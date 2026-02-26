import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4o-mini";
const client = ModelClient(endpoint, new AzureKeyCredential(token));

// ── Generate Full Career Roadmap (ONE call, 8 sections) ───────────────
export async function generateRoadmap(req, res) {
    try {
        const { career } = req.body;
        if (!career?.trim()) {
            return res.status(400).json({ error: "career field is required" });
        }

        const prompt = `You are a career mentor. Generate a concise roadmap for someone who wants to become a "${career}".
Return ONLY valid JSON (no markdown) with exactly these 8 sections. Each section has a title and points array (3-5 bullet strings, max 20 words each):
{
  "career": "${career}",
  "sections": [
    {"id":"academic","title":"Academic Roadmap","emoji":"📚","points":["...","...","..."]},
    {"id":"skills","title":"Skill Development","emoji":"🛠️","points":["...","...","..."]},
    {"id":"exams","title":"Exams & Qualifications","emoji":"📝","points":["...","...","..."]},
    {"id":"education","title":"Education Pathways","emoji":"🎓","points":["...","...","..."]},
    {"id":"finance","title":"Time & Financial Planning","emoji":"💰","points":["...","...","..."]},
    {"id":"timeline","title":"Career Timeline","emoji":"⏱️","points":["...","...","..."]},
    {"id":"lifestyle","title":"Lifestyle & Work Environment","emoji":"🌍","points":["...","...","..."]},
    {"id":"growth","title":"Growth & Future Outlook","emoji":"📈","points":["...","...","..."]}
  ]
}
Be specific to "${career}". Keep bullets concise and actionable.`;

        const response = await client.path("/chat/completions").post({
            body: {
                messages: [
                    { role: "system", content: "You output compact JSON only. No extra text." },
                    { role: "user", content: prompt },
                ],
                model,
                temperature: 0.5,
                max_tokens: 1800,
            },
        });

        if (isUnexpected(response))
            throw response.body?.error || new Error("Unexpected API response");

        const text = response.body.choices[0].message.content;
        const cleaned = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        res.json(parsed);
    } catch (error) {
        console.error("Destiny Designer error:", error);
        res.status(500).json({ error: "Failed to generate roadmap" });
    }
}
