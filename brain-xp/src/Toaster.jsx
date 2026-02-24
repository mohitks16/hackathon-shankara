import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Toaster({ message, show, onClose, type = "success", duration }) {
  useEffect(() => {
    if (show) {
      const ms = duration ?? 2500;
      const t = setTimeout(onClose, ms);
      return () => clearTimeout(t);
    }
  }, [show, onClose, duration]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -30, x: "-50%" }}
          className={`fixed top-6 left-1/2 z-[60] px-6 py-3 rounded-xl shadow-xl border-2 ${
            type === "success"
              ? "bg-emerald-600/95 border-emerald-400 text-white"
              : "bg-red-600/95 border-red-400 text-white"
          }`}
        >
          <p className="font-semibold text-lg">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
