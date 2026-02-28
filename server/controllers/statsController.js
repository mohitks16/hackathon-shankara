import Stats from "../modal/XPandCoinsModal/Stats.js";
import WeakSubtopic from "../modal/WeakSubtopicsModal/WeakSubtopic.js";
import User from "../modal/UserModal/User.js";
import UserBadge from "../modal/BadgeModal/UserBadge.js";


// ── Get global stats ──────────────────────────────────────────────────
export async function getStats(req, res) {
    try {
        const stats = await Stats.findOneAndUpdate(
            { userId: req.user.id },
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
            { userId: req.user.id },
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
            { userId: req.user.id },
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
        const weak = await WeakSubtopic.find({ userId: req.user.id })
            .sort({ count: -1, lastSeenAt: -1 })
            .limit(20);
        res.json(weak);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch weak subtopics" });
    }
}

// ── Get Global Leaderboard ────────────────────────────────────────────
export async function getLeaderboard(req, res) {
    try {
        const topStats = await Stats.find().sort({ totalXP: -1 }).limit(50);

        const userIds = topStats.map(s => s.userId);

        // Fetch users
        const users = await User.find({ _id: { $in: userIds } });
        const userMap = {};
        users.forEach(u => userMap[u._id.toString()] = u.username);

        // Fetch badges
        const badges = await UserBadge.find({ userId: { $in: userIds } });
        const badgeMap = {};
        badges.forEach(b => {
            if (!badgeMap[b.userId]) badgeMap[b.userId] = [];
            // Only keep highest tier per category for the leaderboard
            const existing = badgeMap[b.userId].find(eb => eb.category === b.category);
            if (!existing || b.tier > existing.tier) {
                badgeMap[b.userId] = badgeMap[b.userId].filter(eb => eb.category !== b.category);
                badgeMap[b.userId].push(b);
            }
        });

        const leaderboard = topStats.map(s => ({
            userId: s.userId,
            username: userMap[s.userId] || "Unknown User",
            totalXP: s.totalXP,
            totalCoins: s.totalCoins,
            badges: badgeMap[s.userId] || []
        }));

        res.json(leaderboard);
    } catch (err) {
        console.error("getLeaderboard error:", err);
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
}
