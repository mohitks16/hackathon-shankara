import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaArrowLeft,
    FaArrowRight,
    FaClock,
    FaTrophy,
    FaCoins,
    FaLightbulb,
    FaCheckCircle,
    FaTimesCircle,
    FaFlagCheckered,
    FaChevronDown,
    FaChevronUp,
} from "react-icons/fa";
import axios from "axios";

const DIFFICULTIES = [
    {
        id: "easy",
        label: "Easy",
        xp: 2,
        timePerQ: 60,
        color: "from-emerald-400 to-green-600",
        border: "border-emerald-400",
        bg: "bg-emerald-600",
    },
    {
        id: "medium",
        label: "Medium",
        xp: 4,
        timePerQ: 120,
        color: "from-amber-400 to-orange-600",
        border: "border-amber-400",
        bg: "bg-amber-600",
    },
    
    {
        id: "hard",
        label: "Hard",
        xp: 6,
        timePerQ: 180,
        color: "from-red-400 to-rose-600",
        border: "border-red-400",
        bg: "bg-red-600",
    },
];

const Q_COUNTS = [5, 10, 15, 20, 25];

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Challenge({ onBack, coins, onCoinsChange }) {
    // ─── Stage ────────────────────────────────────────────────────────
    const [stage, setStage] = useState("setup"); // setup | quiz | result

    // ─── Setup state ──────────────────────────────────────────────────
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState(null);
    const [numQuestions, setNumQuestions] = useState(10);
    const [loading, setLoading] = useState(false);

    // ─── Quiz state ───────────────────────────────────────────────────
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentQ, setCurrentQ] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef(null);

    // ─── Hints ────────────────────────────────────────────────────────
    const [hints, setHints] = useState({});
    const [hintLoading, setHintLoading] = useState(false);

    // ─── Result state ─────────────────────────────────────────────────
    const [showSolutions, setShowSolutions] = useState(false);
    const [coinsAwarded, setCoinsAwarded] = useState(false);

    // ─── Difficulty meta ──────────────────────────────────────────────
    const diffMeta = DIFFICULTIES.find((d) => d.id === difficulty);

    // ═══════════════════════════════════════════════════════════════════
    // TIMER
    // ═══════════════════════════════════════════════════════════════════
    useEffect(() => {
        if (stage !== "quiz") return;
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    endQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [stage]);

    const endQuiz = useCallback(() => {
        clearInterval(timerRef.current);
        setStage("result");
    }, []);

    // ═══════════════════════════════════════════════════════════════════
    // GENERATE
    // ═══════════════════════════════════════════════════════════════════
    const startChallenge = async () => {
        if (!topic.trim() || !difficulty) return;
        setLoading(true);
        try {
            const res = await axios.post("http://localhost:5000/api/challenges/generate", {
                topic: topic.trim(),
                numQuestions,
                difficulty,
            });
            if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
                alert("No questions received.");
                setLoading(false);
                return;
            }
            setQuestions(res.data);
            setAnswers({});
            setCurrentQ(0);
            setHints({});
            setCoinsAwarded(false);
            setShowSolutions(false);
            const totalTime = diffMeta.timePerQ * res.data.length;
            setTimeLeft(totalTime);
            setStage("quiz");
        } catch (err) {
            console.error("Challenge generate error:", err);
            alert("Failed to generate challenge.");
        }
        setLoading(false);
    };

    // ═══════════════════════════════════════════════════════════════════
    // HINT
    // ═══════════════════════════════════════════════════════════════════
    const requestHint = async () => {
        if (hints[currentQ] || coins < 1 || hintLoading) return;
        setHintLoading(true);
        try {
            const q = questions[currentQ];
            const res = await axios.post("http://localhost:5000/api/challenges/hint", {
                topic,
                question: q.question,
                options: q.options,
            });
            setHints((prev) => ({ ...prev, [currentQ]: res.data.hint }));
            onCoinsChange(-1);
        } catch {
            // fallback to embedded hint
            const q = questions[currentQ];
            if (q.hint) setHints((prev) => ({ ...prev, [currentQ]: q.hint }));
        }
        setHintLoading(false);
    };

    // ═══════════════════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════════════════
    const correctCount = questions.reduce(
        (sum, q, i) => sum + (answers[i] === q.answer ? 1 : 0),
        0
    );
    const totalXP = correctCount * (diffMeta?.xp || 0);
    const answeredCount = Object.keys(answers).length;

    // Award coins once on result
    useEffect(() => {
        if (stage === "result" && !coinsAwarded) {
            onCoinsChange(5);
            setCoinsAwarded(true);
        }
    }, [stage, coinsAwarded]);

    // ═══════════════════════════════════════════════════════════════════
    // CARD ANIMATION VARIANTS
    // ═══════════════════════════════════════════════════════════════════
    const cardVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.08, duration: 0.4 },
        }),
    };

    // ═══════════════════════════════════════════════════════════════════
    // RENDER — SETUP
    // ═══════════════════════════════════════════════════════════════════
    if (stage === "setup") {
        return (
            <div className="min-h-screen from-[#0f172a] via-[#111827] to-black text-white flex items-center justify-center px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl"
                >
                    {/* Back */}
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 mb-6 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition text-gray-400 hover:text-cyan-400"
                    >
                        <FaArrowLeft /> Back
                    </button>

                    <h2 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 text-transparent bg-clip-text">
                        ⚔️ Challenge Mode
                    </h2>
                    <p className="text-gray-400 text-center mb-8">
                        Test yourself under pressure. Earn XP & coins!
                    </p>

                    {/* Topic */}
                    <div className="mb-6">
                        <label className="block mb-2 text-gray-400 text-sm">Topic</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g. Photosynthesis, React Hooks, WW2..."
                            className="w-full p-3 rounded-xl bg-[#1f2937] border border-gray-600 focus:border-cyan-400 outline-none transition"
                        />
                    </div>

                    {/* Difficulty */}
                    <div className="mb-6">
                        <label className="block mb-3 text-gray-400 text-sm">Difficulty</label>
                        <div className="grid grid-cols-3 gap-4">
                            {DIFFICULTIES.map((d) => (
                                <motion.div
                                    key={d.id}
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => setDifficulty(d.id)}
                                    className={`p-4 rounded-xl cursor-pointer border text-center transition ${difficulty === d.id
                                            ? `${d.bg} ${d.border} border-2`
                                            : "bg-[#1f2937] border-gray-600 hover:border-gray-500"
                                        }`}
                                >
                                    <h3 className="font-bold">{d.label}</h3>
                                    <p className="text-xs text-gray-300 mt-1">+{d.xp} XP/correct</p>
                                    <p className="text-xs text-gray-400">{d.timePerQ / 60} min/Q</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Question Count */}
                    <div className="mb-8">
                        <label className="block mb-3 text-gray-400 text-sm">Number of Questions</label>
                        <div className="flex gap-3 flex-wrap">
                            {Q_COUNTS.map((n) => (
                                <motion.button
                                    key={n}
                                    whileHover={{ scale: 1.1 }}
                                    onClick={() => setNumQuestions(n)}
                                    className={`px-5 py-2 rounded-xl border font-medium transition ${numQuestions === n
                                            ? "bg-pink-600 border-pink-400"
                                            : "bg-[#1f2937] border-gray-600 hover:border-gray-500"
                                        }`}
                                >
                                    {n}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Start */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        disabled={!topic.trim() || !difficulty || loading}
                        onClick={startChallenge}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 p-3 rounded-xl font-semibold disabled:opacity-50 transition"
                    >
                        {loading ? "Generating Challenge..." : "⚔️ Start Challenge"}
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════════
    // RENDER — QUIZ
    // ═══════════════════════════════════════════════════════════════════
    if (stage === "quiz") {
        const q = questions[currentQ];
        const timerDanger = timeLeft < 60;
        const timerWarn = timeLeft < 180 && !timerDanger;

        return (
            <div className="min-h-screen from-[#0f172a] via-[#111827] to-black text-white flex items-center justify-center px-6 py-8">
                <div className="w-full max-w-3xl">
                    {/* Top bar: timer + coins + end quiz */}
                    <div className="flex items-center justify-between mb-6">
                        <div
                            className={`flex items-center gap-2 text-lg font-mono font-bold px-4 py-2 rounded-xl border ${timerDanger
                                    ? "border-red-400 text-red-400 bg-red-500/10 animate-pulse"
                                    : timerWarn
                                        ? "border-amber-400 text-amber-400 bg-amber-500/10"
                                        : "border-cyan-400/50 text-cyan-400 bg-cyan-500/10"
                                }`}
                        >
                            <FaClock /> {formatTime(timeLeft)}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-yellow-400 font-semibold">
                                <FaCoins /> {coins}
                            </div>
                            <button
                                onClick={endQuiz}
                                className="px-4 py-2 rounded-xl bg-amber-600/80 hover:bg-amber-600 border border-amber-500/50 transition font-medium"
                            >
                                <FaFlagCheckered className="inline mr-1" /> End Quiz
                            </button>
                        </div>
                    </div>

                    {/* Question navigation bar */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {questions.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentQ(i)}
                                className={`w-10 h-10 rounded-lg font-medium text-sm transition ${currentQ === i
                                        ? "bg-cyan-600 border-2 border-cyan-400 text-white"
                                        : answers[i] != null
                                            ? "bg-indigo-600/50 border border-indigo-400/50 text-white"
                                            : "bg-[#1f2937] border border-gray-600 text-gray-400 hover:border-gray-500"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    {/* Question card */}
                    <motion.div
                        key={currentQ}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-300">
                                Question {currentQ + 1} / {questions.length}
                            </h2>
                            <span className="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-400/50 text-amber-300 font-semibold text-sm">
                                +{diffMeta.xp} XP
                            </span>
                        </div>

                        <p className="mb-6 text-lg leading-relaxed">{q.question}</p>

                        {/* Options */}
                        <div className="grid gap-3">
                            {q.options?.map((opt, i) => {
                                const isSelected = answers[currentQ] === opt;
                                return (
                                    <button
                                        key={i}
                                        onClick={() =>
                                            setAnswers((prev) => ({ ...prev, [currentQ]: opt }))
                                        }
                                        className={`p-3 rounded-xl border text-left transition ${isSelected
                                                ? "bg-cyan-600 border-cyan-400"
                                                : "bg-[#1f2937] border-gray-600 hover:border-gray-500"
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Hint section */}
                        <div className="mt-4">
                            {hints[currentQ] ? (
                                <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-4 text-amber-300 text-sm">
                                    <FaLightbulb className="inline mr-2" />
                                    {hints[currentQ]}
                                </div>
                            ) : (
                                <button
                                    onClick={requestHint}
                                    disabled={coins < 1 || hintLoading}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-400/50 text-amber-400 hover:bg-amber-500/10 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                                >
                                    <FaLightbulb />
                                    {hintLoading
                                        ? "Getting hint..."
                                        : `Get Hint (1 coin)`}
                                </button>
                            )}
                        </div>

                        {/* Prev / Next */}
                        <div className="mt-6 flex justify-between">
                            <button
                                onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
                                disabled={currentQ === 0}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/5 transition disabled:opacity-30"
                            >
                                <FaArrowLeft /> Prev
                            </button>
                            <button
                                onClick={() =>
                                    setCurrentQ((p) => Math.min(questions.length - 1, p + 1))
                                }
                                disabled={currentQ === questions.length - 1}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 transition disabled:opacity-30"
                            >
                                Next <FaArrowRight />
                            </button>
                        </div>
                    </motion.div>

                    {/* Progress summary */}
                    <p className="mt-4 text-center text-gray-500 text-sm">
                        {answeredCount} / {questions.length} answered
                    </p>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════════
    // RENDER — RESULT
    // ═══════════════════════════════════════════════════════════════════
    return (
        <div className="min-h-screen from-[#0f172a] via-[#111827] to-black text-white flex items-center justify-center px-6 py-8">
            <div className="w-full max-w-3xl">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center mb-8"
                >
                    <FaTrophy className="text-yellow-400 text-5xl mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-2">Challenge Complete!</h2>
                    <p className="text-gray-400 mb-6">
                        {topic} • {diffMeta?.label} Difficulty
                    </p>

                    {/* Score cards */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-4">
                            <p className="text-2xl font-bold text-emerald-400">{correctCount}</p>
                            <p className="text-xs text-gray-400">Correct</p>
                        </div>
                        <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4">
                            <p className="text-2xl font-bold text-red-400">
                                {questions.length - correctCount}
                            </p>
                            <p className="text-xs text-gray-400">Wrong / Skipped</p>
                        </div>
                        <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-xl p-4">
                            <p className="text-2xl font-bold text-cyan-400">{totalXP}</p>
                            <p className="text-xs text-gray-400">XP Earned</p>
                        </div>
                    </div>

                    {/* Coins earned */}
                    <div className="flex items-center justify-center gap-2 text-yellow-400 font-semibold text-lg mb-6">
                        <FaCoins /> +5 Coins Earned!
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => setShowSolutions((s) => !s)}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-cyan-400/50 text-cyan-400 hover:bg-cyan-500/10 transition"
                        >
                            {showSolutions ? <FaChevronUp /> : <FaChevronDown />}
                            {showSolutions ? "Hide Solutions" : "Show Solutions"}
                        </button>
                        <button
                            onClick={onBack}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 font-semibold transition"
                        >
                            Return Home
                        </button>
                    </div>
                </motion.div>

                {/* ─── Solution Review ──────────────────────────────────────── */}
                <AnimatePresence>
                    {showSolutions && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 overflow-hidden"
                        >
                            {questions.map((q, i) => {
                                const userAns = answers[i] ?? null;
                                const isCorrect = userAns === q.answer;
                                return (
                                    <motion.div
                                        key={i}
                                        custom={i}
                                        initial="hidden"
                                        animate="visible"
                                        variants={cardVariants}
                                        className={`bg-white/5 backdrop-blur-xl border rounded-2xl p-6 ${isCorrect
                                                ? "border-emerald-400/30"
                                                : "border-red-400/30"
                                            }`}
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <span className="mt-1">
                                                {isCorrect ? (
                                                    <FaCheckCircle className="text-emerald-400" />
                                                ) : (
                                                    <FaTimesCircle className="text-red-400" />
                                                )}
                                            </span>
                                            <div>
                                                <p className="font-medium text-sm text-gray-400 mb-1">
                                                    Q{i + 1}
                                                </p>
                                                <p className="text-white">{q.question}</p>
                                            </div>
                                        </div>

                                        {/* Options review */}
                                        <div className="grid gap-2 ml-8 mb-4">
                                            {q.options?.map((opt, j) => {
                                                const isAnswer = opt === q.answer;
                                                const isUserPick = opt === userAns;
                                                let style =
                                                    "bg-[#1f2937] border-gray-700 text-gray-400";
                                                if (isAnswer)
                                                    style =
                                                        "bg-emerald-600/20 border-emerald-400/60 text-emerald-300";
                                                if (isUserPick && !isAnswer)
                                                    style =
                                                        "bg-red-600/20 border-red-400/60 text-red-300";

                                                return (
                                                    <div
                                                        key={j}
                                                        className={`py-2 px-3 rounded-lg border text-sm ${style}`}
                                                    >
                                                        {opt}
                                                        {isAnswer && (
                                                            <span className="ml-2 text-xs">(Correct)</span>
                                                        )}
                                                        {isUserPick && !isAnswer && (
                                                            <span className="ml-2 text-xs">(Your answer)</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Solution */}
                                        {q.solution && (
                                            <div className="ml-8 bg-cyan-500/10 border border-cyan-400/20 rounded-xl p-4 text-sm text-gray-300">
                                                <span className="text-cyan-400 font-semibold">Solution: </span>
                                                {q.solution}
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
