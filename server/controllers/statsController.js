import Stats from "../modal/XPandCoinsModal/Stats.js";
import WeakSubtopic from "../modal/WeakSubtopicsModal/WeakSubtopic.js";

const USER_ID = "guest";

// ── Get global stats ──────────────────────────────────────────────────
export async function getStats(req, res) {
    try {
        const stats = await Stats.findOneAndUpdate(
            { userId: USER_ID },
            {},
            { upsert: true, new: true }
        );
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch stats" });
    }
}

// ── Add XP ────────────────────────────────────────────────────────────
export async function addXP(req, res) {
    try {
        const { xp, source } = req.body;
        const stats = await Stats.findOneAndUpdate(
            { userId: USER_ID },
            { $inc: { totalXP: xp }, $push: { history: { source, xp, coins: 0 } } },
            { upsert: true, new: true }
        );
        res.json({ totalXP: stats.totalXP });
    } catch (err) {
        res.status(500).json({ error: "Failed to add XP" });
    }
}

// ── Add Coins ─────────────────────────────────────────────────────────
export async function addCoins(req, res) {
    try {
        const { coins, source } = req.body;
        const stats = await Stats.findOneAndUpdate(
            { userId: USER_ID },
            { $inc: { totalCoins: coins }, $push: { history: { source, xp: 0, coins } } },
            { upsert: true, new: true }
        );
        res.json({ totalCoins: stats.totalCoins });
    } catch (err) {
        res.status(500).json({ error: "Failed to add coins" });
    }
}

// ── Get weak subtopics ────────────────────────────────────────────────
export async function getWeakSubtopics(req, res) {
    try {
        const weak = await WeakSubtopic.find({ userId: USER_ID })
            .sort({ count: -1, lastSeenAt: -1 })
            .limit(20);
        res.json(weak);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch weak subtopics" });
    }
}
