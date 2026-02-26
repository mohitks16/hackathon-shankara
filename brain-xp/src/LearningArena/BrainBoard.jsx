import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import {
    FaBrain, FaLayerGroup, FaChevronDown, FaChevronUp,
    FaArrowLeft, FaArrowRight, FaTrophy, FaCheck,
    FaLightbulb, FaFlask, FaKey, FaSave,
} from "react-icons/fa";
import axios from "axios";

const BASE = "http://localhost:5000/api/brainboard";

// ─────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────
function SetupStage({ onStart, onBack }) {
    const [concept, setConcept] = useState("");
    const [purpose, setPurpose] = useState(null); // "scratch" | "revision"
    const [mode, setMode] = useState(null);        // "mindmap" | "flashcards"
    const heroRef = useRef();

    useEffect(() => {
        gsap.from(heroRef.current, { opacity: 0, y: 40, duration: 0.8, ease: "power3.out" });
    }, []);

    const purposes = [
        { id: "scratch", label: "Learning from Scratch", emoji: "🌱", desc: "Detailed coverage, build full understanding" },
        { id: "revision", label: "Quick Revision", emoji: "⚡", desc: "Concise overview, jog your memory fast" },
    ];
    const modes = [
        { id: "mindmap", label: "Mind Map", emoji: "🗺️", desc: "Visual tree of connected concepts" },
        { id: "flashcards", label: "Flash Cards", emoji: "🃏", desc: "Swipeable summary cards for each subtopic" },
    ];

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div ref={heroRef} className="text-center mb-10">
                <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 text-transparent bg-clip-text">
                    BrainBoard
                </h1>
                <p className="text-gray-400 mt-3 text-lg">Map it. Card it. Master it.</p>
            </div>

            {/* Concept Input */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-6">
                <label className="block text-gray-400 mb-2 text-sm font-medium">Concept / Chapter Name</label>
                <input
                    type="text"
                    placeholder="e.g. Thermodynamics, Quadratic Equations, World War II..."
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#1f2937] border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                />
            </div>

            {/* Purpose */}
            <div className="mb-6">
                <p className="text-gray-400 text-sm font-medium mb-3">What's your goal?</p>
                <div className="grid grid-cols-2 gap-4">
                    {purposes.map((p) => (
                        <motion.div
                            key={p.id}
                            whileHover={{ scale: 1.03, boxShadow: "0 0 22px rgba(34,211,238,0.3)" }}
                            onClick={() => setPurpose(p.id)}
                            className={`cursor-pointer rounded-2xl p-5 border transition-all text-center ${purpose === p.id
                                ? "bg-white/15 border-cyan-400"
                                : "bg-white/5 border-white/10"
                                }`}
                        >
                            <div className="text-3xl mb-2">{p.emoji}</div>
                            <div className="font-semibold text-sm">{p.label}</div>
                            <div className="text-gray-400 text-xs mt-1">{p.desc}</div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Mode */}
            <div className="mb-8">
                <p className="text-gray-400 text-sm font-medium mb-3">What do you want?</p>
                <div className="grid grid-cols-2 gap-4">
                    {modes.map((m) => (
                        <motion.div
                            key={m.id}
                            whileHover={{ scale: 1.03, boxShadow: "0 0 22px rgba(34,211,238,0.3)" }}
                            onClick={() => setMode(m.id)}
                            className={`cursor-pointer rounded-2xl p-5 border transition-all text-center ${mode === m.id
                                ? "bg-white/15 border-cyan-400"
                                : "bg-white/5 border-white/10"
                                }`}
                        >
                            <div className="text-3xl mb-2">{m.emoji}</div>
                            <div className="font-semibold text-sm">{m.label}</div>
                            <div className="text-gray-400 text-xs mt-1">{m.desc}</div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    className="px-6 py-3 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition"
                >
                    ← Back
                </button>
                <motion.button
                    whileTap={{ scale: 0.96 }}
                    disabled={!concept.trim() || !purpose || !mode}
                    onClick={() => onStart(concept.trim(), purpose, mode)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                    Generate →
                </motion.button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// LOADING
// ─────────────────────────────────────────────
function LoadingScreen({ message }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full border-4 border-cyan-400 border-t-transparent"
            />
            <p className="text-cyan-400 text-lg font-semibold">{message}</p>
        </div>
    );
}

// ─────────────────────────────────────────────
// MIND MAP NODE (recursive)
// ─────────────────────────────────────────────
function MindMapNode({ node, depth = 0, index = 0, isLast = false }) {
    const [open, setOpen] = useState(depth < 2); // default open up to level 2
    const [cardOpen, setCardOpen] = useState(false);

    const colors = [
        "border-cyan-400 text-cyan-400 bg-cyan-500/10",
        "border-blue-400 text-blue-400 bg-blue-500/10",
        "border-purple-400 text-purple-400 bg-purple-500/10",
        "border-pink-400 text-pink-400 bg-pink-500/10",
        "border-amber-400 text-amber-400 bg-amber-500/10",
    ];
    const color = colors[depth % colors.length];

    const hasChildren = node.children && node.children.length > 0;
    const hasDetails = node.summary || node.formula || (node.keyPoints && node.keyPoints.length > 0) || node.conceptFlow;

    return (
        <div className="relative pl-8 pb-3">
            {/* Vertical connector line from parent */}
            <div
                className="absolute left-0 top-0 w-px bg-white/20"
                style={{ height: isLast ? '24px' : '100%' }}
            />
            {/* Horizontal twig to this node */}
            <div className="absolute left-0 top-[24px] w-8 h-px bg-white/20" />

            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="relative top-0"
            >
                {/* Node Pill */}
                <div className="flex flex-col items-start pt-[6px]">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl border backdrop-blur-md cursor-pointer select-none transition-all shadow-lg ${color}`}
                        onClick={() => setCardOpen((v) => !v)}
                    >
                        <span className="font-bold text-sm md:text-base">{node.title}</span>
                        {hasDetails && (
                            <span className="text-xs opacity-70 bg-white/10 p-1.5 rounded-full">
                                {cardOpen ? <FaChevronUp /> : <FaChevronDown />}
                            </span>
                        )}
                        {hasChildren && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
                                className="ml-2 text-white/50 hover:text-white transition"
                                title={open ? "Collapse" : "Expand"}
                            >
                                <FaLayerGroup />
                            </button>
                        )}
                    </motion.div>

                    {/* Detail Dropdown Card */}
                    <AnimatePresence>
                        {cardOpen && hasDetails && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="mt-2 ml-4 overflow-hidden z-10"
                            >
                                <div className="bg-[#1f2937]/90 border border-gray-600 rounded-xl p-5 max-w-lg shadow-2xl backdrop-blur-xl">
                                    {node.conceptFlow && (
                                        <div className="mb-3 pb-3 border-b border-gray-700/50">
                                            <p className="text-cyan-300 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 mb-1">
                                                <FaArrowRight className="text-[10px]" /> Concept Flow
                                            </p>
                                            <p className="text-gray-300 text-sm leading-relaxed italic">{node.conceptFlow}</p>
                                        </div>
                                    )}

                                    {node.summary && (
                                        <p className="text-gray-200 text-sm leading-relaxed mb-4">{node.summary}</p>
                                    )}

                                    {node.keyPoints && node.keyPoints.length > 0 && (
                                        <div className="mb-4 space-y-2">
                                            {node.keyPoints.map((pt, i) => (
                                                <div key={i} className="flex items-start gap-2">
                                                    <FaCheck className="text-emerald-400 mt-1 shrink-0 text-xs" />
                                                    <span className="text-gray-300 text-sm">{pt}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {node.formula && (
                                        <div className="flex items-center gap-3 bg-cyan-500/10 border border-cyan-400/20 rounded-lg px-4 py-3 mt-2">
                                            <FaFlask className="text-cyan-400 shrink-0" />
                                            <code className="text-cyan-300 text-sm font-mono tracking-wide">{node.formula}</code>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Children */}
                <AnimatePresence>
                    {open && hasChildren && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-1"
                        >
                            {node.children.map((child, i) => (
                                <MindMapNode
                                    key={i}
                                    node={child}
                                    depth={depth + 1}
                                    index={i}
                                    isLast={i === node.children.length - 1}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MIND MAP VIEW
// ─────────────────────────────────────────────
function MindMapView({ concept, data, onDone }) {
    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                        {concept} — Concept Tree
                    </h2>
                    <p className="text-gray-500 text-sm mt-2">
                        Click a node card to view deeper insights. Click <FaLayerGroup className="inline text-white/50 mx-1" /> to toggle branches.
                    </p>
                </div>
            </div>

            <div className="bg-[#0f172a]/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 mb-6 overflow-auto max-h-[70vh] shadow-2xl overflow-x-auto">
                {/* Root node without the branch lines since it's the start */}
                <div className="relative inline-block mb-1">
                    <div className="px-6 py-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 font-bold text-lg shadow-[0_0_30px_rgba(6,182,212,0.3)] border border-cyan-400/50">
                        {data.title}
                    </div>
                </div>

                {/* Wrapper for the rest of the tree that aligns with the root node's center */}
                <div className="ml-8 relative">
                    {data.children?.map((child, i) => (
                        <MindMapNode
                            key={i}
                            node={child}
                            depth={1}
                            index={i}
                            isLast={i === data.children.length - 1}
                        />
                    ))}
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(34,211,238,0.4)" }}
                whileTap={{ scale: 0.98 }}
                onClick={onDone}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-lg"
            >
                I've Mastered This Map ✓
            </motion.button>
        </div>
    );
}

// ─────────────────────────────────────────────
// FLASH CARD
// ─────────────────────────────────────────────
function FlashCardView({ concept, cards, onDone }) {
    const [idx, setIdx] = useState(0);
    const [direction, setDirection] = useState(1);

    const card = cards[idx];
    const progress = ((idx + 1) / cards.length) * 100;

    const goNext = () => {
        if (idx < cards.length - 1) { setDirection(1); setIdx((i) => i + 1); }
        else onDone();
    };
    const goPrev = () => {
        if (idx > 0) { setDirection(-1); setIdx((i) => i - 1); }
    };

    const slideVariants = {
        enter: (dir) => ({ opacity: 0, rotateY: dir > 0 ? 45 : -45, scale: 0.95 }),
        center: { opacity: 1, rotateY: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
        exit: (dir) => ({ opacity: 0, rotateY: dir > 0 ? -45 : 45, scale: 0.95, transition: { duration: 0.3 } }),
    };

    return (
        <div className="w-full max-w-xl mx-auto" style={{ perspective: "1200px" }}>
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                    {concept}
                </h2>
                <p className="text-gray-500 text-sm mt-1">Card {idx + 1} of {cards.length}</p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/10 rounded-full h-1.5 mb-6">
                <motion.div
                    className="h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                />
            </div>

            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={idx}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-6 min-h-[320px] flex flex-col"
                >
                    <h3 className="text-xl font-bold text-cyan-400 mb-5">{card.title}</h3>

                    {/* Key points */}
                    <ul className="space-y-2 mb-5 flex-1">
                        {card.keyPoints?.map((pt, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="flex items-start gap-2 text-gray-200 text-sm"
                            >
                                <FaCheck className="text-cyan-400 mt-0.5 shrink-0 text-xs" />
                                {pt}
                            </motion.li>
                        ))}
                    </ul>

                    <div className="space-y-2">
                        {card.formula && (
                            <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-400/20 rounded-xl px-4 py-2">
                                <FaFlask className="text-cyan-400 shrink-0 text-sm" />
                                <code className="text-cyan-300 text-sm font-mono">{card.formula}</code>
                            </div>
                        )}
                        {card.mnemonic && (
                            <div className="flex items-start gap-2 bg-purple-500/10 border border-purple-400/20 rounded-xl px-4 py-2">
                                <FaKey className="text-purple-400 shrink-0 text-sm mt-0.5" />
                                <span className="text-purple-300 text-sm">{card.mnemonic}</span>
                            </div>
                        )}
                        {card.examTrick && (
                            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-400/20 rounded-xl px-4 py-2">
                                <FaLightbulb className="text-amber-400 shrink-0 text-sm mt-0.5" />
                                <span className="text-amber-300 text-sm">{card.examTrick}</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="flex gap-4 justify-between">
                <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={goPrev}
                    disabled={idx === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-600 text-gray-300 disabled:opacity-30 hover:border-gray-400 transition"
                >
                    <FaArrowLeft /> Prev
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.04, boxShadow: "0 0 20px rgba(34,211,238,0.4)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={goNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold"
                >
                    {idx === cards.length - 1 ? "Finish ✓" : (<>Next <FaArrowRight /></>)}
                </motion.button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// COMPLETE SCREEN
// ─────────────────────────────────────────────
function CompleteStage({ concept, mode, onBack, onChallenge, onSave }) {
    const modeLabel = mode === "mindmap" ? "Mind Map" : "Flash Cards";
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try { await onSave(); setSaved(true); }
        catch (e) { console.error("Save failed:", e); }
        finally { setSaving(false); }
    };

    return (
        <div className="w-full max-w-lg mx-auto text-center">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mb-8"
            >
                <FaTrophy className="text-yellow-400 text-6xl mx-auto mb-4" />
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 text-transparent bg-clip-text">
                    Topic Mastered!
                </h2>
                <p className="text-gray-400 mt-3">
                    You've completely gone through <span className="text-white font-semibold">{concept}</span> via {modeLabel}.
                </p>
            </motion.div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
                <p className="text-gray-300 text-sm font-semibold mb-3">What you covered:</p>
                <ul className="space-y-2 text-gray-400 text-sm">
                    {mode === "mindmap" ? (
                        <>
                            <li className="flex items-center gap-2"><FaCheck className="text-emerald-400" /> Visual concept tree with subtopics</li>
                            <li className="flex items-center gap-2"><FaCheck className="text-emerald-400" /> Definitions & formulas for each node</li>
                            <li className="flex items-center gap-2"><FaCheck className="text-emerald-400" /> Interconnected sub-sub topic structure</li>
                        </>
                    ) : (
                        <>
                            <li className="flex items-center gap-2"><FaCheck className="text-emerald-400" /> Summary cards for each subtopic</li>
                            <li className="flex items-center gap-2"><FaCheck className="text-emerald-400" /> Key formulas, mnemonics & exam tricks</li>
                            <li className="flex items-center gap-2"><FaCheck className="text-emerald-400" /> Complete concept overview</li>
                        </>
                    )}
                </ul>
            </div>

            <div className="flex flex-col gap-4">
                {/* Save button */}
                <motion.button
                    whileHover={{ scale: saved ? 1 : 1.03, boxShadow: saved ? "none" : "0 0 20px rgba(139,92,246,0.4)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSave}
                    disabled={saving || saved}
                    className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${saved ? "bg-emerald-600/30 border border-emerald-400/50 text-emerald-400 cursor-default"
                            : "bg-gradient-to-r from-violet-500 to-indigo-600 hover:opacity-90"
                        }`}
                >
                    <FaSave />
                    {saved ? "✓ Saved to Past Learnings!" : saving ? "Saving..." : "💾 Save to Past Learnings"}
                </motion.button>

                {/* Optional Challenge CTA */}
                <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 0 24px rgba(251,191,36,0.4)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onChallenge}
                    className="w-full py-3 rounded-xl border border-amber-400/50 text-amber-400 hover:bg-amber-500/10 font-semibold transition"
                >
                    ⚔️ Take a Challenge on this topic (optional)
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onBack}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 font-semibold"
                >
                    Return to Learning Arena
                </motion.button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN BRAINBOARD COMPONENT
// ─────────────────────────────────────────────
export default function BrainBoard({ onBack, onNavigateToChallenge }) {
    const [stage, setStage] = useState("setup");
    const [concept, setConcept] = useState("");
    const [mode, setMode] = useState("");
    const [purpose, setPurpose] = useState("");
    const [data, setData] = useState(null);
    const [loadingMsg, setLoadingMsg] = useState("");
    const [error, setError] = useState(null);

    const handleStart = async (conceptVal, purposeVal, modeVal) => {
        setConcept(conceptVal);
        setMode(modeVal);
        setPurpose(purposeVal);
        setStage("loading");
        setLoadingMsg(
            modeVal === "mindmap" ? "Building your mind map..." : "Creating flash cards..."
        );
        try {
            const endpoint = modeVal === "mindmap" ? "/mindmap" : "/flashcards";
            const { data: result } = await axios.post(`${BASE}${endpoint}`, {
                concept: conceptVal,
                purpose,
            });
            setData(result);
            setStage(modeVal); // "mindmap" | "flashcards"
        } catch (err) {
            console.error(err);
            setError("Failed to generate content. Please try again.");
            setStage("setup");
        }
    };

    const handleDone = () => setStage("complete");

    const handleChallenge = () => {
        if (onNavigateToChallenge) onNavigateToChallenge(concept);
    };

    const handleSaveBrainBoard = async () => {
        await axios.post("http://localhost:5000/api/brainboard-history/save", {
            concept,
            purpose,
            type: mode === "mindmap" ? "mindmap" : "flashcard",
            data,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-black text-white flex items-center justify-center px-6 py-10">
            <div className="w-full">
                {error && (
                    <div className="max-w-lg mx-auto mb-6 bg-red-500/10 border border-red-400/30 rounded-xl p-4 text-red-300 text-sm text-center">
                        {error}
                        <button onClick={() => setError(null)} className="ml-3 underline text-red-400">Dismiss</button>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {stage === "setup" && (
                        <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <SetupStage onStart={handleStart} onBack={onBack} />
                        </motion.div>
                    )}

                    {stage === "loading" && (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <LoadingScreen message={loadingMsg} />
                        </motion.div>
                    )}

                    {stage === "mindmap" && data && (
                        <motion.div key="mindmap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <MindMapView concept={concept} data={data} onDone={handleDone} />
                        </motion.div>
                    )}

                    {stage === "flashcards" && data && (
                        <motion.div key="flashcards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <FlashCardView concept={concept} cards={data} onDone={handleDone} />
                        </motion.div>
                    )}

                    {stage === "complete" && (
                        <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <CompleteStage
                                concept={concept}
                                mode={mode}
                                onBack={onBack}
                                onChallenge={handleChallenge}
                                onSave={handleSaveBrainBoard}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
