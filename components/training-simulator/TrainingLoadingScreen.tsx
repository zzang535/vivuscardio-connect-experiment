"use client";

import { useEffect, useState } from "react";

interface TrainingLoadingScreenProps {
  onLoadingComplete: () => void;
}

export default function TrainingLoadingScreen({ onLoadingComplete }: TrainingLoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 2초 동안 0 → 100%로 진행
    const duration = 2000; // 2초
    const interval = 30; // 30ms마다 업데이트
    const steps = duration / interval;
    const increment = 100 / steps;

    let currentProgress = 0;

    const timer = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(timer);
        // 100% 도달 후 콜백 호출
        setTimeout(() => {
          onLoadingComplete?.();
        }, 200);
      }
      setProgress(currentProgress);
    }, interval);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-center">
        {/* 로딩 타이틀 */}
        <h1 className="text-[48px] font-bold text-[#333333] mb-8">
          Analyzing Results...
        </h1>

        {/* 프로그레스 바 */}
        <div className="w-[600px] h-[12px] bg-[#F5F5F5] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#0061F2] to-[#56ED89] rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 퍼센트 표시 */}
        <div className="mt-6 text-[24px] font-medium text-[#666666]">
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
}

