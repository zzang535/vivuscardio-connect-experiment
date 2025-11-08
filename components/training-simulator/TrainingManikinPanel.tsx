"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Manikin from "./Manikin";
import ManikinGuide from "./ManikinGuide";
import { LAYOUT_SETTINGS } from "@/lib/training-simulator/constants";

interface TrainingManikinPanelProps {
  onPositionChange: (position: { x: number; y: number }) => void;
  onPressStateChange: (isPressed: boolean) => void;
  onDepthChange: (depth: number) => void;
  onRateChange: (rateData: { interval: number; status?: string } | null) => void;
  onCompressionComplete: (data: { position: { x: number; y: number }; maxDepth: number; rate: { interval: number; status?: string } | null; duration: number; timestamp: number }) => void;
  onVentilationVolumeChange: (volume: number) => void;
  onVentilationStateChange: (isVentilating: boolean) => void;
  onVentilationComplete: (data: { volume: number; duration: number; timestamp: number }) => void;
  disabled?: boolean;
}

export default function TrainingManikinPanel({
  onPositionChange,
  onPressStateChange,
  onDepthChange,
  onRateChange,
  onCompressionComplete,
  onVentilationVolumeChange,
  onVentilationStateChange,
  onVentilationComplete,
  disabled = false,
}: TrainingManikinPanelProps) {
  const [manikinSize, setManikinSize] = useState<"large" | "medium" | "small">("medium");

  // 브라우저 width에 따라 마네킹 사이즈 결정
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setManikinSize(width <= LAYOUT_SETTINGS.MANIKIN_SIZE_BREAKPOINT ? "small" : "medium");
    };

    // 초기 사이즈 설정
    handleResize();

    // 리사이즈 이벤트 리스너 등록
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center">
        <motion.div
          layoutId="manikin-container"
          transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          <Manikin
            onPositionChange={onPositionChange}
            onPressStateChange={onPressStateChange}
            onDepthChange={onDepthChange}
            onRateChange={onRateChange}
            onCompressionComplete={onCompressionComplete}
            onVentilationVolumeChange={onVentilationVolumeChange}
            onVentilationStateChange={onVentilationStateChange}
            onVentilationComplete={onVentilationComplete}
            size={manikinSize}
            disabled={disabled}
          />
        </motion.div>
        <ManikinGuide />
      </div>
    </div>
  );
}
