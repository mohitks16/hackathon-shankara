/**
 * levelUtils.js
 * XP-based leveling system with escalating difficulty across 4 brackets.
 *
 * Brackets:
 *   Seeding     (Lvl 1–5)   – easy to level up
 *   Apprentice  (Lvl 6–15)  – moderate
 *   Scholar     (Lvl 16–30) – hard
 *   Legend      (Lvl 31+)   – very hard
 */

// Pre-computed cumulative XP thresholds for each level.
// thresholds[i] = total XP needed to REACH level (i+1).
// Level 1 starts at 0 XP.  Level 2 at 20 XP, etc.
function buildThresholds() {
    const t = [0]; // level 1 = 0 XP

    // Seeding 1→5  (levels 2-5): 20, 50, 90, 140
    const seedCosts = [20, 30, 40, 50];
    // Apprentice 6→15 (levels 6-15): ramp from 70 to 160
    const apprenticeCosts = [70, 80, 90, 100, 110, 120, 130, 140, 150, 160];
    // Scholar 16→30 (levels 16-30): ramp from 200 to 480
    const scholarCosts = [200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420, 440, 460, 480];
    // Legend 31+ : starts at 550, +60 each level (open-ended)

    const allCosts = [...seedCosts, ...apprenticeCosts, ...scholarCosts];
    let cumulative = 0;
    for (const cost of allCosts) {
        cumulative += cost;
        t.push(cumulative); // t[1]=20 means level 2 at 20 XP, etc.
    }
    return t;
}

const THRESHOLDS = buildThresholds();

/**
 * Get the level and bracket info from totalXP.
 * @param {number} totalXP
 * @returns {{ level, bracket, bracketIcon, xpForCurrentLevel, xpForNextLevel, xpInLevel, xpNeededForNext, progress }}
 */
export function getLevelFromXP(totalXP) {
    const xp = Math.max(0, totalXP || 0);

    // Find level from precomputed thresholds
    let level = 1;
    for (let i = 1; i < THRESHOLDS.length; i++) {
        if (xp >= THRESHOLDS[i]) {
            level = i + 1; // e.g. xp >= THRESHOLDS[1] (20) means level 2
        } else {
            break;
        }
    }

    // Handle legend levels beyond the precomputed table
    if (level >= THRESHOLDS.length) {
        // Legend territory: each level costs 550 + 60*(levelsIntoLegend)
        let legendBase = THRESHOLDS[THRESHOLDS.length - 1];
        let legendLevel = THRESHOLDS.length; // first legend level
        let cost = 550;
        while (xp >= legendBase + cost) {
            legendBase += cost;
            legendLevel++;
            cost = 550 + (legendLevel - THRESHOLDS.length) * 60;
        }
        level = legendLevel;

        const xpForCurrentLevel = legendBase;
        const xpForNextLevel = legendBase + cost;
        const xpInLevel = xp - xpForCurrentLevel;
        const xpNeededForNext = cost;
        const progress = xpNeededForNext > 0 ? Math.min(1, xpInLevel / xpNeededForNext) : 1;

        return {
            level,
            bracket: "Legend",
            bracketIcon: "👑",
            xpForCurrentLevel,
            xpForNextLevel,
            xpInLevel,
            xpNeededForNext,
            progress,
        };
    }

    // Normal levels (1-30)
    const xpForCurrentLevel = THRESHOLDS[level - 1] || 0;
    const xpForNextLevel = THRESHOLDS[level] || xpForCurrentLevel + 550;
    const xpInLevel = xp - xpForCurrentLevel;
    const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
    const progress = xpNeededForNext > 0 ? Math.min(1, xpInLevel / xpNeededForNext) : 1;

    let bracket, bracketIcon;
    if (level <= 5) {
        bracket = "Seeding";
        bracketIcon = "🌱";
    } else if (level <= 15) {
        bracket = "Apprentice";
        bracketIcon = "⚔️";
    } else if (level <= 30) {
        bracket = "Scholar";
        bracketIcon = "📚";
    } else {
        bracket = "Legend";
        bracketIcon = "👑";
    }

    return {
        level,
        bracket,
        bracketIcon,
        xpForCurrentLevel,
        xpForNextLevel,
        xpInLevel,
        xpNeededForNext,
        progress,
    };
}

/**
 * Get bonus rewards for leveling up.
 * @param {number} newLevel
 * @returns {{ bonusXP: number, bonusCoins: number }}
 */
export function getLevelUpRewards(newLevel) {
    if (newLevel <= 5) {
        return { bonusXP: 5, bonusCoins: 2 };
    } else if (newLevel <= 15) {
        return { bonusXP: 10, bonusCoins: 5 };
    } else if (newLevel <= 30) {
        return { bonusXP: 20, bonusCoins: 10 };
    } else {
        return { bonusXP: 50, bonusCoins: 25 };
    }
}

/**
 * Check if totalXP crosses into a new level compared to previousXP.
 * @returns {{ leveledUp: boolean, oldLevel: number, newLevel: number, rewards: {} } | null}
 */
export function checkLevelUp(previousXP, currentXP) {
    const oldInfo = getLevelFromXP(previousXP);
    const newInfo = getLevelFromXP(currentXP);
    if (newInfo.level > oldInfo.level) {
        return {
            leveledUp: true,
            oldLevel: oldInfo.level,
            newLevel: newInfo.level,
            oldBracket: oldInfo.bracket,
            newBracket: newInfo.bracket,
            bracketIcon: newInfo.bracketIcon,
            rewards: getLevelUpRewards(newInfo.level),
        };
    }
    return null;
}
