import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { FaPlay, FaHistory, FaRobot, FaTrophy, FaGraduationCap, FaArrowLeft } from "react-icons/fa";

export default function QuizHome({ onStart, onPastQuizzes, onMasterMentors, onChallenge }) {
  const heroRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    gsap.from(heroRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power3.out",
    });
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.6,
      },
    }),
  };

  return (
    <div className="min-h-screen  from-[#0f172a] via-[#111827] to-black text-white flex items-center justify-center px-6">

      <div className="w-full max-w-6xl text-center">

        {/* HERO SECTION */}
        <div ref={heroRef} className="mb-16 relative">
          <button
            onClick={() => navigate("/")}
            className="absolute -top-6 left-0 md:-left-4 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors border border-white/10 bg-white/5 px-4 py-2 rounded-full cursor-pointer"
          >
            <FaArrowLeft /> Back to Home
          </button>
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 text-transparent bg-clip-text">
            PRACTICE ARENA
          </h1>
          <p className="text-gray-400 mt-4 text-lg">
            Learn. Compete. Level Up.
          </p>
        </div>

        {/* CARD GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {[
            {
              icon: <FaPlay />,
              title: "Assited Quiz",
              desc: "Solve and Learn",
              action: onStart,
            },
            {
              icon: <FaHistory />,
              title: "Past Quizzes",
              desc: "Review previous attempts and performance.",
              action: onPastQuizzes,
            },
            {
              icon: <FaGraduationCap />,
              title: "Master Mentors",
              desc: "Practice and learn with experts.",
              action: onMasterMentors,
            },
            {
              icon: <FaTrophy />,
              title: "Challenge",
              desc: "Challenge yourself and earn rewards",
              action: onChallenge,
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 0px 30px rgba(34,211,238,0.4)",
              }}
              onClick={card.action ?? undefined}
              className="cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all"
            >
              <div className="text-4xl text-cyan-400 mb-4 flex justify-center">
                {card.icon}
              </div>

              <h2 className="text-xl font-bold mb-2">{card.title}</h2>
              <p className="text-gray-400 text-sm">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* FOOTER TAGLINE */}
        <div className="mt-16 text-gray-500 text-sm">
          Powered by AI • Gamified Learning • Future Ready
        </div>
      </div>
    </div>
  );
}