"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TrainingPrompt from "@/components/training-simulator/TrainingPrompt";
import TrainingCycleCounter from "@/components/training-simulator/TrainingCycleCounter";
import TrainingGauges from "@/components/training-simulator/TrainingGauges";

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

interface TrainingFeedbackPanelProps {
  compressionResults: CompressionResult[];
  ventilationResults: VentilationResult[];
  clickPosition: { x: number; y: number };
  isPressed: boolean;
  depth: number;
  rateData: { interval: number; status?: string } | null;
  ventilationVolume: number;
  isVentilating: boolean;
}

export default function TrainingFeedbackPanel({
  compressionResults,
  ventilationResults,
  clickPosition,
  isPressed,
  depth,
  rateData,
  ventilationVolume,
  isVentilating,
}: TrainingFeedbackPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // TrainingGauges의 기본 너비는 약 1286px
        const contentWidth = 1286;
        const newScale = Math.min(containerWidth / contentWidth, 0.8);
        setScale(newScale);
      }
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-gray-50 flex items-center justify-center p-8 overflow-hidden">
      <div
        className="h-full flex flex-col justify-center"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          width: '1286px',
        }}
      >
        <AnimatePresence mode="wait">
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
        </AnimatePresence>
      </div>
    </div>
  );
}