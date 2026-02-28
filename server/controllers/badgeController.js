import UserBadge from "../modal/BadgeModal/UserBadge.js";
import LoginStreak from "../modal/BadgeModal/LoginStreak.js";
import ChallengeModel from "../modal/PracticeArenaModal/Challenge.js";
import AssistedQuiz from "../modal/PracticeArenaModal/AssistedQuiz.js";
import Story from "../modal/LearningArenaModal/Story.js";
import BrainBoard from "../modal/LearningArenaModal/BrainBoard.js";
import { BADGE_CATEGORIES, getTierForValue } from "./badgeDefinitions.js";


// ─── Record login & update streak ────────────────────────────────────
export async function recordLogin(req, res) {
    try {
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        let streak = await LoginStreak.findOne({ userId: req.user.id });
        if (!streak) {
            streak = await LoginStreak.create({ userId: req.user.id, currentStreak: 1, longestStreak: 1, lastLoginDate: today });
            return res.json({ currentStreak: 1, longestStreak: 1, isNewDay: true });
        }

        if (streak.lastLoginDate === today) {
            // Already logged in today
            return res.json({ currentStreak: streak.currentStreak, longestStreak: streak.longestStreak, isNewDay: false });
        }

        // Check if yesterday
        const lastDate = new Date(streak.lastLoginDate);
        const todayDate = new Date(today);
        const diffDays = Math.round((todayDate - lastDate) / 86400000);

        if (diffDays === 1) {
            // Consecutive day
            streak.currentStreak += 1;
        } else {
            // Streak broken
            streak.currentStreak = 1;
        }

        streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
        streak.lastLoginDate = today;
        await streak.save();

        res.json({ currentStreak: streak.currentStreak, longestStreak: streak.longestStreak, isNewDay: true });
    } catch (err) {
        console.error("recordLogin error:", err);
        res.status(500).json({ error: "Failed to record login" });
    }
}

// ─── Compute metrics from DB ─────────────────────────────────────────
async function computeMetrics(userId) {
    // Practice: total questions attempted
    const challenges = await ChallengeModel.find({ userId });
    const quizzes = await AssistedQuiz.find({ userId });

    let totalQuestionsAttempted = 0;
    let totalCorrect = 0;

    for (const ch of challenges) {
        totalQuestionsAttempted += ch.questions?.length || 0;
        totalCorrect += ch.questions?.filter((q) => q.isCorrect === true).length || 0;
    }
    for (const q of quizzes) {
        totalQuestionsAttempted += q.questions?.length || 0;
        totalCorrect += q.questions?.filter((qn) => qn.isCorrect === true).length || 0;
    }

    // Learning: stories + brainboards completed
    const storyCount = await Story.countDocuments({ userId });
    const boardCount = await BrainBoard.countDocuments({ userId });
    const totalLearning = storyCount + boardCount;

    // Streak
    const streak = await LoginStreak.findOne({ userId });
    const currentStreak = streak?.longestStreak || 0;

    return {
        practice: totalQuestionsAttempted,
        streak: currentStreak,
        learning: totalLearning,
        accuracy: totalCorrect,
    };
}

// ─── Check & award badges ────────────────────────────────────────────
export async function checkBadges(req, res) {
    try {
        const metrics = await computeMetrics(req.user.id);
        const existingBadges = await UserBadge.find({ userId: req.user.id });

        // Build map of existing highest tier per category
        const existing = {};
        for (const b of existingBadges) {
            if (!existing[b.category] || b.tier > existing[b.category]) {
                existing[b.category] = b.tier;
            }
        }

        const newBadges = [];

        for (const [category, value] of Object.entries(metrics)) {
            const earnedTier = getTierForValue(category, value);
            const currentTier = existing[category] ?? -1;

            if (earnedTier > currentTier) {
                // Award all tiers from currentTier+1 to earnedTier
                for (let t = currentTier + 1; t <= earnedTier; t++) {
                    const badgeDef = BADGE_CATEGORIES[category].badges[t];
                    try {
                        await UserBadge.create({
                            userId: req.user.id,
                            category,
                            tier: t,
                            badgeName: badgeDef.name,
                        });
                        // Only report the highest new badge to the user
                        if (t === earnedTier) {
                            newBadges.push({
                                category,
                                tier: t,
                                badge: badgeDef,
                                categoryLabel: BADGE_CATEGORIES[category].label,
                                categoryEmoji: BADGE_CATEGORIES[category].emoji,
                                value,
                            });
                        }
                    } catch (dupErr) {
                        // Already exists, skip
                    }
                }
            }
        }

        res.json({ newBadges, metrics });
    } catch (err) {
        console.error("checkBadges error:", err);
        res.status(500).json({ error: "Failed to check badges" });
    }
}

// ─── Get all user badges ─────────────────────────────────────────────
export async function getUserBadges(req, res) {
    try {
        const badges = await UserBadge.find({ userId: req.user.id }).sort({ category: 1, tier: 1 });
        res.json(badges);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch badges" });
    }
}

// ─── Get progress toward next badge in each category ─────────────────
export async function getBadgeProgress(req, res) {
    try {
        const metrics = await computeMetrics(req.user.id);
        const existingBadges = await UserBadge.find({ userId: req.user.id });

        const existing = {};
        for (const b of existingBadges) {
            if (!existing[b.category] || b.tier > existing[b.category]) {
                existing[b.category] = b.tier;
            }
        }

        const progress = {};
        for (const [category, catDef] of Object.entries(BADGE_CATEGORIES)) {
            const currentTier = existing[category] ?? -1;
            const nextTier = currentTier + 1;
            const currentValue = metrics[category] || 0;

            const currentBadge = currentTier >= 0 ? catDef.badges[currentTier] : null;
            const nextBadge = nextTier < 10 ? catDef.badges[nextTier] : null;
            const nextThreshold = nextTier < 10 ? catDef.thresholds[nextTier] : null;
            const prevThreshold = currentTier >= 0 ? catDef.thresholds[currentTier] : 0;

            const progressPct = nextThreshold
                ? Math.min(1, Math.max(0, (currentValue - prevThreshold) / (nextThreshold - prevThreshold)))
                : 1;

            progress[category] = {
                label: catDef.label,
                emoji: catDef.emoji,
                color: catDef.color,
                currentTier,
                currentBadge,
                nextTier,
                nextBadge,
                nextThreshold,
                currentValue,
                progressPct,
                maxedOut: nextTier >= 10,
            };
        }

        res.json(progress);
    } catch (err) {
        console.error("getBadgeProgress error:", err);
        res.status(500).json({ error: "Failed to get badge progress" });
    }
}
