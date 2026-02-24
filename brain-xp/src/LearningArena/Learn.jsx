import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import {
    FaBookOpen,
    FaFlask,
    FaBrain,
    FaHistory,
    FaScroll,
    FaProjectDiagram,
    FaArrowLeft,
} from "react-icons/fa";
import Storyverse from "./Storyverse";
import BrainBoard from "./BrainBoard";
import AppliedKnowledge from "./AppliedKnowledge";

export default function Learn() {
    const heroRef = useRef();
    const navigate = useNavigate();
    const [showPastLearnings, setShowPastLearnings] = useState(false);
    const [activeApp, setActiveApp] = useState(null); // "storyverse" | "brainboard" | null

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
            transition: { delay: i * 0.15, duration: 0.6 },
        }),
    };

    const mainCards = [
        {
            icon: <FaBookOpen />,
            title: "StoryVerse",
            desc: "Learn concepts through immersive stories.",
            action: () => setActiveApp("storyverse"),
        },
        {
            icon: <FaFlask />,
            title: "Applied Knowledge",
            desc: "Explore how Physics, Chemistry, Maths & Biology work beyond the textbook.",
            action: () => setActiveApp("applied"),
        },
        {
            icon: <FaBrain />,
            title: "BrainBoard",
            desc: "Create mind maps & flash cards to supercharge memory.",
            action: () => setActiveApp("brainboard"),
        },
        {
            icon: <FaHistory />,
            title: "Past Learnings",
            desc: "Revisit your previous learning journeys.",
            action: () => setShowPastLearnings(true),
        },
    ];

    const pastLearningCards = [
        {
            icon: <FaScroll />,
            title: "Past StoryVerse Learning",
            desc: "Revisit stories you've explored earlier.",
        },
        {
            icon: <FaProjectDiagram />,
            title: "Past BrainBoards",
            desc: "Review your saved mind maps & flash cards.",
        },
    ];

    // ── Active sub-apps ──
    if (activeApp === "storyverse") {
        return <Storyverse onBack={() => setActiveApp(null)} />;
    }

    if (activeApp === "brainboard") {
        return (
            <BrainBoard
                onBack={() => setActiveApp(null)}
                onNavigateToChallenge={() => navigate("/QuizApp")}
            />
        );
    }

    if (activeApp === "applied") {
        return <AppliedKnowledge onBack={() => setActiveApp(null)} />;
    }

    const cards = showPastLearnings ? pastLearningCards : mainCards;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-black text-white flex items-center justify-center px-6">
            <div className="w-full max-w-6xl text-center">

                {/* HERO */}
                <div ref={heroRef} className="mb-16">
                    <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 text-transparent bg-clip-text">
                        LEARNING ARENA
                    </h1>
                    <p className="text-gray-400 mt-4 text-lg">
                        {showPastLearnings ? "Your previous learning sessions await." : "Explore. Understand. Master."}
                    </p>
                </div>

                {/* BACK (past learnings) */}
                <AnimatePresence>
                    {showPastLearnings && (
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onClick={() => setShowPastLearnings(false)}
                            className="mb-8 inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                            <FaArrowLeft /> Back to Learning Arena
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* CARD GRID */}
                <div
                    className={`grid gap-8 ${showPastLearnings
                        ? "md:grid-cols-2 max-w-3xl mx-auto"
                        : "md:grid-cols-2 lg:grid-cols-4"
                        }`}
                >
                    {cards.map((card, i) => (
                        <motion.div
                            key={card.title}
                            custom={i}
                            initial="hidden"
                            animate="visible"
                            variants={cardVariants}
                            whileHover={{ scale: 1.05, boxShadow: "0px 0px 30px rgba(34,211,238,0.4)" }}
                            onClick={card.action ?? undefined}
                            className="cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all"
                        >
                            <div className="text-4xl text-cyan-400 mb-4 flex justify-center">{card.icon}</div>
                            <h2 className="text-xl font-bold mb-2">{card.title}</h2>
                            <p className="text-gray-400 text-sm">{card.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* FOOTER */}
                <div className="mt-16 text-gray-500 text-sm">
                    Powered by AI • Gamified Learning • Future Ready
                </div>
            </div>
        </div>
    );
}
