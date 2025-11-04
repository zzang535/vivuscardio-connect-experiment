"use client";

import { motion } from "framer-motion";

export default function ScreenIntro({ onStart }) {
  return (
    <div className="min-h-screen bg-[#1F2937] flex flex-col items-center justify-center">
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-white text-6xl font-bold mb-16"
        >
          VCC CPR Training Experience
        </motion.h1>
        <motion.button
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="px-32 py-8 bg-[#0061F2] 
            hover:bg-[#0052D4] text-white text-4xl 
            font-bold rounded-[20px] transition-colors duration-200 
            shadow-2xl
          "
        >
          Start
        </motion.button>
      </div>
    </div>
  );
}
