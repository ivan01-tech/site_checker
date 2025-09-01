// app.js
import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- CONFIG ----------
const URL = "https://exam.eclexam.eu/?id=TL7R1R"; // page ECL Cameroun
const CHECK_INTERVAL_MS = 30 * 60 * 1000; // 30 min
const STATE_FILE = "./data/state.json";
const SUBS_FILE = "./data/subscribers.json";

// ---------- PREP DOSSIERS/FILES ----------
fs.mkdirSync("./data", { recursive: true });
if (!fs.existsSync(STATE_FILE))
  fs.writeFileSync(
    STATE_FILE,
    JSON.stringify({ status: "unknown", lastCheck: null }),
    "utf-8"
  );
if (!fs.existsSync(SUBS_FILE))
  fs.writeFileSync(SUBS_FILE, JSON.stringify({ emails: [] }, null, 2), "utf-8");

// ---------- HELPERS PERSISTENCE ----------
function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
  } catch {
    return { status: "unknown", lastCheck: null };
  }
}
function saveState(newState) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(newState, null, 2), "utf-8");
}
function loadSubs() {
  try {
    return JSON.parse(fs.readFileSync(SUBS_FILE, "utf-8"));
  } catch {
    return { emails: [] };
  }
}
function saveSubs(data) {
  fs.writeFileSync(SUBS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ---------- EMAIL TRANSPORT ----------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER, // ex: "tonmail@gmail.com"
    pass: process.env.MAIL_APP_PASSWORD, // mot de passe d'application Gmail
  },
});

async function sendMailToAll(subject, htmlMessage) {
  const { emails } = loadSubs();
  if (!emails.length) return;

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: emails, // envoi groupé
    subject,
    text: htmlMessage.replace(/<[^>]+>/g, ""), // fallback texte
    html: htmlMessage,
  });
  console.log(`📧 Email envoyé à ${emails.length} abonnés`);
}

