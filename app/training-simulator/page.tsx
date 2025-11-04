"use client";

import { useState, useEffect } from "react";
import { POSITION_SETTINGS, DEPTH_SETTINGS, RATE_SETTINGS, VENTILATION_SETTINGS } from "@/lib/training-simulator/constants";
import { calculateMetrics, TrainingMetrics } from "@/lib/training-simulator/calculateMetrics";
import ScreenIntro from "@/components/training-simulator/ScreenIntro";
import ScreenPreview from "@/components/training-simulator/ScreenPreview";
import ScreenTraining from "@/components/training-simulator/ScreenTraining";
import ScreenResult from "@/components/training-simulator/ScreenResult";

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

export default function TrainingPage() {
  // 화면 전환 상태: 'intro' -> 'preview' -> 'training' -> 'result'
  const [screenState, setScreenState] = useState('intro');

  // 훈련 단계: 'active' -> 'loading'
  const [trainingPhase, setTrainingPhase] = useState<'active' | 'loading'>('active');

  // 결과 데이터
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics | null>(null);

  // 마네킹 컨트롤러와 피드백 게이지 간 상태 공유
  const [clickPosition, setClickPosition] = useState({ x: 50, y: 40 }); // 기본값: 중앙(심장위치)
  const [isPressed, setIsPressed] = useState(false);
  const [depth, setDepth] = useState(0); // 압박 깊이 (0-100%)
  const [rateData, setRateData] = useState<{ interval: number; status?: string } | null>(null); // Rate 정보 (간격, 상태)
  const [compressionResults, setCompressionResults] = useState<CompressionResult[]>([]); // 압박 결과 배열

  // Ventilation 관련 상태
  const [ventilationResults, setVentilationResults] = useState<VentilationResult[]>([]); // 환기 결과 배열
  const [ventilationVolume, setVentilationVolume] = useState(0); // 환기 볼륨 (0-100%)
  const [isVentilating, setIsVentilating] = useState(false); // 환기 중 상태

  // 압박 평가 함수
  const evaluateCompression = (position: { x: number; y: number }, maxDepth: number, rate: { interval: number; status?: string } | null) => {
    // Position 평가: 심장 위치로부터의 거리
    const heartPos = POSITION_SETTINGS.HEART_POSITION;
    const distance = Math.sqrt(
      Math.pow(position.x - heartPos.x, 2) + Math.pow(position.y - heartPos.y, 2)
    );
    const positionPass = distance <= POSITION_SETTINGS.POSITION_TOLERANCE;

    // Depth 평가: 적정 깊이 범위
    const depthPass = maxDepth >= DEPTH_SETTINGS.MIN_OPTIMAL_DEPTH &&
                      maxDepth <= DEPTH_SETTINGS.MAX_OPTIMAL_DEPTH;

    // Rate 평가: 적정 간격 범위 (두 번째 압박부터 평가 가능)
    // TOO_FAST ~ TOO_SLOW 범위 내면 합격 (0.4s ~ 0.8s)
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

  // 압박 완료 시 결과 저장
  const handleCompressionComplete = (compressionData: CompressionData) => {
    const evaluation = evaluateCompression(
      compressionData.position,
      compressionData.maxDepth,
      compressionData.rate
    );

    const result = {
      // DebugModal이 기대하는 flat 구조로 저장
      timestamp: compressionData.timestamp,
      position: compressionData.position,
      maxDepth: compressionData.maxDepth,
      rate: compressionData.rate,
      duration: compressionData.duration,
      positionCorrect: evaluation.position,
      depthCorrect: evaluation.depth,
      rateCorrect: evaluation.rate,
      success: evaluation.overall
    };

    setCompressionResults(prev => [...prev, result]);
    console.log('Compression evaluation:', evaluation, 'Position:', compressionData.position, 'MaxDepth:', compressionData.maxDepth);
  };

  // 환기 완료 시 결과 저장
  const handleVentilationComplete = (ventilationData: VentilationData) => {
    // 간단한 환기 평가 (볼륨 기준)
    const volumePass = ventilationData.volume >= VENTILATION_SETTINGS.MIN_OPTIMAL_VOLUME &&
                      ventilationData.volume <= VENTILATION_SETTINGS.MAX_OPTIMAL_VOLUME;

    const result = {
      // DebugModal이 기대하는 flat 구조로 저장
      timestamp: ventilationData.timestamp,
      volume: ventilationData.volume,
      duration: ventilationData.duration,
      volumeCorrect: volumePass,
      success: volumePass
    };

    setVentilationResults(prev => [...prev, result]);
    console.log('Ventilation evaluation - Volume:', ventilationData.volume, 'Pass:', volumePass);
  };

  // 훈련 완료 조건 체크: 30회 압박 + 2회 환기
  useEffect(() => {
    if (screenState === 'training' && trainingPhase === 'active' && compressionResults.length >= 30 && ventilationResults.length >= 2) {
      console.log('Training complete! Compressions:', compressionResults.length, 'Ventilations:', ventilationResults.length);

      // 결과 데이터 계산
      const metrics = calculateMetrics(compressionResults, ventilationResults);
      setTrainingMetrics(metrics);

      // 2초 딜레이 후 로딩 단계로 전환
      const delayTimer = setTimeout(() => {
        setTrainingPhase('loading');
      }, 700);

      return () => clearTimeout(delayTimer);
    }
  }, [compressionResults, ventilationResults, screenState, trainingPhase]);

  // Practice Stop 버튼 클릭 시 바로 preview로 이동
  const handlePracticeStop = () => {
    // 모든 상태 초기화
    setClickPosition({ x: 50, y: 40 });
    setIsPressed(false);
    setDepth(0);
    setRateData(null);
    setCompressionResults([]);
    setVentilationResults([]);
    setVentilationVolume(0);
    setIsVentilating(false);
    setTrainingPhase('active');
    setTrainingMetrics(null);
    setScreenState('preview');
    console.log('Training stopped by user and moved to preview');
  };

  // 결과 화면에서 시작 화면으로 이동
  const handleBackToIntro = () => {
    setClickPosition({ x: 50, y: 40 });
    setIsPressed(false);
    setDepth(0);
    setRateData(null);
    setCompressionResults([]);
    setVentilationResults([]);
    setVentilationVolume(0);
    setIsVentilating(false);
    setTrainingPhase('active');
    setTrainingMetrics(null);
    setScreenState('intro');
    console.log('Returning to intro from result screen');
  };

  // 훈련 시작 시 게이지 초기화
  const handleStartTraining = () => {
    // 게이지 상태만 초기화 (결과는 유지하지 않음)
    setClickPosition({ x: 50, y: 40 });
    setIsPressed(false);
    setDepth(0);
    setRateData(null);
    setVentilationVolume(0);
    setIsVentilating(false);
    setCompressionResults([]);
    setVentilationResults([]);
    setScreenState('training');
    setTrainingPhase('active'); // 훈련 단계 초기화
    console.log('Training started - all gauges reset');
  };

  // 훈련 초기화 및 프리뷰 화면으로 이동
  const handleReset = () => {
    setClickPosition({ x: 50, y: 40 });
    setIsPressed(false);
    setDepth(0);
    setRateData(null);
    setCompressionResults([]);
    setVentilationResults([]);
    setVentilationVolume(0);
    setIsVentilating(false);
    setTrainingPhase('active');
    setTrainingMetrics(null);
    setScreenState('preview');
    console.log('Training data reset and moved to preview');
  };

  // 로딩 완료 후 결과 화면으로 전환
  const handleLoadingComplete = () => {
    setScreenState('result');
    console.log('Loading complete - showing result screen');
  };

  // 결과 화면에서 재시작
  const handleRestart = () => {
    setClickPosition({ x: 50, y: 40 });
    setIsPressed(false);
    setDepth(0);
    setRateData(null);
    setCompressionResults([]);
    setVentilationResults([]);
    setVentilationVolume(0);
    setIsVentilating(false);
    setTrainingMetrics(null);
    setTrainingPhase('active');
    setScreenState('preview');
    console.log('Restarting training from result screen');
  };

  // 1. 시작 화면 렌더링
  if (screenState === 'intro') {
    return <ScreenIntro onStart={() => setScreenState('preview')} />;
  }

  // 2. 마네킹 미리보기 화면 렌더링
  if (screenState === 'preview') {
    return (
      <ScreenPreview
        isPressed={isPressed}
        isVentilating={isVentilating}
        depth={depth}
        ventilationVolume={ventilationVolume}
        onPositionChange={setClickPosition}
        onPressStateChange={setIsPressed}
        onDepthChange={setDepth}
        onVentilationVolumeChange={setVentilationVolume}
        onVentilationStateChange={setIsVentilating}
        onStartTraining={handleStartTraining}
        onBackToIntro={() => setScreenState('intro')}
      />
    );
  }

  // 3. 훈련 화면 렌더링 (active, loading)
  if (screenState === 'training') {
    return (
      <ScreenTraining
        trainingPhase={trainingPhase}
        compressionResults={compressionResults}
        ventilationResults={ventilationResults}
        clickPosition={clickPosition}
        isPressed={isPressed}
        depth={depth}
        rateData={rateData}
        ventilationVolume={ventilationVolume}
        isVentilating={isVentilating}
        onPositionChange={setClickPosition}
        onPressStateChange={setIsPressed}
        onDepthChange={setDepth}
        onRateChange={setRateData}
        onCompressionComplete={handleCompressionComplete}
        onVentilationVolumeChange={setVentilationVolume}
        onVentilationStateChange={setIsVentilating}
        onVentilationComplete={handleVentilationComplete}
        onPracticeStop={handlePracticeStop}
        onLoadingComplete={handleLoadingComplete}
        onBackToIntro={handleBackToIntro}
      />
    );
  }

  // 4. 결과 화면 렌더링
  if (screenState === 'result') {
    if (!trainingMetrics) {
      return null;
    }
    return (
      <ScreenResult
        metrics={trainingMetrics}
        onRestart={handleRestart}
        onBackToIntro={handleBackToIntro}
      />
    );
  }

  // Fallback
  return null;
}
