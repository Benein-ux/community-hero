import { Router } from "express";
import { getAuth } from "firebase-admin/auth";
import { getLeaderboard, getUser, db } from "../services/firestore.js";

const router = Router();

router.get("/leaderboard", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const users = await getLeaderboard(limit);
    res.json({ success: true, data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/:uid", async (req, res) => {
  try {
    const user = await getUser(req.params.uid);
    if (!user) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/become-admin", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const token = authHeader.split("Bearer ")[1];
    const decoded = await getAuth().verifyIdToken(token);

    const { code } = req.body;
    if (code !== "COMMUNITYHERO2026") {
      return res.status(401).json({ success: false, error: "Invalid access code" });
    }

    await db.collection("users").doc(decoded.uid).update({ isAdmin: true });

    res.json({ success: true, data: { isAdmin: true } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;