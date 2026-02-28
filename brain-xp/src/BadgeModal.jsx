import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * BadgeModal — Congratulation screen when a new badge is earned.
 * Props: badge (object with category, tier, badge, categoryLabel, categoryEmoji, value), onClose
 */
export default function BadgeModal({ badge, onClose }) {
    const confettiRef = useRef(null);

    useEffect(() => {
        if (!badge) return;
        // Auto-dismiss after 6 seconds
        const timer = setTimeout(onClose, 6000);
        return () => clearTimeout(timer);
    }, [badge]);

    if (!badge) return null;

    const CATEGORY_COLORS = {
        practice: { gradient: "from-amber-500 to-orange-600", glow: "rgba(245,158,11,0.5)" },
        streak: { gradient: "from-red-500 to-rose-600", glow: "rgba(239,68,68,0.5)" },
        learning: { gradient: "from-purple-500 to-violet-600", glow: "rgba(139,92,246,0.5)" },
        accuracy: { gradient: "from-emerald-500 to-green-600", glow: "rgba(16,185,129,0.5)" },
    };

    const colors = CATEGORY_COLORS[badge.category] || CATEGORY_COLORS.practice;

    // Generate confetti particles
    const confetti = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1.5 + Math.random() * 2,
        color: ["#f59e0b", "#ef4444", "#8b5cf6", "#10b981", "#3b82f6", "#ec4899"][Math.floor(Math.random() * 6)],
        rotation: Math.random() * 360,
        size: 6 + Math.random() * 8,
    }));

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md"
                onClick={onClose}
            >
                {/* Confetti */}
                {confetti.map((c) => (
                    <motion.div
                        key={c.id}
                        initial={{ x: `${c.x}vw`, y: -20, rotate: 0, opacity: 1 }}
                        animate={{
                            y: "110vh",
                            rotate: c.rotation + 360,
                            opacity: [1, 1, 0.5, 0],
                        }}
                        transition={{
                            duration: c.duration,
                            delay: c.delay,
                            ease: "easeIn",
                        }}
                        className="fixed top-0 pointer-events-none"
                        style={{
                            width: c.size,
                            height: c.size,
                            backgroundColor: c.color,
                            borderRadius: c.size > 10 ? "50%" : "2px",
                        }}
                    />
                ))}

                {/* Modal Card */}
                <motion.div
                    initial={{ scale: 0.3, opacity: 0, y: 60 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.3, opacity: 0, y: 60 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl"
                    style={{ boxShadow: `0 0 80px ${colors.glow}` }}
                >
                    {/* Badge icon — large pulsing */}
                    <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-7xl mb-4"
                    >
                        {badge.badge.icon}
                    </motion.div>

                    {/* Badge category label */}
                    <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                        {badge.categoryEmoji} {badge.categoryLabel}
                    </div>

                    {/* NEW BADGE! */}
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-2"
                    >
                        🏅 New Badge Earned!
                    </motion.h2>

                    {/* Badge name */}
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className={`text-3xl font-extrabold bg-gradient-to-r ${colors.gradient} text-transparent bg-clip-text mb-2`}
                    >
                        {badge.badge.name}
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-gray-400 text-sm mb-4"
                    >
                        {badge.badge.desc}
                    </motion.p>

                    {/* Tier indicator */}
                    <div className="flex justify-center gap-1 mb-6">
                        {Array.from({ length: 10 }, (_, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-full ${i <= badge.tier
                                        ? `bg-gradient-to-r ${colors.gradient}`
                                        : "bg-white/10"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Dismiss */}
                    <button
                        onClick={onClose}
                        className={`px-8 py-2.5 rounded-xl bg-gradient-to-r ${colors.gradient} text-white font-bold text-sm transition hover:opacity-90`}
                    >
                        Awesome!
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
