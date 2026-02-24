import React from "react";
import { motion } from "framer-motion";
import {
  FaAtom, FaFlask, FaSquareRootAlt, FaDna, FaLandmark, FaArrowLeft,
  FaBalanceScale, FaGlobeAmericas, FaBookOpen, FaPenNib, FaLanguage,
  FaFeatherAlt, FaCalculator, FaBriefcase, FaDesktop,
} from "react-icons/fa";

const MENTORS = [
  {
    id: "quantum",
    name: "Dr. Quantum",
    subject: "Physics",
    icon: <FaAtom />,
    color: "from-cyan-400 to-blue-600",
    desc: "Master the laws of motion, energy & the universe",
  },
  {
    id: "alchemy",
    name: "Prof. Alchemy",
    subject: "Chemistry",
    icon: <FaFlask />,
    color: "from-emerald-400 to-teal-600",
    desc: "Reactions, elements & molecular magic",
  },
  {
    id: "euclid",
    name: "Sir Euclid",
    subject: "Math",
    icon: <FaSquareRootAlt />,
    color: "from-amber-400 to-orange-600",
    desc: "Algebra, geometry & proofs made elegant",
  },
  {
    id: "genome",
    name: "Dr. Genome",
    subject: "Biology",
    icon: <FaDna />,
    color: "from-lime-400 to-green-600",
    desc: "Life sciences, cells & ecosystems",
  },
  {
    id: "athena",
    name: "Lady Athena",
    subject: "History",
    icon: <FaLandmark />,
    color: "from-pink-400 to-rose-600",
    desc: "Civilizations, wars & the stories that shape us",
  },
  {
    id: "constitution",
    name: "Dr. Constitution",
    subject: "Civics & Government",
    icon: <FaBalanceScale />,
    color: "from-indigo-400 to-violet-600",
    desc: "Democracy, rights & the pillars of governance",
  },
  {
    id: "atlas",
    name: "Lady Atlas",
    subject: "Geography & Environment",
    icon: <FaGlobeAmericas />,
    color: "from-teal-400 to-cyan-600",
    desc: "Maps, climates & the living planet",
  },
  {
    id: "shakespeare",
    name: "Lady Shakespeare",
    subject: "Literature",
    icon: <FaBookOpen />,
    color: "from-purple-400 to-fuchsia-600",
    desc: "Poetry, prose & the beauty of storytelling",
  },
  {
    id: "grammar",
    name: "Prof. Grammar",
    subject: "Grammar & Writing",
    icon: <FaPenNib />,
    color: "from-sky-400 to-blue-600",
    desc: "Sentence structure, punctuation & eloquent writing",
  },
  {
    id: "vyakaran",
    name: "Acharya Vyakaran",
    subject: "Hindi Grammar",
    icon: <FaLanguage />,
    color: "from-orange-400 to-red-600",
    desc: "व्याकरण, संधि, समास और वाक्य रचना",
  },
  {
    id: "kavya",
    name: "Kavya Devi",
    subject: "Hindi Literature",
    icon: <FaFeatherAlt />,
    color: "from-rose-400 to-pink-600",
    desc: "काव्य, गद्य और हिंदी साहित्य की विरासत",
  },
  {
    id: "ledger",
    name: "Dr. Ledger",
    subject: "Accountancy",
    icon: <FaCalculator />,
    color: "from-yellow-400 to-amber-600",
    desc: "Journals, ledgers & the language of finance",
  },
  {
    id: "enterprise",
    name: "Prof. Enterprise",
    subject: "Business Studies",
    icon: <FaBriefcase />,
    color: "from-slate-400 to-gray-600",
    desc: "Management, marketing & entrepreneurship essentials",
  },
  {
    id: "computers",
    name: "Prof. Computers",
    subject: "Computers",
    icon: <FaDesktop />,
    color: "from-green-400 to-emerald-600",
    desc: "Hardware, software & the digital world explained",
  },
];

export default function MasterMentors({ onBack, onSelectMentor }) {
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  return (
    <div className="min-h-screen from-[#0f172a] via-[#111827] to-black text-white flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-5xl">
        <div className="mb-10 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition text-gray-400 hover:text-cyan-400"
          >
            <FaArrowLeft /> Back
          </button>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 text-transparent bg-clip-text text-center">
          🧠 AI Faculty
        </h1>
        <p className="text-gray-400 text-lg text-center mb-12">
          Choose your mentor. Learn through adaptive dialogue & earn XP.
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {MENTORS.map((m, i) => (
            <motion.div
              key={m.id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 0px 30px rgba(34,211,238,0.3)",
              }}
              onClick={() => onSelectMentor(m)}
              className="cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all"
            >
              <div className="text-3xl mb-3 flex justify-center text-cyan-400">
                {m.icon}
              </div>
              <h2 className="text-lg font-bold text-center">{m.name}</h2>
              <p className="text-cyan-400/90 text-sm text-center mb-2">({m.subject})</p>
              <p className="text-gray-400 text-xs text-center">{m.desc}</p>
            </motion.div>
          ))}
        </div>

        <p className="mt-12 text-gray-500 text-sm text-center">
          Each tutor adapts difficulty & divides topics into subtopics. +2 XP per correct answer.
        </p>
      </div>
    </div>
  );
}
