import { DEPTH_SETTINGS, VENTILATION_SETTINGS, ANIMATION_SETTINGS, RATE_SETTINGS } from "@/lib/training-simulator/constants";

interface FeedbackGaugeProps {
  type: string;
  title: string;
  clickPosition?: { x: number; y: number } | null;
  isPressed: boolean;
  depth: number;
  rateData?: { interval: number; status?: string } | null;
  ventilationVolume: number;
  isVentilating: boolean;
}

export default function FeedbackGauge({ type, title, clickPosition, isPressed, depth, rateData, ventilationVolume, isVentilating }: FeedbackGaugeProps) {
  const renderPositionGauge = () => {
    // 마네킹의 클릭 위치를 게이지 좌표로 변환
    // clickPosition.y는 bodyRef(80x80px 영역) 내에서의 상대적 위치
    // bodyRef는 마네킹 이미지의 70% 위치에 있음
    // 이 위치를 게이지 중앙(50%, 50%)으로 매핑
    const gaugeX = clickPosition ? clickPosition.x : 50; // 그대로 사용
    const gaugeY = clickPosition ? clickPosition.y : 50; // clickPosition.y는 이미 bodyRef 중심 기준이므로 그대로 사용

    // 디버깅용 로그
    if (clickPosition) {
      console.log(`Position Gauge Mapping - Input: (${clickPosition.x.toFixed(2)}, ${clickPosition.y.toFixed(2)}) -> Gauge: (${gaugeX.toFixed(2)}, ${gaugeY.toFixed(2)})`);
    }

    return (
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

      {/* Center green dot - position based on click */}
      <div
        className={`absolute w-[50px] h-[50px] rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 transition-all duration-${ANIMATION_SETTINGS.POSITION_TRANSITION_DURATION} ${
          isPressed ? 'bg-[#EF4444] scale-110' : 'bg-[#56ED89]'
        }`}
        style={{
          left: `${gaugeX}%`,
          top: `${gaugeY}%`
        }}
      >
        <div className={`w-[25px] h-[25px] rounded-full ${
          isPressed ? 'bg-[#DC2626]' : 'bg-[#4ADE80]'
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
    );
  };

  const renderDepthGauge = () => {
    // depth 값 (0-100%)을 게이지 높이로 변환 (위에서 아래로 차움)
    const depthHeight = depth ? Math.min(depth * 2.8, 280) : 0; // 최대 280px (게이지 전체 높이)

    return (
    <div className="relative w-[280px] h-[280px] rounded-[50px] border border-[#999999] bg-white overflow-hidden">
      {/* 깊이에 따라 위에서 아래로 차는 녹색 영역 */}
      {depth > 0 && (
        <div
          className="absolute top-0 left-0 w-full bg-[#56ED89] transition-all duration-75"
          style={{ height: `${depthHeight}px` }}
        >
          {/* 현재 깊이 위치를 나타내는 파란 기준선 (녹색 영역 끝에 붙어있음) */}
          <div className="absolute bottom-0 left-0 right-0 h-[6px] bg-[#0061F2]"></div>
        </div>
      )}

      {/* Horizontal lines - 3등분선 (too shallow, too deep) */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 280">
        {/* Too shallow line (1/3 지점) */}
        <line x1="0" y1="93.33" x2="280" y2="93.33" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="5,5"/>
        {/* Too deep line (2/3 지점) */}
        <line x1="0" y1="186.67" x2="280" y2="186.67" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="5,5"/>
      </svg>

      {/* Labels */}
      {/* Too shallow 라벨 (첫 번째 점선 바로 위) */}
      <div className="absolute left-2 flex items-center gap-1 text-[14px] text-[#666666] font-medium" style={{ top: "78px" }}>
        <svg width="12" height="12" viewBox="0 0 12 12" className="text-[#666666]">
          <path d="M6 2L6 10M2 6L6 2L10 6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
        Too shallow
      </div>
      {/* Too deep 라벨 (두 번째 점선 바로 아래) */}
      <div className="absolute left-2 flex items-center gap-1 text-[14px] text-[#666666] font-medium" style={{ top: "200px" }}>
        <svg width="12" height="12" viewBox="0 0 12 12" className="text-[#666666]">
          <path d="M6 10L6 2M2 6L6 10L10 6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
        Too deep
      </div>
    </div>
    );
  };

  const renderRateGauge = () => {
    // Rate 데이터를 게이지 X좌표로 변환
    const getRatePosition = () => {
      if (!rateData || !rateData.interval) return 50; // 기본값 중앙

      const { interval } = rateData;
      const { MIN_INTERVAL, MAX_INTERVAL } = RATE_SETTINGS.GAUGE_MAPPING;

      // 간격을 0.2~1.2초 범위를 0~100% 게이지로 매핑
      const clampedInterval = Math.max(MIN_INTERVAL, Math.min(interval, MAX_INTERVAL));
      const positionPercent = ((clampedInterval - MIN_INTERVAL) / (MAX_INTERVAL - MIN_INTERVAL)) * 100;

      return positionPercent;
    };

    const ratePosition = getRatePosition();

    return (
      <div className="relative w-[280px] h-[280px] rounded-[50px] border border-[#999999] bg-white">
        {/* Vertical lines - 3등분선 (too slow, too fast) */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 280">
          {/* Too fast line (1/3 지점) */}
          <line x1="93.33" y1="0" x2="93.33" y2="280" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="5,5"/>
          {/* Too slow line (2/3 지점) */}
          <line x1="186.67" y1="0" x2="186.67" y2="280" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="5,5"/>
        </svg>

        {/* Rate 표시 세로선 (실시간 Rate 위치) */}
        {rateData && rateData.interval && (
          <div
            className={`absolute top-0 bottom-0 w-[6px] transition-all duration-200 ${
              rateData.status === 'too_fast' ? 'bg-[#EF4444]' :
              rateData.status === 'too_slow' ? 'bg-[#F59E0B]' :
              'bg-[#10B981]'
            }`}
            style={{
              left: `${ratePosition}%`,
              transform: 'translateX(-50%)'
            }}
          >
            {/* Rate 값 표시 */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-[12px] font-medium text-[#333333] bg-white px-1 rounded">
              {rateData.interval.toFixed(2)}s
            </div>
          </div>
        )}

        {/* Labels */}
        {/* Too fast 라벨 (첫 번째 세로선 바로 왼쪽) */}
        <div className="absolute bottom-[72px] text-[14px] text-[#666666] font-medium" style={{ left: "20px" }}>
          Too fast
        </div>
        {/* Too slow 라벨 (두 번째 세로선 바로 오른쪽) */}
        <div className="absolute bottom-[72px] flex items-center gap-1 text-[14px] text-[#666666] font-medium" style={{ left: "200px" }}>
          Too slow
          <svg width="12" height="12" viewBox="0 0 12 12" className="text-[#666666]">
            <path d="M2 6L10 6M6 2L10 6L6 10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        </div>
      </div>
    );
  };

  const renderVolumeGauge = () => {
    // ventilationVolume 값 (0-100%)을 게이지 높이로 변환 (아래에서 위로 차움)
    const volumeHeight = ventilationVolume ? Math.min(ventilationVolume * VENTILATION_SETTINGS.GAUGE_HEIGHT_MULTIPLIER, VENTILATION_SETTINGS.MAX_GAUGE_HEIGHT) : 0;

    return (
      <div className="relative w-[280px] h-[280px] rounded-[50px] border border-[#999999] bg-white overflow-hidden">
        {/* 볼륨에 따라 아래에서 위로 차는 녹색 영역 */}
        {ventilationVolume > 0 && (
          <div
            className="absolute bottom-0 left-0 w-full bg-[#56ED89] transition-all duration-75"
            style={{ height: `${volumeHeight}px` }}
          >
            {/* 현재 볼륨 위치를 나타내는 파란 기준선 (녹색 영역 끝에 붙어있음) */}
            <div className="absolute top-0 left-0 right-0 h-[6px] bg-[#0061F2]"></div>
          </div>
        )}

        {/* Horizontal lines - 2등분선 (중앙선) */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 280">
          {/* 중앙선 */}
          <line x1="0" y1="140" x2="280" y2="140" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="5,5"/>
        </svg>

        {/* Labels */}
        {/* Too much 라벨 (중앙선 위쪽) */}
        <div className="absolute top-[72px] left-2 flex items-center gap-1 text-[14px] text-[#666666] font-medium">
          <svg width="12" height="12" viewBox="0 0 12 12" className="text-[#666666]">
            <path d="M6 2L6 10M2 6L6 2L10 6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
          Too much
        </div>
        {/* Too little 라벨 (중앙선 아래쪽) */}
        <div className="absolute bottom-[72px] left-2 flex items-center gap-1 text-[14px] text-[#666666] font-medium">
          <svg width="12" height="12" viewBox="0 0 12 12" className="text-[#666666]">
            <path d="M6 10L6 2M2 6L6 10L10 6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
          Too little
        </div>

        {/* Damaged tag */}
        {type === "volume" && (
          <div className="absolute top-5 right-5 bg-[#F5F5F5] px-[14px] py-[6px] rounded-full flex items-center gap-2">
            <div className="w-5 h-5 bg-orange-400 rounded-full"></div>
            <span className="text-[14px] text-[#666666] font-medium">Damaged</span>
          </div>
        )}
      </div>
    );
  };

  const renderGauge = () => {
    switch (type) {
      case "position": return renderPositionGauge();
      case "depth": return renderDepthGauge();
      case "rate": return renderRateGauge();
      case "volume": return renderVolumeGauge();
      default: return <div className="w-[280px] h-[280px] rounded-[50px] border border-[#999999] bg-white"></div>;
    }
  };

  const renderHeaderIcon = () => {
    switch (type) {
      case "position":
        return (
          <svg width="12.8" height="12.8" viewBox="0 0 13 13" className="text-[#666666]">
            <circle cx="6.5" cy="6.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="6.5" cy="6.5" r="2" fill="currentColor"/>
          </svg>
        );
      case "depth":
        return (
          <svg width="12.8" height="12.8" viewBox="0 0 13 13" className="text-[#666666]">
            <path d="M6.5 1.5L6.5 11.5M3 6.5L6.5 1.5L10 6.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          </svg>
        );
      case "rate":
        return (
          <svg width="12.8" height="12.8" viewBox="0 0 13 13" className="text-[#666666]">
            <path d="M2 6.5C2 6.5 4 2 6.5 6.5C9 11 11 6.5 11 6.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          </svg>
        );
      case "volume":
        return (
          <svg width="12.8" height="12.8" viewBox="0 0 13 13" className="text-[#666666]">
            <path d="M2 4.5L2 8.5L4 8.5L7 11.5L7 1.5L4 4.5L2 4.5Z" stroke="currentColor" strokeWidth="1" fill="none"/>
            <path d="M9 4.5C9.5 5 10 5.5 10 6.5C10 7.5 9.5 8 9 8.5" stroke="currentColor" strokeWidth="1" fill="none"/>
          </svg>
        );
      default:
        return <div className="w-[12.8px] h-[12.8px] rounded-full bg-gray-400"></div>;
    }
  };

  return (
    <div className="flex flex-col items-center gap-[10px]">
      <div className="flex items-center gap-[6px]">
        {renderHeaderIcon()}
        <span className="text-[18px] font-bold text-[#666666]">{title}</span>
      </div>
      {renderGauge()}
    </div>
  );
}