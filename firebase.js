import admin from "firebase-admin";
import { readFileSync } from "fs";
import dotenv from "dotenv";

// Charger les variables d'environnement (optionnel, pour d'autres configurations)
dotenv.config();

// Configuration manuelle du serviceAccount avec la clé privée extraite
const serviceAccount = {
  type: "service_account",
  project_id: "sitechecker-dee51",
  private_key_id: "9d42c53d03141668ee8b1e4b6bed662cca301a21",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCNVss/PXZxBW8J\nmUsYgJQHjfY5+p8M9J3MuHAfqU393LKEWRhLy2QiUQeQn/99s4N9n+t87Y+xyIob\ngyFtrDLH3RyqSCcMD9ayV3KjWh/Ek4GCBo73k9IVlLus25N8EFcTwlOes7clmM/L\nOp7WTTQ3ngn1vvP1DtAyDGClB8vtE0RvmHorPjhy2uBAJYBRzkeB/cqALoBbXI6h\nSkBFB56QaBxiFzsMped7j5qIN5hODlsu5kGMNRf6MOMPhiipafiJuUFGAS5y1w5u\nWhGChTvpUhKW5gAcwpDAU6FGquPooaEHNUXjjqcrTk3ws9JWUcX7vRL5e3qw+wb+\nVn6mPlRRAgMBAAECggEABqm0TCdoGXzhlqjA1wdcsxx4opQTgmdXtwps0rlHAXQx\ngDa5A/2zG0EJo8I/J5xaUwZCcjG6x+1FwXVFkqd+/1gHnWloWdO3UdH4iAXcIIa5\noLkRbU9tJHJOBKCXS85zZG2RRpZ/SEjzZse9LCoYj5SmMI0PcBqCKxHVToJXFTZ0\n4H0j2B7FGKwy0szu8XSqUcEI5FZVNcZoPaLTvEfaYgCh9zYyhGe2NTElnnBUZfnP\nH++7dAatJW7hV+dc084Pvrvr25kzxrwkJPLlaneoBnGthlu2Fg17ZlpWRL9ECiM/\ntgkPdT9yEvcv6vyHRhv2myBx2r1FwPhQql44wgSRzwKBgQDAIy/bY/F634xqqZ5B\nQBMKXOFfpWrjUV0UGczPPPwuxJPIEboEfgMHhE/7gSgJKanvndHTnjfW3De1rUOU\nTochjszRyX5cgp7on86jeLG4cBYuzg4Q1k6wuqzQUcBkKeJtvbBEgw04rzlEGPm8\n98QWwuYSaBgBQpc7OCxOBEmyCwKBgQC8UTaV+UF0FQr4GDn1P8B6TaRsEQ+if7vy\nAv05bCzbkb4K1C7VT5nqnxib9GE7goFpzmi1YEkkG0c1sBdZIwFeuVM3ot7uSDmQ\n+v8S8ZVTp37C7VMHnVO6lRs571yIqSM5+bOdi4TCwxKai6onDIBI1uTCPbApvW8N\nzKMoM85IkwKBgEMZRrJAUemOPjRVre2tmbipvQ8w7oYaOP43EF5jNtKCVfWtsx+0\nfgxW+bOkZD3m7fC/VbKoc2m2mEH7EzmsvuZKP18YFefqueIVRQ2zraTyh9yqmyDo\nJqzzVDygACc6tVeLwg37Elf0YXRVoImMoU8tmzlcXt25yqSktlw8hRwHAoGAGslK\nhGaiAssDdmqrw9C/piXpH14F5U1aBICcWFCkyM6gQ5YO21SpRhA/Rd+q/PYBRnWP\nu0zo2nPu2xojGBC8nyapSZ6nKymm1pJ9OcqXPQD0LPHo/4pHYKDY8JK1jNLSKer0\nu5Ie3j01Jjp7h3ZlwPagL2jq5+UEKOhUxOEplHUCgYEAmPNssG76m5fFfpZ+ss1P\npWdsYBxR3st07C5uJbM/pGaRRvGOanjcgMYPHMTQjrl5lMaa416N+R445CDCY0uz\nx7zp3hDbEiQyZyBB376T7y5o8SAw5DMA/HR6ZR2i14sT3Jm+pSYq7ztsgr6BoumD\n01LkPuAjy75Ri8w0iytlSpk=\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-fbsvc@sitechecker-dee51.iam.gserviceaccount.com",
  client_id: "117513933760931221193",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40sitechecker-dee51.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

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

// import admin from "firebase-admin";
// import { readFileSync } from "fs";
// import dotenv from "dotenv";

// // Charger les variables d'environnement
// dotenv.config();

// // Charger le fichier de service si présent, sinon utiliser les variables d'environnement
// let serviceAccount;
// try {
//   serviceAccount = JSON.parse(readFileSync("./sitechecker-services-key.json", "utf8"));
// } catch (error) {
//   console.warn("Fichier sitechecker-services-key.json non trouvé. Utilisation des variables d'environnement.");
//   const privateKey = process.env.FIREBASE_PRIVATE_KEY;
//   if (!privateKey) {
//     throw new Error("La variable d'environnement FIREBASE_PRIVATE_KEY est manquante ou vide.");
//   }
//   serviceAccount = {
//     type: process.env.FIREBASE_TYPE || "service_account",
//     project_id: process.env.FIREBASE_PROJECT_ID || "sitechecker-dee51",
//     private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "9d42c53d03141668ee8b1e4b6bed662cca301a21",
//     private_key: privateKey.replace(/\\n/g, "\n"),
//     client_email: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@sitechecker-dee51.iam.gserviceaccount.com",
//     client_id: process.env.FIREBASE_CLIENT_ID || "117513933760931221193",
//     auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
//     token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
//     auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
//     client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL || "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40sitechecker-dee51.iam.gserviceaccount.com",
//     universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || "googleapis.com",
//   };
//   console.log("Service Account configuré avec :", {
//     project_id: serviceAccount.project_id,
//     client_email: serviceAccount.client_email,
//     private_key_id: serviceAccount.private_key_id,
//   }); // Débogage
// }

// if (!admin.apps.length) {
//   try {
//     admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount),
//     });
//     console.log("Firebase Admin initialisé avec succès.");
//   } catch (error) {
//     console.error("Erreur lors de l'initialisation de Firebase :", error);
//     throw error;
//   }
// }

// const db = admin.firestore();
// export { db };
