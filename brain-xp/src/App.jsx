import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCards, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/navigation";

import {
  FaGraduationCap,
  FaCoins,
  FaStar,
  FaMedal,
  FaFire,
  FaChalkboardTeacher,
  FaClipboardList,
  FaMapSigns,
  FaPlay,
  FaProjectDiagram,
  FaFlask,
  FaBookOpen,
  FaBrain
} from "react-icons/fa";
import { fetchStats } from "./statsUtils";

// ─── QUOTES ──────────────────────────────────────────────
const QUOTES = [
  "Education is the passport to the future.",
  "Learn as if you will live forever.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "Turn your passion into your profession.",
];

// ─── HELPER FOR RANK/LEVEL ───────────────────────────────
function getLevelDetails(xp) {
  const level = Math.floor(xp / 1000) + 1;
  let rank = "Novice";
  let badgeColor = "text-gray-400";

  if (level >= 50) { rank = "Grandmaster"; badgeColor = "text-purple-500"; }
  else if (level >= 25) { rank = "Master"; badgeColor = "text-red-500"; }
  else if (level >= 10) { rank = "Expert"; badgeColor = "text-yellow-400"; }
  else if (level >= 5) { rank = "Scholar"; badgeColor = "text-blue-400"; }
  else if (level >= 2) { rank = "Apprentice"; badgeColor = "text-emerald-400"; }

  return { level, rank, badgeColor };
}

