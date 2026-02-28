import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4o";
const client = ModelClient(endpoint, new AzureKeyCredential(token));


// ── Generate All Questions (ONE call) ─────────────────────────────────
// Returns 25 MCQ questions covering 8 career assessment dimensions.
// Frontend loops through them with NO further AI calls.
export async function generateQuestions(req, res) {
    try {
        const prompt = `Generate exactly 25 multiple-choice career assessment questions for a student.
Cover these 8 areas (~3 questions each): Academic strengths, Subjects enjoyed, Hobbies & interests, Technical skills, Soft skills, Work style preference, Career aspirations, Personal values.

Return ONLY a valid JSON array of exactly 25 items. No markdown:
[
  {
    "id": 1,
    "question": "Which subject did you enjoy the most in high school?",
    "options": ["Science & Math", "Arts & Humanities", "Commerce & Economics", "Sports & Physical Education"]
  }
]

Rules:
- Exactly 4 options per question
- Options must be concise (max 7 words each)
- Questions must be clear and student-friendly
- No open-ended questions — all must be MCQ`;

        const response = await client.path("/chat/completions").post({
            body: {
                messages: [
                    { role: "system", content: "You output compact JSON only. No extra text." },
                    { role: "user", content: prompt },
                ],
                model,
                temperature: 0.6,
                max_tokens: 2500,
            },
        });

        if (isUnexpected(response))
            throw response.body?.error || new Error("Unexpected API response");

        const text = response.body.choices[0].message.content;
        const cleaned = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        res.json(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
        console.error("Question generation error:", error);
        res.status(500).json({ error: "Failed to generate questions" });
    }
}

// ── Analyze Career (ONE call) ──────────────────────────────────────────
// Takes compact Q&A pairs (not full chat history) for minimal tokens.
export async function analyzeCareer(req, res) {
    try {
        const { answers } = req.body;
        // answers: [{ question: "...", answer: "..." }]
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: "answers array is required" });
        }

        // Compact format: "Q: ... A: ..." — much smaller than chat history format
        const transcript = answers
            .map((a, i) => `Q${i + 1}: ${a.question}\nA: ${a.answer}`)
            .join("\n");

        const prompt = `Career assessment answers:\n${transcript}\n
Analyze and return ONLY valid JSON (no markdown):
{
  "summary": "2 sentence profile summary starting with 'You are...'",
  "recommendations": [
    {"title": "Career", "description": "1 sentence", "whyItFits": "1-2 sentences referencing specific answers"},
    {"title": "Career", "description": "1 sentence", "whyItFits": "1-2 sentences referencing specific answers"},
    {"title": "Career", "description": "1 sentence", "whyItFits": "1-2 sentences referencing specific answers"}
  ]
}`;

        const response = await client.path("/chat/completions").post({
            body: {
                messages: [
                    { role: "system", content: "You are a career counsellor. Output compact JSON only." },
                    { role: "user", content: prompt },
                ],
                model,
                temperature: 0.5,
                max_tokens: 800,
            },
        });

        if (isUnexpected(response))
            throw response.body?.error || new Error("Unexpected API response");

        const text = response.body.choices[0].message.content;
        const cleaned = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        res.json(parsed);
    } catch (error) {
        console.error("Career analysis error:", error);
        res.status(500).json({ error: "Failed to analyze career profile" });
    }
}
