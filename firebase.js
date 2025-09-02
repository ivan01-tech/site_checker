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
  serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  };
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
export { db };
