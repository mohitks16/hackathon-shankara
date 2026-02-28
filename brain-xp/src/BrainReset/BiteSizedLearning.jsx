import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaArrowLeft,
    FaArrowRight,
    FaBolt,
    FaCheckCircle,
    FaTimesCircle,
    FaChevronDown,
    FaChevronUp,
    FaSync,
    FaTrashAlt,
} from "react-icons/fa";
import axios from "axios";

const API = "http://localhost:5000/api/brain-reset";

export default function BiteSizedLearning({ onBack }) {
    // ─── stages: select | flashcards | quiz | results ───
    const [stage, setStage] = useState("select");
    const [weakSubtopics, setWeakSubtopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    // Selected subtopic
    const [selectedSubtopic, setSelectedSubtopic] = useState(null);

    // Revision data
    const [flashcards, setFlashcards] = useState([]);
    const [quiz, setQuiz] = useState([]);

    // Flashcard state
    const [cardIdx, setCardIdx] = useState(0);
    const [flipped, setFlipped] = useState(false);

    // Quiz state
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showSolutions, setShowSolutions] = useState(false);

    useEffect(() => {
        fetchWeakSubtopics();
    }, []);

    const fetchWeakSubtopics = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/weak-subtopics`);
            setWeakSubtopics(res.data);
        } catch (err) {
            console.error("Failed to fetch weak subtopics:", err);
        }
        setLoading(false);
    };

    const startRevision = async (subtopic) => {
        setSelectedSubtopic(subtopic);
        setGenerating(true);
        try {
            const res = await axios.post(`${API}/generate-revision`, {
                subtopic: subtopic.subtopic,
            });
            setFlashcards(res.data.flashcards || []);
            setQuiz(res.data.quiz || []);
            setCardIdx(0);
            setFlipped(false);
            setCurrentQ(0);
            setAnswers({});
            setShowSolutions(false);
            setStage("flashcards");
        } catch (err) {
            console.error("Failed to generate revision:", err);
            alert("Failed to generate revision material. Try again.");
        }
        setGenerating(false);
    };

    const removeAndFinish = async () => {
        if (selectedSubtopic) {
            try {
                await axios.delete(`${API}/weak-subtopics/${selectedSubtopic._id}`);
                setWeakSubtopics((prev) => prev.filter((w) => w._id !== selectedSubtopic._id));
            } catch (err) {
                console.error("Failed to remove weak subtopic:", err);
            }
        }
        setStage("select");
        setSelectedSubtopic(null);
    };

    // ─── Scoring ───
    const correctCount = quiz.reduce(
        (sum, q, i) => sum + (answers[i] === q.answer ? 1 : 0),
        0
    );

    // ═══════════════════════════════════════════════════════
    // RENDER — SELECT SUBTOPIC
    // ═══════════════════════════════════════════════════════
    if (stage === "select") {
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
                        <div className="inline-flex items-center gap-2 text-cyan-400 mb-3">
                            <FaBolt className="text-2xl" />
                            <span className="text-sm font-bold uppercase tracking-widest">Targeted Revision</span>
                        </div>
                        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                            Bite-Sized Learning
                        </h1>
                        <p className="text-gray-400 mt-3">
                            {weakSubtopics.length > 0
                                ? "Pick a weak subtopic to master with flashcards + quiz."
                                : "No weak subtopics found — keep learning and practicing!"}
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center text-gray-400 py-20 animate-pulse text-lg">
                            Loading weak subtopics...
                        </div>
                    ) : generating ? (
                        <div className="text-center py-20">
                            <div className="animate-spin text-4xl text-cyan-400 mb-4 inline-block">
                                <FaSync />
                            </div>
                            <p className="text-lg text-gray-300">
                                Generating flashcards & quiz for{" "}
                                <span className="text-cyan-400 font-bold">{selectedSubtopic?.subtopic}</span>...
                            </p>
                        </div>
                    ) : weakSubtopics.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20"
                        >
                            <span className="text-5xl mb-4 block">💪</span>
                            <h3 className="text-xl font-bold text-cyan-400">No weak areas!</h3>
                            <p className="text-gray-400 mt-2">Complete more quizzes and challenges to identify weak subtopics.</p>
                        </motion.div>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {weakSubtopics.map((ws, i) => (
                                <motion.div
                                    key={ws._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(6,182,212,0.2)" }}
                                    onClick={() => startRevision(ws)}
                                    className="cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-400/40 transition"
                                >
                                    <h3 className="font-bold text-lg mb-1">{ws.subtopic}</h3>
                                    <div className="flex gap-3 text-xs text-gray-400">
                                        <span className="capitalize">{ws.source}</span>
                                        <span>•</span>
                                        <span>Wrong {ws.count}x</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════
    // RENDER — FLASHCARDS
    // ═══════════════════════════════════════════════════════
    if (stage === "flashcards") {
        const card = flashcards[cardIdx];
        const isLast = cardIdx === flashcards.length - 1;

        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-black text-white flex items-center justify-center px-6 py-8">
                <div className="w-full max-w-lg">
                    <div className="text-center mb-6">
                        <p className="text-gray-400 text-sm">
                            Flashcard {cardIdx + 1} / {flashcards.length} — <span className="text-cyan-400 font-semibold">{selectedSubtopic?.subtopic}</span>
                        </p>
                    </div>

                    {/* Card */}
                    <div
                        onClick={() => setFlipped(!flipped)}
                        className="cursor-pointer perspective-1000"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={flipped ? "back" : "front"}
                                initial={{ rotateY: 90, opacity: 0 }}
                                animate={{ rotateY: 0, opacity: 1 }}
                                exit={{ rotateY: -90, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`min-h-[280px] flex items-center justify-center p-8 rounded-3xl border ${flipped
                                        ? "bg-cyan-500/10 border-cyan-400/30"
                                        : "bg-white/5 border-white/10"
                                    }`}
                            >
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
                                        {flipped ? "Answer" : "Question"}
                                    </p>
                                    <p className="text-xl font-semibold leading-relaxed">
                                        {card ? (flipped ? card.back : card.front) : "No card"}
                                    </p>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <p className="text-center text-gray-500 text-xs mt-3">Tap card to flip</p>

                    {/* Navigation */}
                    <div className="flex justify-between mt-8">
                        <button
                            onClick={() => {
                                setFlipped(false);
                                setCardIdx((p) => Math.max(0, p - 1));
                            }}
                            disabled={cardIdx === 0}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/5 transition disabled:opacity-30"
                        >
                            <FaArrowLeft /> Prev
                        </button>

                        {isLast ? (
                            <button
                                onClick={() => {
                                    setCurrentQ(0);
                                    setAnswers({});
                                    setStage("quiz");
                                }}
                                className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold"
                            >
                                Start Quiz →
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setFlipped(false);
                                    setCardIdx((p) => p + 1);
                                }}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 transition"
                            >
                                Next <FaArrowRight />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════
    // RENDER — QUIZ
    // ═══════════════════════════════════════════════════════
    if (stage === "quiz") {
        const q = quiz[currentQ];
        const answeredCount = Object.keys(answers).length;
        const allAnswered = answeredCount === quiz.length;

        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-black text-white flex items-center justify-center px-6 py-8">
                <div className="w-full max-w-3xl">
                    <div className="text-center mb-6">
                        <p className="text-gray-400 text-sm">
                            Question {currentQ + 1} / {quiz.length} — <span className="text-cyan-400 font-semibold">{selectedSubtopic?.subtopic}</span>
                        </p>
                    </div>

                    {/* Question navigation bar */}
                    <div className="flex flex-wrap gap-2 mb-6 justify-center">
                        {quiz.map((_, i) => (
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
                        className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl"
                    >
                        <p className="mb-6 text-lg leading-relaxed">{q?.question}</p>

                        <div className="grid gap-3">
                            {q?.options?.map((opt, i) => {
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

                        {/* Prev / Next / Submit */}
                        <div className="mt-6 flex justify-between">
                            <button
                                onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
                                disabled={currentQ === 0}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/5 transition disabled:opacity-30"
                            >
                                <FaArrowLeft /> Prev
                            </button>

                            {currentQ === quiz.length - 1 ? (
                                <button
                                    onClick={() => setStage("results")}
                                    disabled={!allAnswered}
                                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 font-semibold transition disabled:opacity-40"
                                >
                                    Finish Quiz
                                </button>
                            ) : (
                                <button
                                    onClick={() => setCurrentQ((p) => p + 1)}
                                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 transition"
                                >
                                    Next <FaArrowRight />
                                </button>
                            )}
                        </div>
                    </motion.div>

                    <p className="mt-4 text-center text-gray-500 text-sm">
                        {answeredCount} / {quiz.length} answered
                    </p>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════
    // RENDER — RESULTS
    // ═══════════════════════════════════════════════════════
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-black text-white px-6 py-8">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center mb-8"
                >
                    <span className="text-5xl block mb-4">
                        {correctCount >= quiz.length * 0.7 ? "🎉" : "📚"}
                    </span>
                    <h2 className="text-3xl font-bold mb-2">
                        {correctCount >= quiz.length * 0.7 ? "Great Job!" : "Keep Practicing!"}
                    </h2>
                    <p className="text-gray-400 mb-4">
                        {selectedSubtopic?.subtopic} — Revision Quiz
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-4">
                            <p className="text-2xl font-bold text-emerald-400">{correctCount}</p>
                            <p className="text-xs text-gray-400">Correct</p>
                        </div>
                        <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4">
                            <p className="text-2xl font-bold text-red-400">{quiz.length - correctCount}</p>
                            <p className="text-xs text-gray-400">Wrong</p>
                        </div>
                    </div>

                    {correctCount >= quiz.length * 0.7 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-green-500/10 border border-green-400/30 rounded-xl p-4 mb-6"
                        >
                            <p className="text-green-400 font-semibold text-sm">
                                <FaCheckCircle className="inline mr-2" />
                                Passed! This subtopic will be removed from your weak areas.
                            </p>
                        </motion.div>
                    )}

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => setShowSolutions(!showSolutions)}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-cyan-400/50 text-cyan-400 hover:bg-cyan-500/10 transition mx-auto"
                        >
                            {showSolutions ? <FaChevronUp /> : <FaChevronDown />}
                            {showSolutions ? "Hide Solutions" : "Show All Solutions"}
                        </button>

                        <button
                            onClick={removeAndFinish}
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold transition mx-auto flex items-center gap-2"
                        >
                            {correctCount >= quiz.length * 0.7 ? (
                                <>
                                    <FaTrashAlt /> Remove from Weak & Finish
                                </>
                            ) : (
                                "Back to Topics"
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Solutions */}
                <AnimatePresence>
                    {showSolutions && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 overflow-hidden"
                        >
                            {quiz.map((q, i) => {
                                const userAns = answers[i] ?? null;
                                const isCorrect = userAns === q.answer;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`bg-white/5 backdrop-blur-xl border rounded-2xl p-6 ${isCorrect ? "border-emerald-400/30" : "border-red-400/30"
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
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-400 mb-1">Q{i + 1}</p>
                                                <p className="text-white">{q.question}</p>
                                            </div>
                                        </div>

                                        <div className="grid gap-2 ml-8 mb-4">
                                            {q.options?.map((opt, j) => {
                                                const isAnswer = opt === q.answer;
                                                const isUserPick = opt === userAns;
                                                let style = "bg-[#1f2937] border-gray-700 text-gray-400";
                                                if (isAnswer) style = "bg-emerald-600/20 border-emerald-400/60 text-emerald-300";
                                                if (isUserPick && !isAnswer) style = "bg-red-600/20 border-red-400/60 text-red-300";

                                                return (
                                                    <div key={j} className={`py-2 px-3 rounded-lg border text-sm ${style}`}>
                                                        {opt}
                                                        {isAnswer && <span className="ml-2 text-xs">(Correct)</span>}
                                                        {isUserPick && !isAnswer && <span className="ml-2 text-xs">(Your answer)</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>

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
