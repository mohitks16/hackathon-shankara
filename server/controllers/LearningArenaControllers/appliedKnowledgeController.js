import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4o";
const client = ModelClient(endpoint, new AzureKeyCredential(token));

// ── 1. Generate all Applied Knowledge sections in ONE call ────────────
export async function generateAppliedKnowledge(req, res) {
    try {
        const { concept } = req.body;
        if (!concept?.trim()) return res.status(400).json({ error: "concept is required" });

        const prompt = `For the science/math concept "${concept}" (Physics, Chemistry, Biology, or Maths context), provide ALL of the following in one JSON response. Be concise but insightful — max 3-4 sentences per field, max 3 items per array.

Return ONLY valid JSON, no markdown:
{
  "history": {
    "summary": "How this concept was discovered/developed. Key scientists involved.",
    "links": [{"title":"short label","url":"https://en.wikipedia.org/wiki/..."}]
  },
  "dailyLife": "How this concept is used in everyday life and why studying it matters.",
  "careers": [
    {"field": "Career/Industry name", "how": "1-sentence on how this concept applies"}
  ],
  "higherStudies": "How this concept builds into advanced topics in college/university.",
  "futureScope": "What one can become with interest in this area, and what they'll study next."
}`;

        const response = await client.path("/chat/completions").post({
            body: {
                messages: [
                    { role: "system", content: "You output compact JSON only. Focus on Physics/Chemistry/Biology/Maths concepts. Be inspiring and concise." },
                    { role: "user", content: prompt },
                ],
                model,
                temperature: 0.6,
                max_tokens: 1200,
            },
        });

        if (isUnexpected(response)) throw response.body?.error || new Error("Unexpected response");

        const text = response.body.choices[0].message.content;
        const cleaned = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        res.json(parsed);
    } catch (err) {
        console.error("AppliedKnowledge error:", err);
        res.status(500).json({ error: "Failed to generate applied knowledge" });
    }
}

// ── 2. Mini Chat (3-4 messages max) ──────────────────────────────────
export async function appliedKnowledgeChat(req, res) {
    try {
        const { concept, messages } = req.body; // messages: [{role,content}]
        if (!concept?.trim()) return res.status(400).json({ error: "concept is required" });

        const msgCount = messages.filter(m => m.role === "assistant").length;
        const isFinal = msgCount >= 2; // after 2 AI replies, next is farewell

        const systemPrompt = isFinal
            ? `You are a warm, encouraging science mentor wrapping up a brief conversation about "${concept}". Give a short farewell message (2-3 sentences): appreciate what the student found interesting, encourage them to explore further, and wish them a great future. End the conversation positively.`
            : `You are a friendly, curious science mentor having a brief chat about "${concept}" (Physics/Chemistry/Biology/Maths). Ask engaging follow-up questions about what the student finds interesting. Keep replies to 2-3 sentences. Be warm and encouraging.`;

        const response = await client.path("/chat/completions").post({
            body: {
                messages: [
                    { role: "system", content: systemPrompt },
                    ...messages,
                ],
                model,
                temperature: 0.7,
                max_tokens: 200,
            },
        });

        if (isUnexpected(response)) throw response.body?.error || new Error("Unexpected response");

        const reply = response.body.choices[0].message.content;
        res.json({ reply, isFinal });
    } catch (err) {
        console.error("AppliedKnowledge chat error:", err);
        res.status(500).json({ error: "Chat failed" });
    }
}
