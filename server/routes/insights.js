import { Router } from "express";
import { getIssues } from "../services/firestore.js";

const router = Router();
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

let cache = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

async function generateInsights(issueData) {
  const prompt = `You are a civic data analyst. Analyze the following civic issue data and return a JSON object with exactly three keys:

- patterns: array of strings describing recurring patterns (e.g. "Potholes spike after rainy weekends")
- predictions: array of strings predicting problem areas (e.g. "Downtown will see increased drainage issues if rain continues")
- recommendations: array of strings suggesting preventive actions (e.g. "Prioritize Main Street pothole repairs before monsoon season")

Issue data: ${JSON.stringify(issueData)}

Return ONLY valid JSON.`;

  let res;
  try {
    res = await fetch(`${GEMINI_URL}${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });
  } catch (err) {
    console.log("Gemini fetch error:", err.message);
    return fallbackInsights();
  }

  if (!res.ok) {
    let bodyText = "";
    try { bodyText = await res.text(); } catch {}
    console.log("Gemini non-200 response:", res.status, bodyText);
    return fallbackInsights();
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  console.log("Gemini raw response text:", text);

  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return {
      patterns: parsed.patterns || [],
      predictions: parsed.predictions || [],
      recommendations: parsed.recommendations || [],
    };
  } catch {
    console.log("Gemini JSON parse failed, text was:", text);
    return fallbackInsights();
  }
}

function fallbackInsights() {
  return {
    patterns: ["Could not generate patterns at this time."],
    predictions: ["Could not generate predictions at this time."],
    recommendations: ["Could not generate recommendations at this time."],
  };
}

router.get("/", async (req, res) => {
  try {
    if (req.query.force === "true") {
      cache = null;
    }

    if (cache && Date.now() - cacheTime < CACHE_TTL) {
      return res.json({ success: true, data: cache, cached: true });
    }

    const issues = await getIssues({ limit: 500 });

    const categoryCounts = {};
    const severityCounts = {};
    const statusCounts = {};
    const recentTitles = [];

    for (const issue of issues) {
      categoryCounts[issue.category] = (categoryCounts[issue.category] || 0) + 1;
      severityCounts[issue.severity] = (severityCounts[issue.severity] || 0) + 1;
      statusCounts[issue.status] = (statusCounts[issue.status] || 0) + 1;
      if (recentTitles.length < 20) {
        recentTitles.push({ title: issue.title, category: issue.category, severity: issue.severity, status: issue.status });
      }
    }

    const insightData = await generateInsights({
      totalIssues: issues.length,
      byCategory: categoryCounts,
      bySeverity: severityCounts,
      byStatus: statusCounts,
      recentIssues: recentTitles,
    });

    cache = insightData;
    cacheTime = Date.now();

    res.json({ success: true, data: insightData, cached: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;