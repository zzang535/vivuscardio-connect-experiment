"use client";

interface ErrorOverlayProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function ErrorOverlay({
  title = "문제가 발생했습니다",
  description = "잠시 후 다시 시도해 주세요.",
  actionLabel = "다시 시도",
  onAction,
}: ErrorOverlayProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(15, 15, 15, 0.92)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        textAlign: "center",
        color: "#fefefe",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          fontSize: "22px",
          fontWeight: 600,
          marginBottom: "12px",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "15px",
          color: "rgba(255,255,255,0.75)",
        }}
      >
        {description}
      </div>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            marginTop: "32px",
            padding: "12px 36px",
            borderRadius: "9999px",
            border: "none",
            background: "linear-gradient(135deg, #60a5fa, #3b82f6)",
            color: "#fff",
            fontSize: "15px",
            fontWeight: 600,
            letterSpacing: "0.5px",
            cursor: "pointer",
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
