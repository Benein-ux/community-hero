import { readFileSync } from "fs";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

if (!getApps().length) {
  const serviceAccount = JSON.parse(readFileSync(new URL("../serviceAccountKey.json", import.meta.url)));
  initializeApp({ credential: cert(serviceAccount) });
}

export const db = getFirestore();

export async function createIssue(data) {
  const ref = await db.collection("issues").add({ ...data, createdAt: Timestamp.now(), upvotes: 0, status: "reported" });
  return { id: ref.id, ...data };
}

export async function getIssues(filters = {}) {
  let query = db.collection("issues").orderBy("createdAt", "desc");
  if (filters.category) query = query.where("category", "==", filters.category);
  if (filters.status) query = query.where("status", "==", filters.status);
  const snapshot = await query.limit(filters.limit || 50).get();
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getIssue(id) {
  const doc = await db.collection("issues").doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function upvoteIssue(issueId, userId) {
  const voteRef = db.collection("votes").doc(`${issueId}_${userId}`);
  const voteDoc = await voteRef.get();
  if (voteDoc.exists) return { success: false, error: "Already voted" };

  let verified = false;
  let upvotes = 0;
  await db.runTransaction(async (t) => {
    const issueDoc = await t.get(db.collection("issues").doc(issueId));
    if (!issueDoc.exists) throw new Error("Issue not found");

    const currentUpvotes = issueDoc.data().upvotes || 0;
    upvotes = currentUpvotes + 1;

    t.set(voteRef, { issueId, userId, createdAt: Timestamp.now() });
    const updates = { upvotes };
    if (upvotes >= 3) {
      updates.verified = true;
      verified = true;
    }
    t.update(db.collection("issues").doc(issueId), updates);
  });

  return { success: true, verified, upvotes };
}

export async function createUser(data) {
  const ref = await db.collection("users").doc(data.uid).set({ ...data, isAdmin: false, badges: [] }, { merge: true });
  return { id: data.uid, ...data };
}

export async function getUser(uid) {
  const doc = await db.collection("users").doc(uid).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function deleteIssue(id, userId) {
  const doc = await db.collection("issues").doc(id).get();
  if (!doc.exists) return { success: false, error: "Not found" };
  if (doc.data().reportedBy !== userId) return { success: false, error: "Unauthorized" };
  await db.collection("issues").doc(id).delete();
  return { success: true };
}

export async function updateUserPoints(uid, points) {
  await db.collection("users").doc(uid).update({ points: FieldValue.increment(points) });
}

function computeBadges(issuesReported, points) {
  const badges = [];
  if (issuesReported >= 1) badges.push("First Step");
  if (issuesReported >= 5) badges.push("Active Citizen");
  if (issuesReported >= 15) badges.push("Community Champion");
  if (issuesReported >= 30) badges.push("Civic Hero");
  if (points >= 100) badges.push("Trusted Voice");
  return badges;
}

export async function updateBadges(uid) {
  const user = await getUser(uid);
  if (!user) return;

  const earned = computeBadges(user.issuesReported || 0, user.points || 0);
  const existing = user.badges || [];
  const newBadges = earned.filter((b) => !existing.includes(b));

  if (newBadges.length > 0) {
    await db.collection("users").doc(uid).update({
      badges: FieldValue.arrayUnion(...newBadges),
    });
  }
}

export async function getLeaderboard(limit = 10) {
  try {
    const snapshot = await db.collection("users")
      .orderBy("points", "desc")
      .limit(limit)
      .get();
    return snapshot.docs.map((d, i) => ({ rank: i + 1, id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}