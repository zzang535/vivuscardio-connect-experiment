"use client";

import { useEffect, useState } from "react";
import TrainingFeedbackPanel from "./TrainingFeedbackPanel";
import TrainingManikinPanel from "./TrainingManikinPanel";
import { POSITION_SETTINGS, DEPTH_SETTINGS, RATE_SETTINGS, VENTILATION_SETTINGS } from "@/lib/training-simulator/constants";
import { calculateMetrics, TrainingMetrics } from "@/lib/training-simulator/calculateMetrics";

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

  // 훈련 단계 및 결과 상태
  const [trainingPhase, setTrainingPhase] = useState<'training' | 'result'>('training');
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics | null>(null);

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
      setTrainingPhase('training');
      setTrainingMetrics(null);
    }
  }, [isOpen]);

  // 훈련 완료 조건 체크 (압박 30회, 환기 2회)
  useEffect(() => {
    if (isOpen && trainingPhase === 'training' && compressionResults.length >= 30 && ventilationResults.length >= 2) {
      console.log('Training complete! Compressions:', compressionResults.length, 'Ventilations:', ventilationResults.length);

      const metrics = calculateMetrics(compressionResults, ventilationResults);
      setTrainingMetrics(metrics);
      setTrainingPhase('result');
    }
  }, [compressionResults, ventilationResults, isOpen, trainingPhase]);

  // 재시작 핸들러
  const handleRestart = () => {
    setClickPosition({ x: 50, y: 40 });
    setIsPressed(false);
    setDepth(0);
    setRateData(null);
    setCompressionResults([]);
    setVentilationResults([]);
    setVentilationVolume(0);
    setIsVentilating(false);
    setTrainingPhase('training');
    setTrainingMetrics(null);
    console.log('Restarting training from result screen');
  };

  // 압박 평가 함수
  const evaluateCompression = (position: { x: number; y: number }, maxDepth: number, rate: { interval: number; status?: string } | null) => {
    const heartPos = POSITION_SETTINGS.HEART_POSITION;
    const distance = Math.sqrt(
      Math.pow(position.x - heartPos.x, 2) + Math.pow(position.y - heartPos.y, 2)
    );
    const positionPass = distance <= POSITION_SETTINGS.POSITION_TOLERANCE;

    const depthPass = maxDepth >= DEPTH_SETTINGS.MIN_OPTIMAL_DEPTH &&
                      maxDepth <= DEPTH_SETTINGS.MAX_OPTIMAL_DEPTH;

    const ratePass = !rate ||
                     (rate.interval >= RATE_SETTINGS.TOO_FAST_THRESHOLD &&
                      rate.interval <= RATE_SETTINGS.TOO_SLOW_THRESHOLD);

    return {
      position: positionPass,
      depth: depthPass,
      rate: ratePass,
      overall: positionPass && depthPass && ratePass
    };
  };

  // 압박 완료 핸들러
  const handleCompressionComplete = (compressionData: CompressionData) => {
    const evaluation = evaluateCompression(
      compressionData.position,
      compressionData.maxDepth,
      compressionData.rate
    );

    const result: CompressionResult = {
      timestamp: compressionData.timestamp,
      position: compressionData.position,
      maxDepth: compressionData.maxDepth,
      rate: compressionData.rate,
      duration: compressionData.duration,
      positionCorrect: evaluation.position,
      depthCorrect: evaluation.depth,
      rateCorrect: evaluation.rate,
      success: evaluation.overall,
    };

    setCompressionResults(prev => [...prev, result]);
  };

  // 환기 완료 핸들러
  const handleVentilationComplete = (ventilationData: VentilationData) => {
    const volumePass = ventilationData.volume >= VENTILATION_SETTINGS.MIN_OPTIMAL_VOLUME &&
                      ventilationData.volume <= VENTILATION_SETTINGS.MAX_OPTIMAL_VOLUME;

    const result: VentilationResult = {
      timestamp: ventilationData.timestamp,
      volume: ventilationData.volume,
      duration: ventilationData.duration,
      volumeCorrect: volumePass,
      success: volumePass,
    };

    setVentilationResults(prev => [...prev, result]);
  };

  // 각 모달 크기 계산
  const [leftModalSize, setLeftModalSize] = useState({ width: 1200, height: 900 });
  const [rightModalSize, setRightModalSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const calculateModalSize = () => {
      const viewportHeight = window.innerHeight;
      const leftWidth = 1200;
      const leftHeight = leftWidth / 1.6;
      const rightHeight = 700;
      const rightWidth = 350;
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
        <img
          src="/manikin-showroom/samsung-galaxy-tab-s7-medium.png"
          alt="Tablet Frame"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
          style={{
            userSelect: 'none',
          }}
        />
        <div
          className="absolute bg-gray-50 overflow-hidden"
          style={{
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
        className="relative rounded-lg overflow-hidden"
        style={{
          width: `${rightModalSize.width}px`,
          height: `${rightModalSize.height}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-0 right-0 z-[10001] flex items-center justify-center gap-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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
          <span>닫기</span>
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
          disabled={trainingPhase === 'result'}
        />
      </div>
    </div>
  );
}
