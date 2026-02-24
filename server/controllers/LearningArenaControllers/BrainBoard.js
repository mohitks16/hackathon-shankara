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

    const subtopicCount = purpose === "scratch" ? "5-7" : "3-5";
    const subNodeCount = purpose === "scratch" ? "3-5" : "2-3";

    const prompt = `Create a detailed mind map for "${concept}" for a student ${purpose === "scratch" ? "learning from scratch" : "doing revision"}.

Rules:
- ${subtopicCount} top-level subtopics
- Each subtopic has ${subNodeCount} sub-nodes (key concepts, mechanisms, facts)
- Every node (subtopic + sub-node) must include:
  - title: short name (max 5 words)
  - summary: 1-2 sentences explaining the concept clearly
  - keyPoints: array of 2-3 bullet strings (important details, not repeating summary)
  - formula: relevant equation/formula string, or null
  - conceptFlow: one sentence describing how this connects to the parent concept

Return ONLY valid JSON, no markdown:
{
  "title": "${concept}",
  "children": [
    {
      "title": "Subtopic Name",
      "summary": "Clear 1-2 sentence explanation.",
      "keyPoints": ["point 1", "point 2", "point 3"],
      "formula": "equation or null",
      "conceptFlow": "How this subtopic connects to ${concept}.",
      "children": [
        {
          "title": "Sub-node Name",
          "summary": "Clear 1-2 sentence explanation.",
          "keyPoints": ["detail 1", "detail 2"],
          "formula": "equation or null",
          "conceptFlow": "How this connects to parent subtopic."
        }
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
