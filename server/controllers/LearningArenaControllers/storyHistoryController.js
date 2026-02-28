import Story from "../../modal/LearningArenaModal/Story.js";
import WeakSubtopic from "../../modal/WeakSubtopicsModal/WeakSubtopic.js";
import Stats from "../../modal/XPandCoinsModal/Stats.js";


export async function saveStory(req, res) {
    try {
        const { topic, difficulty, subtopics, wrongAnswers, xpEarned } = req.body;

        await Stats.findOneAndUpdate(
            { userId: req.user.id },
            { $inc: { totalXP: xpEarned || 0 }, $push: { history: { source: "story", xp: xpEarned || 0, coins: 0 } } },
            { upsert: true }
        );

        for (const w of (wrongAnswers || [])) {
            if (w.subtopic) {
                await WeakSubtopic.findOneAndUpdate(
                    { userId: req.user.id, subtopic: w.subtopic, source: "story" },
                    { $inc: { count: 1 }, $set: { lastSeenAt: new Date() } },
                    { upsert: true }
                );
            }
        }

        const story = await Story.create({
            userId: req.user.id, topic, difficulty,
            subtopics: subtopics || [],
            wrongAnswers: wrongAnswers || [],
            xpEarned: xpEarned || 0,
            name: `${topic} — ${new Date().toLocaleDateString()}`,
        });

        res.status(201).json({ id: story._id });
    } catch (err) {
        console.error("saveStory error:", err);
        res.status(500).json({ error: "Failed to save story" });
    }
}

export async function listStories(req, res) {
    try {
        const stories = await Story.find({ userId: req.user.id })
            .select("_id name topic difficulty xpEarned createdAt")
            .sort({ createdAt: -1 });
        res.json(stories);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch stories" });
    }
}

export async function getStoryById(req, res) {
    try {
        const s = await Story.findOne({ _id: req.params.id, userId: req.user.id });
        if (!s) return res.status(404).json({ error: "Not found" });
        res.json(s);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch story" });
    }
}

export async function deleteStory(req, res) {
    try {
        await Story.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete" });
    }
}

export async function addStoryNote(req, res) {
    try {
        const { subtopicIndex, note } = req.body;
        const s = await Story.findOne({ _id: req.params.id, userId: req.user.id });
        if (!s) return res.status(404).json({ error: "Not found" });
        if (subtopicIndex !== undefined) s.subtopics[subtopicIndex].note = note;
        else s.note = note;
        await s.save();
        res.json({ message: "Note saved" });
    } catch (err) {
        res.status(500).json({ error: "Failed to save note" });
    }
}
