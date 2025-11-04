"use client";

/**
 * MetricCard - 결과 화면의 개별 메트릭 카드 컴포넌트
 * 
 * @param {string} title - 메트릭 제목
 * @param {number} [score] - 점수 (0-100, 선택적 - 주석 처리 시 표시 안됨)
 * @param {Array} criteria - 평가 기준 배열 [{label, value, color}]
 * @param {string} specialLabel - 특수 라벨 (Compression Fraction 전용)
 */
export default function MetricCard({ title, score, criteria, specialLabel }) {
  if (specialLabel) {
    // Compression Fraction은 특수 케이스
    return (
      <div className="flex flex-col gap-[15px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-medium text-[#333333]">{title}</h3>
          {score !== undefined && (
            <span className="text-[24px] font-medium text-[#333333]">{score}</span>
          )}
        </div>

        {/* Special Label */}
        <div className="h-[100px] flex items-center justify-center">
          <p className="text-[16px] font-medium text-[#999999]">{specialLabel}</p>
        </div>
      </div>
    );
  }

  // 수직 바 차트 높이 계산
  const calculateBarHeights = () => {
    const totalHeight = 100; // 전체 바 높이 (px)
    const gapSize = 4; // 항목 간 간격 (px)
    
    // value가 0이 아닌 항목만 필터링
    const nonZeroItems = criteria.filter(c => c.value > 0);
    
    // 총 간격 계산 (항목 수 - 1)
    const totalGaps = (nonZeroItems.length - 1) * gapSize;
    
    // 실제 차트 높이 (전체 높이 - 간격)
    const availableHeight = totalHeight - totalGaps;
    
    // 각 항목의 실제 높이 계산
    return criteria.map(item => {
      if (item.value === 0) return 0;
      return (availableHeight * item.value) / 100;
    });
  };

  const barHeights = calculateBarHeights();

  return (
    <div className="flex flex-col gap-[15px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[18px] font-medium text-[#333333]">{title}</h3>
        {score !== undefined && (
          <span className="text-[24px] font-medium text-[#333333]">{score}</span>
        )}
      </div>

      {/* Content: Bar + Criteria */}
      <div className="flex gap-[20px] h-[100px]">
        {/* Vertical Bar */}
        <div className="w-[40px] h-[100px] flex flex-col justify-end gap-[4px]">
          {criteria.map((item, index) => {
            if (item.value === 0) return null;
            return (
              <div
                key={index}
                className="w-full transition-all duration-300 rounded-[6px]"
                style={{
                  height: `${barHeights[index]}px`,
                  backgroundColor: item.color,
                }}
              />
            );
          })}
        </div>

        {/* Criteria List */}
        <div className="flex-1 flex flex-col justify-between">
          {criteria.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-[10px] flex-1">
                <span 
                  className="text-[16px] font-medium"
                  style={{ color: item.label === 'Good' ? '#0061F2' : '#666666' }}
                >
                  {item.label}
                </span>
                <div className="flex-1 border-b border-dashed border-[#D9D9D9]" />
              </div>
              <span 
                className="ml-[10px] flex items-center"
                style={{ color: item.label === 'Good' ? '#0061F2' : '#666666' }}
              >
                <span className="text-[20px] font-bold">{item.value}</span>
                <span className="text-[16px] font-medium">%</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

