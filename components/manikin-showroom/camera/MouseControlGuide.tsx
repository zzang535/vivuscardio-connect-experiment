"use client";

export default function MouseControlGuide() {
  const containerStyle = {
    position: "fixed" as const,
    top: "16px",
    right: "16px",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    color: "#ffffff",
    padding: "12px 16px",
    borderRadius: "12px",
    fontSize: "13px",
    lineHeight: "1.4",
    zIndex: 1000,
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    boxShadow: "0 6px 18px rgba(0, 0, 0, 0.45)",
    minWidth: "200px",
  };

  const rowStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  } as const;

  const controlBoxStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "4px",
    padding: "10px 12px",
    borderRadius: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    minWidth: "95px",
  };

  const arrowStyle = {
    fontSize: "18px",
    fontWeight: 600,
    color: "#c7c7c7",
  };

  return (
    <div style={containerStyle}>
      <div
        style={{
          fontWeight: 700,
          marginBottom: "10px",
          fontSize: "15px",
          letterSpacing: "0.2px",
        }}
      >
        마우스 컨트롤
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* 회전 */}
        <div style={rowStyle}>
          <div style={controlBoxStyle}>
            <MouseLeftIcon />
            <div style={{ fontWeight: 600, fontSize: "12px" }}>드래그</div>
          </div>
          <div style={arrowStyle}>→</div>
          <div style={controlBoxStyle}>
            <RotateIcon />
            <div style={{ fontSize: "12px", opacity: 0.85 }}>화면 회전</div>
          </div>
        </div>

        {/* 패닝 */}
        <div style={rowStyle}>
          <div style={controlBoxStyle}>
            <MouseRightIcon />
            <div style={{ fontWeight: 600, fontSize: "12px" }}>우클릭 드래그</div>
          </div>
          <div style={arrowStyle}>→</div>
          <div style={controlBoxStyle}>
            <PanIcon />
            <div style={{ fontSize: "12px", opacity: 0.85 }}>화면 이동</div>
          </div>
        </div>

        {/* 줌 */}
        <div style={rowStyle}>
          <div style={controlBoxStyle}>
            <MouseWheelIcon />
            <div style={{ fontWeight: 600, fontSize: "12px" }}>스크롤</div>
          </div>
          <div style={arrowStyle}>→</div>
          <div style={controlBoxStyle}>
            <ZoomIcon />
            <div style={{ fontSize: "12px", opacity: 0.85 }}>확대 / 축소</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MouseLeftIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="6" width="20" height="28" rx="10" fill="#E8E8E8" stroke="#555" strokeWidth="2" />
    <path d="M20 6C14.477 6 10 10.477 10 16V18H20V6Z" fill="#4A9EFF" />
    <line x1="20" y1="6" x2="20" y2="18" stroke="#555" strokeWidth="2" />
  </svg>
);

const MouseRightIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="6" width="20" height="28" rx="10" fill="#E8E8E8" stroke="#555" strokeWidth="2" />
    <path d="M20 6C25.523 6 30 10.477 30 16V18H20V6Z" fill="#4A9EFF" />
    <line x1="20" y1="6" x2="20" y2="18" stroke="#555" strokeWidth="2" />
  </svg>
);

const MouseWheelIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="6" width="20" height="28" rx="10" fill="#E8E8E8" stroke="#555" strokeWidth="2" />
    <line x1="20" y1="6" x2="20" y2="18" stroke="#555" strokeWidth="2" />
    <rect x="17" y="10" width="6" height="12" rx="3" fill="#4A9EFF" />
    <path d="M19 13L20 11L21 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 17L20 19L19 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RotateIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 20C30 25 27 28 23 29.5" stroke="#4A9EFF" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M20 27L23 29.5L25 26" fill="#4A9EFF" />
    <path d="M10 20C10 15 13 12 17 10.5" stroke="#4A9EFF" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M20 13L17 10.5L15 14" fill="#4A9EFF" />
    <circle cx="20" cy="20" r="3" fill="none" stroke="#4A9EFF" strokeWidth="1.5" strokeDasharray="2 2" />
  </svg>
);

const PanIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 10V30" stroke="#4A9EFF" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" />
    <path d="M10 20H30" stroke="#4A9EFF" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M27 17L30 20L27 23" fill="#4A9EFF" />
    <path d="M13 17L10 20L13 23" fill="#4A9EFF" />
  </svg>
);

const ZoomIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="12" stroke="#4A9EFF" strokeWidth="2.5" fill="none" />
    <line x1="14" y1="20" x2="26" y2="20" stroke="#4A9EFF" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="20" y1="14" x2="20" y2="26" stroke="#4A9EFF" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M28 28L33 33" stroke="#4A9EFF" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);
