import IconCompression from './IconCompression';
import { DEPTH_SETTINGS } from '@/lib/training-simulator/constants';

interface TrainingGaugeDepthProps {
  depth: number;
  isPressed: boolean;
  lastMaxDepth: number | null;
}

export default function TrainingGaugeDepth({ depth, isPressed, lastMaxDepth }: TrainingGaugeDepthProps) {
  // 현재 depth 값 (0-100%)을 게이지 높이로 변환 (실시간 fill용)
  const depthHeight = depth
    ? Math.min(depth * DEPTH_SETTINGS.GAUGE_HEIGHT_MULTIPLIER, DEPTH_SETTINGS.MAX_GAUGE_HEIGHT)
    : 0;

  // 마지막 압박의 maxDepth를 게이지 높이로 변환 (고정 border용)
  const lastDepthHeight = lastMaxDepth
    ? Math.min(lastMaxDepth * DEPTH_SETTINGS.GAUGE_HEIGHT_MULTIPLIER, DEPTH_SETTINGS.MAX_GAUGE_HEIGHT)
    : 0;

  // 디버그 로깅 (개발 중 확인용)
  if (isPressed && depth > 0) {
    console.log(`Depth Gauge - depth: ${depth.toFixed(1)}%, height: ${depthHeight.toFixed(1)}px`);
  }

  // 현재 실시간 깊이에 따른 fill 색상
  const getFillColor = () => {
    if (depth < DEPTH_SETTINGS.MIN_OPTIMAL_DEPTH) {
      return '#F3F4F6'; // Too shallow: 연한 회색
    } else if (depth <= DEPTH_SETTINGS.MAX_OPTIMAL_DEPTH) {
      return '#56ED89'; // 정상 범위: 초록색
    } else {
      return '#FFD4E5'; // Too deep: 연한 분홍색
    }
  };

  // 마지막 압박 깊이에 따른 border 색상
  const getBorderColor = () => {
    if (!lastMaxDepth) return '#0061F2'; // 기본값
    
    if (lastMaxDepth < DEPTH_SETTINGS.MIN_OPTIMAL_DEPTH) {
      return '#6B7280'; // Too shallow: 진한 회색
    } else if (lastMaxDepth <= DEPTH_SETTINGS.MAX_OPTIMAL_DEPTH) {
      return '#0061F2'; // 정상 범위: 파란색
    } else {
      return '#E300E8'; // Too deep: 마젠타
    }
  };

  return (
    <div className="flex flex-col items-center gap-[10px]">
      <div className="flex items-center gap-[6px]">
        <IconCompression width={12.8} height={12.8} color="#666666" />
        <span className="text-[18px] font-bold text-[#666666]">Depth</span>
      </div>

      <div className="relative w-[280px] h-[280px] rounded-[50px] border border-[#999999] bg-white overflow-hidden">
        {/* 실시간 fill 영역 - 현재 depth에 따라 위에서 아래로 차움 */}
        {depth > 0 && (
          <div
            className="absolute top-0 left-0 w-full"
            style={{ 
              height: `${depthHeight}px`,
              backgroundColor: getFillColor(),
              transition: 'height 16ms linear, background-color 100ms ease-out'
            }}
          />
        )}

        {/* 고정 border 라인 - 마지막 압박의 maxDepth 위치에 고정 */}
        {lastMaxDepth && lastMaxDepth > 0 && (
          <div 
            className="absolute left-0 right-0 h-[6px] transition-all duration-200"
            style={{ 
              top: `${lastDepthHeight - 6}px`, // border 두께 보정
              backgroundColor: getBorderColor()
            }}
          />
        )}

        {/* Horizontal lines - 판정 기준선 (too shallow, too deep) */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 280">
          {/* Too shallow line (MIN_OPTIMAL_DEPTH 지점) */}
          <line
            x1="0"
            y1={DEPTH_SETTINGS.GAUGE_GUIDE_LINES.TOO_SHALLOW_LINE_PX}
            x2="280"
            y2={DEPTH_SETTINGS.GAUGE_GUIDE_LINES.TOO_SHALLOW_LINE_PX}
            stroke="#E5E7EB"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          {/* Too deep line (MAX_OPTIMAL_DEPTH 지점) */}
          <line
            x1="0"
            y1={DEPTH_SETTINGS.GAUGE_GUIDE_LINES.TOO_DEEP_LINE_PX}
            x2="280"
            y2={DEPTH_SETTINGS.GAUGE_GUIDE_LINES.TOO_DEEP_LINE_PX}
            stroke="#E5E7EB"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        </svg>

        {/* Labels */}
        {/* Too shallow 라벨 (첫 번째 점선 위쪽 영역) */}
        <div
          className="absolute left-2 flex items-center gap-1 text-[14px] text-[#666666] font-medium"
          style={{ top: `${DEPTH_SETTINGS.GAUGE_GUIDE_LINES.TOO_SHALLOW_LABEL_TOP}px` }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" className="text-[#666666]">
            <path d="M6 2L6 10M2 6L6 2L10 6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
          Too shallow
        </div>
        {/* Too deep 라벨 (두 번째 점선 아래쪽 영역) */}
        <div
          className="absolute left-2 flex items-center gap-1 text-[14px] text-[#666666] font-medium"
          style={{ top: `${DEPTH_SETTINGS.GAUGE_GUIDE_LINES.TOO_DEEP_LABEL_TOP}px` }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" className="text-[#666666]">
            <path d="M6 10L6 2M2 6L6 10L10 6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
          Too deep
        </div>
      </div>
    </div>
  );
}
