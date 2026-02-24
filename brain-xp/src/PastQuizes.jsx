import React from "react";
import { motion } from "framer-motion";
import { FaRobot, FaTrophy, FaArrowLeft } from "react-icons/fa";

export default function PastQuizes({ onBack, onPastAssistedQuiz, onPastChallenges }) {
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

  const cards = [
    {
      icon: <FaRobot />,
      title: "Past Assisted Quiz",
      desc: "Review your previous AI-assisted quiz attempts and performance.",
      action: onPastAssistedQuiz,
    },
    {
      icon: <FaTrophy />,
      title: "Past Challenges",
      desc: "Relive your past challenges and earned rewards.",
      action: onPastChallenges,
    },
  ];

  return (
    <div className="min-h-screen from-[#0f172a] via-[#111827] to-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-4xl">
        {/* Header with back button */}
        <div className="mb-10 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition text-gray-400 hover:text-cyan-400"
          >
            <FaArrowLeft /> Back
          </button>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 text-transparent bg-clip-text text-center">
          Past Quizzes
        </h1>
        <p className="text-gray-400 text-lg text-center mb-12">
          Review previous attempts and performance
        </p>

        {/* Two options */}
        <div className="grid md:grid-cols-2 gap-8">
          {cards.map((card, i) => (
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
              onClick={card.action}
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

        <div className="mt-16 text-gray-500 text-sm text-center">
          Powered by AI • Gamified Learning • Future Ready
        </div>
      </div>
    </div>
  );
}
