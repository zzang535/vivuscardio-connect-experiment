"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header";
import TrainingPrompt from "./TrainingPrompt";
import TrainingCycleCounter from "./TrainingCycleCounter";
import TrainingGauges from "./TrainingGauges";
import Manikin from "./Manikin";
import ManikinGuide from "./ManikinGuide";
import DebugModal from "./DebugModal";
import { LAYOUT_SETTINGS } from "@/lib/training-simulator/constants";

interface CompressionResult {
  timestamp: number;
  position: { x: number; y: number };
  maxDepth: number;
  rate: { interval: number; status?: string } | null;
  duration: number;
  positionCorrect: boolean;
  depthCorrect: boolean;
  rateCorrect: boolean;
  success: boolean;
}

interface VentilationResult {
  timestamp: number;
  volume: number;
  duration: number;
  volumeCorrect: boolean;
  success: boolean;
}

interface ScreenTrainingProps {
  trainingPhase: 'active' | 'loading';
  compressionResults: CompressionResult[];
  ventilationResults: VentilationResult[];
  clickPosition: { x: number; y: number };
  isPressed: boolean;
  depth: number;
  rateData: { interval: number; status?: string } | null;
  ventilationVolume: number;
  isVentilating: boolean;
  onPositionChange: (position: { x: number; y: number }) => void;
  onPressStateChange: (isPressed: boolean) => void;
  onDepthChange: (depth: number) => void;
  onRateChange: (rateData: { interval: number; status?: string } | null) => void;
  onCompressionComplete: (data: { position: { x: number; y: number }; maxDepth: number; rate: { interval: number; status?: string } | null; duration: number; timestamp: number }) => void;
  onVentilationVolumeChange: (volume: number) => void;
  onVentilationStateChange: (isVentilating: boolean) => void;
  onVentilationComplete: (data: { volume: number; duration: number; timestamp: number }) => void;
  onPracticeStop: () => void;
  onLoadingComplete: () => void;
  onBackToIntro: () => void;
}

export default function ScreenTraining({
  trainingPhase,
  compressionResults,
  ventilationResults,
  clickPosition,
  isPressed,
  depth,
  rateData,
  ventilationVolume,
  isVentilating,
  onPositionChange,
  onPressStateChange,
  onDepthChange,
  onRateChange,
  onCompressionComplete,
  onVentilationVolumeChange,
  onVentilationStateChange,
  onVentilationComplete,
  onPracticeStop,
  onLoadingComplete,
  onBackToIntro,
}: ScreenTrainingProps) {
  const showDebugUI = process.env.NEXT_PUBLIC_ENV === "development";
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
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

  // 로딩 진행률 관리
  useEffect(() => {
    if (trainingPhase === 'loading') {
      setLoadingProgress(0);
      const duration = 2000;
      const interval = 30;
      const steps = duration / interval;
      const increment = 100 / steps;

      let currentProgress = 0;
      const timer = setInterval(() => {
        currentProgress += increment;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(timer);
          setTimeout(() => {
            onLoadingComplete?.();
          }, 200);
        }
        setLoadingProgress(currentProgress);
      }, interval);

      return () => clearInterval(timer);
    }
  }, [trainingPhase, onLoadingComplete]);
  return (
    <div className="w-full h-full bg-gray-50 overflow-x-auto" style={{ minWidth: '1800px' }}>
      {/* 헤더 영역 - 60px */}
      <div style={{ height: '60px' }}>
        <Header
          mode="training"
          onPracticeStop={onPracticeStop}
          onBackToIntro={onBackToIntro}
        />
      </div>

      {/* 디버그 모달 토글 버튼 및 모달 - 개발 환경(NEXT_PUBLIC_ENV=development)에서만 노출 */}
      {showDebugUI && (
        <>
          <button
            onClick={() => setShowDebugModal(!showDebugModal)}
            className="fixed bottom-4 right-4 z-[1999] bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2"
            title="디버그 모달 열기"
          >
            <span>🐛</span>
            Debug
          </button>

          <DebugModal
            showModal={showDebugModal}
            onClose={() => setShowDebugModal(false)}
            compressionResults={compressionResults}
            ventilationResults={ventilationResults}
          />
        </>
      )}

      {/* 메인 컨텐츠 영역 - 나머지 높이 */}
      <div className="flex h-[calc(100vh-60px)]">
        {/* 좌측 CPR 인터페이스 영역 - 고정 1500px */}
        <motion.div
          className="w-[1366px] py-8 flex-shrink-0"
          initial={{ x: -50 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          {/* 피드백 스크린 컨텐츠 영역 */}
          <div className="w-full max-w-[1286px] mx-auto h-full">
            <AnimatePresence mode="wait">
              {/* 훈련 활성 상태 */}
              {trainingPhase === 'active' && (
                <div className="h-full flex flex-col justify-center">
                  <TrainingPrompt
                    lastCompressionResult={compressionResults[compressionResults.length - 1]}
                    lastVentilationResult={ventilationResults[ventilationResults.length - 1]}
                    isPressed={isPressed}
                    isVentilating={isVentilating}
                    trainingStarted={true}
                  />
                  <div className="mt-[30px]">
                    <TrainingCycleCounter
                      compressionResults={compressionResults}
                      ventilationResults={ventilationResults}
                    />
                    <div className="mt-[30px]">
                      <TrainingGauges
                        clickPosition={clickPosition}
                        isPressed={isPressed}
                        depth={depth}
                        rateData={rateData}
                        ventilationVolume={ventilationVolume}
                        isVentilating={isVentilating}
                        lastMaxDepth={compressionResults.length > 0 ? compressionResults[compressionResults.length - 1].maxDepth : null}
                        lastMaxVolume={ventilationResults.length > 0 ? ventilationResults[ventilationResults.length - 1].volume : null}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 로딩 상태 */}
              {trainingPhase === 'loading' && (
                <motion.div
                  key="training-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col items-center justify-center"
                >
                  <div className="text-center">
                    <h1 className="text-[48px] font-bold text-[#333333] mb-8">
                      Analyzing Results...
                    </h1>
                    <div className="w-[600px] h-[12px] bg-[#F5F5F5] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0052D4] via-[#0061F2] to-[#4A9EFF] rounded-full"
                        style={{
                          width: `${loadingProgress}%`,
                          transition: 'width 30ms linear'
                        }}
                      />
                    </div>
                    <div className="mt-6 text-[24px] font-bold text-[#666666]">
                      {Math.round(loadingProgress)}%
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* 우측 CPR 훈련 마네킹 영역 - 나머지 공간 */}
        <div className="flex-1 bg-white border-l border-gray-200 p-8 flex flex-col items-center justify-center">
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
                disabled={trainingPhase === 'loading'}
              />
            </motion.div>
            <ManikinGuide />
          </div>

          {/* 다시 하기 버튼 */}
          {/* <div className="mt-8">
            <button
              onClick={onReset}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
            >
              다시 하기
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
}
