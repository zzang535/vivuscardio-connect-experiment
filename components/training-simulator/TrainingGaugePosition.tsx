import { ANIMATION_SETTINGS, POSITION_SETTINGS } from "@/lib/training-simulator/constants";
import IconTarget from "./IconTarget";

interface TrainingGaugePositionProps {
  clickPosition: { x: number; y: number } | null;
  isPressed: boolean;
}

export default function TrainingGaugePosition({ clickPosition, isPressed }: TrainingGaugePositionProps) {
  // 마네킹의 클릭 위치를 게이지 좌표로 변환
  const gaugeX = clickPosition ? clickPosition.x : 50;
  const gaugeY = clickPosition ? clickPosition.y : 50;

  // 위치 판정: 심장 위치로부터의 거리 계산
  const isPositionCorrect = () => {
    if (!clickPosition) return true; // 클릭 전에는 기본값(녹색)

    const heartPos = POSITION_SETTINGS.HEART_POSITION;
    const distance = Math.sqrt(
      Math.pow(clickPosition.x - heartPos.x, 2) +
      Math.pow(clickPosition.y - heartPos.y, 2)
    );

    return distance <= POSITION_SETTINGS.POSITION_TOLERANCE;
  };

  const positionCorrect = isPositionCorrect();

  // 디버깅용 로그
  if (clickPosition) {
    console.log(`Position Gauge Mapping - Input: (${clickPosition.x.toFixed(2)}, ${clickPosition.y.toFixed(2)}) -> Gauge: (${gaugeX.toFixed(2)}, ${gaugeY.toFixed(2)}), Correct: ${positionCorrect}`);
  }

  return (
    <div className="flex flex-col items-center gap-[10px]">
      <div className="flex items-center gap-[6px]">
        <IconTarget size={12.8} color="#666666" />
        <span className="text-[18px] font-bold text-[#666666]">Position</span>
      </div>

      <div className="relative w-[280px] h-[280px] rounded-[50px] border border-[#999999] bg-white">
        {/* Grid pattern background */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 280">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <circle cx="140" cy="140" r="139" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
          <circle cx="140" cy="140" r="100" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
          <circle cx="140" cy="140" r="60" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
          <line x1="0" y1="140" x2="280" y2="140" stroke="#E5E7EB" strokeWidth="1"/>
          <line x1="140" y1="0" x2="140" y2="280" stroke="#E5E7EB" strokeWidth="1"/>
        </svg>

        {/* Center dot - color based on position correctness */}
        <div
          className={`absolute w-[50px] h-[50px] rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 transition-all duration-${ANIMATION_SETTINGS.POSITION_TRANSITION_DURATION} ${
            isPressed
              ? 'scale-110'
              : ''
          } ${
            positionCorrect
              ? 'bg-[#56ED89]'  // 녹색: 위치 정확
              : 'bg-[#E300E8]'  // 마젠타: 위치 부정확
          }`}
          style={{
            left: `${gaugeX}%`,
            top: `${gaugeY}%`
          }}
        >
          <div className={`w-[25px] h-[25px] rounded-full ${
            positionCorrect
              ? 'bg-[#4ADE80]'  // 진한 녹색
              : 'bg-[#C000C6]'  // 진한 마젠타
          }`}></div>
        </div>

        {/* Labels */}
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-[14px] text-[#666666] font-medium">
          Head
        </div>
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[14px] text-[#666666] font-medium">
          Center
        </div>
      </div>
    </div>
  );
}
