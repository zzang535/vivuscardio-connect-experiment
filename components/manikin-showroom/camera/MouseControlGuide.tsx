"use client";

export default function MouseControlGuide() {
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        color: "#ffffff",
        padding: "16px 20px",
        borderRadius: "12px",
        fontSize: "14px",
        lineHeight: "1.6",
        zIndex: 1000,
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
        minWidth: "200px",
      }}
    >
      <div
        style={{
          fontWeight: "700",
          marginBottom: "12px",
          fontSize: "16px",
          letterSpacing: "0.3px",
        }}
      >
        마우스 컨트롤
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* 드래그 */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* 왼쪽: 마우스 좌클릭 */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="10"
              y="6"
              width="20"
              height="28"
              rx="10"
              fill="#E8E8E8"
              stroke="#555"
              strokeWidth="2"
            />
            <path
              d="M20 6C14.477 6 10 10.477 10 16V18H20V6Z"
              fill="#4A9EFF"
            />
            <line
              x1="20"
              y1="6"
              x2="20"
              y2="18"
              stroke="#555"
              strokeWidth="2"
            />
          </svg>

          {/* 중앙: + 기호 */}
          <div
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#999",
              lineHeight: "1",
            }}
          >
            +
          </div>

          {/* 오른쪽: 회전 화살표 */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M30 20C30 25 27 28 23 29.5"
              stroke="#4A9EFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path d="M20 27L23 29.5L25 26" fill="#4A9EFF" />
            <path
              d="M10 20C10 15 13 12 17 10.5"
              stroke="#4A9EFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path d="M20 13L17 10.5L15 14" fill="#4A9EFF" />
            <circle
              cx="20"
              cy="20"
              r="3"
              fill="none"
              stroke="#4A9EFF"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          </svg>

          <div style={{ marginLeft: "4px" }}>
            <div style={{ fontWeight: "600", marginBottom: "2px" }}>드래그</div>
            <div style={{ fontSize: "12px", opacity: 0.85 }}>화면 회전</div>
          </div>
        </div>

        {/* 패닝 */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* 오른쪽 버튼 강조 */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="10"
              y="6"
              width="20"
              height="28"
              rx="10"
              fill="#E8E8E8"
              stroke="#555"
              strokeWidth="2"
            />
            <path
              d="M20 6C25.523 6 30 10.477 30 16V18H20V6Z"
              fill="#4A9EFF"
            />
            <line
              x1="20"
              y1="6"
              x2="20"
              y2="18"
              stroke="#555"
              strokeWidth="2"
            />
          </svg>

          <div
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#999",
              lineHeight: "1",
            }}
          >
            →
          </div>

          {/* 패닝 화살표 */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 10V30"
              stroke="#4A9EFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="4 4"
            />
            <path
              d="M10 20H30"
              stroke="#4A9EFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path d="M27 17L30 20L27 23" fill="#4A9EFF" />
            <path d="M13 17L10 20L13 23" fill="#4A9EFF" />
          </svg>

          <div style={{ marginLeft: "4px" }}>
            <div style={{ fontWeight: "600", marginBottom: "2px" }}>우클릭 드래그</div>
            <div style={{ fontSize: "12px", opacity: 0.85 }}>
              패닝 이동 (속도 1.5)
            </div>
          </div>
        </div>

        {/* 스크롤 */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* 왼쪽: 마우스 휠 */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="10"
              y="6"
              width="20"
              height="28"
              rx="10"
              fill="#E8E8E8"
              stroke="#555"
              strokeWidth="2"
            />
            <line x1="20" y1="6" x2="20" y2="18" stroke="#555" strokeWidth="2" />
            {/* 중앙 휠 영역 파란색 */}
            <rect x="17" y="10" width="6" height="12" rx="3" fill="#4A9EFF" />
            {/* 휠 상하 화살표 */}
            <path
              d="M19 13L20 11L21 13"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 17L20 19L19 17"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* 중앙: = 기호 */}
          <div
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#999",
              lineHeight: "1",
            }}
          >
            =
          </div>

          {/* 오른쪽: 확대/축소 */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="20"
              cy="20"
              r="12"
              stroke="#4A9EFF"
              strokeWidth="2.5"
              fill="none"
            />
            <line
              x1="14"
              y1="20"
              x2="26"
              y2="20"
              stroke="#4A9EFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <line
              x1="20"
              y1="14"
              x2="20"
              y2="26"
              stroke="#4A9EFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M28 28L33 33"
              stroke="#4A9EFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>

          <div style={{ marginLeft: "4px" }}>
            <div style={{ fontWeight: "600", marginBottom: "2px" }}>
              스크롤
            </div>
            <div style={{ fontSize: "12px", opacity: 0.85 }}>확대/축소</div>
          </div>
        </div>
      </div>
    </div>
  );
}
