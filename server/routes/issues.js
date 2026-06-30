import { Router } from "express";
import multer from "multer";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { uploadImage } from "../services/cloudinary.js";
import { categorizeIssue } from "../services/gemini.js";
import { createIssue, getIssues, getIssue, getUser, upvoteIssue, deleteIssue, createUser, updateUserPoints, updateBadges, db } from "../services/firestore.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const token = authHeader.split("Bearer ")[1];
    const decoded = await getAuth().verifyIdToken(token);

    const { title, description, lat, lng, address } = req.body;
    const imageBase64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;
    const [imageUrl, ai] = await Promise.all([
      uploadImage(imageBase64, mimeType),
      categorizeIssue(imageBase64, description, mimeType),
    ]);
    const issue = await createIssue({
      title,
      description,
      imageUrl,
      location: { lat: parseFloat(lat), lng: parseFloat(lng), address },
      category: ai.category,
      severity: ai.severity,
      tags: ai.tags,
      summary: ai.summary,
      estimatedResolutionDays: ai.estimatedResolutionDays,
      reportedBy: decoded.uid,
    });

    await Promise.all([
      createUser({
        uid: decoded.uid,
        name: decoded.name || decoded.email || "Anonymous",
        email: decoded.email || "",
        photoURL: decoded.picture || "",
      }),
      db.collection("votes").doc(`${issue.id}_${decoded.uid}`).set({
        issueId: issue.id,
        userId: decoded.uid,
        createdAt: Timestamp.now(),
      }),
    ]);
    await Promise.all([
      updateUserPoints(decoded.uid, 10),
      db.collection("users").doc(decoded.uid).update({ issuesReported: FieldValue.increment(1) }),
      db.collection("issues").doc(issue.id).update({ upvotes: 1 }),
    ]);
    await updateBadges(decoded.uid);

    res.status(201).json({ success: true, data: { ...issue, upvotes: 1, verified: false } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const issues = await getIssues(req.query);
    res.json({ success: true, data: issues });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const issue = await getIssue(req.params.id);
    if (!issue) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: issue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch("/:id/upvote", async (req, res) => {
  try {
    const { userId } = req.body;

    const issue = await getIssue(req.params.id);
    if (!issue) return res.status(404).json({ success: false, error: "Not found" });
    if (issue.reportedBy === userId) {
      return res.status(400).json({ success: false, error: "Cannot upvote your own issue" });
    }

    const result = await upvoteIssue(req.params.id, userId);
    if (result.success) {
      await updateUserPoints(userId, 5);
      await updateBadges(userId);
    }
    res.json({ success: result.success, data: { upvotes: result.upvotes, verified: result.verified }, error: result.error });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const token = authHeader.split("Bearer ")[1];
    const decoded = await getAuth().verifyIdToken(token);

    const user = await getUser(decoded.uid);
    if (!user?.isAdmin) {
      return res.status(403).json({ success: false, error: "Admin access required" });
    }

    const { status } = req.body;
    if (!["reported", "in_progress", "resolved"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const updates = { status };
    if (status === "resolved") {
      updates.resolvedAt = Timestamp.now();
    }
    await db.collection("issues").doc(req.params.id).update(updates);

    res.json({ success: true, data: { status } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const token = authHeader.split("Bearer ")[1];
    const decoded = await getAuth().verifyIdToken(token);
    const result = await deleteIssue(req.params.id, decoded.uid);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;