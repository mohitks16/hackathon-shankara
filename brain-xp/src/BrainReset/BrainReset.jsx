import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import {
    FaBell,
    FaExclamationTriangle,
    FaBolt,
    FaArrowLeft,
    FaBrain,
} from "react-icons/fa";
import RevisionNotifications from "./RevisionNotifications";
import MistakeBuckets from "./MistakeBuckets";
import BiteSizedLearning from "./BiteSizedLearning";

export default function BrainReset() {
    const heroRef = useRef();
    const navigate = useNavigate();
    const [activeFeature, setActiveFeature] = useState(null);

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

    const features = [
        {
            icon: <FaBell />,
            title: "Revision Reminders",
            desc: "Beat the forgetting curve. Get notified to revisit topics at 1, 5, 14, and 30 day intervals.",
            color: "text-amber-400",
            bg: "bg-amber-500/20",
            border: "border-amber-400/30",
            action: () => setActiveFeature("notifications"),
        },
        {
            icon: <FaExclamationTriangle />,
            title: "Smart Mistake Buckets",
            desc: "Your wrong answers from Challenges categorized: Silly, Time Pressure, Weak Concept, Overthinking, Guessing.",
            color: "text-red-400",
            bg: "bg-red-500/20",
            border: "border-red-400/30",
            action: () => setActiveFeature("mistakes"),
        },
        {
            icon: <FaBolt />,
            title: "Bite-Sized Learning",
            desc: "Turn your weak subtopics into strengths with flashcards and quizzes.",
            color: "text-cyan-400",
            bg: "bg-cyan-500/20",
            border: "border-cyan-400/30",
            action: () => setActiveFeature("bitesized"),
        },
    ];

    // Sub-feature routing
    if (activeFeature === "notifications") {
        return <RevisionNotifications onBack={() => setActiveFeature(null)} />;
    }
    if (activeFeature === "mistakes") {
        return <MistakeBuckets onBack={() => setActiveFeature(null)} />;
    }
    if (activeFeature === "bitesized") {
        return <BiteSizedLearning onBack={() => setActiveFeature(null)} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-black text-white flex items-center justify-center px-6">
            <div className="w-full max-w-6xl text-center">
                {/* Hero */}
                <div ref={heroRef} className="max-w-4xl mx-auto text-center mb-16 relative z-10">
                    <button
                        onClick={() => navigate("/")}
                        className="absolute -top-6 -left-4 md:-left-12 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors border border-white/10 bg-white/5 px-4 py-2 rounded-full cursor-pointer"
                    >
                        <FaArrowLeft /> Back to Home
                    </button>
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium text-sm mb-6">
                        <FaBrain className="text-lg" />
                        <span>Smart Revision System</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-rose-400 via-pink-500 to-purple-500 text-transparent bg-clip-text">
                        BRAIN RESET
                    </h1>
                    <p className="text-gray-400 mt-4 text-lg">
                        Fight forgetting. Fix mistakes. Get stronger.
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {features.map((feat, i) => (
                        <motion.div
                            key={feat.title}
                            custom={i}
                            initial="hidden"
                            animate="visible"
                            variants={cardVariants}
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0px 0px 30px rgba(244,63,94,0.3)",
                            }}
                            onClick={feat.action}
                            className="cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-all text-left"
                        >
                            <div className={`text-4xl mb-4 ${feat.color}`}>
                                {feat.icon}
                            </div>
                            <h2 className="text-xl font-bold mb-2">{feat.title}</h2>
                            <p className="text-gray-400 text-sm">{feat.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-16 text-gray-500 text-sm">
                    Powered by AI • Smart Revision • Beat the Forgetting Curve
                </div>
            </div>
        </div>
    );
}
