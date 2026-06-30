const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

const prompt = `You are a civic issue categorization AI. Analyze the image and description of a civic issue and return a JSON object with:
- category: one of ["Pothole", "Streetlight", "Water Leak", "Waste Management", "Electrical Hazard", "Road Damage", "Public Property Damage", "Sewage Issue", "Tree/Vegetation Hazard", "Other"]
- severity: one of ["low", "medium", "high", "critical"]
- tags: array of relevant tags (max 5)
- summary: one-sentence summary of the issue
- estimatedResolutionDays: estimated days to resolve based on category and severity

Pick the most specific matching category. Only use "Other" when none of the other categories clearly apply.`;
export async function categorizeIssue(imageBase64, description, mimeType = "image/jpeg") {
  const res = await fetch(`${GEMINI_URL}${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            { text: prompt },
            { text: description },
          ],
        },
      ],
    }),
  });

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return { category: "other", severity: "low", tags: [], summary: description, estimatedResolutionDays: 7 };
  }
}