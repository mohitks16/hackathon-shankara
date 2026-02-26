import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import {
    FaBookOpen, FaCheckCircle, FaCircle, FaYoutube,
    FaGlobe, FaTrophy, FaArrowLeft, FaArrowRight,
    FaLightbulb, FaBrain, FaExclamationTriangle, FaSave,
} from "react-icons/fa";
import axios from "axios";
import { addXpToServer, addCoinsToServer } from "../statsUtils";

const BASE = "http://localhost:5000/api/storyverse";

const PATHS = [
    {
        id: "novice",
        name: "Novice Path",
        desc: "Core concepts, gentle pace",
        subtopics: 5,
        xp: 20,
        coins: 5,
        quizDiff: "easy",
        color: "from-emerald-400 to-cyan-500",
        glow: "rgba(16,185,129,0.45)",
    },
    {
        id: "achiever",
        name: "Achiever Path",
        desc: "Medium depth, broader coverage",
        subtopics: 7,
        xp: 30,
        coins: 10,
        quizDiff: "medium",
        color: "from-blue-400 to-indigo-500",
        glow: "rgba(96,165,250,0.45)",
    },
    {
        id: "warrior",
        name: "Warrior Path",
        desc: "Deep dive, full mastery",
        subtopics: 10,
        xp: 40,
        coins: 15,
        quizDiff: "hard",
        color: "from-pink-500 to-purple-600",
        glow: "rgba(236,72,153,0.45)",
    },
];

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.5 },
    }),
};

