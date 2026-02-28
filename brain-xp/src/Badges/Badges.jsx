import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaMedal, FaTrophy } from "react-icons/fa";
import { BADGE_CATEGORIES, CATEGORY_ORDER } from "../badgeData";
import axios from "axios";

const API = "http://localhost:5000/api/badges";

export default function Badges() {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(null);
    const [earnedBadges, setEarnedBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCat, setExpandedCat] = useState(null);

    useEffect(() => {
        Promise.all([
            axios.get(`${API}/progress`),
            axios.get(API),
        ]).then(([progRes, badgesRes]) => {
            setProgress(progRes.data);
            setEarnedBadges(badgesRes.data);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    // Build earned set for quick lookup
    const earnedSet = new Set(earnedBadges.map((b) => `${b.category}-${b.tier}`));

    const totalEarned = earnedBadges.length;
    const totalPossible = 40;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-black text-white px-6 py-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 mb-8 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition text-gray-400 hover:text-cyan-400"
                >
                    <FaArrowLeft /> Back to Home
                </button>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 text-yellow-400 mb-3">
                        <FaMedal className="text-2xl" />
                        <span className="text-sm font-bold uppercase tracking-widest">Achievement System</span>
                    </div>
                    <h1 className="text-5xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-transparent bg-clip-text">
                        YOUR BADGES
                    </h1>
                    <p className="text-gray-400 mt-3">
                        {totalEarned} / {totalPossible} badges earned
                    </p>
                    {/* Total progress bar */}
                    <div className="w-64 mx-auto mt-3 h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round((totalEarned / totalPossible) * 100)}%` }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center text-gray-400 py-20 animate-pulse text-lg">
                        Loading badges...
                    </div>
                ) : (
                    <div className="space-y-8">
                        {CATEGORY_ORDER.map((catKey) => {
                            const cat = BADGE_CATEGORIES[catKey];
                            const prog = progress?.[catKey];
                            const isExpanded = expandedCat === catKey;

                            return (
                                <motion.div
                                    key={catKey}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`${cat.bgClass} ${cat.borderClass} border rounded-3xl overflow-hidden`}
                                >
                                    {/* Category Header */}
                                    <button
                                        onClick={() => setExpandedCat(isExpanded ? null : catKey)}
                                        className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/5 transition"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-3xl">{cat.emoji}</span>
                                            <div className="text-left">
                                                <h2 className={`text-lg font-bold ${cat.textClass}`}>{cat.label}</h2>
                                                <p className="text-gray-400 text-xs mt-0.5">{cat.metric}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {/* Current badge */}
                                            {prog?.currentBadge && (
                                                <div className="hidden sm:flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-3 py-1.5">
                                                    <span className="text-lg">{prog.currentBadge.icon}</span>
                                                    <span className="text-sm font-semibold text-white">{prog.currentBadge.name}</span>
                                                </div>
                                            )}
                                            {/* Progress to next */}
                                            {prog && !prog.maxedOut && (
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-xs text-gray-400">{prog.currentValue} / {prog.nextThreshold}</span>
                                                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className={`h-full bg-gradient-to-r ${cat.gradient} rounded-full`}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.round(prog.progressPct * 100)}%` }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {prog?.maxedOut && (
                                                <span className="text-yellow-400 text-xs font-bold flex items-center gap-1">
                                                    <FaTrophy /> MAXED
                                                </span>
                                            )}
                                        </div>
                                    </button>

                                    {/* Expanded: All badges in this category */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-white/5"
                                            >
                                                <div className="px-6 py-5 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                                    {cat.badges.map((badge, i) => {
                                                        const isEarned = earnedSet.has(`${catKey}-${i}`);
                                                        const threshold = cat.thresholds[i];

                                                        return (
                                                            <motion.div
                                                                key={i}
                                                                initial={{ opacity: 0, scale: 0.9 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: i * 0.04 }}
                                                                className={`relative text-center p-4 rounded-2xl border transition ${isEarned
                                                                        ? `${cat.bgClass} ${cat.borderClass} shadow-md`
                                                                        : "bg-white/[0.02] border-white/5 opacity-40"
                                                                    }`}
                                                            >
                                                                {/* Tier number */}
                                                                <span className="absolute top-2 right-2 text-[10px] text-gray-500 font-mono">
                                                                    #{i + 1}
                                                                </span>
                                                                <span className={`text-3xl block mb-2 ${!isEarned ? "grayscale" : ""}`}>
                                                                    {badge.icon}
                                                                </span>
                                                                <p className={`text-xs font-bold ${isEarned ? "text-white" : "text-gray-500"}`}>
                                                                    {badge.name}
                                                                </p>
                                                                <p className="text-[10px] text-gray-500 mt-1">
                                                                    {threshold} {cat.metric.split(" ").slice(-1)}
                                                                </p>
                                                                {isEarned && (
                                                                    <div className="mt-2">
                                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-400/30">
                                                                            ✓ Earned
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
