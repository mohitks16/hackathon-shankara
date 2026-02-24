import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { FaArrowLeft, FaPaperPlane } from "react-icons/fa";

const API = "http://localhost:5000";

export default function MentorChat({
  mentor,
  onBack,
  onXpEarned,
  showXpToast,
}) {
  const [topic, setTopic] = useState("");
  const [subtopics, setSubtopics] = useState([]);
  const [currentSubtopicIdx, setCurrentSubtopicIdx] = useState(0);
  const [subtopicStatus, setSubtopicStatus] = useState({});
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");
  const [performance, setPerformance] = useState({ correct: 0, wrong: 0 });
  const [questionsInSubtopic, setQuestionsInSubtopic] = useState(1);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startSession = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/mentors/session`, {
        mentorId: mentor.id,
        topic: topic.trim(),
      });
      const { subtopics: st, welcomeMessage, firstQuestion } = res.data;
      setSubtopics(st || []);
      setSessionStarted(true);
      setMessages([
        { role: "tutor", content: welcomeMessage },
        { role: "tutor", content: firstQuestion, isQuestion: true },
      ]);
      setLastQuestion(firstQuestion);
      setWaitingForAnswer(true);
      inputRef.current?.focus();
    } catch (err) {
      console.error(err);
      alert("Failed to start session.");
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading || !waitingForAnswer) return;

    const userMsg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setWaitingForAnswer(false);
    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/mentors/chat`, {
        mentorId: mentor.id,
        topic,
        subtopics,
        conversation: [...messages, userMsg],
        currentSubtopicIndex: currentSubtopicIdx,
        lastQuestion,
        performanceSummary: performance,
        questionsInSubtopic,
      });

      const {
        reply,
        correct,
        moveToNext,
        completedSubtopic,
        xpEarned,
        newQuestion,
      } = res.data;

      const tutorMsg = { role: "tutor", content: reply };
      if (newQuestion) {
        tutorMsg.nextQuestion = newQuestion;
        tutorMsg.isQuestion = true;
      }
      setMessages((m) => [...m, tutorMsg]);

      if (correct) {
        setPerformance((p) => ({ ...p, correct: p.correct + 1 }));
        if (xpEarned) {
          onXpEarned?.(xpEarned);
          showXpToast?.(xpEarned);
        }
      } else {
        setPerformance((p) => ({ ...p, wrong: p.wrong + 1 }));
      }

      if (moveToNext && completedSubtopic !== undefined) {
        setSubtopicStatus((s) => ({ ...s, [completedSubtopic]: "done" }));
        setCurrentSubtopicIdx((i) => Math.min(i + 1, subtopics.length - 1));
        setQuestionsInSubtopic(0);
      } else if (newQuestion) {
        setQuestionsInSubtopic((n) => n + 1);
      }

      if (newQuestion) {
        setLastQuestion(newQuestion);
        setWaitingForAnswer(true);
      } else {
        setWaitingForAnswer(!!res.data.waitingForAnswer);
      }
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        { role: "tutor", content: "Sorry, I had an error. Try again?", isError: true },
      ]);
      setWaitingForAnswer(true);
    }
    setLoading(false);
  };

  if (!sessionStarted) {
    return (
      <div className="min-h-screen from-[#0f172a] via-[#111827] to-black text-white flex items-center justify-center px-6">
        <div className="w-full max-w-lg">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-gray-400 hover:text-cyan-400 mb-8"
          >
            <FaArrowLeft /> Back
          </button>

          <h2 className="text-2xl font-bold mb-2 text-cyan-400">
            {mentor.name} • {mentor.subject}
          </h2>
          <p className="text-gray-400 mb-6">
            What topic would you like to explore? I'll break it into subtopics and quiz you step by step.
          </p>

          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startSession()}
            placeholder={`e.g. Newton's Laws, Chemical Bonds, Quadratic Equations...`}
            className="w-full p-3 rounded-xl bg-[#1f2937] border border-gray-600 mb-4 focus:border-cyan-500 focus:outline-none"
          />

          <button
            onClick={startSession}
            disabled={loading || !topic.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold disabled:opacity-50"
          >
            {loading ? "Starting..." : "Start Learning"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen from-[#0f172a] via-[#111827] to-black text-white flex flex-col md:flex-row">
      {/* Chat area */}
      <div className="flex-1 flex flex-col p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400"
          >
            <FaArrowLeft /> Back
          </button>
          <span className="text-sm text-gray-500">{mentor.name} • {topic}</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                  msg.role === "user"
                    ? "bg-cyan-600/50 border border-cyan-400/30"
                    : msg.isError
                    ? "bg-red-900/30 border border-red-400/30"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {msg.nextQuestion && (
                  <p className="mt-2 text-cyan-300 font-medium">{msg.nextQuestion}</p>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {waitingForAnswer && (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Your answer..."
              className="flex-1 p-3 rounded-xl bg-[#1f2937] border border-gray-600 focus:border-cyan-500 focus:outline-none"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50"
            >
              <FaPaperPlane />
            </button>
          </div>
        )}
      </div>

      {/* Subtopics sidebar */}
      <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-white/10 p-4 bg-black/20">
        <h3 className="text-sm font-semibold text-cyan-400 mb-3">Subtopics</h3>
        <div className="space-y-2">
          <AnimatePresence>
            {subtopics.map((st, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: currentSubtopicIdx === i ? 1.02 : 1,
                }}
                className={`rounded-lg px-3 py-2 text-xs border transition ${
                  subtopicStatus[i] === "done"
                    ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300"
                    : currentSubtopicIdx === i
                    ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300"
                    : "bg-white/5 border-white/10 text-gray-400"
                }`}
              >
                <span className="font-medium">{i + 1}.</span> {st}
                {subtopicStatus[i] === "done" && " ✓"}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
