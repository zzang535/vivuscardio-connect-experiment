"use client";

import { useEffect, useRef } from "react";
import { ModelType } from "@/lib/manikin-showroom/modelTypes";
import ModelPreview from "./ModelPreview";

interface ModelSelectorProps {
  models: ModelType[];
  onSelectModel: (model: ModelType) => void;
  onClose: () => void;
}

export default function ModelSelector({
  models,
  onSelectModel,
  onClose,
}: ModelSelectorProps) {
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={selectorRef}
      style={{
        position: "fixed",
        left: "20px",
        bottom: "110px", // Editor(ObjectController) 위에 배치
        width: "300px",
        maxHeight: "calc(100vh - 220px)", // 상하 여백 고려
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        color: "#ffffff",
        borderRadius: "12px",
        zIndex: 1001,
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontWeight: "700",
            fontSize: "16px",
            letterSpacing: "0.3px",
          }}
        >
          모델 선택
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#ffffff",
            cursor: "pointer",
            fontSize: "20px",
            padding: "0",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.7,
            transition: "opacity 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "0.7")}
        >
          ×
        </button>
      </div>

      {/* 모델 리스트 */}
      <div
        style={{
          overflowY: "auto",
          padding: "8px",
          flex: 1,
        }}
      >
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => onSelectModel(model)}
            style={{
              width: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              textAlign: "left",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(74, 158, 255, 0.2)";
              e.currentTarget.style.borderColor = "#4A9EFF";
              e.currentTarget.style.transform = "translateX(4px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            {/* 3D 프리뷰 */}
            <div
              style={{
                flexShrink: 0,
              }}
            >
              <ModelPreview model={model} size={80} />
            </div>

            {/* 정보 */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: "600",
                  fontSize: "14px",
                  marginBottom: "4px",
                  color: "#ffffff",
                }}
              >
                {model.name}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  opacity: 0.7,
                  marginBottom: "6px",
                  color: "#ffffff",
                }}
              >
                {model.description}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  opacity: 0.5,
                  color: "#ffffff",
                }}
              >
                크기: {model.dimensions.width} × {model.dimensions.height} ×{" "}
                {model.dimensions.depth}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
