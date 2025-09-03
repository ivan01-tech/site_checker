import admin from "firebase-admin";
import { readFileSync } from "fs";
import dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

// Charger le fichier de service si présent, sinon utiliser les variables d'environnement
let serviceAccount;
try {
  serviceAccount = JSON.parse(
    readFileSync("./sitechecker-services-key.json", "utf8")
  );
} catch (error) {
  console.warn(
    "Fichier sitechecker-services-key.json non trouvé. Utilisation des variables d'environnement."
  );
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error(
      "La variable d'environnement FIREBASE_PRIVATE_KEY est manquante ou vide."
    );
  }
  serviceAccount = {
    type: process.env.FIREBASE_TYPE || "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID || "sitechecker-dee51",
    private_key_id:
      process.env.FIREBASE_PRIVATE_KEY_ID ||
      "9d42c53d03141668ee8b1e4b6bed662cca301a21",
    private_key: privateKey.replace(/\\n/g, "\n"),
    client_email:
      process.env.FIREBASE_CLIENT_EMAIL ||
      "firebase-adminsdk-fbsvc@sitechecker-dee51.iam.gserviceaccount.com",
    client_id: process.env.FIREBASE_CLIENT_ID || "117513933760931221193",
    auth_uri:
      process.env.FIREBASE_AUTH_URI ||
      "https://accounts.google.com/o/oauth2/auth",
    token_uri:
      process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url:
      process.env.FIREBASE_AUTH_PROVIDER_CERT_URL ||
      "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      process.env.FIREBASE_CLIENT_CERT_URL ||
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40sitechecker-dee51.iam.gserviceaccount.com",
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || "googleapis.com",
  };
  console.log("Service Account configuré avec :", {
    project_id: serviceAccount.project_id,
    client_email: serviceAccount.client_email,
    private_key_id: serviceAccount.private_key_id,
  }); // Débogage
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin initialisé avec succès.");
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Firebase :", error);
    throw error;
  }
}

const db = admin.firestore();
export { db };