export default function App() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalXP: 0, totalCoins: 0 });
  const [quoteIdx, setQuoteIdx] = useState(0);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats().then((data) => {
      if (data) setStats(data);
    });

    // Rotate quotes every 5 seconds
    const interval = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % QUOTES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const { level, rank, badgeColor } = getLevelDetails(stats.totalXP);

  // ─── HOT FEATURES ROSTER ───────────────────────────────
  const hotFeatures = [
    {
      title: "Master Mentors",
      desc: "Get 1-on-1 guidance from top industry experts.",
      icon: <FaChalkboardTeacher />,
      gradient: "from-purple-500 to-indigo-600",
      action: () => navigate("/MasterMentors"),
    },
    {
      title: "Exam Planners",
      desc: "Intelligent auto-scheduling for massive syllabuses.",
      icon: <FaClipboardList />,
      gradient: "from-cyan-400 to-blue-500",
      action: () => navigate("/ExamPlanner"),
    },
    {
      title: "Career Navigators",
      desc: "Psychological profiling to find your perfect job.",
      icon: <FaMapSigns />,
      gradient: "from-pink-500 to-rose-500",
      action: () => navigate("/CarrerCounsellor"),
    },
    {
      title: "Destiny Designer",
      desc: "Create a massive detailed roadmap to success.",
      icon: <FaProjectDiagram />,
      gradient: "from-indigo-400 to-purple-500",
      action: () => navigate("/DestinyDesigner"),
    },
    {
      title: "Applied Knowledge",
      desc: "See how abstract concepts are used in reality.",
      icon: <FaFlask />,
      gradient: "from-emerald-400 to-teal-500",
      action: () => navigate("/AppliedKnowledge"),
    },
    {
      title: "Story Verse",
      desc: "Learn through interactive adventures.",
      icon: <FaBookOpen />,
      gradient: "from-orange-400 to-red-500",
      action: () => navigate("/Storyverse"),
    },
    {
      title: "Brain Board",
      desc: "Smart memorization with Mind Maps & Flashcards.",
      icon: <FaBrain />,
      gradient: "from-rose-400 to-pink-600",
      action: () => navigate("/BrainBoard"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-black text-white selection:bg-cyan-500/30 font-sans overflow-x-hidden">

      {/* ─── NAVBAR ─── */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md bg-[#0f172a]/80 sticky top-0 z-50 border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-cyan-400 to-blue-600 p-2 lg:p-3 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <FaGraduationCap className="text-white text-2xl lg:text-3xl" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 to-blue-500 text-transparent bg-clip-text">
              Eduventure
            </h1>
            <span className="text-[10px] lg:text-xs text-cyan-400/80 font-medium tracking-widest pl-1">
              (by team CodeTitans)
            </span>
          </div>
        </div>

        {/* PROFILE CHIP */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-5 py-2 shadow-inner">
          <div className="flex items-center gap-2" title="Total XP">
            <FaStar className="text-yellow-400" />
            <span className="font-bold">{stats.totalXP}</span>
          </div>
          <div className="w-px h-4 bg-white/20"></div>
          <div className="flex items-center gap-2" title="Total Coins">
            <FaCoins className="text-yellow-300" />
            <span className="font-bold">{stats.totalCoins}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/20"></div>
          <div className="hidden sm:flex items-center gap-2 uppercase text-xs font-black tracking-widest text-gray-400">
            <FaMedal className={`text-lg ${badgeColor}`} /> {rank} Lvl {level}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-20">

        {/* ─── HERO SECTION ─── */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          <div className="space-y-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h2 className="text-5xl md:text-7xl font-black leading-tight">
                Level Up Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                  Mind.
                </span>
              </h2>
              <div className="mt-4 h-16 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={quoteIdx}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute text-gray-400 text-lg md:text-xl font-medium italic border-l-4 border-cyan-500 pl-4"
                  >
                    "{QUOTES[quoteIdx]}"
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex gap-4"
            >
              <button onClick={() => navigate("/Learn")} className="bg-white text-black px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center gap-3">
                <FaPlay className="text-sm" /> Start Quest
              </button>
            </motion.div>
          </div>

          {/* ─── SWIPER AUTO SLIDER (HOT FEATURES) ─── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-[320px] aspect-[3/4] perspective-1000 relative">
              {/* Decorative background glow */}
              <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full"></div>

              <Swiper
                effect={"cards"}
                grabCursor={true}
                modules={[EffectCards, Autoplay, Navigation]}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                loop={true}
                navigation={true}
                className="w-full h-full drop-shadow-2xl"
              >
                {hotFeatures.map((feat, i) => (
                  <SwiperSlide key={i} className="rounded-3xl overflow-hidden cursor-pointer" onClick={feat.action}>
                    <div className={`w-full h-full bg-gradient-to-br ${feat.gradient} p-8 flex flex-col justify-end relative shadow-inner border border-white/20`}>
                      <div className="absolute top-6 right-6 text-white/50 text-6xl">
                        {feat.icon}
                      </div>
                      <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 transform translate-y-4 shadow-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <FaFire className="text-orange-400" />
                          <p className="text-xs font-bold text-orange-200 uppercase tracking-widest">Hot Feature</p>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">{feat.title}</h3>
                        <p className="text-sm text-gray-200">{feat.desc}</p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </motion.div>
        </div>

        {/* ─── MAJOR MODULES GRID ─── */}
        <div className="pt-10 border-t border-white/10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-extrabold text-white">Choose Your Arena</h3>
            <span className="text-gray-500 text-sm hidden sm:block">Select a path to continue your journey</span>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Learning Arena Card */}
            <motion.div
              whileHover={{ y: -8, boxShadow: "0 20px 40px -10px rgba(6,182,212,0.3)" }}
              onClick={() => navigate("/Learn")}
              className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 cursor-pointer group relative overflow-hidden flex flex-col items-start transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-bl-full transition-transform group-hover:scale-150 duration-500"></div>
              <div className="bg-cyan-500/20 text-cyan-400 p-4 rounded-2xl mb-6">
                <FaGraduationCap className="text-3xl" />
              </div>
              <h4 className="text-2xl font-bold mb-3 group-hover:text-cyan-400 transition-colors">Learning Arena</h4>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                Immersive StoryVerses and AI-generated BrainBoards. Learn complex concepts visually and interactively.
              </p>
              <span className="text-cyan-400 text-sm font-bold flex items-center gap-2 mt-auto">
                Enter Arena <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.div>

            {/* Practice Arena Card */}
            <motion.div
              whileHover={{ y: -8, boxShadow: "0 20px 40px -10px rgba(236,72,153,0.3)" }}
              onClick={() => navigate("/QuizApp")}
              className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 cursor-pointer group relative overflow-hidden flex flex-col items-start transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-bl-full transition-transform group-hover:scale-150 duration-500"></div>
              <div className="bg-pink-500/20 text-pink-400 p-4 rounded-2xl mb-6">
                <FaFire className="text-3xl" />
              </div>
              <h4 className="text-2xl font-bold mb-3 group-hover:text-pink-400 transition-colors">Practice Arena</h4>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                Dynamic, timed challenges and quizzes. Spend coins for hints, review solutions, and climb the ranks.
              </p>
              <span className="text-pink-400 text-sm font-bold flex items-center gap-2 mt-auto">
                Start Challenge <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.div>

            {/* Growth Blueprint Card */}
            <motion.div
              whileHover={{ y: -8, boxShadow: "0 20px 40px -10px rgba(139,92,246,0.3)" }}
              onClick={() => navigate("/Growth")}
              className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 cursor-pointer group relative overflow-hidden flex flex-col items-start transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full transition-transform group-hover:scale-150 duration-500"></div>
              <div className="bg-purple-500/20 text-purple-400 p-4 rounded-2xl mb-6">
                <FaMapSigns className="text-3xl" />
              </div>
              <h4 className="text-2xl font-bold mb-3 group-hover:text-purple-400 transition-colors">Growth Blueprint</h4>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                Plan exams intelligently, map out your entire career destiny, and consult the AI counselor.
              </p>
              <span className="text-purple-400 text-sm font-bold flex items-center gap-2 mt-auto">
                Plan Future <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.div>

          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 mt-12 py-8 text-center text-gray-500 text-sm bg-black/50">
        <p>Powered by AI • Gamified Learning • Ready for the Future</p>
      </footer>
    </div>
  );
}

// Ensure simple Arrow icon is available since it's used in cards
function FaArrowRight(props) {
  return (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"></path>
    </svg>
  );
}
