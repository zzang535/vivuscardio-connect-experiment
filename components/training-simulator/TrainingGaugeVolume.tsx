import { VENTILATION_SETTINGS } from "@/lib/training-simulator/constants";
import IconVentilation from './IconVentilation';
import IconInfantWarning from './IconInfantWarning';

export default function TrainingGaugeVolume({ ventilationVolume, isVentilating, lastMaxVolume }) {
  // 현재 ventilationVolume 값 (0-100%)을 게이지 높이로 변환 (실시간 fill용, 아래에서 위로)
  const volumeHeight = ventilationVolume 
    ? Math.min(ventilationVolume * VENTILATION_SETTINGS.GAUGE_HEIGHT_MULTIPLIER, VENTILATION_SETTINGS.MAX_GAUGE_HEIGHT) 
    : 0;

  // 마지막 환기의 maxVolume을 게이지 높이로 변환 (고정 border용)
  const lastVolumeHeight = lastMaxVolume
    ? Math.min(lastMaxVolume * VENTILATION_SETTINGS.GAUGE_HEIGHT_MULTIPLIER, VENTILATION_SETTINGS.MAX_GAUGE_HEIGHT)
    : 0;

  // 현재 실시간 볼륨에 따른 fill 색상
  const getFillColor = () => {
    if (ventilationVolume < VENTILATION_SETTINGS.MIN_OPTIMAL_VOLUME) {
      return '#F3F4F6'; // Too little: 연한 회색
    } else if (ventilationVolume <= VENTILATION_SETTINGS.MAX_OPTIMAL_VOLUME) {
      return '#56ED89'; // 정상 범위: 초록색
    } else {
      return '#FFD4E5'; // Too much: 연한 분홍색
    }
  };

  // 마지막 환기 볼륨에 따른 border 색상
  const getBorderColor = () => {
    if (!lastMaxVolume) return '#0061F2'; // 기본값
    
    if (lastMaxVolume < VENTILATION_SETTINGS.MIN_OPTIMAL_VOLUME) {
      return '#6B7280'; // Too little: 진한 회색
    } else if (lastMaxVolume <= VENTILATION_SETTINGS.MAX_OPTIMAL_VOLUME) {
      return '#0061F2'; // 정상 범위: 파란색
    } else {
      return '#E300E8'; // Too much: 마젠타
    }
  };

  // 디버그 로깅 (개발 중 확인용)
  if (isVentilating && ventilationVolume > 0) {
    console.log(`Volume Gauge - volume: ${ventilationVolume.toFixed(1)}%, height: ${volumeHeight.toFixed(1)}px`);
  }

  return (
    <div className="flex flex-col items-center gap-[10px]">
      <div className="flex items-center gap-[6px]">
        <IconVentilation width={12.8} height={12.8} color="#666666" />
        <span className="text-[18px] font-bold text-[#666666]">Volume</span>
      </div>

      <div className="relative w-[280px] h-[280px] rounded-[50px] border border-[#999999] bg-white overflow-hidden">
        {/* 실시간 fill 영역 - 현재 ventilationVolume에 따라 아래에서 위로 차움 */}
        {ventilationVolume > 0 && (
          <div
            className="absolute bottom-0 left-0 w-full"
            style={{ 
              height: `${volumeHeight}px`,
              backgroundColor: getFillColor(),
              transition: 'height 16ms linear, background-color 100ms ease-out'
            }}
          />
        )}

        {/* 고정 border 라인 - 마지막 환기의 maxVolume 위치에 고정 */}
        {lastMaxVolume && lastMaxVolume > 0 && (
          <div 
            className="absolute left-0 right-0 h-[6px] transition-all duration-200"
            style={{ 
              bottom: `${lastVolumeHeight - 6}px`, // border 두께 보정
              backgroundColor: getBorderColor()
            }}
          />
        )}

        {/* Horizontal lines - 판정 기준선 (too little, too much) */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 280">
          {/* Too little line (MIN_OPTIMAL_VOLUME 지점) */}
          <line
            x1="0"
            y1={VENTILATION_SETTINGS.GAUGE_GUIDE_LINES.TOO_LITTLE_LINE_PX}
            x2="280"
            y2={VENTILATION_SETTINGS.GAUGE_GUIDE_LINES.TOO_LITTLE_LINE_PX}
            stroke="#E5E7EB"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          {/* Too much line (MAX_OPTIMAL_VOLUME 지점) */}
          <line
            x1="0"
            y1={VENTILATION_SETTINGS.GAUGE_GUIDE_LINES.TOO_MUCH_LINE_PX}
            x2="280"
            y2={VENTILATION_SETTINGS.GAUGE_GUIDE_LINES.TOO_MUCH_LINE_PX}
            stroke="#E5E7EB"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        </svg>

        {/* Labels */}
        {/* Too much 라벨 (위쪽 영역 - 두 번째 점선 위) */}
        <div
          className="absolute left-2 flex items-center gap-1 text-[14px] text-[#666666] font-medium"
          style={{ top: `${VENTILATION_SETTINGS.GAUGE_GUIDE_LINES.TOO_MUCH_LABEL_TOP}px` }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" className="text-[#666666]">
            <path d="M6 2L6 10M2 6L6 2L10 6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
          Too much
        </div>
        {/* Too little 라벨 (아래쪽 영역 - 첫 번째 점선 아래) */}
        <div
          className="absolute left-2 flex items-center gap-1 text-[14px] text-[#666666] font-medium"
          style={{ bottom: `${VENTILATION_SETTINGS.GAUGE_GUIDE_LINES.TOO_LITTLE_LABEL_BOTTOM}px` }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" className="text-[#666666]">
            <path d="M6 10L6 2M2 6L6 10L10 6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
          Too little
        </div>

        {/* Damaged tag */}
        {/* <div className="absolute top-5 right-5 bg-[#F5F5F5] px-[14px] py-[6px] rounded-full flex items-center gap-1">
          <IconInfantWarning width={20} height={20} color="#666666" />
          <span className="text-[14px] text-[#666666] font-medium">Damaged</span>
        </div> */}
      </div>
    </div>
  );
}
