import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4o";
const client = ModelClient(endpoint, new AzureKeyCredential(token));

// ── Generate Challenge Quiz ───────────────────────────────────────────
export async function generateChallenge(req, res) {
  try {
    const { topic, numQuestions, difficulty } = req.body;
    if (!topic?.trim() || !numQuestions || !difficulty) {
      return res.status(400).json({ error: "topic, numQuestions, and difficulty are required" });
    }

    const prompt = `
Generate ${numQuestions} ${difficulty} level MCQs on the topic: ${topic}.

For EACH question return ALL these fields:
- question: the MCQ text
- options: array of exactly 4 strings
- answer: the exact correct option (must match one option exactly)
- solution: 2-4 sentence explanation of the correct answer
- hint: a subtle 1-sentence clue that helps the student think in the right direction WITHOUT revealing the answer

Return ONLY a valid JSON array, no markdown or code blocks:
[{"question":"","options":["","","",""],"answer":"","solution":"","hint":""}]
`;

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: "You generate clean JSON only." },
          { role: "user", content: prompt },
        ],
        model,
        temperature: 0.7,
      },
    });

    if (isUnexpected(response)) {
      throw response.body?.error || new Error("Unexpected API response");
    }

    const text = response.body.choices[0].message.content;
    const cleaned = text.replace(/```json|```/g, "").trim();
    let parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) parsed = [parsed];

    const normalized = parsed.map((q) => ({
      question: q.question || "",
      options: Array.isArray(q.options) ? q.options : ["", "", "", ""],
      answer: q.answer || "",
      solution: q.solution || "",
      hint: q.hint || "",
    }));

    res.json(normalized);
  } catch (error) {
    console.error("Challenge generation error:", error);
    res.status(500).json({ error: "Failed to generate challenge" });
  }
}

// ── AI Hint (on-demand, per question) ─────────────────────────────────
export async function getChallengeHint(req, res) {
  try {
    const { topic, question, options } = req.body;
    if (!question) {
      return res.status(400).json({ error: "question is required" });
    }

    const prompt = `The student is stuck on this ${topic || ""} question:
"${question}"
Options: ${JSON.stringify(options || [])}

Give a SHORT 1-2 sentence hint that nudges them toward the right thinking WITHOUT revealing the answer. Be encouraging.`;

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: "You give short, helpful hints. Never reveal the answer directly." },
          { role: "user", content: prompt },
        ],
        model,
        temperature: 0.6,
      },
    });

    if (isUnexpected(response)) {
      throw response.body?.error || new Error("Unexpected API response");
    }

    const hint = response.body.choices[0].message.content.trim();
    res.json({ hint });
  } catch (error) {
    console.error("Challenge hint error:", error);
    res.status(500).json({ error: "Failed to generate hint" });
  }
}

// ── Past Challenges (placeholder) ─────────────────────────────────────
export async function listPastChallenges(req, res) {
  try {
    res.json({ challenges: [], message: "Past challenges will appear here" });
  } catch (error) {
    console.error("List past challenges error:", error);
    res.status(500).json({ error: "Failed to fetch past challenges" });
  }
}

export async function getPastChallengeById(req, res) {
  try {
    const { id } = req.params;
    res.status(404).json({ error: "Challenge not found", id });
  } catch (error) {
    console.error("Get past challenge error:", error);
    res.status(500).json({ error: "Failed to fetch challenge" });
  }
}
