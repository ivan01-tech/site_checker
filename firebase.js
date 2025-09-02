// firebase.js
import admin from "firebase-admin";
import { readFileSync } from "fs";

// 🔑 Télécharge ton fichier de clé privée JSON depuis Firebase Console
// (Projet > Paramètres > Comptes de service > Générer une clé privée)

const serviceAccount = JSON.parse(
  readFileSync("./sitechecker-services-key.json", "utf8")
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
export { db };
