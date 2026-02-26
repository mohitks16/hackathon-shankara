import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import {
    FaClipboardList,
    FaCompass,
    FaHistory,
    FaMapSigns,
    FaHandsHelping,
    FaArrowLeft,
    FaScroll,
} from "react-icons/fa";
import CarrerCounsellor from "./CarrerCounsellor";
import DestinyDesigner from "./DestinyDesigner";
import ExamPlanner from "./ExamPlanner";
import PastGrowth from "../PastGrowth";

export default function GrowthBlueprint() {
    const heroRef = useRef();
    const navigate = useNavigate();
    const [activeApp, setActiveApp] = useState(null);
    const [destinyCareer, setDestinyCareer] = useState("");

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
            icon: <FaClipboardList />,
            title: "Exam Master Plan",
            desc: "Create comprehensive strategies and schedules for your upcoming exams.",
            action: () => setActiveApp("examMaster"),
        },
        {
            icon: <FaCompass />,
            title: "Career Navigator",
            desc: "Find your path, get expert advice, and figure out your ideal career journey.",
            action: () => setActiveApp("careerNav"),
        },
        {
            icon: <FaHistory />,
            title: "Past Plans & Roadmaps",
            desc: "Revisit your old exam strategies and career roadmaps.",
            action: () => setActiveApp("pastPlans"),
        },
    ];

    const careerCards = [
        {
            icon: <FaMapSigns />,
            title: "Destiny Designer",
            desc: "Creating roadmap and expert advice for your specific goal.",
            action: () => setActiveApp("destiny"),
        },
        {
            icon: <FaHandsHelping />,
            title: "Career Counsellor",
            desc: "Are you totally confused? Let's figure it out together.",
            action: () => setActiveApp("counsellor"),
        },
    ];

    const pastPlansCards = [
        {
            icon: <FaScroll />,
            title: "Saved Exam Plans",
            desc: "Review your active and past exam schedules.",
            action: () => setActiveApp("pastExamPlans"),
        },
        {
            icon: <FaHistory />,
            title: "Saved Career Roadmaps",
            desc: "Revisit your previous Destiny Designer roadmaps.",
            action: () => setActiveApp("pastRoadmaps"),
        },
    ];

    // ── Active sub-apps ──
    if (activeApp === "destiny") {
        return <DestinyDesigner onBack={() => setActiveApp("careerNav")} prefillCareer={destinyCareer} />;
    }

    if (activeApp === "counsellor") {
        return <CarrerCounsellor
            onBack={() => setActiveApp("careerNav")}
            onRedirectToDestiny={(careerTitle) => {
                setDestinyCareer(careerTitle || "");
                setActiveApp("destiny");
            }}
        />;
    }

    if (activeApp === "examMaster") {
        return <ExamPlanner onBack={() => setActiveApp(null)} />;
    }

    if (activeApp === "pastExamPlans" || activeApp === "pastRoadmaps") {
        return <PastGrowth onBack={() => setActiveApp(null)} initialTab={activeApp === "pastRoadmaps" ? "roadmaps" : "plans"} />;
    }

    let cards = mainCards;
    let subtitle = "Strategize. Plan. Achieve.";
    let showBack = false;
    let onBack = () => { };

    if (activeApp === "careerNav") {
        cards = careerCards;
        subtitle = "Chart your future course with expert guidance.";
        showBack = true;
        onBack = () => setActiveApp(null);
    } else if (activeApp === "pastPlans") {
        cards = pastPlansCards;
        subtitle = "Your previous blueprints and roadmaps.";
        showBack = true;
        onBack = () => setActiveApp(null);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-black text-white flex items-center justify-center px-6">
            <div className="w-full max-w-6xl text-center">

                {/* HERO */}
                <div ref={heroRef} className="max-w-4xl mx-auto text-center mb-16 relative z-10">
                    <button
                        onClick={() => navigate("/")}
                        className="absolute -top-6 -left-4 md:-left-12 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors border border-white/10 bg-white/5 px-4 py-2 rounded-full cursor-pointer"
                    >
                        <FaArrowLeft /> Back to Home
                    </button>
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-medium text-sm mb-6">
                        <FaMapSigns className="text-lg" />
                        <span>Your Future, Mapped</span>
                    </div>    <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 text-transparent bg-clip-text">
                        GROWTH BLUEPRINT
                    </h1>
                    <p className="text-gray-400 mt-4 text-lg">
                        {subtitle}
                    </p>
                </div>

                {/* BACK button */}
                <AnimatePresence>
                    {showBack && (
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onClick={onBack}
                            className="mb-8 inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                            <FaArrowLeft /> Back
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* CARD GRID */}
                <div
                    className={`grid gap-8 ${showBack
                        ? "md:grid-cols-2 max-w-3xl mx-auto"
                        : "md:grid-cols-1 lg:grid-cols-3 max-w-5xl mx-auto"
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
