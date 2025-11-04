// CSS 애니메이션 스타일 정의
const MARKER_STYLES = `
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  .blinking-marker {
    animation: blink 1s infinite;
  }
`;

// 스타일시트 추가 여부 플래그
let styleSheetAdded = false;

/**
 * CSS 애니메이션을 DOM에 한 번만 추가
 */
export const initializeMarkerStyles = (): void => {
  if (styleSheetAdded) return;

  const style = document.createElement("style");
  style.textContent = MARKER_STYLES;
  document.head.appendChild(style);
  styleSheetAdded = true;
};

/**
 * 현재 위치를 나타내는 깜빡이는 파란 마커 생성
 * @returns 마커 DOM 요소
 */
export const createCurrentLocationMarker = (): HTMLDivElement => {
  const blinkingDot = document.createElement("div");
  blinkingDot.className = "blinking-marker";

  // 스타일 적용
  Object.assign(blinkingDot.style, {
    width: "20px",
    height: "20px",
    backgroundColor: "#4285F4",
    borderRadius: "50%",
    border: "3px solid white",
    boxShadow: "0 0 10px rgba(66, 133, 244, 0.6)",
  });

  return blinkingDot;
};
