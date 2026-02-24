import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4o";
const client = ModelClient(endpoint, new AzureKeyCredential(token));

// ── 1. Mind Map ───────────────────────────────────────────────────────
// Returns a tree: { title, children: [{ title, summary, formula?, children: [{ title, summary, formula? }] }] }
export async function generateMindMap(req, res) {
    try {
        const { concept, purpose } = req.body; // purpose: "scratch" | "revision"
        if (!concept?.trim()) return res.status(400).json({ error: "concept is required" });

        const depth = purpose === "scratch" ? "detailed" : "concise";
        const nodeCount = purpose === "scratch" ? "4-6 subtopics, each with 2-4 sub-nodes" : "3-4 subtopics, each with 1-3 sub-nodes";

        const prompt = `Create a ${depth} mind map for "${concept}".
Structure: ${nodeCount}. Each node must have title + 1-sentence summary + optional formula (if math/science).
Return ONLY valid JSON, no markdown:
{
  "title": "${concept}",
  "children": [
    {
      "title": "Subtopic",
      "summary": "One sentence.",
      "formula": "optional string or null",
      "children": [
        { "title": "Sub-node", "summary": "One sentence.", "formula": null }
      ]
    }
  ]
}`;

        const response = await client.path("/chat/completions").post({
            body: {
                messages: [
                    { role: "system", content: "You output compact JSON only. Be concise. No redundancy." },
                    { role: "user", content: prompt },
                ],
                model,
                temperature: 0.5,
                max_tokens: 1800,
            },
        });

        if (isUnexpected(response)) throw response.body?.error || new Error("Unexpected response");

        const text = response.body.choices[0].message.content;
        const cleaned = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        res.json(parsed);
    } catch (err) {
        console.error("MindMap error:", err);
        res.status(500).json({ error: "Failed to generate mind map" });
    }
}

// ── 2. Flash Cards ────────────────────────────────────────────────────
// Returns 3-7 cards: [{ title, keyPoints: string[], formula?: string, mnemonic?: string, examTrick?: string }]
export async function generateFlashCards(req, res) {
    try {
        const { concept, purpose } = req.body;
        if (!concept?.trim()) return res.status(400).json({ error: "concept is required" });

        const cardCount = purpose === "scratch" ? "6-7" : "3-4";

        const prompt = `Create ${cardCount} flash cards summarising "${concept}" for a student.
Each card covers one subtopic. Be concise — every field max 1-2 lines.
Return ONLY valid JSON array, no markdown:
[
  {
    "title": "Subtopic name",
    "keyPoints": ["key point 1", "key point 2", "key point 3"],
    "formula": "equation or null",
    "mnemonic": "memory trick or null",
    "examTrick": "exam tip or null"
  }
]`;

        const response = await client.path("/chat/completions").post({
            body: {
                messages: [
                    { role: "system", content: "You output compact JSON only. Max 2 sentences per field." },
                    { role: "user", content: prompt },
                ],
                model,
                temperature: 0.5,
                max_tokens: 1200,
            },
        });

        if (isUnexpected(response)) throw response.body?.error || new Error("Unexpected response");

        const text = response.body.choices[0].message.content;
        const cleaned = text.replace(/```json|```/g, "").trim();
        let parsed = JSON.parse(cleaned);
        if (!Array.isArray(parsed)) parsed = [parsed];
        res.json(parsed);
    } catch (err) {
        console.error("FlashCards error:", err);
        res.status(500).json({ error: "Failed to generate flash cards" });
    }
}
