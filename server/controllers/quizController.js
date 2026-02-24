import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4o";

const client = ModelClient(endpoint, new AzureKeyCredential(token));

export async function generateQuiz(req, res) {
  try {
    const { topic, numQuestions, difficulty } = req.body;

    const prompt = `
Generate ${numQuestions} ${difficulty} level MCQs from the topic: ${topic}.

For EACH question, include ALL of these fields in your JSON:
- question: the MCQ question text
- options: array of 4 option strings ["A","B","C","D"]
- answer: the exact correct option text (must match one of the options exactly)
- subtopic: a specific subtopic/construct this question tests (e.g., "Photosynthesis", "React Hooks", "Quadratic Equations")
- solution: a clear 2-4 sentence explanation of why the correct answer is right and how to approach this type of question
- doYouKnow: 2-3 interesting facts, surprising information, or curiosity-inducing knowledge related to this question's concept (engaging "Did you know?" style content)
- additionalKnowledge: extra context, real-world applications, or related concepts that deepen understanding
- learnMoreLinks: array of 2-4 objects with { title: "Short link title", url: "https://..." } - use real, relevant Wikipedia, Khan Academy, MDN, or educational URLs when possible
- imageSearchTerm: a short keyword phrase (2-4 words) for finding a related educational image (e.g., "photosynthesis diagram", "neural network visualization")

Return ONLY valid JSON array, no markdown or code blocks:
[
{
  "question": "",
  "options": ["","","",""],
  "answer": "",
  "subtopic": "",
  "solution": "",
  "doYouKnow": "",
  "additionalKnowledge": "",
  "learnMoreLinks": [{"title":"","url":""}],
  "imageSearchTerm": ""
}
]
`;

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
