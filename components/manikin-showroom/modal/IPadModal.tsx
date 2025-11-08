"use client";

import { useEffect, useState } from "react";
import TrainingFeedbackPanel from "@/components/training-simulator/TrainingFeedbackPanel";
import TrainingManikinPanel from "@/components/training-simulator/TrainingManikinPanel";

interface CompressionData {
  position: { x: number; y: number };
  maxDepth: number;
  rate: { interval: number; status?: string } | null;
  duration: number;
  timestamp: number;
}

interface VentilationData {
  volume: number;
  duration: number;
  timestamp: number;
}

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

interface IPadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IPadModal({ isOpen, onClose }: IPadModalProps) {
  // 훈련 상태
  const [clickPosition, setClickPosition] = useState({ x: 50, y: 40 });
  const [isPressed, setIsPressed] = useState(false);
  const [depth, setDepth] = useState(0);
  const [rateData, setRateData] = useState<{ interval: number; status?: string } | null>(null);
  const [compressionResults, setCompressionResults] = useState<CompressionResult[]>([]);
  const [ventilationResults, setVentilationResults] = useState<VentilationResult[]>([]);
  const [ventilationVolume, setVentilationVolume] = useState(0);
  const [isVentilating, setIsVentilating] = useState(false);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setClickPosition({ x: 50, y: 40 });
      setIsPressed(false);
      setDepth(0);
      setRateData(null);
      setCompressionResults([]);
      setVentilationResults([]);
      setVentilationVolume(0);
      setIsVentilating(false);
    }
  }, [isOpen]);

  // 압박 완료 핸들러
  const handleCompressionComplete = (compressionData: CompressionData) => {
    // 간단한 평가 (실제 평가 로직은 생략)
    const result: CompressionResult = {
      timestamp: compressionData.timestamp,
      position: compressionData.position,
      maxDepth: compressionData.maxDepth,
      rate: compressionData.rate,
      duration: compressionData.duration,
      positionCorrect: true,
      depthCorrect: true,
      rateCorrect: true,
      success: true,
    };

    setCompressionResults(prev => [...prev, result]);
  };

  // 환기 완료 핸들러
  const handleVentilationComplete = (ventilationData: VentilationData) => {
    const result: VentilationResult = {
      timestamp: ventilationData.timestamp,
      volume: ventilationData.volume,
      duration: ventilationData.duration,
      volumeCorrect: true,
      success: true,
    };

    setVentilationResults(prev => [...prev, result]);
  };

  // 각 모달 크기 계산
  const [leftModalSize, setLeftModalSize] = useState({ width: 1200, height: 900 });
  const [rightModalSize, setRightModalSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const calculateModalSize = () => {
      const viewportHeight = window.innerHeight;

      // 왼쪽 모달: 가로 1200px, 1.44:1 비율
      const leftWidth = 1200;
      const leftHeight = leftWidth / 1.6; // 약 833px

      // 오른쪽 모달: 화면 높이의 90%에 맞춤
      const rightHeight = viewportHeight * 0.9;
      const rightWidth = viewportHeight * 0.42;

      setLeftModalSize({ width: leftWidth, height: leftHeight });
      setRightModalSize({ width: rightWidth, height: rightHeight });
    };

    if (isOpen) {
      calculateModalSize();
      window.addEventListener("resize", calculateModalSize);
      return () => window.removeEventListener("resize", calculateModalSize);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center gap-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.2)",
      }}
      onClick={onClose}
    >
      {/* 왼쪽 모달: 훈련 피드백 (태블릿 프레임) */}
      <div
        className="relative"
        style={{
          width: `${leftModalSize.width}px`,
          height: `${leftModalSize.height}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 태블릿 프레임 배경 이미지 */}
        <img
          src="/manikin-showroom/samsung-galaxy-tab-s7-medium.png"
          alt="Tablet Frame"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
          style={{
            userSelect: 'none',
          }}
        />

        {/* 태블릿 화면 영역 (프레임 안쪽) */}
        <div
          className="absolute bg-gray-50 overflow-hidden"
          style={{
            // 태블릿 프레임의 베젤을 고려한 화면 영역
            // 실제 화면 영역은 프레임보다 약간 작음
            top: '2.5%',
            left: '2.2%',
            right: '2.2%',
            bottom: '2.5%',
            borderRadius: '12px',
          }}
        >
          <TrainingFeedbackPanel
            compressionResults={compressionResults}
            ventilationResults={ventilationResults}
            clickPosition={clickPosition}
            isPressed={isPressed}
            depth={depth}
            rateData={rateData}
            ventilationVolume={ventilationVolume}
            isVentilating={isVentilating}
          />
        </div>
      </div>

      {/* 오른쪽 모달: 마네킹 */}
      <div
        className="relative bg-white rounded-lg shadow-2xl overflow-hidden"
        style={{
          width: `${rightModalSize.width}px`,
          height: `${rightModalSize.height}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[10001] w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <TrainingManikinPanel
          onPositionChange={setClickPosition}
          onPressStateChange={setIsPressed}
          onDepthChange={setDepth}
          onRateChange={setRateData}
          onCompressionComplete={handleCompressionComplete}
          onVentilationVolumeChange={setVentilationVolume}
          onVentilationStateChange={setIsVentilating}
          onVentilationComplete={handleVentilationComplete}
          disabled={false}
        />
      </div>
    </div>
  );
}
