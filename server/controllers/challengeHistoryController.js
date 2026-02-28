import ChallengeModel from "../modal/PracticeArenaModal/Challenge.js";
import WeakSubtopic from "../modal/WeakSubtopicsModal/WeakSubtopic.js";
import Stats from "../modal/XPandCoinsModal/Stats.js";
import StudyLog from "../modal/BrainResetModal/StudyLog.js";
import RevisionNotification from "../modal/BrainResetModal/RevisionNotification.js";

const USER_ID = "guest";
const REVISION_INTERVALS = [1, 5, 14, 30];

// ── Save challenge after result ───────────────────────────────────────
export async function saveChallenge(req, res) {
    try {
        const { topic, difficulty, questions, score, xpEarned, coinsEarned, weakSubtopics, timeTakenSeconds } = req.body;

        await Stats.findOneAndUpdate(
            { userId: USER_ID },
            { $inc: { totalXP: xpEarned || 0, totalCoins: coinsEarned || 0 }, $push: { history: { source: "challenge", xp: xpEarned || 0, coins: coinsEarned || 0 } } },
            { upsert: true }
        );

        for (const sub of (weakSubtopics || [])) {
            await WeakSubtopic.findOneAndUpdate(
                { userId: USER_ID, subtopic: sub, source: "challenge" },
                { $inc: { count: 1 }, $set: { lastSeenAt: new Date() } },
                { upsert: true }
            );
        }

        const challenge = await ChallengeModel.create({
            userId: USER_ID, topic, difficulty,
            questions: questions || [],
            score: score || 0, xpEarned: xpEarned || 0, coinsEarned: coinsEarned || 0,
            weakSubtopics: weakSubtopics || [],
            timeTakenSeconds: timeTakenSeconds || 0,
            name: `${topic} — ${new Date().toLocaleDateString()}`,
        });

        // Log study for forgetting curve notifications
        try {
            const log = await StudyLog.create({ userId: USER_ID, topic, source: "challenge" });
            const notifications = REVISION_INTERVALS.map((days) => ({
                userId: USER_ID,
                studyLogId: log._id,
                topic,
                source: "challenge",
                dayInterval: days,
                dueDate: new Date(Date.now() + days * 86400000),
            }));
            await RevisionNotification.insertMany(notifications, { ordered: false }).catch(() => { });
        } catch (e) { /* non-critical */ }

        res.status(201).json({ id: challenge._id, message: "Challenge saved" });
    } catch (err) {
        console.error("saveChallenge error:", err);
        res.status(500).json({ error: "Failed to save challenge" });
    }
}

// ── List ─────────────────────────────────────────────────────────────
export async function listChallenges(req, res) {
    try {
        const list = await ChallengeModel.find({ userId: USER_ID })
            .select("_id name topic difficulty score xpEarned coinsEarned weakSubtopics createdAt")
            .sort({ createdAt: -1 });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch challenges" });
    }
}

// ── Get by id ────────────────────────────────────────────────────────
export async function getChallengeById(req, res) {
    try {
        const ch = await ChallengeModel.findOne({ _id: req.params.id, userId: USER_ID });
        if (!ch) return res.status(404).json({ error: "Not found" });
        res.json(ch);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch challenge" });
    }
}

// ── Rename ───────────────────────────────────────────────────────────
export async function renameChallenge(req, res) {
    try {
        await ChallengeModel.findOneAndUpdate({ _id: req.params.id, userId: USER_ID }, { name: req.body.name });
        res.json({ message: "Renamed" });
    } catch (err) {
        res.status(500).json({ error: "Failed to rename" });
    }
}

// ── Delete ───────────────────────────────────────────────────────────
export async function deleteChallenge(req, res) {
    try {
        await ChallengeModel.findOneAndDelete({ _id: req.params.id, userId: USER_ID });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete" });
    }
}

// ── Bookmark ─────────────────────────────────────────────────────────
export async function toggleChallengeBookmark(req, res) {
    try {
        const { questionIndex } = req.body;
        const ch = await ChallengeModel.findOne({ _id: req.params.id, userId: USER_ID });
        if (!ch) return res.status(404).json({ error: "Not found" });
        ch.questions[questionIndex].isBookmarked = !ch.questions[questionIndex].isBookmarked;
        await ch.save();
        res.json({ isBookmarked: ch.questions[questionIndex].isBookmarked });
    } catch (err) {
        res.status(500).json({ error: "Failed to toggle bookmark" });
    }
}

// ── Add note ─────────────────────────────────────────────────────────
export async function addChallengeNote(req, res) {
    try {
        const { questionIndex, note } = req.body;
        const ch = await ChallengeModel.findOne({ _id: req.params.id, userId: USER_ID });
        if (!ch) return res.status(404).json({ error: "Not found" });
        ch.questions[questionIndex].note = note;
        await ch.save();
        res.json({ message: "Note saved" });
    } catch (err) {
        res.status(500).json({ error: "Failed to save note" });
    }
}
