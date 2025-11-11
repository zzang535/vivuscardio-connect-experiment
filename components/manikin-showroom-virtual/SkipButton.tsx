"use client";

interface SkipButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

export default function SkipButton({ isVisible, onClick }: SkipButtonProps) {
  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed",
        bottom: "40px",
        right: "40px",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        color: "#ffffff",
        padding: "12px 24px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 500,
        cursor: "pointer",
        zIndex: 100,
        backdropFilter: "blur(10px)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      건너뛰기
    </button>
  );
}
