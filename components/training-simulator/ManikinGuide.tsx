"use client";

import { motion } from "framer-motion";

export default function ManikinGuide() {
  return (
    <motion.div
      layoutId="manikin-guide"
      transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="mt-6 text-sm text-gray-500 space-y-2 max-w-md text-center"
    >
      <p>Click the red point (heart) to simulate CPR compression.</p>
      <p>Click the blue point (head) to simulate ventilation.</p>
    </motion.div>
  );
}