// ---------- CORE CHECK (avec retry) ----------
async function fetchPageWithRetry(retries = 3, delayMs = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.get(URL, { timeout: 15000 });
      return res.data;
    } catch (e) {
      console.warn(`⚠️ Tentative ${i + 1}/${retries} échouée: ${e.message}`);
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

function extractStatus(html) {
  const $ = cheerio.load(html);
  // Les messages sont des <p class="sN"> sous #objMain
  const messages = $("#objMain p.sN")
    .map((i, el) => $(el).text().trim())
    .get();

  const isClosed =
    messages.includes("It is currently not possible to apply for an exam.") &&
    messages.includes("The next application period will open soon.");

  return {
    status: isClosed ? "closed" : "open",
    rawMessages: messages,
  };
}

async function checkECLAndNotify() {
  try {
    const html = await fetchPageWithRetry();
    const { status, rawMessages } = extractStatus(html);

    const prev = loadState();
    const now = new Date().toISOString();
    console.log(`🕒 Vérifié à ${now} → ${status.toUpperCase()}`);

    // Notifier uniquement si changement d'état
    if (prev.status !== status && prev.status !== "unknown") {
      if (status === "open") {
        const subject = "🎉 ECL : Les inscriptions sont OUVERTES !";
        const htmlMsg = `
          <h2 style="color:#16a34a;margin:0;">🎉 Les inscriptions ECL sont OUVERTES !</h2>
          <p style="margin:8px 0 16px;">Clique ici pour vérifier : <a href="${URL}">${URL}</a></p>
          <table style="border-collapse:collapse;font-family:Arial;font-size:14px">
            <tr><td style="padding:6px 10px;background:#f3f4f6;">Dernière vérification</td><td style="padding:6px 10px;">${new Date(
              now
            ).toLocaleString()}</td></tr>
            <tr><td style="padding:6px 10px;background:#f3f4f6;">Messages détectés</td><td style="padding:6px 10px;">${
              rawMessages.join(" • ") || "—"
            }</td></tr>
          </table>
          <p style="color:#6b7280;font-size:12px;margin-top:16px;">Service gratuit – vous recevez ce message car vous êtes abonné(e) aux alertes ECL.</p>
        `;
        await sendMailToAll(subject, htmlMsg);
      } else if (status === "closed") {
        const subject = "ℹ️ ECL : Inscriptions fermées";
        const htmlMsg = `
          <h2 style="color:#dc2626;margin:0;">ℹ️ Les inscriptions ECL sont fermées.</h2>
          <p style="margin:8px 0 16px;">Nous vous préviendrons dès la prochaine ouverture.</p>
          <p style="color:#6b7280;font-size:12px;margin-top:16px;">Service gratuit – vous êtes abonné(e) aux alertes ECL.</p>
        `;
        await sendMailToAll(subject, htmlMsg);
      }
    }

    saveState({ status, lastCheck: now, messages: rawMessages });
  } catch (err) {
    console.error("❌ Erreur de vérification :", err.message);
    // On met quand même à jour l'heure de check pour le dashboard
    const prev = loadState();
    saveState({
      ...prev,
      lastCheck: new Date().toISOString(),
      error: err.message,
    });
  }
}

// ---------- PLANIF ----------
setInterval(checkECLAndNotify, CHECK_INTERVAL_MS);
checkECLAndNotify(); // premier run au démarrage

// ---------- MIDDLEWARE WEB ----------
app.use(express.urlencoded({ extended: true }));

// Petit style inline pour éviter des assets externes
const baseCss = `
  :root { --green:#16a34a; --red:#dc2626; --gray:#6b7280; --bg:#f8fafc; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: Arial, sans-serif; background: var(--bg); color:#0f172a; }
  header { background:#0ea5e9; color:white; padding:16px 20px; }
  main { max-width: 880px; margin: 24px auto; background:white; border-radius: 12px; box-shadow: 0 8px 24px rgba(15,23,42,.06); overflow:hidden;}
  .wrap { padding: 20px; }
  h1 { margin:0; font-size:22px; }
  .status { display:flex; align-items:center; gap:10px; padding:12px 16px; border-radius:10px; font-weight:600; }
  .status.open { background: #ecfdf5; color: var(--green); border:1px solid #bbf7d0;}
  .status.closed { background: #fef2f2; color: var(--red); border:1px solid #fecaca;}
  .muted { color: var(--gray); font-size: 12px; }
  .grid { display:grid; gap:14px; grid-template-columns: 1fr; }
  @media (min-width: 720px) { .grid { grid-template-columns: 1fr 1fr; } }
  .card { border:1px solid #e5e7eb; border-radius:10px; padding:14px 16px; background:white; }
  .card h3 { margin:0 0 8px; font-size:16px; }
  input[type="email"] { width:100%; padding:10px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; }
  button { appearance:none; border:0; background:#0ea5e9; color:white; padding:10px 14px; border-radius:8px; font-weight:600; cursor:pointer; }
  button:disabled { opacity:.6; cursor:not-allowed; }
  ul { margin:8px 0 0 18px; }
  .pill { display:inline-block; padding:3px 8px; border-radius:999px; background:#f1f5f9; font-size:12px; }
`;

// ---------- ROUTES ----------
app.get("/", (req, res) => {
  const state = loadState();
  const subs = loadSubs();

  const isOpen = state.status === "open";
  const statusClass = isOpen ? "open" : "closed";
  const statusLabel = isOpen
    ? "OUVERT"
    : state.status === "unknown"
    ? "INCONNU"
    : "FERMÉ";
  const lastCheck = state.lastCheck
    ? new Date(state.lastCheck).toLocaleString()
    : "—";
  const messageLines = state.messages?.length
    ? state.messages.map((m) => `<li>${m}</li>`).join("")
    : `<li>—</li>`;

  res.send(`
    <!doctype html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Alertes ECL – Dashboard</title>
      <style>${baseCss}</style>
    </head>
    <body>
      <header>
        <h1>Alertes ECL – Dashboard</h1>
        <div class="muted">Surveille automatiquement : <a style="color:#fff;text-decoration:underline;" href="${URL}">exam.eclexam.eu</a></div>
      </header>
      <main>
        <div class="wrap">
          <div class="status ${statusClass}">
            <span>Statut actuel : ${statusLabel}</span>
            <span class="pill">Dernier check : ${lastCheck}</span>
          </div>

          <div class="grid" style="margin-top:14px;">
            <section class="card">
              <h3>Messages détectés</h3>
              <ul>${messageLines}</ul>
            </section>

            <section class="card">
              <h3>S'abonner aux alertes (gratuit)</h3>
              <form method="POST" action="/subscribe">
                <label for="email" class="muted">Entrez votre email :</label>
                <input type="email" id="email" name="email" placeholder="ex: nom@gmail.com" required>
                <div style="margin-top:10px; display:flex; gap:8px;">
                  <button type="submit">S'abonner</button>
                  <span class="muted">Abonnés : ${subs.emails.length}</span>
                </div>
              </form>
            </section>
          </div>

          <section class="card" style="margin-top:14px;">
            <h3>À propos</h3>
            <p>Cette page vérifie automatiquement si les inscriptions ECL sont ouvertes et envoie un email dès qu'un changement est détecté. Service 100% gratuit.</p>
            <p class="muted">Intervalle de vérification : toutes les ${Math.round(
              CHECK_INTERVAL_MS / 60000
            )} minutes.</p>
          </section>
        </div>
      </main>
    </body>
    </html>
  `);
});

app.post("/subscribe", (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!valid) {
    return res.status(400).send("Email invalide. <a href='/'>Retour</a>");
  }

  const data = loadSubs();
  if (!data.emails.includes(email)) {
    data.emails.push(email);
    saveSubs(data);
    console.log(`➕ Abonné: ${email}`);
  }
  res.redirect("/");
});

// ---------- START ----------
app.listen(PORT, () => {
  console.log(`✅ Dashboard dispo sur http://localhost:${PORT}`);
});
