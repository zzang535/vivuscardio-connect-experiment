"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 카운트다운 배열 (3, 2, 1만 표시) - 컴포넌트 외부에 선언
const COUNTDOWN_SEQUENCE = [4, 3, 2, 1];

export default function TrainingPrompt({
  lastCompressionResult,
  lastVentilationResult,
  isPressed,
  isVentilating,
  trainingStarted
}) {
  // 카운트다운 상태
  const [countdownIndex, setCountdownIndex] = useState(0);
  const [showCountdown, setShowCountdown] = useState(true);

  // 메시지 상태
  const [currentMessage, setCurrentMessage] = useState(null);
  const [messageKey, setMessageKey] = useState(0);

  // Hands Off Time 상태
  const [handsOffTime, setHandsOffTime] = useState(0);
  const [showHandsOff, setShowHandsOff] = useState(false);
  const handsOffTimerRef = useRef(null);
  const lastActionTimeRef = useRef(Date.now());

  // 카운트다운 로직 (3, 2, 1, Start)
  useEffect(() => {
    if (!trainingStarted) return;

    const countdownTimer = setInterval(() => {
      setCountdownIndex((prev) => {
        const nextIndex = prev + 1;

        // 배열의 끝에 도달하면 카운트다운 종료
        if (nextIndex >= COUNTDOWN_SEQUENCE.length) {
          clearInterval(countdownTimer);
          setShowCountdown(false);
          // Start를 currentMessage로 설정
          setCurrentMessage({
            title: "Start",
            color: "#333333"
          });
          setMessageKey(Date.now());
          // 마지막 액션 시간 초기화
          lastActionTimeRef.current = Date.now();
          return prev;
        }

        return nextIndex;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [trainingStarted]);

  // Hands Off Time 타이머
  useEffect(() => {
    // 액션이 있으면 타이머 리셋
    if (isPressed || isVentilating) {
      lastActionTimeRef.current = Date.now();
      setHandsOffTime(0);
      setShowHandsOff(false);

      if (handsOffTimerRef.current) {
        clearInterval(handsOffTimerRef.current);
        handsOffTimerRef.current = null;
      }
      return;
    }

    // 카운트다운 중이거나 훈련 시작 전이면 타이머 시작 안함
    if (showCountdown || !trainingStarted) {
      return;
    }

    // Hands Off 타이머 시작
    handsOffTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActionTimeRef.current) / 1000);

      if (elapsed >= 2) {
        setHandsOffTime(elapsed - 1); // 2초부터 시작하되 1초로 표시
        setShowHandsOff(true);
        // Hands Off Time 표시 시 currentMessage를 null로 설정
        setCurrentMessage(null);
      }
    }, 100);

    return () => {
      if (handsOffTimerRef.current) {
        clearInterval(handsOffTimerRef.current);
        handsOffTimerRef.current = null;
      }
    };
  }, [isPressed, isVentilating, showCountdown, trainingStarted]);

  // Compression 피드백
  useEffect(() => {
    if (!lastCompressionResult) return;
    if (showCountdown) return; // 카운트다운 중에는 피드백 표시 안함

    console.log('New compression result:', lastCompressionResult);

    const { positionCorrect, depthCorrect, rateCorrect, success, maxDepth, rate } = lastCompressionResult;

    let message = {
      title: "",
      color: "#333333"
    };

    // 우선순위: position > depth > rate
    if (success) {
      // 3가지 모두 통과
      message.title = "Good";
    } else if (!positionCorrect) {
      // Position 실패
      message.title = "Check Position";
    } else if (!depthCorrect) {
      // Depth 실패
      if (maxDepth < 33) {
        message.title = "Deeper";
      } else if (maxDepth > 67) {
        message.title = "Shallower";
      } else {
        message.title = "Deeper";
      }
    } else if (!rateCorrect) {
      // Rate 실패
      if (rate && rate.interval) {
        if (rate.interval < 0.4) {
          message.title = "Slower";
        } else if (rate.interval > 0.8) {
          message.title = "Faster";
        } else {
          message.title = "Slower";
        }
      }
    }

    console.log('Feedback message:', message);

    // 1단계: 이전 메시지를 회색으로 변경
    if (currentMessage) {
      setCurrentMessage({ ...currentMessage, color: "#999999" });
    }

    // 2단계: 150ms 후 회색 메시지 삭제 및 새 메시지 설정
    setTimeout(() => {
      setCurrentMessage(message);
      setMessageKey(Date.now());
      setShowHandsOff(false); // 액션 판정이 나오면 Hands Off 숨김
    }, 150);

    // 마지막 액션 시간 업데이트
    lastActionTimeRef.current = Date.now();
  }, [lastCompressionResult, showCountdown]);

  // Ventilation 피드백
  useEffect(() => {
    if (!lastVentilationResult) return;
    if (showCountdown) return; // 카운트다운 중에는 피드백 표시 안함

    console.log('New ventilation result:', lastVentilationResult);

    const { volumeCorrect, success, volume } = lastVentilationResult;

    let message = {
      title: "",
      color: "#333333"
    };

    if (success) {
      message.title = "Good";
    } else if (!volumeCorrect) {
      if (volume < 33) {
        message.title = "Deeper";
      } else if (volume > 67) {
        message.title = "Shallower";
      } else {
        message.title = "Deeper";
      }
    }

    console.log('Ventilation feedback message:', message);

    // 1단계: 이전 메시지를 회색으로 변경
    if (currentMessage) {
      setCurrentMessage({ ...currentMessage, color: "#999999" });
    }

    // 2단계: 150ms 후 회색 메시지 삭제 및 새 메시지 설정
    setTimeout(() => {
      setCurrentMessage(message);
      setMessageKey(Date.now());
      setShowHandsOff(false); // 액션 판정이 나오면 Hands Off 숨김
    }, 150);

    // 마지막 액션 시간 업데이트
    lastActionTimeRef.current = Date.now();
  }, [lastVentilationResult, showCountdown]);

  return (
    <div
      className="flex flex-col items-center justify-center px-8 py-16 rounded-[60px] bg-gradient-to-br from-white to-gray-100"
      style={{
        backgroundImage: "radial-gradient(ellipse 643px 202px at center, rgba(255,255,255,1) 0%, rgba(245,245,245,1) 100%)"
      }}
    >
      <div className="text-center min-h-[120px] flex items-center justify-center">
        {/* 카운트다운 표시 (3, 2, 1) */}
        {showCountdown && countdownIndex !== 0 && countdownIndex < COUNTDOWN_SEQUENCE.length && (
          <motion.div
            key={countdownIndex}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-[120px] font-bold text-[#333333] leading-none">
              {COUNTDOWN_SEQUENCE[countdownIndex]}
            </h1>
          </motion.div>
        )}

        {/* 카운트다운 종료 후 메시지 표시 */}
        {!showCountdown && (
          <div className="relative w-full">
            {/* Hands Off Time 표시 */}
            {showHandsOff && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-[80px] font-bold text-[#333333] leading-none tracking-[-1px]">
                  Hands Off Time: {handsOffTime}s
                </h1>
              </motion.div>
            )}

            {/* 현재 메시지 */}
            {!showHandsOff && currentMessage && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={messageKey}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.15,
                    ease: "easeOut"
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <h1
                    className="text-[80px] font-bold leading-none tracking-[-1px] whitespace-nowrap"
                    style={{ color: currentMessage.color }}
                  >
                    {currentMessage.title}
                  </h1>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
