import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaArrowLeft,
    FaExclamationTriangle,
    FaChevronDown,
    FaChevronUp,
} from "react-icons/fa";
import axios from "axios";

const API = "http://localhost:5000/api/brain-reset";

const BUCKET_META = {
    silly: {
        label: "Silly Mistakes",
        emoji: "🤦",
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-400/30",
        desc: "Quick answers that went wrong — slow down and double-check!",
    },
    time_pressure: {
        label: "Time Pressure",
        emoji: "⏱️",
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-400/30",
        desc: "Took too long then got it wrong — practice speed and method recall.",
    },
    weak_concept: {
        label: "Weak Concept",
        emoji: "📚",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-400/30",
        desc: "Fundamental gaps — these need deep revision.",
    },
    overthinking: {
        label: "Overthinking",
        emoji: "🌀",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-400/30",
        desc: "Easy/medium questions overthought — trust your instincts more.",
    },
    guessing: {
        label: "Guessing",
        emoji: "🎲",
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-400/30",
        desc: "Random guesses on hard questions — learn the concepts first.",
    },
};

const BUCKET_ORDER = ["silly", "time_pressure", "weak_concept", "overthinking", "guessing"];

export default function MistakeBuckets({ onBack }) {
    const [buckets, setBuckets] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        fetchBuckets();
    }, []);

    const fetchBuckets = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/mistake-buckets`);
            setBuckets(res.data);
        } catch (err) {
            console.error("Failed to fetch mistake buckets:", err);
        }
        setLoading(false);
    };

    const toggleBucket = (key) => {
        setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const totalMistakes = buckets
        ? Object.values(buckets).reduce((sum, arr) => sum + arr.length, 0)
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-black text-white px-6 py-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 mb-8 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition text-gray-400 hover:text-cyan-400"
                >
                    <FaArrowLeft /> Back
                </button>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 text-red-400 mb-3">
                        <FaExclamationTriangle className="text-2xl" />
                        <span className="text-sm font-bold uppercase tracking-widest">Error Analysis</span>
                    </div>
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-red-400 to-rose-500 text-transparent bg-clip-text">
                        Smart Mistake Buckets
                    </h1>
                    <p className="text-gray-400 mt-3">
                        Your wrong answers from Challenges, categorized by error type.
                        {totalMistakes > 0 && (
                            <span className="ml-2 text-red-400 font-semibold">{totalMistakes} total mistakes analyzed.</span>
                        )}
                    </p>
                </div>

                {loading ? (
                    <div className="text-center text-gray-400 py-20 animate-pulse text-lg">
                        Analyzing your mistakes...
                    </div>
                ) : !buckets || totalMistakes === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <span className="text-5xl mb-4 block">🎉</span>
                        <h3 className="text-xl font-bold text-green-400">No mistakes found!</h3>
                        <p className="text-gray-400 mt-2">Complete some Challenges to see your mistake analysis here.</p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {BUCKET_ORDER.map((key) => {
                            const meta = BUCKET_META[key];
                            const items = buckets[key] || [];
                            if (items.length === 0) return null;
                            const isOpen = expanded[key];

                            return (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`${meta.bg} ${meta.border} border rounded-2xl overflow-hidden`}
                                >
                                    {/* Bucket Header */}
                                    <button
                                        onClick={() => toggleBucket(key)}
                                        className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/5 transition"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-3xl">{meta.emoji}</span>
                                            <div className="text-left">
                                                <h3 className={`text-lg font-bold ${meta.color}`}>{meta.label}</h3>
                                                <p className="text-gray-400 text-xs mt-0.5">{meta.desc}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${meta.bg} ${meta.border} border`}>
                                                {items.length}
                                            </span>
                                            {isOpen ? (
                                                <FaChevronUp className="text-gray-400" />
                                            ) : (
                                                <FaChevronDown className="text-gray-400" />
                                            )}
                                        </div>
                                    </button>

                                    {/* Expanded Questions */}
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-white/5"
                                            >
                                                <div className="px-6 py-4 space-y-3 max-h-96 overflow-y-auto">
                                                    {items.map((item, i) => (
                                                        <div
                                                            key={i}
                                                            className="bg-black/20 border border-white/5 rounded-xl p-4"
                                                        >
                                                            <div className="flex items-start justify-between mb-2">
                                                                <p className="text-sm font-medium text-white flex-1 pr-4">{item.question}</p>
                                                                {item.timeTakenSeconds > 0 && (
                                                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                                                        {item.timeTakenSeconds}s
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-4 text-xs">
                                                                <span className="text-red-400">Your: {item.userAnswer || "—"}</span>
                                                                <span className="text-green-400">Correct: {item.correctAnswer}</span>
                                                            </div>
                                                            {item.solution && (
                                                                <p className="text-xs text-gray-400 mt-2 border-t border-white/5 pt-2">{item.solution}</p>
                                                            )}
                                                            <div className="flex gap-3 mt-2 text-[10px] text-gray-500">
                                                                <span>{item.topic}</span>
                                                                <span>•</span>
                                                                <span className="capitalize">{item.difficulty}</span>
                                                            </div>
                                                        </div>
                                                    ))}
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
