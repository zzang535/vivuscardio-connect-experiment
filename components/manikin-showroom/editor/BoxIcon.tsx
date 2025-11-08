"use client";

interface BoxIconProps {
  size?: number;
  color?: string;
}

export default function BoxIcon({ size = 40, color = "#cccccc" }: BoxIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 아이소메트릭 박스 - 3개 면 */}

      {/* 윗면 */}
      <path
        d="M 50 20 L 80 35 L 50 50 L 20 35 Z"
        fill={color}
        stroke="#ffffff"
        strokeWidth="2"
        opacity="1"
      />

      {/* 왼쪽 면 */}
      <path
        d="M 20 35 L 20 65 L 50 80 L 50 50 Z"
        fill={color}
        stroke="#ffffff"
        strokeWidth="2"
        opacity="0.7"
      />

      {/* 오른쪽 면 */}
      <path
        d="M 50 50 L 50 80 L 80 65 L 80 35 Z"
        fill={color}
        stroke="#ffffff"
        strokeWidth="2"
        opacity="0.85"
      />
    </svg>
  );
}
