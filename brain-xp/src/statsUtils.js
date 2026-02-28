/**
 * statsUtils.js
 * Lightweight helpers to persist XP and Coins to the backend stats API.
 * Call these whenever the user earns XP or coins anywhere in the app.
 */

import axios from 'axios';

const API_BASE_URL = "http://localhost:5000/api";
/**
 * Add XP to the global stats (fire-and-forget, won't throw).
 * @param {number} xp  – XP amount to add (can be negative to deduct)
 * @param {string} source – Human-readable source label, e.g. "quiz", "challenge"
 */
export async function addXpToServer(xp, source = "general") {
    if (!xp || isNaN(xp)) return;
    try {
        await axios.post(`${API_BASE_URL}/stats/addXP`, { xp, source });
    } catch (e) {
        console.warn("[statsUtils] addXpToServer failed:", e);
    }
}

/**
 * Add Coins to the global stats (fire-and-forget, won't throw).
 * @param {number} coins  – Coins amount (can be negative to deduct)
 * @param {string} source – Human-readable source label, e.g. "quiz", "challenge"
 */
export async function addCoinsToServer(coins, source = "unknown") {
    if (!coins || isNaN(coins)) return;
    try {
        await axios.post(`${API_BASE_URL}/stats/addCoins`, { coins, source });
    } catch (e) {
        console.warn("[statsUtils] addCoinsToServer failed:", e);
    }
}

/**
 * Fetch the current global XP and Coins totals from the server.
 * Returns { totalXP, totalCoins } or null on failure.
 */
export async function fetchStats() {
    try {
        // Attempt to fetch fresh stats
        const res = await axios.get(`${API_BASE_URL}/stats`);
        const stats = res.data;
        return stats;
    } catch (e) {
        console.warn("[statsUtils] fetchStats failed:", e);
        return null;
    }
}

/**
 * Add XP, fetch updated stats, and check if level-up occurred.
 * Returns { stats, levelUp } where levelUp is the result from checkLevelUp (or null).
 */
export async function addXpAndCheckLevelUp(previousXP, xp, source = "general") {
    const { checkLevelUp } = await import("./levelUtils.js");
    await addXpToServer(xp, source);
    const stats = await fetchStats();
    if (!stats) return { stats: null, levelUp: null };
    const levelUp = checkLevelUp(previousXP, stats.totalXP);
    return { stats, levelUp };
}

