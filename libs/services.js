import { db } from "./config"; // ta config firebase

async function saveSubscriber(email) {
  await db.collection("subscribers").doc(email).set({ email, createdAt: new Date() });
}

async function getSubscribers() {
  const snap = await db.collection("subscribers").get();
  return snap.docs.map(doc => doc.data().email);
}
