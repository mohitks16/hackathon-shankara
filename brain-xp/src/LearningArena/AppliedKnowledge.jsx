import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import {
    FaArrowLeft, FaArrowRight, FaHistory, FaGlobe, FaBriefcase,
    FaGraduationCap, FaRocket, FaComments, FaTrophy, FaCheck,
    FaExternalLinkAlt, FaPaperPlane, FaAtom,
} from "react-icons/fa";
import axios from "axios";

const BASE = "http://localhost:5000/api/applied-knowledge";

const SUBJECTS = ["Physics", "Chemistry", "Biology", "Maths"];

// ─────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────
function SetupStage({ onStart, onBack }) {
    const [concept, setConcept] = useState("");
    const [subject, setSubject] = useState(null);
    const heroRef = useRef();

    useEffect(() => {
        gsap.from(heroRef.current, { opacity: 0, y: 40, duration: 0.8, ease: "power3.out" });
    }, []);

    const subjectMeta = {
        Physics: { emoji: "⚛️", color: "border-cyan-400 bg-cyan-500/15 text-cyan-300" },
        Chemistry: { emoji: "🧪", color: "border-purple-400 bg-purple-500/15 text-purple-300" },
        Biology: { emoji: "🧬", color: "border-emerald-400 bg-emerald-500/15 text-emerald-300" },
        Maths: { emoji: "📐", color: "border-amber-400 bg-amber-500/15 text-amber-300" },
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div ref={heroRef} className="text-center mb-10">
                <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 text-transparent bg-clip-text">
                    Applied Knowledge
                </h1>
                <p className="text-gray-400 mt-3 text-lg">Discover how concepts connect to the real world.</p>
            </div>

            {/* Subject */}
            <div className="mb-6">
                <p className="text-gray-400 text-sm font-medium mb-3">Choose Subject</p>
                <div className="grid grid-cols-4 gap-3">
                    {SUBJECTS.map((s) => {
                        const m = subjectMeta[s];
                        return (
                            <motion.div
                                key={s}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => setSubject(s)}
                                className={`cursor-pointer rounded-2xl p-4 border text-center transition-all ${subject === s ? m.color : "bg-white/5 border-white/10 text-gray-400"
                                    }`}
                            >
                                <div className="text-2xl mb-1">{m.emoji}</div>
                                <div className="text-xs font-semibold">{s}</div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Concept */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
                <label className="block text-gray-400 mb-2 text-sm font-medium">Concept / Topic</label>
                <input
                    type="text"
                    placeholder="e.g. Newton's Laws, Organic Chemistry, Photosynthesis..."
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#1f2937] border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                />
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
                    disabled={!concept.trim() || !subject}
                    onClick={() => onStart(concept.trim(), subject)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                    Explore →
                </motion.button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// LOADING
// ─────────────────────────────────────────────
function LoadingScreen() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full border-4 border-cyan-400 border-t-transparent"
            />
            <p className="text-cyan-400 text-lg font-semibold">Discovering real-world connections...</p>
        </div>
    );
}

// ─────────────────────────────────────────────
// INSIGHT CARDS VIEW
// ─────────────────────────────────────────────
function InsightCardsView({ concept, subject, data, onOpenChat }) {
    const sections = [
        {
            key: "history",
            icon: <FaHistory />,
            title: "History & Discovery",
            color: "border-amber-400/50 bg-amber-500/5",
            iconColor: "text-amber-400",
            content: (
                <div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-3">{data.history?.summary}</p>
                    {data.history?.links?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {data.history.links.map((link, i) => (
                                <a
                                    key={i}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-400/30 text-amber-300 hover:bg-amber-500/20 transition"
                                >
                                    <FaExternalLinkAlt className="text-[10px]" /> {link.title}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: "dailyLife",
            icon: <FaGlobe />,
            title: "Why Study This?",
            color: "border-cyan-400/50 bg-cyan-500/5",
            iconColor: "text-cyan-400",
            content: <p className="text-gray-300 text-sm leading-relaxed">{data.dailyLife}</p>,
        },
        {
            key: "careers",
            icon: <FaBriefcase />,
            title: "Careers & Industries",
            color: "border-purple-400/50 bg-purple-500/5",
            iconColor: "text-purple-400",
            content: (
                <div className="space-y-2">
                    {data.careers?.map((c, i) => (
                        <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
                            <FaCheck className="text-purple-400 mt-1 shrink-0 text-xs" />
                            <div>
                                <span className="text-purple-300 font-semibold text-sm">{c.field}</span>
                                <span className="text-gray-400 text-sm"> — {c.how}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            key: "higherStudies",
            icon: <FaGraduationCap />,
            title: "In Higher Studies",
            color: "border-blue-400/50 bg-blue-500/5",
            iconColor: "text-blue-400",
            content: <p className="text-gray-300 text-sm leading-relaxed">{data.higherStudies}</p>,
        },
        {
            key: "futureScope",
            icon: <FaRocket />,
            title: "Your Future with This",
            color: "border-pink-400/50 bg-pink-500/5",
            iconColor: "text-pink-400",
            content: <p className="text-gray-300 text-sm leading-relaxed">{data.futureScope}</p>,
        },
    ];

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                    {concept}
                </h2>
                <p className="text-gray-500 text-sm mt-2 flex items-center justify-center gap-2">
                    <FaAtom /> {subject} — Applied Knowledge
                </p>
            </div>

            <div className="space-y-4 mb-8">
                {sections.map((sec, i) => (
                    <motion.div
                        key={sec.key}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        className={`border rounded-2xl p-6 backdrop-blur-xl ${sec.color}`}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`text-xl ${sec.iconColor}`}>{sec.icon}</div>
                            <h3 className="text-lg font-bold text-white">{sec.title}</h3>
                        </div>
                        {sec.content}
                    </motion.div>
                ))}
            </div>

            {/* Chat CTA */}
            <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 24px rgba(34,211,238,0.4)" }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenChat}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-lg flex items-center justify-center gap-3"
            >
                <FaComments /> Let's Chat About This →
            </motion.button>
        </div>
    );
}

// ─────────────────────────────────────────────
// MINI CHAT (3-4 messages)
// ─────────────────────────────────────────────
function MiniChat({ concept, onDone }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [ended, setEnded] = useState(false);
    const chatRef = useRef();

    // Start conversation with AI greeting
    useEffect(() => {
        sendToAI([
            { role: "user", content: `Hi! I just learned about ${concept} and I want to talk about it.` },
        ], true);
    }, []);

    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages]);

    const sendToAI = async (msgHistory, isFirst = false) => {
        setLoading(true);
        try {
            const { data } = await axios.post(`${BASE}/chat`, {
                concept,
                messages: msgHistory,
            });

            const newMsgs = isFirst
                ? [{ role: "assistant", content: data.reply }]
                : [...messages, ...msgHistory.slice(messages.length), { role: "assistant", content: data.reply }];

            setMessages(newMsgs);
            if (data.isFinal) setEnded(true);
        } catch {
            setMessages((prev) => [...prev, { role: "assistant", content: "Hmm, something went wrong. But keep exploring — your curiosity is your superpower! 🌟" }]);
            setEnded(true);
        }
        setLoading(false);
    };

    const handleSend = () => {
        if (!input.trim() || loading || ended) return;
        const userMsg = { role: "user", content: input.trim() };
        const updated = [...messages, userMsg];
        setMessages(updated);
        setInput("");
        sendToAI(updated);
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                    Let's Talk About {concept}
                </h2>
                <p className="text-gray-500 text-sm mt-1">A quick conversation — share what excites you!</p>
            </div>

            <div
                ref={chatRef}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-4 max-h-[50vh] overflow-y-auto space-y-4"
            >
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                    ? "bg-cyan-600 text-white rounded-br-md"
                                    : "bg-white/10 text-gray-200 border border-white/10 rounded-bl-md"
                                }`}
                        >
                            {msg.content}
                        </div>
                    </motion.div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white/10 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
                            <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 1.2, repeat: Infinity }}
                                className="text-gray-400 text-sm"
                            >
                                Thinking...
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            {!ended ? (
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Type your thoughts..."
                        disabled={loading}
                        className="flex-1 p-3 rounded-xl bg-[#1f2937] border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition disabled:opacity-50"
                    />
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 disabled:opacity-40 transition"
                    >
                        <FaPaperPlane />
                    </motion.button>
                </div>
            ) : (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onDone}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 font-bold text-lg"
                >
                    Continue →
                </motion.button>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// COMPLETE SCREEN
// ─────────────────────────────────────────────
function CompleteStage({ concept, subject, onBack }) {
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
                    Exploration Complete!
                </h2>
                <p className="text-gray-400 mt-3">
                    You now know how <span className="text-white font-semibold">{concept}</span> connects to the real world.
                </p>
            </motion.div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
                <p className="text-gray-300 text-sm font-semibold mb-3">You explored:</p>
                <ul className="space-y-2 text-gray-400 text-sm">
                    <li className="flex items-center gap-2"><FaCheck className="text-emerald-400" /> History & how it was discovered</li>
                    <li className="flex items-center gap-2"><FaCheck className="text-emerald-400" /> Real-world applications in daily life</li>
                    <li className="flex items-center gap-2"><FaCheck className="text-emerald-400" /> Related careers & industries</li>
                    <li className="flex items-center gap-2"><FaCheck className="text-emerald-400" /> Relevance in higher studies</li>
                    <li className="flex items-center gap-2"><FaCheck className="text-emerald-400" /> Future scope & what you can become</li>
                    <li className="flex items-center gap-2"><FaCheck className="text-emerald-400" /> Shared your thoughts in a mini-chat</li>
                </ul>
            </div>

            <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onBack}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 font-semibold"
            >
                Return to Learning Arena
            </motion.button>
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function AppliedKnowledge({ onBack }) {
    const [stage, setStage] = useState("setup"); // setup | loading | insights | chat | complete
    const [concept, setConcept] = useState("");
    const [subject, setSubject] = useState("");
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const handleStart = async (conceptVal, subjectVal) => {
        setConcept(conceptVal);
        setSubject(subjectVal);
        setStage("loading");
        try {
            const { data: result } = await axios.post(`${BASE}/generate`, {
                concept: `${conceptVal} (${subjectVal})`,
            });
            setData(result);
            setStage("insights");
        } catch (err) {
            console.error(err);
            setError("Failed to generate insights. Please try again.");
            setStage("setup");
        }
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
                            <LoadingScreen />
                        </motion.div>
                    )}

                    {stage === "insights" && data && (
                        <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <InsightCardsView
                                concept={concept}
                                subject={subject}
                                data={data}
                                onOpenChat={() => setStage("chat")}
                            />
                        </motion.div>
                    )}

                    {stage === "chat" && (
                        <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <MiniChat concept={concept} onDone={() => setStage("complete")} />
                        </motion.div>
                    )}

                    {stage === "complete" && (
                        <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <CompleteStage concept={concept} subject={subject} onBack={onBack} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
