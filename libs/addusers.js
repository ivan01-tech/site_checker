import { db } from "../firebase.js";

// Liste des emails uniques
const emails = [
  "ivansilatsa@gmail.com",
  "carloskakeusilatsa@gmail.com",
  "chouapiruth@gmail.com",
  "aschleykafack@gmail.com",
  "maureyfeulefack0@gmail.com",
  "rostelledjousse5@gmail.com",
  "arletteyoumbi93@gmail.com",
  "simonnedjeugoue@icloud.com",
  "lynnchekina@gmail.com",
];

/**
 * Insère un email dans la collection 'subscribers' de Firestore.
 * @param {string} email - L'email à insérer.
 * @returns {Promise<void>} Promesse résolue une fois l'insertion effectuée.
 */
async function insertSubscriber(email) {
  try {
    await db.collection("subscribers").doc(email).set({
      email,
      createdAt: new Date().toISOString(),
    });
    console.log(`✅ Abonné inséré : ${email}`);
  } catch (error) {
    console.error(`❌ Erreur lors de l'insertion de ${email} :`, error.message);
  }
}

/**
 * Insère tous les emails dans Firestore.
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