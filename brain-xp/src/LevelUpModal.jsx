import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const confettiColors = [
    "#ffd700", "#ff6b6b", "#48dbfb", "#ff9ff3", "#54a0ff",
    "#5f27cd", "#01a3a4", "#f368e0", "#ee5a24", "#0abde3",
];

function ConfettiPiece({ index }) {
    const color = confettiColors[index % confettiColors.length];
    const left = `${Math.random() * 100}%`;
    const delay = Math.random() * 0.8;
    const duration = 1.5 + Math.random() * 1.5;
    const size = 6 + Math.random() * 8;
    const rotation = Math.random() * 360;

    return (
        <motion.div
            initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
            animate={{
                y: "100vh",
                x: [0, (Math.random() - 0.5) * 200],
                opacity: [1, 1, 0],
                rotate: rotation + 720,
            }}
            transition={{ duration, delay, ease: "easeIn" }}
            style={{
                position: "absolute",
                top: 0,
                left,
                width: size,
                height: size * 0.6,
                background: color,
                borderRadius: 2,
                zIndex: 60,
            }}
        />
    );
}

export default function LevelUpModal({ show, levelUpData, onDismiss }) {
    if (!show || !levelUpData) return null;

    const { oldLevel, newLevel, oldBracket, newBracket, bracketIcon, rewards } = levelUpData;
    const bracketChanged = oldBracket !== newBracket;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.85)" }}
                >
                    {/* Confetti */}
                    {Array.from({ length: 40 }).map((_, i) => (
                        <ConfettiPiece key={i} index={i} />
                    ))}

                    <motion.div
                        initial={{ scale: 0.3, opacity: 0, y: 60 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="relative z-[101] text-center px-6"
                    >
                        {/* Glow ring */}
                        <motion.div
                            animate={{
                                boxShadow: [
                                    "0 0 40px rgba(6,182,212,0.3)",
                                    "0 0 80px rgba(6,182,212,0.6)",
                                    "0 0 40px rgba(6,182,212,0.3)",
                                ],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="bg-gradient-to-br from-[#0f172a]/90 to-[#1e293b]/90 backdrop-blur-2xl border border-cyan-400/30 rounded-3xl p-10 max-w-md mx-auto"
                        >
                            {/* Big icon */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                className="text-7xl mb-4"
                            >
                                {bracketIcon}
                            </motion.div>

                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-3xl md:text-4xl font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 text-transparent bg-clip-text mb-2"
                            >
                                LEVEL UP!
                            </motion.h2>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.55 }}
                                className="flex items-center justify-center gap-4 my-6"
                            >
                                <div className="text-center">
                                    <div className="text-4xl font-black text-gray-400">{oldLevel}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">{oldBracket}</div>
                                </div>
                                <motion.div
                                    animate={{ x: [0, 8, 0] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="text-2xl text-cyan-400"
                                >
                                    →
                                </motion.div>
                                <div className="text-center">
                                    <motion.div
                                        animate={{ scale: [1, 1.15, 1] }}
                                        transition={{ duration: 1.2, repeat: Infinity }}
                                        className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
                                    >
                                        {newLevel}
                                    </motion.div>
                                    <div className="text-xs text-cyan-400 uppercase tracking-wider font-bold">{newBracket}</div>
                                </div>
                            </motion.div>

                            {bracketChanged && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                    className="text-sm text-amber-400 font-semibold mb-4"
                                >
                                    🎉 New Bracket: {newBracket}!
                                </motion.p>
                            )}

                            {/* Rewards */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="flex justify-center gap-6 my-6"
                            >
                                <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl px-5 py-3 text-center">
                                    <div className="text-lg font-bold text-amber-400">+{rewards.bonusXP}</div>
                                    <div className="text-xs text-amber-300">Bonus XP</div>
                                </div>
                                <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl px-5 py-3 text-center">
                                    <div className="text-lg font-bold text-yellow-400">+{rewards.bonusCoins}</div>
                                    <div className="text-xs text-yellow-300">Bonus Coins</div>
                                </div>
                            </motion.div>

                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                onClick={onDismiss}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white shadow-lg shadow-cyan-500/30 text-lg"
                            >
                                Continue
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
