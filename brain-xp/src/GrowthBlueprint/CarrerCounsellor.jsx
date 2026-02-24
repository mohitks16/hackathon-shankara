import React from "react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaHandsHelping } from "react-icons/fa";

export default function CarrerCounsellor({ onBack }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-black text-white flex items-center justify-center px-6">
            <div className="w-full max-w-2xl text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl"
                >
                    <div className="text-6xl text-cyan-400 mb-6 flex justify-center">
                        <FaHandsHelping />
                    </div>
                    <h2 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text mb-4">
                        Career Counsellor
                    </h2>
                    <p className="text-gray-400 text-lg mb-8">
                        Are you totally confused? Let's figure it out together. (Feature Coming Soon)
                    </p>

                    <button
                        onClick={onBack}
                        className="px-6 py-3 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition flex items-center gap-2 mx-auto"
                    >
                        <FaArrowLeft /> Back to Career Navigator
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
