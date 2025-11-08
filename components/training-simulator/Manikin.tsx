"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { DEPTH_SETTINGS, VENTILATION_SETTINGS, TIME_SETTINGS, POSITION_SETTINGS, RATE_SETTINGS } from "@/lib/training-simulator/constants";

// 커스텀 pulse 애니메이션 스타일 (심장 박동 주기: 분당 72회 = 0.833초)
const pulseAnimation = `
  @keyframes pulse-heartbeat {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.15);
    }
  }
  .animate-pulse-heartbeat {
    animation: pulse-heartbeat 0.833s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`;

interface ManikinProps {
  onPositionChange: (position: { x: number; y: number }) => void;
  onPressStateChange: (isPressed: boolean) => void;
  onDepthChange: (depth: number) => void;
  onRateChange: (rateData: { interval: number; status?: string } | null) => void;
  onCompressionComplete: (data: { position: { x: number; y: number }; maxDepth: number; rate: { interval: number; status?: string } | null; duration: number; timestamp: number }) => void;
  onVentilationVolumeChange: (volume: number) => void;
  onVentilationStateChange: (isVentilating: boolean) => void;
  onVentilationComplete: (data: { volume: number; duration: number; timestamp: number }) => void;
  size?: "large" | "medium" | "small";
  disabled?: boolean;
}

