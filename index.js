import axios from "axios";
import nodemailer from "nodemailer";

const url = "https://exam.eclexam.eu/?id=TL7R1R";
const mpa = "fbsr vyvr oqot pcyd"; // mot de passe d'application Gmail
// 🔹 Emails des utilisateurs
const EMAILS = ["ivansilatsa@gmail.com", "carloskakeusilatsa@gmail.com"];

// 🔹 Config Telegram
const TELEGRAM_TOKEN = "TON_TOKEN";
const CHAT_IDS = ["12345678", "87654321"];

// Vérification
async function checkECL() {
  try {
    const res = await axios.get(url);
    const html = res.data;

    const closedText1 = "It is currently not possible to apply for an exam.";
    const closedText2 = "The next application period will open soon.";

    const inscriptionsFermees =
      !html.includes(closedText1) && html.includes(closedText2);

    if (!inscriptionsFermees) {
      const msg = "🎉 Les inscriptions ECL sont OUVERTES !";
      console.log(msg);
      await sendMail(msg);
      //   await sendTelegram(msg);
    } else {
      console.log("⏳ Pas encore ouvert...");
    }
  } catch (err) {
    console.error("❌ Erreur :", err.message);
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

// Envoi Telegram
async function sendTelegram(message) {
  for (const chatId of CHAT_IDS) {
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
      }
    );
  }
}

// Vérification toutes les 30 minutes
setInterval(checkECL, 30 * 60 * 1000);
checkECL();