// ──────────────────────────────────────────────────────────
// LOADING SCREEN
// ──────────────────────────────────────────────────────────
function LoadingScreen({ message }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full border-4 border-cyan-400 border-t-transparent"
            />
            <p className="text-cyan-400 text-lg font-semibold">{message}</p>
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// SETUP STAGE
// ──────────────────────────────────────────────────────────
function SetupStage({ onStart, onBack }) {
    const [topic, setTopic] = useState("");
    const [selectedPath, setSelectedPath] = useState(null);
    const heroRef = useRef();

    useEffect(() => {
        gsap.from(heroRef.current, { opacity: 0, y: 40, duration: 0.8, ease: "power3.out" });
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto text-center">
            <div ref={heroRef} className="mb-10">
                <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 text-transparent bg-clip-text">
                    StoryVerse
                </h1>
                <p className="text-gray-400 mt-3 text-lg">Learn through stories. Understand through experience.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 text-left">
                <label className="block text-gray-400 mb-2 text-sm font-medium">What topic do you want to explore?</label>
                <input
                    type="text"
                    placeholder="e.g. Photosynthesis, Newton's Laws, Trigonometry..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#1f2937] border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                />
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
                {PATHS.map((path, i) => (
                    <motion.div
                        key={path.id}
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        whileHover={{ scale: 1.04, boxShadow: `0 0 28px ${path.glow}` }}
                        onClick={() => setSelectedPath(path.id)}
                        className={`cursor-pointer rounded-3xl p-6 border transition-all ${selectedPath === path.id
                            ? "bg-white/15 border-cyan-400"
                            : "bg-white/5 border-white/10"
                            }`}
                    >
                        <div className={`text-2xl font-extrabold bg-gradient-to-r ${path.color} text-transparent bg-clip-text mb-2`}>
                            {path.name}
                        </div>
                        <p className="text-gray-400 text-sm mb-4">{path.desc}</p>
                        <div className="text-xs text-gray-500 space-y-1">
                            <div>📚 {path.subtopics} subtopics</div>
                            <div>⭐ {path.xp} XP on completion</div>
                            <div>🪙 {path.coins} coins on completion</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="flex gap-4 justify-center">
                <button
                    onClick={onBack}
                    className="px-6 py-3 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition"
                >
                    ← Back
                </button>
                <motion.button
                    whileTap={{ scale: 0.96 }}
                    disabled={!topic.trim() || !selectedPath}
                    onClick={() => onStart(topic.trim(), selectedPath)}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                    Begin Story →
                </motion.button>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// STORY STAGE
// ──────────────────────────────────────────────────────────
function StoryStage({ topic, subtopics, currentSubtopicIdx, storyData, onProceedToQuiz }) {
    const subtopic = subtopics[currentSubtopicIdx];
    const { storyCards, doYouKnow, resourceLinks } = storyData;
    const youtubeLinks = resourceLinks.filter((l) => l.type === "youtube");
    const webLinks = resourceLinks.filter((l) => l.type === "web");

    return (
        <div className="flex gap-6 w-full max-w-7xl mx-auto">
            {/* ── Main Content ── */}
            <div className="flex-1 min-w-0">
                <div className="mb-6">
                    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 text-transparent bg-clip-text">
                        {subtopic}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Part of: {topic}</p>
                </div>

                {/* Story Cards */}
                <div className="space-y-4 mb-6">
                    {storyCards.map((card, i) => (
                        <motion.div
                            key={i}
                            custom={i}
                            initial="hidden"
                            animate="visible"
                            variants={cardVariants}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                        >
                            <p className="text-gray-200 leading-relaxed">{card}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Do You Know */}
                {doYouKnow && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-5 mb-6 flex gap-3"
                    >
                        <FaLightbulb className="text-amber-400 text-xl mt-1 shrink-0" />
                        <div>
                            <p className="text-amber-400 font-semibold mb-1">Did You Know?</p>
                            <p className="text-gray-300 text-sm leading-relaxed">{doYouKnow}</p>
                        </div>
                    </motion.div>
                )}

                {/* Resource Links */}
                {(youtubeLinks.length > 0 || webLinks.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8"
                    >
                        <p className="text-gray-300 font-semibold mb-4 flex items-center gap-2">
                            <FaBrain className="text-cyan-400" /> Study Further
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {youtubeLinks.map((link, i) => (
                                <a
                                    key={i}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-xl bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 transition group"
                                >
                                    <FaYoutube className="text-red-500 text-xl shrink-0" />
                                    <span className="text-sm text-gray-300 group-hover:text-white transition truncate">
                                        {link.title}
                                    </span>
                                </a>
                            ))}
                            {webLinks.map((link, i) => (
                                <a
                                    key={i}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/20 hover:bg-cyan-500/20 transition group"
                                >
                                    <FaGlobe className="text-cyan-400 text-xl shrink-0" />
                                    <span className="text-sm text-gray-300 group-hover:text-white transition truncate">
                                        {link.title}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </motion.div>
                )}

                <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(34,211,238,0.4)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onProceedToQuiz}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white"
                >
                    Proceed to Quiz →
                </motion.button>
            </div>

            {/* ── Subtopic Sidebar ── */}
            <div className="w-64 shrink-0 hidden lg:block">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sticky top-6">
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Subtopics</p>
                    <div className="space-y-2">
                        {subtopics.map((st, i) => (
                            <div
                                key={i}
                                className={`flex items-center gap-2 p-2 rounded-lg text-sm transition ${i === currentSubtopicIdx
                                    ? "bg-cyan-400/10 text-cyan-400 font-medium"
                                    : i < currentSubtopicIdx
                                        ? "text-emerald-400"
                                        : "text-gray-500"
                                    }`}
                            >
                                {i < currentSubtopicIdx ? (
                                    <FaCheckCircle className="shrink-0" />
                                ) : i === currentSubtopicIdx ? (
                                    <FaBookOpen className="shrink-0" />
                                ) : (
                                    <FaCircle className="shrink-0 opacity-30 text-xs" />
                                )}
                                <span className="truncate">{st}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// QUIZ STAGE
// ──────────────────────────────────────────────────────────
function QuizStage({ subtopic, questions, onComplete }) {
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({});
    const [selected, setSelected] = useState(null);
    const [revealed, setRevealed] = useState(false);

    const q = questions[currentQ];
    const totalQ = questions.length;

    const handleSelect = (opt) => {
        if (revealed) return;
        setSelected(opt);
        setRevealed(true);
        setAnswers((prev) => ({ ...prev, [currentQ]: opt }));
    };

    const handleNext = () => {
        if (currentQ + 1 < totalQ) {
            setCurrentQ(currentQ + 1);
            setSelected(null);
            setRevealed(false);
        } else {
            onComplete(answers);
        }
    };

    const isCorrect = selected === q?.answer;
    const progress = ((currentQ) / totalQ) * 100;

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">
                    Mini Quiz — <span className="text-cyan-400 font-medium">{subtopic}</span>
                </p>
                <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                    <motion.div
                        className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4 }}
                    />
                </div>
                <p className="text-gray-500 text-xs text-right">{currentQ + 1} / {totalQ}</p>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQ}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-4"
                >
                    <p className="text-lg font-medium mb-5">{q?.question}</p>
                    <div className="grid gap-3">
                        {q?.options?.map((opt, i) => {
                            const isSelected = selected === opt;
                            const isCorrectOpt = opt === q.answer;
                            let cls = "bg-[#1f2937] border-gray-600 hover:border-gray-400";
                            if (revealed) {
                                if (isCorrectOpt) cls = "bg-emerald-600/80 border-emerald-400";
                                else if (isSelected) cls = "bg-red-600/80 border-red-400";
                                else cls = "bg-[#1f2937] border-gray-700 opacity-60";
                            } else if (isSelected) {
                                cls = "bg-cyan-600 border-cyan-400";
                            }
                            return (
                                <button
                                    key={i}
                                    onClick={() => handleSelect(opt)}
                                    disabled={revealed}
                                    className={`p-3 rounded-xl border text-left text-sm transition ${cls}`}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>

            {revealed && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center"
                >
                    <span className={`text-sm font-semibold ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                        {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
                    </span>
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleNext}
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-sm"
                    >
                        {currentQ + 1 === totalQ ? "Finish Quiz →" : "Next →"}
                    </motion.button>
                </motion.div>
            )}
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// SOLUTION STAGE
// ──────────────────────────────────────────────────────────
function SolutionStage({ subtopic, questions, answers, onNext, isLast }) {
    const wrongOrSkipped = questions.map((q, i) => ({
        ...q,
        userAnswer: answers[i] ?? null,
        correct: answers[i] === q.answer,
    })).filter((q) => !q.correct);

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-1">Quiz Results</h2>
                <p className="text-gray-400 text-sm">{subtopic}</p>
            </div>

            {wrongOrSkipped.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-600/10 border border-emerald-400/30 rounded-2xl p-8 text-center mb-6"
                >
                    <p className="text-3xl mb-2">🎉</p>
                    <p className="text-emerald-400 font-bold text-lg">Perfect Score!</p>
                    <p className="text-gray-400 text-sm mt-1">You nailed every question in this subtopic.</p>
                </motion.div>
            ) : (
                <div className="space-y-4 mb-6">
                    {wrongOrSkipped.map((q, i) => (
                        <motion.div
                            key={i}
                            custom={i}
                            initial="hidden"
                            animate="visible"
                            variants={cardVariants}
                            className="bg-white/5 border border-white/10 rounded-2xl p-5"
                        >
                            <p className="font-medium text-sm text-white mb-3">{q.question}</p>
                            {q.userAnswer && (
                                <p className="text-red-400 text-xs mb-1">Your answer: {q.userAnswer}</p>
                            )}
                            {!q.userAnswer && (
                                <p className="text-gray-500 text-xs mb-1">Skipped</p>
                            )}
                            <p className="text-emerald-400 text-xs mb-3">Correct: {q.answer}</p>
                            <div className="bg-black/30 border border-white/5 rounded-xl p-3">
                                <p className="text-gray-300 text-xs leading-relaxed">{q.solution}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(34,211,238,0.4)" }}
                whileTap={{ scale: 0.97 }}
                onClick={onNext}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold"
            >
                {isLast ? "See Results 🏆" : "Next Subtopic →"}
            </motion.button>
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// COMPLETE STAGE
// ──────────────────────────────────────────────────────────
function CompleteStage({ subtopics, weakSubtopics, path, onBack, onSave }) {
    const config = PATHS.find((p) => p.id === path);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave();
            setSaved(true);
        } catch (e) {
            console.error("Save failed:", e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto text-center">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mb-8"
            >
                <FaTrophy className="text-yellow-400 text-6xl mx-auto mb-4" />
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 text-transparent bg-clip-text">
                    Story Complete!
                </h2>
                <p className="text-gray-400 mt-2">You've journeyed through all of {subtopics.length} subtopics.</p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <p className="text-3xl font-extrabold text-cyan-400">+{config?.xp}</p>
                    <p className="text-gray-400 text-sm mt-1">XP Earned</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <p className="text-3xl font-extrabold text-yellow-400">+{config?.coins} 🪙</p>
                    <p className="text-gray-400 text-sm mt-1">Coins Earned</p>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left mb-6">
                <p className="text-gray-300 font-semibold mb-3">✅ Subtopics Covered</p>
                <div className="flex flex-wrap gap-2">
                    {subtopics.map((st, i) => (
                        <span
                            key={i}
                            className={`px-3 py-1 rounded-lg text-xs ${weakSubtopics.includes(st)
                                ? "bg-red-500/20 text-red-300 border border-red-400/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                                }`}
                        >
                            {st}
                        </span>
                    ))}
                </div>
            </div>

            {weakSubtopics.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-5 text-left mb-6"
                >
                    <p className="text-amber-400 font-semibold mb-2 flex items-center gap-2">
                        <FaExclamationTriangle /> Subtopics to Revisit
                    </p>
                    <p className="text-gray-400 text-xs mb-3">
                        You got more than 3 questions wrong or unattempted in these areas:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {weakSubtopics.map((st, i) => (
                            <span key={i} className="px-3 py-1 rounded-lg text-xs bg-amber-500/20 text-amber-300 border border-amber-400/30">
                                {st}
                            </span>
                        ))}
                    </div>
                </motion.div>
            )}

            <div className="flex flex-col gap-3">
                {/* Save button */}
                <motion.button
                    whileHover={{ scale: saved ? 1 : 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSave}
                    disabled={saving || saved}
                    className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${saved
                        ? "bg-emerald-600/30 border border-emerald-400/50 text-emerald-400 cursor-default"
                        : "bg-gradient-to-r from-violet-500 to-indigo-600 hover:opacity-90"
                        }`}
                >
                    <FaSave />
                    {saved ? "✓ Saved to Past Learnings!" : saving ? "Saving..." : "💾 Save to Past Learnings"}
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

// ──────────────────────────────────────────────────────────
// MAIN STORYVERSE COMPONENT
// ──────────────────────────────────────────────────────────
export default function Storyverse({ onBack }) {
    const [stage, setStage] = useState("setup");
    const [topic, setTopic] = useState("");
    const [pathId, setPathId] = useState("");
    const [subtopics, setSubtopics] = useState([]);
    const [currentSubtopicIdx, setCurrentSubtopicIdx] = useState(0);
    const [storyData, setStoryData] = useState(null);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [allAnswers, setAllAnswers] = useState([]); // answers per subtopic
    const [loadingMsg, setLoadingMsg] = useState("Generating your story...");
    const [error, setError] = useState(null);

    const handleStart = async (topicVal, path) => {
        setTopic(topicVal);
        setPathId(path);
        setStage("loading");
        setLoadingMsg("Generating subtopics...");
        try {
            const { data } = await axios.post(`${BASE}/subtopics`, { topic: topicVal, difficulty: path });
            const fetchedSubtopics = data.subtopics;
            setSubtopics(fetchedSubtopics);
            setCurrentSubtopicIdx(0);
            setAllAnswers([]);
            setLoadingMsg("Creating your story...");
            const { data: story } = await axios.post(`${BASE}/story`, {
                topic: topicVal,
                subtopic: fetchedSubtopics[0],
                difficulty: path,
            });
            setStoryData(story);
            setStage("story");
        } catch (err) {
            setError("Failed to generate content. Please try again.");
            setStage("setup");
        }
    };

    const handleProceedToQuiz = async () => {
        setStage("loading");
        setLoadingMsg("Creating quiz questions...");
        try {
            const { data } = await axios.post(`${BASE}/quiz`, {
                topic,
                subtopic: subtopics[currentSubtopicIdx],
                difficulty: pathId,
            });
            setQuizQuestions(data);
            setStage("quiz");
        } catch {
            setError("Failed to generate quiz. Please try again.");
            setStage("story");
        }
    };

    const handleQuizComplete = (answers) => {
        setAllAnswers((prev) => [...prev, { subtopic: subtopics[currentSubtopicIdx], answers, questions: quizQuestions }]);
        setStage("solution");
    };

    const handleNextSubtopic = async () => {
        const nextIdx = currentSubtopicIdx + 1;
        if (nextIdx >= subtopics.length) {
            setStage("complete");
            return;
        }
        setCurrentSubtopicIdx(nextIdx);
        setStage("loading");
        setLoadingMsg("Loading next subtopic...");
        try {
            const { data: story } = await axios.post(`${BASE}/story`, {
                topic,
                subtopic: subtopics[nextIdx],
                difficulty: pathId,
            });
            setStoryData(story);
            setStage("story");
        } catch {
            setError("Failed to generate story. Please try again.");
            setStage("complete");
        }
    };

    const handleSaveStory = async () => {
        const path = PATHS.find(p => p.id === pathId);
        // Build subtopics list with answers
        const subtopicData = allAnswers.map(({ subtopic, questions, answers }) => ({
            title: subtopic,
            content: "",
            userAnswer: null,
            isCorrect: !getWeakSubtopics().includes(subtopic),
            solution: questions
                .filter((q, i) => answers[i] !== q.answer)
                .map(q => `${q.question} → ${q.answer}`)
                .join(" | "),
        }));
        const wrongAnswers = allAnswers.flatMap(({ subtopic, questions, answers: ans }) =>
            questions
                .map((q, qi) => ({ q, qi }))
                .filter(({ q, qi }) => ans[qi] !== q.answer)
                .map(({ q, qi }) => ({ subtopic, userAnswer: ans[qi] ?? "Skipped", correctAnswer: q.answer }))
        );
        await axios.post("http://localhost:5000/api/story-history/save", {
            topic,
            difficulty: pathId,
            subtopics: subtopicData,
            wrongAnswers,
            xpEarned: path?.xp || 0,
        });
        // Persist XP + coins to global stats
        addXpToServer(path?.xp || 0, "storyverse");
        addCoinsToServer(path?.coins || 0, "storyverse-complete");
    };
    const getWeakSubtopics = () => {
        return allAnswers
            .filter(({ questions, answers }) => {
                const wrongOrSkipped = questions.filter((q, i) => answers[i] !== q.answer).length;
                return wrongOrSkipped > 3;
            })
            .map((a) => a.subtopic);
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

                    {stage === "story" && storyData && (
                        <motion.div key="story" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <StoryStage
                                topic={topic}
                                subtopics={subtopics}
                                currentSubtopicIdx={currentSubtopicIdx}
                                storyData={storyData}
                                onProceedToQuiz={handleProceedToQuiz}
                            />
                        </motion.div>
                    )}

                    {stage === "quiz" && (
                        <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <QuizStage
                                subtopic={subtopics[currentSubtopicIdx]}
                                questions={quizQuestions}
                                onComplete={handleQuizComplete}
                            />
                        </motion.div>
                    )}

                    {stage === "solution" && (
                        <motion.div key="solution" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <SolutionStage
                                subtopic={subtopics[currentSubtopicIdx]}
                                questions={quizQuestions}
                                answers={allAnswers[allAnswers.length - 1]?.answers ?? {}}
                                onNext={handleNextSubtopic}
                                isLast={currentSubtopicIdx + 1 >= subtopics.length}
                            />
                        </motion.div>
                    )}

                    {stage === "complete" && (
                        <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <CompleteStage
                                subtopics={subtopics}
                                weakSubtopics={getWeakSubtopics()}
                                path={pathId}
                                onBack={onBack}
                                onSave={handleSaveStory}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
