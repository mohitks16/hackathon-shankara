import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { FaTrophy, FaLightbulb, FaBook, FaExternalLinkAlt, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import QuizHome from "./QuizHome";
import PastQuizes from "./PastQuizes";
import PastAssistedQuizzes from "./PastAssistedQuizzes";
import PastChallenges from "./PastChallenges";
import MasterMentors from "./MasterMentors";
import MentorChat from "./MentorChat";
import Challenge from "./Challenge";
import Toaster from "./Toaster";
import { addXpToServer, addCoinsToServer } from "./statsUtils";

const difficultyLevels = [
  {
    id: "novice",
    title: "Novice Adventurer",
    desc: "Entry level questions. Perfect to begin your journey.",
    xp: 2,
  },
  {
    id: "explorer",
    title: "Explorer",
    desc: "Easy questions. Build your foundation.",
    xp: 4,
  },
  {
    id: "wanderer",
    title: "Seasoned Wanderer",
    desc: "Medium difficulty. Concept clarity required.",
    xp: 6,
  },
  {
    id: "warrior",
    title: "Battle-Hardened Warrior",
    desc: "Difficult questions. Deep understanding needed.",
    xp: 8,
  },
  {
    id: "mythic",
    title: "Mythic Champion",
    desc: "High-order thinking. Multi-concept mastery.",
    xp: 10,
  },
  {
    id: "adaptive",
    title: "Fate’s Chosen",
    desc: "Adaptive difficulty. Every question varies in challenge and XP.",
    xp: "dynamic",
  },
];

export default function QuizApp() {
  const [stage, setStage] = useState("home");
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [xpEarnedPerQuestion, setXpEarnedPerQuestion] = useState({});
  const [streakCount, setStreakCount] = useState(0);
  const [streakBonusEarned, setStreakBonusEarned] = useState(0);
  const [streakPopup, setStreakPopup] = useState(false);
  const [toaster, setToaster] = useState({ show: false, message: "", type: "success", duration: undefined });
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [mentorTotalXp, setMentorTotalXp] = useState(0);
  const [coins, setCoins] = useState(10);
  const [quizSaving, setQuizSaving] = useState(false);
  const [quizSaved, setQuizSaved] = useState(false);
  const navigate = useNavigate();

  // GENERATE QUIZ
  const generateQuiz = async () => {
    if (!topic || !selectedDifficulty) return;

    setLoading(true);



    try {
      const res = await axios.post("http://localhost:5000/generate-quiz", {
        topic,
        numQuestions,
        difficulty: selectedDifficulty,
      });

      if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
        alert("No questions received from backend.");
        setLoading(false);
        return;
      }

      setQuestions(res.data);
      setCurrentQ(0);
      setAnswers([]);
      setSelected(null);
      setXpEarnedPerQuestion({});
      setStreakCount(0);
      setStreakBonusEarned(0);
      setStreakPopup(false);
      setToaster({ show: false, message: "" });
      setStage("quiz");

    } catch (err) {

      console.error("Error fetching quiz:", err);
      alert("Failed to generate quiz.");
    }

    setLoading(false);
  };

  // Save quiz to DB on demand
  const calculateXP = () => {
    return answers.reduce((total, ans, i) => {
      if (ans === questions[i]?.answer) {
        const diff = difficultyLevels.find(d => d.id === selectedDifficulty);
        return total + (xpEarnedPerQuestion[i] ?? (typeof diff?.xp === "number" ? diff.xp : 0));
      }
      return total;
    }, 0) + streakBonusEarned;
  };

  const handleSaveQuiz = async () => {
    if (quizSaving || quizSaved) return;
    setQuizSaving(true);
    try {
      const totalXP = calculateXP();
      const questionsWithAnswers = questions.map((q, i) => ({
        ...q,
        userAnswer: answers[i] ?? null,
        isCorrect: answers[i] === q.answer,
      }));
      const weakSubtopics = [...new Set(
        questionsWithAnswers
          .filter(q => !q.isCorrect)
          .map(q => q.subtopic)
          .filter(Boolean)
      )];
      await axios.post("http://localhost:5000/api/past-quiz/save", {
        topic,
        difficulty: selectedDifficulty,
        questions: questionsWithAnswers,
        score: questionsWithAnswers.filter(q => q.isCorrect).length,
        totalXP,
        weakSubtopics,
      });
      setQuizSaved(true);
      // Persist XP to global stats
      addXpToServer(totalXP, "quiz");
      addCoinsToServer(1, "quiz-complete"); // 1 coin per quiz completion
    } catch (err) {
      console.error("Quiz save error:", err);
    } finally {
      setQuizSaving(false);
    }
  };

  const getXPForQuestion = (qIndex) => {
    if (selectedDifficulty === "adaptive") {
      if (xpEarnedPerQuestion[qIndex] != null) return xpEarnedPerQuestion[qIndex];
      return "2-10"; // dynamic before attempt
    }
    const diff = difficultyLevels.find((d) => d.id === selectedDifficulty);
    return typeof diff?.xp === "number" ? diff.xp : 0;
  };

  const handleSelectOption = (opt) => {
    if (answers[currentQ] != null) return; // already attempted
    const updated = [...answers];
    updated[currentQ] = opt;
    setAnswers(updated);
    setSelected(opt);
    const isCorrect = opt === questions[currentQ]?.answer;

    if (isCorrect) {
      const xp = selectedDifficulty === "adaptive"
        ? [2, 4, 6, 8, 10][Math.floor(Math.random() * 5)]
        : difficultyLevels.find((d) => d.id === selectedDifficulty)?.xp ?? 0;
      if (selectedDifficulty === "adaptive") {
        setXpEarnedPerQuestion((prev) => ({ ...prev, [currentQ]: xp }));
      }

      const newStreak = streakCount + 1;
      setStreakCount(newStreak);

      if (newStreak >= 3) {
        setStreakBonusEarned((prev) => prev + 5);
        setStreakPopup(true);
        setToaster({ show: true, message: `Correct! +${xp} XP (+5 streak bonus!)`, type: "success" });
      } else {
        setToaster({ show: true, message: `Correct! +${xp} XP`, type: "success" });
      }
    } else {
      setStreakCount(0);
      setToaster({ show: true, message: "Incorrect - no XP earned", type: "error" });
    }
  };

  const handleNext = () => {
    setSelected(null);
    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
    } else {
      setStage("result");
    }
  };

  const closeStreakPopup = () => {
    setStreakPopup(false);
  };

  const resetQuiz = () => {
    setStage("home");
    setTopic("");
    setNumQuestions(5);
    setSelectedDifficulty(null);
    setQuestions([]);
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setXpEarnedPerQuestion({});
    setStreakCount(0);
    setStreakBonusEarned(0);
    setStreakPopup(false);
    setToaster({ show: false, message: "" });
  };

  const goToSetup = () => {
    setStage("setup");
    setQuestions([]);
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setXpEarnedPerQuestion({});
    setStreakCount(0);
    setStreakBonusEarned(0);
    setStreakPopup(false);
    setToaster({ show: false, message: "" });
  };

  const goToQuestion = (index) => {
    const updated = [...answers];
    updated[currentQ] = selected;
    setAnswers(updated);
    setSelected(updated[index] ?? null);
    setCurrentQ(index);
  };

  const endQuiz = () => {
    const updated = [...answers];
    updated[currentQ] = selected;
    setAnswers(updated);
    setSelected(null);
    setStage("result");
  };




  const getSubtopicsToFocusOn = () => {
    const wrongSubtopics = new Set();
    questions.forEach((q, i) => {
      if (answers[i] != null && answers[i] !== q.answer && q.subtopic) {
        wrongSubtopics.add(q.subtopic);
      }
    });
    return Array.from(wrongSubtopics);
  };

  const glowHover = (e) => {
    gsap.to(e.currentTarget, {
      scale: 1.05,
      boxShadow: "0px 0px 25px rgba(34,211,238,0.6)",
      duration: 0.2,
    });
  };

  const glowLeave = (e) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      boxShadow: "0px 0px 0px rgba(0,0,0,0)",
      duration: 0.2,
    });
  };

  const q = questions[currentQ];
  const attempted = answers[currentQ] != null;
  const isCorrectAttempt = attempted && answers[currentQ] === q?.answer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-black text-white flex items-center justify-center p-6 relative">
      <Toaster
        message={toaster.message}
        show={toaster.show}
        onClose={() => setToaster((t) => ({ ...t, show: false }))}
        type={toaster.type}
        duration={toaster.duration}
      />
      <AnimatePresence>
        {streakPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeStreakPopup}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-10 py-8 rounded-2xl border-2 border-yellow-300 shadow-2xl shadow-amber-500/40"
            >
              <p className="text-3xl font-bold text-amber-900 mb-2">🔥 Streak!</p>
              <p className="text-2xl font-extrabold text-amber-800">3 Correct in a Row!</p>
              <p className="text-xl font-bold text-amber-700 mt-2">+5 XP Bonus</p>
              <p className="text-sm text-amber-600 mt-2">Tap anywhere to continue</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="w-full max-w-4xl">
        <AnimatePresence mode="wait">

          {stage === "home" && (
            <QuizHome
              onStart={() => setStage("setup")}
              onPastQuizzes={() => setStage("pastQuizzes")}
              onMasterMentors={() => setStage("mentorSelect")}
              onChallenge={() => setStage("challenge")}
            />
          )}

          {stage === "mentorSelect" && (
            <MasterMentors
              onBack={() => setStage("home")}
              onSelectMentor={(m) => {
                setSelectedMentor(m);
                setMentorTotalXp(0);
                setStage("mentorChat");
              }}
            />
          )}

          {stage === "mentorChat" && selectedMentor && (
            <MentorChat
              mentor={selectedMentor}
              onBack={() => {
                setStage("mentorSelect");
                setSelectedMentor(null);
              }}
              onXpEarned={(xp) => setMentorTotalXp((n) => n + xp)}
              showXpToast={(xp) =>
                setToaster({ show: true, message: `+${xp} XP`, type: "success", duration: 1000 })
              }
            />
          )}

          {stage === "pastQuizzes" && (
            <PastQuizes
              onBack={() => setStage("home")}
              onPastAssistedQuiz={() => setStage("pastAssisted")}
              onPastChallenges={() => setStage("pastChallenges")}
            />
          )}

          {stage === "pastAssisted" && (
            <PastAssistedQuizzes onBack={() => setStage("pastQuizzes")} />
          )}

          {stage === "pastChallenges" && (
            <PastChallenges onBack={() => setStage("pastQuizzes")} />
          )}

          {stage === "challenge" && (
            <Challenge
              onBack={() => setStage("home")}
              coins={coins}
              onCoinsChange={(delta) => setCoins((c) => Math.max(0, c + delta))}
            />
          )}

          {stage === "setup" && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl"
            >
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12 relative">
                  <button
                    onClick={() => setStage("home")}
                    className="absolute -top-2 left-0 md:-left-8 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors border border-white/10 bg-white/5 px-4 py-2 rounded-full cursor-pointer"
                  >
                    <FaArrowLeft /> Back to Home
                  </button>

                  <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text mb-4 inline-block drop-shadow-sm">
                    Practice Arena
                  </h1>
                  <p className="text-gray-400 text-lg max-w-xl mx-auto">
                    Challenge yourself across distinct difficulty tiers. Earn XP, coins, and climb the ranks.
                  </p>
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-pink-500 text-transparent bg-clip-text">
                Setup Your Quiz
              </h2>

              <div className="mb-8">
                <label className="block mb-2 text-gray-400">
                  Enter Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#1f2937] border border-gray-600"
                />
              </div>

              <div className="mb-8">
                <label className="block mb-4 text-gray-400">
                  Choose Your Path
                </label>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {difficultyLevels.map((level) => (
                    <motion.div
                      key={level.id}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setSelectedDifficulty(level.id)}
                      className={`p-4 rounded-xl cursor-pointer border transition ${selectedDifficulty === level.id
                        ? "bg-cyan-600 border-cyan-400"
                        : "bg-[#1f2937] border-gray-600"
                        }`}
                    >
                      <h3 className="font-semibold text-sm">
                        {level.title}
                      </h3>
                    </motion.div>
                  ))}
                </div>

                <AnimatePresence>
                  {selectedDifficulty && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 bg-black/40 p-4 rounded-xl border border-cyan-400/30"
                    >
                      {difficultyLevels
                        .filter((d) => d.id === selectedDifficulty)
                        .map((d) => (
                          <div key={d.id}>
                            <p className="text-gray-300 mb-2">
                              {d.desc}
                            </p>
                            <p className="text-cyan-400 font-semibold">
                              XP per correct:{" "}
                              {d.xp === "dynamic"
                                ? "Dynamic (2-10 XP)"
                                : `+${d.xp} XP`}
                            </p>
                          </div>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mb-8">
                <label className="block mb-4 text-gray-400">
                  Number of Questions
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[5, 10, 15, 20, 25, 30].map((num) => (
                    <motion.div
                      key={num}
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setNumQuestions(num)}
                      className={`px-5 py-3 text-center rounded-xl cursor-pointer border ${numQuestions === num
                        ? "bg-pink-600 border-pink-400"
                        : "bg-[#1f2937] border-gray-600"
                        }`}
                    >
                      {num}
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onMouseEnter={glowHover}
                onMouseLeave={glowLeave}
                disabled={!selectedDifficulty || loading}
                onClick={generateQuiz}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 p-3 rounded-xl font-semibold disabled:opacity-50"
              >
                {loading ? "Generating..." : "Begin Adventure"}
              </motion.button>
            </motion.div>
          )}

          {stage === "quiz" && questions.length > 0 && q && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl">
                    Question {currentQ + 1} / {questions.length}
                  </h2>
                  <span className="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-400/50 text-amber-300 font-semibold">
                    +{getXPForQuestion(currentQ)} XP
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={goToSetup}
                    className="px-4 py-2 rounded-xl border border-gray-500 text-gray-300 hover:bg-white/5 transition"
                  >
                    ← Back to Setup
                  </button>
                  <button
                    onClick={endQuiz}
                    className="px-4 py-2 rounded-xl bg-amber-600/80 hover:bg-amber-600 border border-amber-500/50 transition"
                  >
                    End Quiz
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToQuestion(i)}
                    className={`w-10 h-10 rounded-lg font-medium transition ${currentQ === i
                      ? "bg-cyan-600 border-2 border-cyan-400 text-white"
                      : answers[i] != null
                        ? answers[i] === questions[i]?.answer
                          ? "bg-emerald-600/50 border border-emerald-400/50 text-white"
                          : "bg-red-600/50 border border-red-400/50 text-white"
                        : "bg-[#1f2937] border border-gray-600 text-gray-400 hover:border-gray-500"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <p className="mb-6 text-lg">{q.question}</p>

              <div className="grid gap-4">
                {q.options?.map((opt, i) => {
                  const isCorrectOpt = opt === q.answer;
                  const isSelectedWrong = attempted && selected === opt && !isCorrectOpt;
                  const showCorrect = attempted && isCorrectOpt;
                  const showWrong = attempted && isSelectedWrong;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectOption(opt)}
                      disabled={attempted}
                      className={`p-3 rounded-xl border text-left transition ${attempted
                        ? showCorrect
                          ? "bg-emerald-600/80 border-emerald-400"
                          : showWrong
                            ? "bg-red-600/80 border-red-400"
                            : "bg-[#1f2937] border-gray-600 opacity-70"
                        : selected === opt
                          ? "bg-cyan-600 border-cyan-400"
                          : "bg-[#1f2937] border-gray-600 hover:border-gray-500"
                        }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {attempted && (
                <div className="mt-8 space-y-6">
                  <h3 className="text-lg font-semibold text-cyan-400">Learn More</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-slate-800/50 border border-cyan-500/30 rounded-xl p-5"
                    >
                      <div className="flex items-center gap-2 mb-3 text-cyan-400">
                        <FaBook />
                        <span className="font-semibold">Solution</span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {q.solution || "Understanding why the correct answer works and how to approach similar questions."}
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-slate-800/50 border border-amber-500/30 rounded-xl p-5"
                    >
                      <div className="flex items-center gap-2 mb-3 text-amber-400">
                        <FaLightbulb />
                        <span className="font-semibold">Did you know?</span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {q.doYouKnow || "Interesting facts and curiosity about this topic."}
                      </p>
                      {q.additionalKnowledge && (
                        <p className="text-gray-400 text-xs mt-2 italic">{q.additionalKnowledge}</p>
                      )}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-slate-800/50 border border-pink-500/30 rounded-xl p-5"
                    >
                      <div className="flex items-center gap-2 mb-3 text-pink-400">
                        <FaExternalLinkAlt />
                        <span className="font-semibold">Learn More</span>
                      </div>
                      <div className="space-y-2">
                        {(q.learnMoreLinks || []).length > 0 ? (
                          q.learnMoreLinks.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-cyan-400 hover:text-cyan-300 text-sm truncate"
                            >
                              {link.title || "Link"}
                            </a>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">No links available</p>
                        )}
                      </div>
                      {q.imageSearchTerm && (
                        <div className="mt-3">
                          <img
                            src={`https://placehold.co/400x200/1e293b/64748b?text=${encodeURIComponent(q.imageSearchTerm)}`}
                            alt={q.imageSearchTerm}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  disabled={!attempted}
                  onClick={handleNext}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2 rounded-xl disabled:opacity-50"
                >
                  {currentQ + 1 === questions.length ? "Finish" : "Next"}
                </button>
              </div>
            </motion.div>
          )}

          {stage === "result" && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center max-w-2xl mx-auto"
            >
              <FaTrophy className="text-yellow-400 text-5xl mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Adventure Completed!</h2>
              <p className="text-xl mb-6 text-cyan-400 font-bold">
                Total XP Earned: {calculateXP()}
              </p>
              {getSubtopicsToFocusOn().length > 0 && (
                <div className="mb-6 text-left bg-amber-500/10 border border-amber-400/30 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-amber-400 mb-2">Subtopics to Focus On</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    Based on your performance, consider reviewing these areas:
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {getSubtopicsToFocusOn().map((sub, i) => (
                      <li
                        key={i}
                        className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-sm"
                      >
                        {sub}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-col gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: quizSaved ? 1 : 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSaveQuiz}
                  disabled={quizSaving || quizSaved}
                  className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${quizSaved
                    ? "bg-emerald-600/30 border border-emerald-400/50 text-emerald-400 cursor-default"
                    : "bg-gradient-to-r from-violet-500 to-indigo-600"
                    }`}
                >
                  {quizSaved ? "✓ Saved to Past Quizzes!" : quizSaving ? "Saving..." : "💾 Save to Past Quizzes"}
                </motion.button>
                <button
                  onClick={resetQuiz}
                  className="bg-gradient-to-r from-cyan-500 to-pink-500 px-6 py-3 rounded-xl w-full"
                >
                  Return Home
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}