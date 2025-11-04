import { RATE_SETTINGS } from "@/lib/training-simulator/constants";
import IconRate from "./IconRate";
import IconSpeedSlow from "./IconSpeedSlow";
import IconSpeed from "./IconSpeed";

interface TrainingGaugeRateProps {
  rateData: { interval: number; status?: string } | null;
}

export default function TrainingGaugeRate({ rateData }: TrainingGaugeRateProps) {
  // Rate 데이터를 게이지 X좌표로 변환
  // 3등분 구조: 0% (너무 느림) | 33.33% (0.8s) | 66.67% (0.4s) | 100% (너무 빠름)
  // 왼쪽 = slow (긴 간격), 오른쪽 = fast (짧은 간격)
  const getRatePosition = () => {
    if (!rateData || !rateData.interval) return 50; // 기본값 중앙

    const { interval } = rateData;
    const { MIN_INTERVAL, MAX_INTERVAL } = RATE_SETTINGS.GAUGE_MAPPING;

    // 간격을 역순으로 매핑: 긴 간격(1.2s) = 0%, 짧은 간격(0s) = 100%
    const clampedInterval = Math.max(MIN_INTERVAL, Math.min(interval, MAX_INTERVAL));
    const positionPercent = ((MAX_INTERVAL - clampedInterval) / MAX_INTERVAL) * 100;

    return positionPercent;
  };

  const ratePosition = getRatePosition();

  return (
    <div className="flex flex-col items-center gap-[10px]">
      <div className="flex items-center gap-[6px]">
        <IconRate width={12.8} height={12.8} color="#666666" />
        <span className="text-[18px] font-bold text-[#666666]">Rate</span>
      </div>

      <div className="relative w-[280px] h-[280px] rounded-[50px] border border-[#999999] bg-white">
        {/* Vertical lines - 판정 기준선 (왼쪽: too slow, 오른쪽: too fast) */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 280">
          {/* Too slow line (TOO_SLOW_THRESHOLD 지점) */}
          <line
            x1={RATE_SETTINGS.GAUGE_GUIDE_LINES.TOO_SLOW_LINE_PX}
            y1="0"
            x2={RATE_SETTINGS.GAUGE_GUIDE_LINES.TOO_SLOW_LINE_PX}
            y2="280"
            stroke="#E5E7EB"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          {/* Too fast line (TOO_FAST_THRESHOLD 지점) */}
          <line
            x1={RATE_SETTINGS.GAUGE_GUIDE_LINES.TOO_FAST_LINE_PX}
            y1="0"
            x2={RATE_SETTINGS.GAUGE_GUIDE_LINES.TOO_FAST_LINE_PX}
            y2="280"
            stroke="#E5E7EB"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        </svg>

        {/* Rate 표시 세로선 (실시간 Rate 위치) */}
        {rateData && rateData.interval && (
          <div
            className="absolute top-0 bottom-0 w-[6px] bg-[#333333] transition-all duration-200"
            style={{
              left: `${ratePosition}%`,
              transform: 'translateX(-50%)'
            }}
          >
            {/* Rate 값 표시 - 바 아래쪽에 위치 */}
            <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[12px] font-medium text-[#333333] bg-white px-1 rounded">
              {rateData.interval.toFixed(2)}s
            </div>
          </div>
        )}

        {/* Labels */}
        {/* Too slow 라벨 (TOO_SLOW 선 왼쪽) */}
        <div
          className="absolute bottom-[72px] flex items-center gap-1 text-[14px] text-[#666666] font-medium"
          style={{ left: `${RATE_SETTINGS.GAUGE_GUIDE_LINES.TOO_SLOW_LABEL_PX}px` }}
        >
          Too slow
          <IconSpeedSlow width={16} height={16} color="#666666" />
        </div>
        {/* Too fast 라벨 (TOO_FAST 선 오른쪽) */}
        <div
          className="absolute bottom-[72px] flex items-center gap-1 text-[14px] text-[#666666] font-medium"
          style={{ left: `${RATE_SETTINGS.GAUGE_GUIDE_LINES.TOO_FAST_LABEL_PX}px` }}
        >
          <IconSpeed width={16} height={16} color="#666666" />
          Too fast
        </div>
      </div>
    </div>
  );
}
