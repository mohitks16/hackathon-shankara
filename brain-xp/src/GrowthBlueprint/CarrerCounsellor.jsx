import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaArrowLeft, FaHandsHelping, FaMagic, FaRegLightbulb,
    FaBriefcase, FaChevronRight, FaCheckCircle
} from "react-icons/fa";
import axios from "axios";

const BASE = "http://localhost:5000/api/counsellor";

// ─────────────────────────────────────────────
// WELCOME STAGE
// ─────────────────────────────────────────────
const QUOTES = [
    "The best way to predict the future is to create it.",
    "Choose a job you love, and you will never have to work a day in your life.",
    "Your work is going to fill a large part of your life. Do what you believe is great work.",
    "Don't watch the clock; do what it does. Keep going."
];

function WelcomeStage({ onStart, onBack, loading }) {
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    return (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-2xl text-center">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl">
                <div className="text-6xl text-cyan-400 mb-6 flex justify-center"><FaHandsHelping /></div>
                <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text mb-4">
                    Career Counsellor
                </h2>
                <div className="bg-blue-500/10 border border-blue-400/20 rounded-2xl p-5 mb-6 mt-4 italic text-gray-300 text-sm">
                    "{quote}"
                </div>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-lg mx-auto">
                    Answer 25 quick multiple-choice questions about your interests, skills, and goals.
                    I'll recommend the best career paths for you instantly!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={onBack} className="px-6 py-4 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition flex items-center justify-center gap-2 font-medium cursor-pointer">
                        <FaArrowLeft /> Back
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(34,211,238,0.4)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onStart}
                        disabled={loading}
                        className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-lg flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
                    >
                        {loading ? (
                            <><span className="animate-spin rounded-full w-4 h-4 border-b-2 border-white inline-block mr-2" />Loading Questions...</>
                        ) : (
                            <>Start Assessment <FaMagic /></>
                        )}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────
// QUIZ STAGE
// ─────────────────────────────────────────────
function QuizStage({ questions, onFinish, onBack }) {
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState({}); // { qId: selectedOption }
    const containerRef = useRef(null);

    const q = questions[current];
    const totalAnswered = Object.keys(answers).length;
    const progressPct = (current / questions.length) * 100;

    const handleSelect = (opt) => {
        const newAnswers = { ...answers, [q.id]: opt };
        setAnswers(newAnswers);
        // Auto advance after short delay
        setTimeout(() => {
            if (current + 1 < questions.length) {
                setCurrent(c => c + 1);
            }
        }, 350);
    };

    const handleFinish = () => {
        const answeredList = questions.map(q => ({
            question: q.question,
            answer: answers[q.id] || "No answer"
        }));
        onFinish(answeredList);
    };

    return (
        <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition cursor-pointer flex items-center gap-2 text-sm">
                    <FaArrowLeft /> Exit
                </button>
                <span className="text-gray-400 text-sm font-medium">{current + 1} / {questions.length}</span>
                {current + 1 === questions.length && answers[q.id] && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={handleFinish}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl text-sm font-bold cursor-pointer"
                    >
                        Get My Results
                    </motion.button>
                )}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-8">
                <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl"
                    ref={containerRef}
                >
                    <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-4">
                        Question {current + 1}
                    </p>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed">
                        {q.question}
                    </h3>

                    <div className="grid gap-3">
                        {q.options.map((opt, i) => {
                            const isSelected = answers[q.id] === opt;
                            return (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleSelect(opt)}
                                    disabled={!!answers[q.id]}
                                    className={`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer font-medium ${isSelected
                                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                                        : answers[q.id]
                                            ? "bg-white/3 border-gray-700/50 text-gray-500 cursor-not-allowed"
                                            : "bg-white/5 border-white/10 text-gray-200 hover:bg-white/10 hover:border-cyan-400/40"
                                        }`}
                                >
                                    <span>{opt}</span>
                                    {isSelected && <FaCheckCircle className="text-cyan-400 shrink-0" />}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Navigation Dots */}
                    <div className="flex gap-1.5 mt-8 justify-center flex-wrap">
                        {questions.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${i === current ? "bg-cyan-400 w-5" : answers[questions[i].id] ? "bg-emerald-500" : "bg-gray-700"}`}
                            />
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// ─────────────────────────────────────────────
// RESULTS STAGE
// ─────────────────────────────────────────────
function ResultsStage({ results, loading, onBack, onRedirectToDestiny }) {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-20 h-20 rounded-full border-4 border-cyan-400 border-t-transparent" />
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text mb-2">Analyzing your profile...</h2>
                    <p className="text-gray-400 text-sm">Finding your perfect career matches.</p>
                </div>
            </div>
        );
    }

    if (!results) {
        return (
            <div className="text-center">
                <p className="text-red-400 mb-4">Failed to analyze results. Please try again.</p>
                <button onClick={onBack} className="px-4 py-2 border border-gray-600 rounded-lg text-gray-400 hover:text-white transition cursor-pointer">← Back</button>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 text-transparent bg-clip-text mb-6">
                    Your Career Analysis
                </h2>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left max-w-2xl mx-auto">
                    <p className="text-gray-200 text-lg leading-relaxed italic border-l-4 border-cyan-400 pl-4">
                        "{results.summary}"
                    </p>
                </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FaRegLightbulb className="text-amber-400" /> Recommended Paths
            </h3>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
                {results.recommendations?.map((rec, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="bg-[#1f2937] border border-gray-700 rounded-2xl p-6 flex flex-col hover:border-cyan-400/50 transition-colors shadow-xl"
                    >
                        <div className="text-3xl text-cyan-400 mb-4"><FaBriefcase /></div>
                        <h4 className="text-xl font-bold text-white mb-2">{rec.title}</h4>
                        <p className="text-gray-400 text-sm mb-4 flex-1">{rec.description}</p>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-auto">
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Why it fits you</p>
                            <p className="text-gray-300 text-sm">{rec.whyItFits}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={onBack} className="px-6 py-4 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition font-medium cursor-pointer">
                    Return to Navigator
                </button>
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(34,211,238,0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onRedirectToDestiny(results.recommendations?.[0]?.title || "My Career Path")}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-lg text-white shadow-lg cursor-pointer flex items-center gap-2"
                >
                    See the Roadmap <FaChevronRight />
                </motion.button>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────
export default function CarrerCounsellor({ onBack, onRedirectToDestiny }) {
    const [stage, setStage] = useState("welcome"); // welcome | quiz | results
    const [questions, setQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);

    const handleStart = async () => {
        setLoadingQuestions(true);
        try {
            const { data } = await axios.post(`${BASE}/generate-questions`);
            setQuestions(data);
            setStage("quiz");
        } catch (err) {
            console.error(err);
            alert("Failed to load questions. Please check the server.");
        } finally {
            setLoadingQuestions(false);
        }
    };

    const handleFinishQuiz = async (answeredList) => {
        setStage("results");
        setAnalysisLoading(true);
        try {
            const { data } = await axios.post(`${BASE}/analyze`, { answers: answeredList });
            setAnalysisResult(data);
        } catch (err) {
            console.error(err);
            setAnalysisResult(null);
        } finally {
            setAnalysisLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-black text-white flex items-center justify-center py-8 px-4 w-full">
            <AnimatePresence mode="wait">
                {stage === "welcome" && (
                    <WelcomeStage key="welcome" onStart={handleStart} onBack={onBack} loading={loadingQuestions} />
                )}
                {stage === "quiz" && questions.length > 0 && (
                    <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex justify-center">
                        <QuizStage questions={questions} onFinish={handleFinishQuiz} onBack={onBack} />
                    </motion.div>
                )}
                {stage === "results" && (
                    <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex justify-center">
                        <ResultsStage
                            results={analysisResult}
                            loading={analysisLoading}
                            onBack={onBack}
                            onRedirectToDestiny={onRedirectToDestiny}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}