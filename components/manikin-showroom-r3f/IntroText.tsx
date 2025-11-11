"use client";

import { useEffect, useState } from "react";

interface IntroTextProps {
  isActive: boolean;
}

export default function IntroText({ isActive }: IntroTextProps) {
  const [opacity, setOpacity] = useState(0);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setOpacity(0);
      setShowText(false);
      return;
    }

    // 1초 후 텍스트 표시 시작
    const showTimer = setTimeout(() => {
      setShowText(true);
    }, 1000);

    // 1.5초 후 페이드인
    const fadeInTimer = setTimeout(() => {
      setOpacity(1);
    }, 1500);

    // 4초 후 페이드아웃
    const fadeOutTimer = setTimeout(() => {
      setOpacity(0);
    }, 4000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeInTimer);
      clearTimeout(fadeOutTimer);
    };
  }, [isActive]);

  if (!showText) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        color: "#ffffff",
        zIndex: 100,
        opacity,
        transition: "opacity 1s ease-in-out",
        pointerEvents: "none",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: 300,
          letterSpacing: "0.1em",
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        우리는 생명을 다루는
        <br />
        기술을 만듭니다.
      </h1>
    </div>
  );
}
