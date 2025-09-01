import axios from "axios";
import nodemailer from "nodemailer";

// Lien ECL
const url = "https://exam.eclexam.eu/?id=TL7R1R";

// Fonction de vérification des inscriptions
async function checkECL() {
  try {
    const res = await axios.get(url);
    const html = res.data;

    // Vérification par texte exact
    const closedText1 = "It is currently not possible to apply for an exam.";
    const closedText2 = "The next application period will open soon.";

    const inscriptionsFermees =
      !html.includes(closedText1) && html.includes(closedText2);

    if (!inscriptionsFermees) {
      console.log("🎉 Les inscriptions sont OUVERTES !");
      await sendMail("🎉 Les inscriptions ECL sont OUVERTES !");
    } else {
      console.log("⏳ Pas encore ouvert...");
    }
  } catch (error) {
    console.error("❌ Erreur :", error.message);
  }
}
// Fonction d'envoi d'email
async function sendMail(message) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ivansilatsa@gmail.com", // ton adresse Gmail
      pass: "fbsr vyvr oqot pcyd",
    },
  });

  await transporter.sendMail({
    from: "ivansilatsa@gmail.com",
    to: ["ivansilatsa@gmail.com", "carloskakeusilatsa@gmail.com"], // ✅ envoie aux 2 adresses
    subject: "🚨 Alerte ECL",
    text: message,
  });

  console.log("📧 Email envoyé aux 2 adresses !");
}

// Vérification toutes les 30 minutes
setInterval(checkECL, 30 * 60 * 1000);

// Lancer une première fois au démarrage
checkECL();
