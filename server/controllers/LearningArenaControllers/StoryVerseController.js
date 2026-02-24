import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4o";
const client = ModelClient(endpoint, new AzureKeyCredential(token));

const subtopicCount = { novice: 5, achiever: 7, warrior: 10 };

// ── 1. Generate Subtopics ─────────────────────────────────────────────
export async function generateSubtopics(req, res) {
    try {
        const { topic, difficulty } = req.body;
        if (!topic?.trim() || !difficulty) {
            return res.status(400).json({ error: "topic and difficulty are required" });
        }

        const count = subtopicCount[difficulty] ?? 5;

        const prompt = `You are an expert educator. Break the topic "${topic}" into exactly ${count} clear, distinct subtopics suitable for a ${difficulty}-level learner.
Return ONLY a valid JSON array of ${count} subtopic name strings. No markdown, no explanation, no code blocks.
Example: ["Subtopic 1", "Subtopic 2", ...]`;

        const response = await client.path("/chat/completions").post({
            body: {
                messages: [
                    { role: "system", content: "You generate clean JSON only." },
                    { role: "user", content: prompt },
                ],
                model,
                temperature: 0.5,
            },
        });

        if (isUnexpected(response)) {
            throw response.body?.error || new Error("Unexpected API response");
        }

        const text = response.body.choices[0].message.content;
        const cleaned = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        const subtopics = Array.isArray(parsed) ? parsed : Object.values(parsed);

        res.json({ subtopics: subtopics.slice(0, count) });
    } catch (error) {
        console.error("Subtopic generation error:", error);
        res.status(500).json({ error: "Failed to generate subtopics" });
    }
}

// ── 2. Generate Story + DoYouKnow + Resource Links ───────────────────
export async function generateStory(req, res) {
    try {
        const { topic, subtopic, difficulty } = req.body;
        if (!topic?.trim() || !subtopic?.trim()) {
            return res.status(400).json({ error: "topic and subtopic are required" });
        }

        const cardCount = difficulty === "warrior" ? 5 : difficulty === "achiever" ? 4 : 3;

        const prompt = `You are a master storyteller and educator. Create an engaging, analogy-driven story to teach "${subtopic}" (part of the broader topic "${topic}") to a ${difficulty}-level student.

Return ONLY a valid JSON object with these exact fields:
{
  "storyCards": [
    "Paragraph 1 of the story (100-150 words, vivid analogy)",
    "Paragraph 2...",
    ...exactly ${cardCount} paragraphs total
  ],
  "doYouKnow": "1-2 surprising, interesting facts about ${subtopic} in a 'Did You Know?' style (2-3 sentences)",
  "resourceLinks": [
    { "title": "Short descriptive title", "url": "https://www.youtube.com/watch?v=...", "type": "youtube" },
    { "title": "Short descriptive title", "url": "https://en.wikipedia.org/wiki/...", "type": "web" },
    { "title": "Short descriptive title", "url": "https://www.khanacademy.org/...", "type": "web" }
  ]
}

Rules for resourceLinks:
- Include 2 YouTube links (real, relevant, educational YouTube URLs — search for popular educational channels like CrashCourse, Khan Academy, Veritasium, TED-Ed, 3Blue1Brown)
- Include 2-3 web links (Wikipedia, Khan Academy, or other reputable educational sites)
- URLs must be real and relevant to "${subtopic}"
- No markdown, no code blocks in response`;

        const response = await client.path("/chat/completions").post({
            body: {
                messages: [
                    { role: "system", content: "You generate clean JSON only. All URLs must be real and valid." },
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
        const parsed = JSON.parse(cleaned);

        res.json({
            storyCards: Array.isArray(parsed.storyCards) ? parsed.storyCards : [],
            doYouKnow: parsed.doYouKnow || "",
            resourceLinks: Array.isArray(parsed.resourceLinks)
                ? parsed.resourceLinks.map((l) => ({
                    title: l.title || "Learn more",
                    url: l.url || "#",
                    type: l.type === "youtube" ? "youtube" : "web",
                }))
                : [],
        });
    } catch (error) {
        console.error("Story generation error:", error);
        res.status(500).json({ error: "Failed to generate story" });
    }
}

// ── 3. Generate Mini Quiz (5 questions) ──────────────────────────────
export async function generateStoryQuiz(req, res) {
    try {
        const { topic, subtopic, difficulty } = req.body;
        if (!topic?.trim() || !subtopic?.trim()) {
            return res.status(400).json({ error: "topic and subtopic are required" });
        }

        const difficultyMap = {
            novice: "easy",
            achiever: "medium",
            warrior: "hard",
        };
        const quizDiff = difficultyMap[difficulty] ?? "easy";

        const prompt = `Generate exactly 5 ${quizDiff}-level MCQs about the subtopic "${subtopic}" from the topic "${topic}".
Questions should test understanding of the core concept, not trivial memorization.

Return ONLY a valid JSON array:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Exact correct option text",
    "solution": "2-3 sentence explanation of why this is correct"
  }
]
No markdown, no code blocks.`;

        const response = await client.path("/chat/completions").post({
            body: {
                messages: [
                    { role: "system", content: "You generate clean JSON only." },
                    { role: "user", content: prompt },
                ],
                model,
                temperature: 0.6,
            },
        });

        if (isUnexpected(response)) {
            throw response.body?.error || new Error("Unexpected API response");
        }

        const text = response.body.choices[0].message.content;
        const cleaned = text.replace(/```json|```/g, "").trim();
        let parsed = JSON.parse(cleaned);
        if (!Array.isArray(parsed)) parsed = [parsed];

        const normalized = parsed.slice(0, 5).map((q) => ({
            question: q.question || "",
            options: Array.isArray(q.options) ? q.options : ["", "", "", ""],
            answer: q.answer || "",
            solution: q.solution || "",
        }));

        res.json(normalized);
    } catch (error) {
        console.error("Story quiz generation error:", error);
        res.status(500).json({ error: "Failed to generate quiz" });
    }
}
