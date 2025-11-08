"use client";

interface ManikinIconProps {
  size?: number;
  color?: string;
}

export default function ManikinIcon({ size = 24, color = "#ffffff" }: ManikinIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
      aria-hidden="true"
      fill="none"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="24" cy="14" r="6.5" />
      <path d="M10 35c0-7 6-12 14-12s14 5 14 12" />
    </svg>
  );
}
