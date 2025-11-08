"use client";

interface Camera360ButtonProps {
  isMoving: boolean;
  onClick: () => void;
}

export default function Camera360Button({
  isMoving,
  onClick,
}: Camera360ButtonProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: "auto",
        right: "20px",
        bottom: "20px",
        zIndex: 1000,
      }}
    >
      <button
        onClick={onClick}
        disabled={isMoving}
        style={{
          width: "100%",
          padding: "12px 20px",
          backgroundColor: isMoving ? "#666" : "#4A9EFF",
          color: "#ffffff",
          border: "none",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "600",
          cursor: isMoving ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(10px)",
          minWidth: "160px",
        }}
        onMouseEnter={(e) => {
          if (!isMoving) {
            e.currentTarget.style.backgroundColor = "#3A8EEF";
            e.currentTarget.style.boxShadow =
              "0 6px 16px rgba(74, 158, 255, 0.5)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isMoving) {
            e.currentTarget.style.backgroundColor = "#4A9EFF";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
            e.currentTarget.style.transform = "translateY(0)";
          }
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isMoving ? (
            // Pause icon
            <>
              <rect x="3" y="2" width="4" height="12" rx="1" fill="currentColor" />
              <rect x="9" y="2" width="4" height="12" rx="1" fill="currentColor" />
            </>
          ) : (
            // Play icon
            <path d="M3 1.5v13l10-6.5L3 1.5z" fill="currentColor" />
          )}
        </svg>
        {isMoving ? "무빙 중..." : "360° 둘러보기"}
      </button>
    </div>
  );
}
