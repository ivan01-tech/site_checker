// api/check-ecl.js
import axios from "axios";
import * as cheerio from "cheerio";
import nodemailer from "nodemailer";
import fs from "fs";

const url = "https://exam.eclexam.eu/?id=TL7R1R";
const mpa = process.env.GMAIL_APP_PASSWORD; // Utilisez une variable d'environnement
const EMAILS = ["ivansilatsa@gmail.com", "carloskakeusilatsa@gmail.com"];
const STATE_FILE = "./lastState.txt";

// Charger dernier état
function loadLastState() {
  if (fs.existsSync(STATE_FILE)) {
    return fs.readFileSync(STATE_FILE, "utf-8");
  }
  return "unknown";
}

// Sauvegarder nouvel état
function saveLastState(state) {
  fs.writeFileSync(STATE_FILE, state, "utf-8");
}

// Envoi email
async function sendMail(message) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ivansilatsa@gmail.com",
      pass: mpa,
    },
  });

  await transporter.sendMail({
    from: "ivansilatsa@gmail.com",
    to: EMAILS,
    subject: "🚨 Alerte ECL",
    text: message,
    html: `<h2 style="color:green;">${message}</h2>
           <p>👉 Vérifie vite : <a href="${url}">Lien d'inscription</a></p>`,
  });
  console.log("📧 Email envoyé !");
}

// Fonction principale
async function checkECL() {
  try {
    const res = await axios.get(url);
    const html = res.data;

    const $ = cheerio.load(html);
    const messages = $("#objMain p.sN")
      .map((i, el) => $(el).text().trim())
      .get();

    console.log("📋 Messages extraits :", messages);

    const inscriptionsFermees =
      messages.includes("It is currently not possible to apply for an exam.") &&
      messages.includes("The next application period will open soon.");

    const newState = inscriptionsFermees ? "ferme" : "ouvert";
    const lastState = loadLastState();

    if (newState !== lastState) {
      if (newState === "ouvert") {
        const msg = "🎉 Les inscriptions ECL sont OUVERTES !";
        await sendMail(msg);
        return { status: 200, message: msg };
      } else {
        console.log("⛔️ Les inscriptions viennent de se fermer.");
        return { status: 200, message: "Inscriptions fermées" };
      }
      saveLastState(newState);
    } else {
      return { status: 200, message: `Pas de changement (${newState})` };
    }
  } catch (err) {
    console.error("❌ Erreur :", err.message);
    return { status: 500, message: `Erreur : ${err.message}` };
  }
}

// Export pour Vercel
export default async function handler(req, res) {
  const result = await checkECL();
  res.status(result.status).json({ message: result.message });
}

