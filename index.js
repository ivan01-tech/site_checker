import axios from "axios";
import * as cheerio from "cheerio";
import nodemailer from "nodemailer";
import fs from "fs";

const url = "https://exam.eclexam.eu/?id=TL7R1R";
const mpa = "fbsr vyvr oqot pcyd"; // mot de passe d'application Gmail
const EMAILS = ["ivansilatsa@gmail.com", "carloskakeusilatsa@gmail.com"];

// 🔹 Fichier pour stocker le dernier état connu
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

// Vérification
async function checkECL(retry = 0) {
  try {
    const res = await axios.get(url);
    const html = res.data;

    const $ = cheerio.load(html);

    // Récupérer les <p> dans #objMain
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
      // Seulement si changement d'état
      if (newState === "ouvert") {
        const msg = "🎉 Les inscriptions ECL sont OUVERTES !";
        console.log(msg);
        await sendMail(msg);
        // await sendTelegram(msg);
      } else {
        console.log("⛔️ Les inscriptions viennent de se fermer.");
      }
      saveLastState(newState);
    } else {
      console.log(`⏳ Pas de changement (${newState})...`);
    }
  } catch (err) {
    console.error("❌ Erreur :", err.message);
    if (retry < 3) {
      console.log("🔁 Retry...");
      setTimeout(() => checkECL(retry + 1), 5000); // réessaye dans 5 sec
    }
  }
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

// Vérification toutes les 30 minutes
setInterval(checkECL, 30 * 60 * 1000);
checkECL();
