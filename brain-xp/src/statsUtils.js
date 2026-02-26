/**
 * statsUtils.js
 * Lightweight helpers to persist XP and Coins to the backend stats API.
 * Call these whenever the user earns XP or coins anywhere in the app.
 */

const STATS_BASE = "http://localhost:5000/api/stats";

/**
 * Add XP to the global stats (fire-and-forget, won't throw).
 * @param {number} xp  – XP amount to add (can be negative to deduct)
 * @param {string} source – Human-readable source label, e.g. "quiz", "challenge"
 */
export async function addXpToServer(xp, source = "general") {
    if (!xp || isNaN(xp)) return;
    try {
        await fetch(`${STATS_BASE}/xp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ xp, source }),
        });
    } catch (e) {
        console.warn("[statsUtils] addXpToServer failed:", e);
    }
}

/**
 * Add Coins to the global stats (fire-and-forget, won't throw).
 * @param {number} coins  – Coins amount (can be negative to deduct)
 * @param {string} source – Human-readable source label, e.g. "quiz", "challenge"
 */
export async function addCoinsToServer(coins, source = "general") {
    if (!coins || isNaN(coins)) return;
    try {
        await fetch(`${STATS_BASE}/coins`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ coins, source }),
        });
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
        const res = await fetch(`${STATS_BASE}`);
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.warn("[statsUtils] fetchStats failed:", e);
        return null;
    }
}
