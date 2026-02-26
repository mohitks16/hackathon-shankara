import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4o-mini";

const client = ModelClient(endpoint, new AzureKeyCredential(token));

export async function generateQuiz(req, res) {
  try {
    const { topic, numQuestions, difficulty } = req.body;

    const prompt = `Generate ${numQuestions} ${difficulty} level MCQs on: ${topic}.
Return ONLY valid JSON array, no markdown:
[{"question":"","options":["","","",""],"answer":"","subtopic":"","solution":"1-3 sentences","doYouKnow":"1 interesting fact"}]
Rules: 4 options per question. answer must exactly match one option.`;

    const response = await client
      .path("/chat/completions")
      .post({
        body: {
          messages: [
            { role: "system", content: "You generate clean JSON only." },
            { role: "user", content: prompt },
          ],
          model: model,
          temperature: 0.7,
          max_tokens: 2000,
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
      subtopic: q.subtopic || "",
      solution: q.solution || "",
      doYouKnow: q.doYouKnow || "",
      additionalKnowledge: q.additionalKnowledge || "",
      learnMoreLinks: Array.isArray(q.learnMoreLinks)
        ? q.learnMoreLinks.map((l) => ({
          title: l.title || (typeof l === "string" ? l : "Learn more"),
          url: l.url || (typeof l === "string" ? l : "#"),
        }))
        : [],
      imageSearchTerm: q.imageSearchTerm || "",
    }));

    res.json(normalized);
  } catch (error) {
    console.error("Quiz generation error:", error);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
}
