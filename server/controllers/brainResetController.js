import StudyLog from "../modal/BrainResetModal/StudyLog.js";
import RevisionNotification from "../modal/BrainResetModal/RevisionNotification.js";
import ChallengeModel from "../modal/PracticeArenaModal/Challenge.js";
import WeakSubtopic from "../modal/WeakSubtopicsModal/WeakSubtopic.js";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4o-mini";
const client = ModelClient(endpoint, new AzureKeyCredential(token));

const REVISION_INTERVALS = [1, 5, 14, 30]; // days

// ─── 1) Log a studied topic ──────────────────────────────────────────
export async function logStudy(req, res) {
    try {
        const { topic, source } = req.body;
        if (!topic?.trim()) return res.status(400).json({ error: "topic required" });

        const log = await StudyLog.create({
            userId: req.user.id,
            topic: topic.trim(),
            source: source || "quiz",
        });

        // Generate revision notifications for 1, 5, 14, 30 days
        const notifications = REVISION_INTERVALS.map((days) => ({
            userId: req.user.id,
            studyLogId: log._id,
            topic: log.topic,
            source: log.source,
            dayInterval: days,
            dueDate: new Date(log.studiedAt.getTime() + days * 86400000),
        }));

        // insertMany with ordered:false to skip duplicates silently
        await RevisionNotification.insertMany(notifications, { ordered: false }).catch(() => { });

        res.status(201).json({ id: log._id, message: "Study logged" });
    } catch (err) {
        console.error("logStudy error:", err);
        res.status(500).json({ error: "Failed to log study" });
    }
}

// ─── 2) Get pending revision notifications ───────────────────────────
export async function getNotifications(req, res) {
    try {
        const now = new Date();
        const notifications = await RevisionNotification.find({
            userId: req.user.id,
            dismissed: false,
            dueDate: { $lte: now },
        })
            .sort({ dueDate: 1 })
            .limit(50);

        res.json(notifications);
    } catch (err) {
        console.error("getNotifications error:", err);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
}

// ─── 3) Dismiss a notification ───────────────────────────────────────
export async function dismissNotification(req, res) {
    try {
        await RevisionNotification.findByIdAndUpdate(req.params.id, {
            dismissed: true,
            seen: true,
        });
        res.json({ message: "Dismissed" });
    } catch (err) {
        res.status(500).json({ error: "Failed to dismiss" });
    }
}

// ─── 4) Smart Mistake Buckets ────────────────────────────────────────
// Avg time per difficulty for classification
const AVG_TIMES = { easy: 60, medium: 120, hard: 180 };

function classifyMistake(q, challengeDifficulty) {
    const diff = q.difficulty || challengeDifficulty || "medium";
    const avgTime = AVG_TIMES[diff] || 120;
    const time = q.timeTakenSeconds || 0;

    // If no time data, classify as weak concept by default
    if (time === 0) return "weak_concept";

    // Guessing: extremely low time, hard difficulty
    if (time < avgTime * 0.25 && diff === "hard") return "guessing";

    // Silly: less than half the average time
    if (time < avgTime * 0.5) return "silly";

    // Overthinking: easy/medium difficulty but took too long
    if ((diff === "easy" || diff === "medium") && time > avgTime * 1.5) return "overthinking";

    // Time pressure: hard/medium, took long
    if (time > avgTime * 1.5 && (diff === "medium" || diff === "hard")) return "time_pressure";

    // Default: weak concept
    return "weak_concept";
}

export async function getMistakeBuckets(req, res) {
    try {
        const challenges = await ChallengeModel.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);

        const buckets = {
            silly: [],
            time_pressure: [],
            weak_concept: [],
            overthinking: [],
            guessing: [],
        };

        for (const ch of challenges) {
            for (const q of ch.questions) {
                if (q.isCorrect === false) {
                    const bucket = classifyMistake(q, ch.difficulty);
                    buckets[bucket].push({
                        challengeId: ch._id,
                        topic: ch.topic,
                        difficulty: q.difficulty || ch.difficulty,
                        question: q.question,
                        userAnswer: q.userAnswer,
                        correctAnswer: q.answer,
                        solution: q.solution,
                        timeTakenSeconds: q.timeTakenSeconds,
                        subtopic: q.subtopic,
                        date: ch.createdAt,
                    });
                }
            }
        }

        res.json(buckets);
    } catch (err) {
        console.error("getMistakeBuckets error:", err);
        res.status(500).json({ error: "Failed to fetch mistake buckets" });
    }
}

// ─── 5) Get weak subtopics ───────────────────────────────────────────
export async function getWeakSubtopics(req, res) {
    try {
        const weak = await WeakSubtopic.find({ userId: req.user.id })
            .sort({ count: -1, lastSeenAt: -1 })
            .limit(30);
        res.json(weak);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch weak subtopics" });
    }
}

// ─── 6) Remove weak subtopic ─────────────────────────────────────────
export async function removeWeakSubtopic(req, res) {
    try {
        await WeakSubtopic.findByIdAndDelete(req.params.id);
        res.json({ message: "Weak subtopic removed" });
    } catch (err) {
        res.status(500).json({ error: "Failed to remove" });
    }
}

// ─── 7) Generate revision material (flashcards + quiz) ───────────────
export async function generateRevision(req, res) {
    try {
        const { subtopic } = req.body;
        if (!subtopic?.trim()) return res.status(400).json({ error: "subtopic required" });

        const prompt = `Create revision material for the subtopic: "${subtopic.trim()}"

Generate EXACTLY this JSON:
{
  "flashcards": [
    {"front": "concept/question", "back": "answer/explanation/formula"},
    ... (exactly 5 flashcards covering key concepts, formulas, and important facts)
  ],
  "quiz": [
    {"question": "MCQ text", "options": ["a","b","c","d"], "answer": "correct option", "solution": "2-sentence explanation"},
    ... (exactly 10 questions, mixed difficulty: 3 easy, 4 medium, 3 hard)
  ]
}

Return ONLY valid JSON, no markdown or code blocks.`;

        const response = await client.path("/chat/completions").post({
            body: {
                messages: [
                    { role: "system", content: "Generate clean, educational JSON revision material." },
                    { role: "user", content: prompt },
                ],
                model,
                temperature: 0.6,
            },
        });

        if (isUnexpected(response)) {
            throw response.body?.error || new Error("AI error");
        }

        const text = response.body.choices[0].message.content;
        const cleaned = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        res.json({
            flashcards: Array.isArray(parsed.flashcards) ? parsed.flashcards.slice(0, 5) : [],
            quiz: Array.isArray(parsed.quiz) ? parsed.quiz.slice(0, 10) : [],
        });
    } catch (err) {
        console.error("generateRevision error:", err);
        res.status(500).json({ error: "Failed to generate revision material" });
    }
}
