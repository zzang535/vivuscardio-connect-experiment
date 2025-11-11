interface CoordinateIconProps {
  size?: number;
  color?: string;
}

export default function CoordinateIcon({ size = 24, color = "#ffffff" }: CoordinateIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 격자 (Grid) */}
      <line x1="3" y1="3" x2="3" y2="21" stroke={color} strokeWidth="1" opacity="0.4" />
      <line x1="7" y1="3" x2="7" y2="21" stroke={color} strokeWidth="1" opacity="0.4" />
      <line x1="11" y1="3" x2="11" y2="21" stroke={color} strokeWidth="1" opacity="0.4" />
      <line x1="15" y1="3" x2="15" y2="21" stroke={color} strokeWidth="1" opacity="0.4" />
      <line x1="19" y1="3" x2="19" y2="21" stroke={color} strokeWidth="1" opacity="0.4" />
      <line x1="21" y1="3" x2="21" y2="21" stroke={color} strokeWidth="1" opacity="0.4" />

      <line x1="3" y1="3" x2="21" y2="3" stroke={color} strokeWidth="1" opacity="0.4" />
      <line x1="3" y1="7" x2="21" y2="7" stroke={color} strokeWidth="1" opacity="0.4" />
      <line x1="3" y1="11" x2="21" y2="11" stroke={color} strokeWidth="1" opacity="0.4" />
      <line x1="3" y1="15" x2="21" y2="15" stroke={color} strokeWidth="1" opacity="0.4" />
      <line x1="3" y1="19" x2="21" y2="19" stroke={color} strokeWidth="1" opacity="0.4" />
      <line x1="3" y1="21" x2="21" y2="21" stroke={color} strokeWidth="1" opacity="0.4" />

      {/* X축 (빨간색) */}
      <line x1="3" y1="12" x2="21" y2="12" stroke="#ff4444" strokeWidth="2" />
      <polygon points="21,12 18,10 18,14" fill="#ff4444" />

      {/* Y축 (초록색) */}
      <line x1="12" y1="21" x2="12" y2="3" stroke="#44ff44" strokeWidth="2" />
      <polygon points="12,3 10,6 14,6" fill="#44ff44" />

      {/* 원점 표시 */}
      <circle cx="12" cy="12" r="1.5" fill={color} />
    </svg>
  );
}
