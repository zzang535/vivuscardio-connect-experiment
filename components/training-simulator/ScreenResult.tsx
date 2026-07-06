"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "./Header";
import Manikin from "./Manikin";
import ManikinGuide from "./ManikinGuide";
import MetricCard from "./MetricCard";
import { LAYOUT_SETTINGS } from "@/lib/training-simulator/constants";
import { TrainingMetrics } from "@/lib/training-simulator/calculateMetrics";

interface ScreenResultProps {
  metrics: TrainingMetrics;
  onRestart: () => void;
  onBackToIntro: () => void;
}

export default function ScreenResult({
  metrics,
  onRestart,
  onBackToIntro,
}: ScreenResultProps) {
  const [manikinSize, setManikinSize] = useState<"large" | "medium">("medium");

  // 브라우저 width에 따라 마네킹 사이즈 결정
  useEffect(() => {
    const handleResize = () => {
      setManikinSize("medium");
    };

    // 초기 사이즈 설정
    handleResize();

    // 리사이즈 이벤트 리스너 등록
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    compressionDepth,
    compressionRate,
    handPosition,
    compressionCount,
    ventilationVolume,
    ventilationCount,
  } = metrics;

  return (
    <div className="w-full h-full bg-gray-50">
      {/* 헤더 영역 - 60px */}
      <div style={{ height: "60px" }}>
        <Header
          mode="result"
          onRestart={onRestart}
          onBackToIntro={onBackToIntro}
        />
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex h-[calc(100vh-60px)]">
        {/* 좌측 결과 영역 - 고정 1500px */}
        <motion.div className="w-[1366px] py-8 flex-shrink-0">
          <div className="w-full max-w-[1286px] mx-auto h-full flex flex-col justify-center">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <h1 className="text-[48px] font-bold text-[#333333]">
                Training Complete
              </h1>
            </motion.div>

            {/* Metrics Grid */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-[#999999] rounded-[50px] px-[45px] py-[40px]"
            >
              <h2 className="text-[28px] font-semibold text-[#333333] mb-[32px]">
                Performance Metrics
              </h2>

              {/* Row 1 */}
              <div className="grid grid-cols-3 gap-[40px] mb-[40px]">
                {/* Compression Depth */}
                <MetricCard
                  title="Compression Depth"
                  criteria={[
                    {
                      label: "Too Deep",
                      value: compressionDepth.tooDeep,
                      color: "#D9D9D9",
                    },
                    {
                      label: "Good",
                      value: compressionDepth.good,
                      color: "#0061F2",
                    },
                    {
                      label: "Too Shallow",
                      value: compressionDepth.tooShallow,
                      color: "#D9D9D9",
                    },
                  ]}
                />

                {/* Compression Rate */}
                <MetricCard
                  title="Compression Rate"
                  criteria={[
                    {
                      label: "Too Slow",
                      value: compressionRate.tooSlow,
                      color: "#D9D9D9",
                    },
                    {
                      label: "Good",
                      value: compressionRate.good,
                      color: "#0061F2",
                    },
                    {
                      label: "Too Fast",
                      value: compressionRate.tooFast,
                      color: "#D9D9D9",
                    },
                  ]}
                />

                {/* Hand Position */}
                <MetricCard
                  title="Hand Position"
                  criteria={[
                    {
                      label: "Incorrect (Abdomen)",
                      value: handPosition.incorrectAbdomen,
                      color: "#D9D9D9",
                    },
                    {
                      label: "Good",
                      value: handPosition.good,
                      color: "#0061F2",
                    },
                    {
                      label: "Incorrect (LR)",
                      value: handPosition.incorrectLR,
                      color: "#D9D9D9",
                    },
                  ]}
                />
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-3 gap-[40px]">
                {/* Compression Count */}
                <MetricCard
                  title="Compression Count"
                  criteria={[
                    {
                      label: "Too Few",
                      value: compressionCount.tooFew,
                      color: "#D9D9D9",
                    },
                    {
                      label: "Good",
                      value: compressionCount.good,
                      color: "#0061F2",
                    },
                    {
                      label: "Too Many",
                      value: compressionCount.tooMany,
                      color: "#D9D9D9",
                    },
                  ]}
                />

                {/* Ventilation Volume */}
                <MetricCard
                  title="Ventilation Volume"
                  criteria={[
                    {
                      label: "Too Little",
                      value: ventilationVolume.tooLittle,
                      color: "#D9D9D9",
                    },
                    {
                      label: "Good",
                      value: ventilationVolume.good,
                      color: "#0061F2",
                    },
                    {
                      label: "Too Much",
                      value: ventilationVolume.tooMuch,
                      color: "#D9D9D9",
                    },
                  ]}
                />

                {/* Ventilation Count */}
                <MetricCard
                  title="Ventilation Count"
                  criteria={[
                    {
                      label: "Too Few",
                      value: ventilationCount.tooFew,
                      color: "#D9D9D9",
                    },
                    {
                      label: "Good",
                      value: ventilationCount.good,
                      color: "#0061F2",
                    },
                    {
                      label: "Too Many",
                      value: ventilationCount.tooMany,
                      color: "#D9D9D9",
                    },
                  ]}
                />
              </div>
            </motion.div>

            {/* Large Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex gap-8"
            >
              <button
                onClick={onRestart}
                className="flex-1 py-8 bg-[#0061F2] text-white text-[24px] font-bold rounded-[30px] hover:bg-[#0052D4] transition-colors shadow-lg"
              >
                Try Again
              </button>
              <button
                onClick={() =>
                  window.open("https://www.innosonian.co.kr/", "_blank")
                }
                className="flex-1 py-8 bg-[#0061F2] text-white text-[24px] font-bold rounded-[30px] hover:bg-[#0052D4] transition-colors shadow-lg"
              >
                Learn More About VivusCardio Connect
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* 우측 마네킹 영역 - 나머지 공간 */}
        <div className="flex-1 bg-white border-l border-gray-200 p-8 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center">
            <motion.div
              layoutId="manikin-container"
              transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
            >
              <Manikin
                onPositionChange={() => {}}
                onPressStateChange={() => {}}
                onDepthChange={() => {}}
                onRateChange={() => {}}
                onCompressionComplete={() => {}}
                onVentilationVolumeChange={() => {}}
                onVentilationStateChange={() => {}}
                onVentilationComplete={() => {}}
                size={manikinSize}
              />
            </motion.div>
            <ManikinGuide />
          </div>
        </div>
      </div>
    </div>
  );
}
