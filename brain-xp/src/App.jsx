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
  FaBrain,
  FaUser,
  FaBell,
  FaTimes,
  FaTrophy,
} from "react-icons/fa";
import axios from "axios";
import { fetchStats, addXpToServer, addCoinsToServer } from "./statsUtils";
import { getLevelFromXP, checkLevelUp, getLevelUpRewards } from "./levelUtils";
import LevelUpModal from "./LevelUpModal";
import BadgeModal from "./BadgeModal";
import { useAuth } from "./AuthContext";

// ─── QUOTES ──────────────────────────────────────────────
const QUOTES = [
  "Education is the passport to the future.",
  "Learn as if you will live forever.",
  "The beautiful thing about learning is that no one can take it away from you.",
  "Turn your passion into your profession.",
];

export default function App() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ totalXP: 0, totalCoins: 0 });
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [revisionNotifs, setRevisionNotifs] = useState([]);
  const [showRevisionPopup, setShowRevisionPopup] = useState(false);
  const [badgeQueue, setBadgeQueue] = useState([]);
  const [currentBadge, setCurrentBadge] = useState(null);
  const [userBadges, setUserBadges] = useState([]);

  // Fetch stats + revision notifications on mount
  useEffect(() => {
    fetchStats().then((data) => {
      if (data) setStats(data);
    });

    // Fetch revision notifications (forgetting curve)
    axios.get("http://localhost:5000/api/brain-reset/notifications")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setRevisionNotifs(res.data);
          setShowRevisionPopup(true);
        }
      })
      .catch(() => { });

    // Record login + check badges
    axios.post("http://localhost:5000/api/badges/record-login")
      .then(() => axios.post("http://localhost:5000/api/badges/check"))
      .then((res) => {
        if (res.data.newBadges && res.data.newBadges.length > 0) {
          setBadgeQueue(res.data.newBadges);
          setCurrentBadge(res.data.newBadges[0]);
        }
      })
      .catch(() => { });

    // Fetch earned badges for profile
    axios.get("http://localhost:5000/api/badges")
      .then((res) => setUserBadges(res.data))
      .catch(() => { });

    // Rotate quotes every 5 seconds
    const interval = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % QUOTES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const levelInfo = getLevelFromXP(stats.totalXP);

  // ─── HOT FEATURES ROSTER ───────────────────────────────
  const hotFeatures = [
    {
      title: "Master Mentors",
      desc: "Get 1-on-1 guidance from top industry experts.",
      icon: <FaChalkboardTeacher />,
      gradient: "from-purple-500 to-indigo-600",
      action: () => navigate("/QuizApp?stage=mentorSelect"),
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

  // ─── Level-up dismiss handler ─────────────────────────
  const handleLevelUpDismiss = async () => {
    if (levelUpData?.rewards) {
      // Award bonus XP and coins
      await addXpToServer(levelUpData.rewards.bonusXP, "level-up-bonus");
      await addCoinsToServer(levelUpData.rewards.bonusCoins, "level-up-bonus");
      const updated = await fetchStats();
      if (updated) setStats(updated);
    }
    setShowLevelUp(false);
    setLevelUpData(null);
  };

  // ─── Bracket color helper ─────────────────────────────
  const bracketColor = () => {
    switch (levelInfo.bracket) {
      case "Seeding": return "text-emerald-400";
      case "Apprentice": return "text-blue-400";
      case "Scholar": return "text-purple-400";
      case "Legend": return "text-amber-400";
      default: return "text-gray-400";
    }
  };

  const bracketGradient = () => {
    switch (levelInfo.bracket) {
      case "Seeding": return "from-emerald-500 to-green-600";
      case "Apprentice": return "from-blue-500 to-cyan-600";
      case "Scholar": return "from-purple-500 to-violet-600";
      case "Legend": return "from-amber-500 to-yellow-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-black text-white selection:bg-cyan-500/30 font-sans overflow-x-hidden">

      {/* ─── LEVEL UP MODAL ─── */}
      <LevelUpModal show={showLevelUp} levelUpData={levelUpData} onDismiss={handleLevelUpDismiss} />

      {/* ─── NAVBAR ─── */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md bg-[#0f172a]/80 sticky top-0 z-50 border-b border-white/10 shadow-lg">
        {/* LEFT: Profile Button with Level */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2 hover:bg-white/10 transition-all group"
          >
            <div className={`bg-gradient-to-tr ${bracketGradient()} p-2 rounded-full shadow-lg`}>
              <FaUser className="text-white text-sm" />
            </div>
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">Lvl {levelInfo.level}</span>
                <span className={`text-xs font-semibold ${bracketColor()}`}>
                  {levelInfo.bracketIcon} {levelInfo.bracket}
                </span>
              </div>
              {/* Mini progress bar */}
              <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden mt-0.5">
                <motion.div
                  className={`h-full bg-gradient-to-r ${bracketGradient()} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(levelInfo.progress * 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </button>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full left-0 mt-2 w-72 bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl z-50 overflow-hidden"
              >
                {/* Dynamically Styled Profile Banner */}
                {levelInfo.level >= 30 ? (
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500 opacity-40 mix-blend-screen z-0 animate-pulse"></div>
                ) : levelInfo.level >= 20 ? (
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 opacity-30 animate-pulse z-0"></div>
                ) : levelInfo.level >= 10 ? (
                  <div className="absolute top-0 left-0 w-full h-24 bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.3)] z-0"></div>
                ) : (
                  <div className="absolute top-0 left-0 w-full h-24 bg-slate-700/30 z-0"></div>
                )}

                <div className="relative z-10 text-center mb-4 mt-2">
                  <div className={`inline-flex bg-gradient-to-tr ${bracketGradient()} p-4 rounded-full shadow-lg mb-3 ring-4 ring-black/20`}>
                    <FaUser className="text-white text-2xl" />
                  </div>
                  <h3 className="text-lg font-bold">{levelInfo.bracketIcon} Level {levelInfo.level}</h3>
                  <p className={`text-sm font-semibold ${bracketColor()}`}>{levelInfo.bracket}</p>
                </div>

                {/* XP Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Level {levelInfo.level}</span>
                    <span>Level {levelInfo.level + 1}</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${bracketGradient()} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(levelInfo.progress * 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-center">
                    {levelInfo.xpInLevel} / {levelInfo.xpNeededForNext} XP
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                    <FaStar className="text-yellow-400 mx-auto mb-1" />
                    <p className="text-lg font-bold">{stats.totalXP}</p>
                    <p className="text-xs text-gray-400">Total XP</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                    <FaCoins className="text-yellow-300 mx-auto mb-1" />
                    <p className="text-lg font-bold">{stats.totalCoins}</p>
                    <p className="text-xs text-gray-400">Coins</p>
                  </div>
                </div>

                {/* Badges in profile */}
                {userBadges.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-400 mb-2 text-left">Badges Earned</p>
                    <div className="flex flex-col gap-1.5">
                      {(() => {
                        const highest = {};
                        for (const b of userBadges) {
                          if (!highest[b.category] || b.tier > highest[b.category].tier) highest[b.category] = b;
                        }
                        return Object.values(highest).map((b) => (
                          <div key={b.category} className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-lg px-3 py-1.5">
                            <span className="text-base">
                              {b.category === 'practice' ? '⚔️' : b.category === 'streak' ? '🔥' : b.category === 'learning' ? '📚' : '🎯'}
                            </span>
                            <span className="text-xs font-semibold text-white">{b.badgeName}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                {/* Logout Button */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold rounded-xl border border-red-500/20 transition-all text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CENTER: Brain Reset Button */}
        <button
          onClick={() => navigate("/BrainReset")}
          className="relative flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 rounded-full px-4 py-2 hover:bg-rose-500/20 transition-all text-rose-400 font-semibold text-sm"
        >
          <FaBrain className="text-lg" />
          <span className="hidden sm:inline">Brain Reset</span>
          {
            revisionNotifs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {revisionNotifs.length > 9 ? "9+" : revisionNotifs.length}
              </span>
            )
          }
        </button >

        {/* Leaderboard Button */}
        <button
          onClick={() => navigate("/Leaderboard")}
          className="relative flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 hover:bg-purple-500/20 transition-all text-purple-400 font-semibold text-sm mx-1 md:mx-2"
        >
          <FaTrophy className="text-lg" />
          <span className="hidden sm:inline">Leaderboard</span>
        </button>

        {/* Badges Button */}
        < button
          onClick={() => navigate("/Badges")}
          className="relative flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-2 hover:bg-yellow-500/20 transition-all text-yellow-400 font-semibold text-sm"
        >
          <FaMedal className="text-lg" />
          <span className="hidden sm:inline">Badges</span>
          {
            userBadges.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                {userBadges.length}
              </span>
            )
          }
        </button >

        {/* RIGHT: Quick Stats Chip */}
        < div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-5 py-2 shadow-inner" >
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
            <FaMedal className={`text-lg ${bracketColor()}`} /> {levelInfo.bracket} Lvl {levelInfo.level}
          </div>
        </div >
      </nav >

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-20">

        {/* ─── HERO SECTION ─── */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          <div className="space-y-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Eduventure Logo in Hero */}
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-tr from-cyan-400 to-blue-600 p-3 lg:p-4 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                  <FaGraduationCap className="text-white text-3xl lg:text-4xl" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-cyan-300 to-blue-500 text-transparent bg-clip-text">
                    Eduventure
                  </h1>
                  <span className="text-[10px] lg:text-xs text-cyan-400/80 font-medium tracking-widest pl-1">
                    (by team CodeTitans)
                  </span>
                </div>
              </div>

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
        </div>

        {/* ─── SWIPER AUTO SLIDER (HOT FEATURES) ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="w-full max-w-[900px] relative">
            {/* Decorative background glow */}
            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full"></div>

            <Swiper
              slidesPerView={1}
              spaceBetween={20}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              grabCursor={true}
              modules={[Autoplay, Navigation]}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop={true}
              navigation={true}
              className="w-full drop-shadow-2xl !pb-2"
            >
              {hotFeatures.map((feat, i) => (
                <SwiperSlide key={i} className="rounded-3xl overflow-hidden cursor-pointer" onClick={feat.action}>
                  <div className={`w-full h-[280px] bg-gradient-to-br ${feat.gradient} p-6 flex flex-col justify-end relative shadow-inner border border-white/20 rounded-3xl`}>
                    <div className="absolute top-5 right-5 text-white/50 text-5xl">
                      {feat.icon}
                    </div>
                    <div className="bg-black/40 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <FaFire className="text-orange-400" />
                        <p className="text-xs font-bold text-orange-200 uppercase tracking-widest">Hot Feature</p>
                      </div>
                      <h3 className="text-xl font-black text-white mb-1">{feat.title}</h3>
                      <p className="text-xs text-gray-200">{feat.desc}</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </motion.div>

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

      </main >

      {/* FOOTER */}
      < footer className="border-t border-white/10 mt-12 py-8 text-center text-gray-500 text-sm bg-black/50" >
        <p>Powered by AI • Gamified Learning • Ready for the Future</p>
      </footer >

      {/* REVISION NOTIFICATION POPUP */}
      < AnimatePresence >
        {showRevisionPopup && revisionNotifs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 40 }}
              className="bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FaBell className="text-amber-400 text-xl" />
                  <h3 className="text-lg font-bold text-white">Revision Reminder</h3>
                </div>
                <button
                  onClick={() => setShowRevisionPopup(false)}
                  className="text-gray-400 hover:text-white transition p-1"
                >
                  <FaTimes />
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Based on your study history, these topics need review to beat the forgetting curve:
              </p>
              <div className="space-y-2 mb-5 max-h-40 overflow-y-auto">
                {revisionNotifs.slice(0, 5).map((n) => (
                  <div key={n._id} className="flex items-center gap-3 bg-amber-500/10 border border-amber-400/20 rounded-xl px-4 py-2.5">
                    <span className="text-sm">{n.dayInterval === 1 ? "🟢" : n.dayInterval === 5 ? "🔵" : n.dayInterval === 14 ? "🟠" : "🟣"}</span>
                    <span className="text-sm text-white font-medium flex-1">{n.topic}</span>
                    <span className="text-xs text-amber-400 font-semibold">{n.dayInterval}d</span>
                  </div>
                ))}
                {revisionNotifs.length > 5 && (
                  <p className="text-xs text-gray-500 text-center">+{revisionNotifs.length - 5} more</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRevisionPopup(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 transition text-sm"
                >
                  Later
                </button>
                <button
                  onClick={() => { setShowRevisionPopup(false); navigate("/BrainReset"); }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold text-sm"
                >
                  Open Brain Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )
        }
      </AnimatePresence >

      {/* BADGE CONGRATULATION MODAL */}
      < BadgeModal
        badge={currentBadge}
        onClose={() => {
          const remaining = badgeQueue.slice(1);
          setBadgeQueue(remaining);
          setCurrentBadge(remaining.length > 0 ? remaining[0] : null);
        }}
      />
    </div >
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
