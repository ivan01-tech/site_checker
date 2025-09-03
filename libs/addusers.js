import { db } from "../firebase.js";

// Liste des emails uniques à vérifier
const emails = [
  "ivansilatsa@gmail.com",
  "carloskakeusilatsa@gmail.com",
  "ivan@gmail.com",
  "fff@gmail.com",
  "jovaniewabo15@gmail.com",
  "arletteyoumbi93@gmail.com",
  "simonnedjeugoue@icloud.com",
  "rostelledjousse5@gmail.com",
  "aaa@gmail.com",
  "aschleykafack@gmail.com",
  "chouapiruth@gmail.com",
  "lynnchekina@gmail.com",
  "maureyfeulefack0@gmail.com",
  "cecilevoufo06@gmail.com",
  "dert@gmail.com",
  "vanellehobaka@gmail.com",
  "kevinkamga56@gmail.com",
  "jaelmotoum@gmail.com",
  "dinkaachrist2004@gmail.com",
  "roosveltdountio@gmail.com",
];

/**
 * Vérifie si un email existe déjà dans la collection 'subscribers'.
 * @param {string} email - L'email à vérifier.
 * @returns {Promise<boolean>} Promesse résolue avec true si l'email existe, false sinon.
 */
async function emailExists(email) {
  try {
    const doc = await db.collection("subscribers").doc(email).get();
    return doc.exists;
  } catch (error) {
    console.error(`❌ Erreur lors de la vérification de ${email} :`, error.message);
    return false; // En cas d'erreur, on suppose qu'il n'existe pas pour éviter de bloquer
  }
}

/**
 * Insère un email dans la collection 'subscribers' de Firestore s'il n'existe pas.
 * @param {string} email - L'email à insérer.
 * @returns {Promise<void>} Promesse résolue une fois l'insertion effectuée ou ignorée.
 */
async function insertSubscriber(email) {
  const exists = await emailExists(email);
  if (!exists) {
    try {
      await db.collection("subscribers").doc(email).set({
        email,
        createdAt: new Date().toISOString(),
      });
      console.log(`✅ Abonné inséré : ${email}`);
    } catch (error) {
      console.error(`❌ Erreur lors de l'insertion de ${email} :`, error.message);
    }
  } else {
    console.log(`⏩ ${email} existe déjà, insertion ignorée.`);
  }
}

/**
 * Insère tous les emails dans Firestore, en évitant les doublons.
 * @returns {Promise<void>} Promesse résolue une fois toutes les insertions terminées.
 */
async function insertAllSubscribers() {
  console.log("Début de l'insertion des abonnés dans Firestore...");
  for (const email of emails) {
    await insertSubscriber(email);
  }
  console.log("✅ Toutes les insertions sont terminées !");
}

// Exécuter le service
insertAllSubscribers().catch((error) => {
  console.error("❌ Erreur globale :", error.message);
});