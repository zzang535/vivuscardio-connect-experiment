"use client";

import { motion } from "framer-motion";
import Header from "./Header";
import Manikin from "./Manikin";
import ManikinStatus from "./ManikinStatus";
import ManikinGuide from "./ManikinGuide";

interface ScreenPreviewProps {
  isPressed: boolean;
  isVentilating: boolean;
  depth: number;
  ventilationVolume: number;
  onPositionChange: (position: { x: number; y: number }) => void;
  onPressStateChange: (isPressed: boolean) => void;
  onDepthChange: (depth: number) => void;
  onVentilationVolumeChange: (volume: number) => void;
  onVentilationStateChange: (isVentilating: boolean) => void;
  onStartTraining: () => void;
  onBackToIntro: () => void;
}

export default function ScreenPreview({
  isPressed,
  isVentilating,
  depth,
  ventilationVolume,
  onPositionChange,
  onPressStateChange,
  onDepthChange,
  onVentilationVolumeChange,
  onVentilationStateChange,
  onStartTraining,
  onBackToIntro
}: ScreenPreviewProps) {
  return (
    <div className="w-full h-full bg-[#F5F5F5]">
      <div style={{ height: '60px' }}>
        <Header mode="default" />
      </div>
      <div className="flex-1 flex items-center justify-center px-12 py-8" style={{ height: 'calc(100vh - 60px)' }}>
        {/* 마네킹과 컨트롤러를 하나의 그룹으로 중앙 정렬 */}
        <div className="flex items-center gap-8">
        {/* 마네킹과 가이드 */}
        <motion.div
          initial={{ x: -10 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <motion.div
            layoutId="manikin-container"
            transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
          >
            <Manikin
              onPositionChange={onPositionChange}
              onPressStateChange={onPressStateChange}
              onDepthChange={onDepthChange}
              onRateChange={() => {}}
              onCompressionComplete={() => {}}
              onVentilationVolumeChange={onVentilationVolumeChange}
              onVentilationStateChange={onVentilationStateChange}
              onVentilationComplete={() => {}}
              size="large"
            />
          </motion.div>
          <ManikinGuide />
        </motion.div>

        {/* 상태 정보와 버튼 */}
        <motion.div
          className="w-[380px] flex flex-col gap-8"
        >
          {/* 상태 정보 */}
          <ManikinStatus
            isPressed={isPressed}
            isVentilating={isVentilating}
            depth={depth}
            ventilationVolume={ventilationVolume}
          />

          {/* 버튼 그룹 */}
          <div className="flex flex-col gap-4">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStartTraining}
              className="w-full px-8 py-6 bg-[#0061F2] hover:bg-[#0052D4] text-white text-2xl font-bold rounded-[20px] transition-colors duration-200 shadow-xl"
            >
              Start Training
            </motion.button>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onBackToIntro}
              className="w-full px-8 py-6 bg-gray-500 hover:bg-gray-600 text-white text-2xl font-bold rounded-[20px] transition-colors duration-200 shadow-lg"
            >
              Back to Start
            </motion.button>
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  );
}