export default function Manikin({
  onPositionChange,
  onPressStateChange,
  onDepthChange,
  onRateChange,
  onCompressionComplete,
  onVentilationVolumeChange,
  onVentilationStateChange,
  onVentilationComplete,
  size = "medium",
  disabled = false
}: ManikinProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [depth, setDepth] = useState(0);
  const [pressStartTime, setPressStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [compressionHistory, setCompressionHistory] = useState<number[]>([]);
  const [currentPosition, setCurrentPosition] = useState({ x: 50, y: 40 });
  const [maxDepthReached, setMaxDepthReached] = useState(0);
  const [currentRateData, setCurrentRateData] = useState<{ interval: number; status?: string } | null>(null);

  // Ventilation 관련 상태
  const [isVentilating, setIsVentilating] = useState(false);
  const [ventilationVolume, setVentilationVolume] = useState(0);
  const [ventilationStartTime, setVentilationStartTime] = useState<number | null>(null);
  const [maxVolumeReached, setMaxVolumeReached] = useState(0);

  const bodyRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const depthIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeUpdateRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ventilationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const heartPosition = POSITION_SETTINGS.HEART_POSITION;

  // Size configurations
  const SIZE_CONFIG = {
    large: { width: 540, height: 810 },
    medium: { width: 440, height: 660 },
    small: { width: 280, height: 420 },
  };

  const { width, height } = SIZE_CONFIG[size as keyof typeof SIZE_CONFIG];

  // Rate 계산 함수
  const calculateRate = (newCompressionTime: number) => {
    const updatedHistory = [...compressionHistory, newCompressionTime];

    if (updatedHistory.length > RATE_SETTINGS.MAX_COMPRESSION_HISTORY) {
      updatedHistory.shift();
    }

    let newRateData = null;

    if (updatedHistory.length >= 2) {
      const lastTwoCompressions = updatedHistory.slice(-2);
      const interval = (lastTwoCompressions[1] - lastTwoCompressions[0]) / 1000;

      console.log(`Compression interval: ${interval.toFixed(3)}s`);

      let rateStatus = 'optimal';
      if (interval < RATE_SETTINGS.TOO_FAST_THRESHOLD) {
        rateStatus = 'too_fast';
      } else if (interval > RATE_SETTINGS.TOO_SLOW_THRESHOLD) {
        rateStatus = 'too_slow';
      }

      newRateData = {
        interval: interval,
        status: rateStatus
      };

      onRateChange && onRateChange(newRateData);
    } else {
      onRateChange && onRateChange(null);
    }

    setCompressionHistory(updatedHistory);
    return newRateData;
  };

  // Ventilation 처리
  const handleVentilationMouseDown = (e: React.MouseEvent) => {
    if (disabled) return; // 비활성화 상태에서는 클릭 무시
    if (!headRef.current) return;

    console.log('Ventilation started');

    setIsVentilating(true);
    onVentilationStateChange && onVentilationStateChange(true);
    setVentilationStartTime(Date.now());
    setMaxVolumeReached(0);

    ventilationIntervalRef.current = setInterval(() => {
      setVentilationVolume(prev => {
        const newVolume = Math.min(prev + VENTILATION_SETTINGS.VOLUME_INCREMENT_RATE, VENTILATION_SETTINGS.MAX_VOLUME_PERCENT);
        setMaxVolumeReached(prevMax => Math.max(prevMax, newVolume));
        return newVolume;
      });
    }, VENTILATION_SETTINGS.VOLUME_UPDATE_INTERVAL);
  };

  const handleVentilationMouseUp = () => {
    if (!isVentilating || !ventilationStartTime) return;

    const ventilationTime = Date.now() - ventilationStartTime;
    const finalVolume = ventilationVolume;
    const ventilationEndTime = Date.now();

    console.log(`Ventilation completed - Duration: ${ventilationTime}ms, Max Volume: ${finalVolume}%`);

    if (onVentilationComplete) {
      onVentilationComplete({
        volume: maxVolumeReached,
        duration: ventilationTime,
        timestamp: ventilationEndTime
      });
    }

    setIsVentilating(false);
    onVentilationStateChange && onVentilationStateChange(false);
    setVentilationVolume(0);
    onVentilationVolumeChange && onVentilationVolumeChange(0);
    setVentilationStartTime(null);

    if (ventilationIntervalRef.current) {
      clearInterval(ventilationIntervalRef.current);
      ventilationIntervalRef.current = null;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return; // 비활성화 상태에서는 클릭 무시
    if (!bodyRef.current) return;

    const rect = bodyRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    onPositionChange({ x: clickX, y: clickY });
    setCurrentPosition({ x: clickX, y: clickY });

    const distanceX = Math.abs(clickX - heartPosition.x);
    const distanceY = Math.abs(clickY - heartPosition.y);
    const totalDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    console.log(`Position offset from heart: ${totalDistance.toFixed(2)}% (X: ${distanceX.toFixed(2)}%, Y: ${distanceY.toFixed(2)}%)`);

    setIsPressed(true);
    onPressStateChange(true);
    setPressStartTime(Date.now());
    setMaxDepthReached(0);

    depthIntervalRef.current = setInterval(() => {
      setDepth(prev => {
        const newDepth = Math.min(prev + DEPTH_SETTINGS.DEPTH_INCREMENT_RATE, DEPTH_SETTINGS.MAX_DEPTH_PERCENT);
        setMaxDepthReached(prevMax => Math.max(prevMax, newDepth));
        return newDepth;
      });
    }, DEPTH_SETTINGS.DEPTH_UPDATE_INTERVAL);

    timeUpdateRef.current = setInterval(() => {
      setCurrentTime(Date.now());
    }, TIME_SETTINGS.TIME_UPDATE_INTERVAL);
  };

  const handleMouseUp = () => {
    if (!isPressed || !pressStartTime) return;

    const pressTime = Date.now() - pressStartTime;
    const finalDepth = depth;
    const compressionEndTime = Date.now();

    console.log(`Compression completed - Duration: ${pressTime}ms, Max Depth: ${finalDepth}%`);

    const newRateData = calculateRate(compressionEndTime);

    if (onCompressionComplete) {
      onCompressionComplete({
        position: currentPosition,
        maxDepth: maxDepthReached,
        rate: newRateData,
        duration: pressTime,
        timestamp: compressionEndTime
      });
    }

    setIsPressed(false);
    onPressStateChange(false);
    setDepth(0);
    onDepthChange(0);
    setPressStartTime(null);

    if (depthIntervalRef.current) {
      clearInterval(depthIntervalRef.current);
      depthIntervalRef.current = null;
    }

    if (timeUpdateRef.current) {
      clearInterval(timeUpdateRef.current);
      timeUpdateRef.current = null;
    }
  };

  // depth 변경 시 콜백 호출
  useEffect(() => {
    onDepthChange(depth);
  }, [depth, onDepthChange]);

  // ventilationVolume 변경 시 콜백 호출
  useEffect(() => {
    onVentilationVolumeChange && onVentilationVolumeChange(ventilationVolume);
  }, [ventilationVolume, onVentilationVolumeChange]);

  // 클린업
  useEffect(() => {
    return () => {
      if (depthIntervalRef.current) {
        clearInterval(depthIntervalRef.current);
      }
      if (timeUpdateRef.current) {
        clearInterval(timeUpdateRef.current);
      }
      if (ventilationIntervalRef.current) {
        clearInterval(ventilationIntervalRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* 커스텀 애니메이션 스타일 주입 */}
      <style>{pulseAnimation}</style>

      {/* 마네킹 이미지 컨테이너 */}
      <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
        <Image
          src="/manikin-showroom/manikin-transparent.png"
          alt="CPR 마네킹"
          width={width}
          height={height}
          className="object-contain"
          priority
        />

        {/* 환기 위치 표시 (파란 점 - 입) */}
        <div
          ref={headRef}
          className={`absolute w-20 h-20 transition-all duration-100 flex items-center justify-center rounded-lg ${
            disabled 
              ? 'cursor-not-allowed opacity-50' 
              : `cursor-pointer ${isVentilating ? 'bg-blue-200/30' : 'hover:bg-blue-100/20'}`
          }`}
          style={{
            left: '50%',
            top: '30%',
            transform: 'translate(-50%, -50%)'
          }}
          onMouseDown={handleVentilationMouseDown}
          onMouseUp={handleVentilationMouseUp}
          onMouseLeave={handleVentilationMouseUp}
        >
          <div className="w-4 h-4 relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-pulse-heartbeat"></div>
          </div>
        </div>

        {/* 심장 위치 표시 (빨간 점 - 가슴 정중앙) */}
        <div
          ref={bodyRef}
          className={`absolute w-28 h-28 transition-all duration-100 rounded-lg ${
            disabled
              ? 'cursor-not-allowed opacity-50'
              : `cursor-pointer ${isPressed ? 'bg-red-200/30' : 'hover:bg-red-100/20'}`
          }`}
          style={{
            left: '50%',
            top: '67%',
            transform: 'translate(-50%, -50%)'
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* 심장 위치 표시점 */}
          <div
            className="absolute w-5 h-5 relative"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse-heartbeat"></div>
          </div>
        </div>
      </div>
    </>
  );
}
