"use client";

import { useState, useEffect } from "react";
import { Position } from "../lib/types";

interface AEDData {
  id: string;
  name: string;
  place: string;
  lat: number;
  lng: number;
  open24h: boolean;
  openNow: boolean;
  phone: string;
  distance_m: number;
  eta_min: number;
}

interface ResultScreenProps {
  currentPosition: Position;
  onBack: () => void;
  onEmergencyCall: () => void;
  onViewMap?: (aedList: AEDData[], currentPosition: Position, selectedAED?: AEDData) => void;
}

export default function ResultScreen({
  currentPosition,
  onBack,
  onEmergencyCall,
  onViewMap,
}: ResultScreenProps) {
  const [aedList, setAedList] = useState<AEDData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedAED, setSelectedAED] = useState<AEDData | null>(null);

  useEffect(() => {
    const fetchNearestAEDs = async (radius: number = 1000) => {
      try {
        setIsLoading(true);
        setError(null);
        // limit=5로 5개 AED 가져옴
        const response = await fetch(
          `/api/aed/nearest?lat=${currentPosition.lat}&lng=${currentPosition.lng}&radius=${radius}&limit=5`
        );
        const result = await response.json();

        if (result.data && result.data.length > 0) {
          setAedList(result.data);
        } else if (radius < 10000) {
          // 1km에서 못 찾으면 10km로 확대
          setToast("반경을 확대하는 중...");
          setTimeout(() => {
            fetchNearestAEDs(10000);
            setToast(null);
          }, 800);
        } else if (radius < 100000) {
          // 10km에서도 못 찾으면 100km로 확대
          setToast("반경을 확대하는 중...");
          setTimeout(() => {
            fetchNearestAEDs(100000);
            setToast(null);
          }, 800);
        } else {
          // 100km에서도 못 찾으면 에러
          setError("반경 내 AED를 찾을 수 없습니다.");
        }
      } catch (err) {
        console.error("Failed to fetch nearest AEDs:", err);
        setError("위치 정보를 불러올 수 없습니다");
      } finally {
        setIsLoading(false);
      }
    };

    if (currentPosition) {
      fetchNearestAEDs();
    }
  }, [currentPosition]);

  const handleViewMap = (aed?: AEDData) => {
    if (onViewMap) {
      onViewMap(aedList, currentPosition, aed || selectedAED || aedList[0]);
    }
  };

  const handleAEDItemClick = (aed: AEDData) => {
    setSelectedAED(aed);
    handleViewMap(aed);
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <p style={{ color: "#666", fontSize: "14px" }}>AED를 찾는 중...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          backgroundColor: "#fff",
          boxSizing: "border-box",
        }}
      >
        <p style={{ color: "#666", marginBottom: "20px", textAlign: "center" }}>
          {error}
        </p>
        <button
          onClick={onBack}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "14px",
            color: "white",
            backgroundColor: "#FF5252",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          돌아가기
        </button>

        <button
          onClick={onEmergencyCall}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#FF5252",
            border: "none",
            color: "white",
            fontSize: "24px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(255, 82, 82, 0.3)",
            fontWeight: "700",
          }}
        >
          119
        </button>
      </div>
    );
  }

  // Success state - AED List screen
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        padding: "0",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #eee",
          backgroundColor: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: "#666",
          }}
        >
          ←
        </button>
        <h1 style={{ margin: "0", fontSize: "16px", fontWeight: "700", color: "#222" }}>
          주변 AED (가까운 순 {aedList.length}개)
        </h1>
        <button
          onClick={() => handleViewMap()}
          style={{
            background: "none",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
            color: "#FF5252",
            fontWeight: "700",
          }}
        >
          지도
        </button>
      </div>

      {/* AED List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 20px",
        }}
      >
        {aedList.map((aed, index) => (
          <div
            key={aed.id}
            style={{
              padding: "16px",
              marginBottom: "12px",
              backgroundColor: selectedAED?.id === aed.id ? "#FFE5E5" : "#f9f9f9",
              border: selectedAED?.id === aed.id ? "2px solid #FF5252" : "1px solid #eee",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background-color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              if (selectedAED?.id !== aed.id) {
                e.currentTarget.style.backgroundColor = "#f0f0f0";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedAED?.id !== aed.id) {
                e.currentTarget.style.backgroundColor = "#f9f9f9";
              }
            }}
            onClick={() => handleAEDItemClick(aed)}
          >
            {/* Rank + Distance */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "50px",
                      height: "50px",
                      backgroundColor: index === 0 ? "#FF5252" : "#FF9500",
                      color: "white",
                      borderRadius: "8px",
                      boxShadow: `0 2px 8px rgba(${index === 0 ? "255, 82, 82" : "255, 149, 0"}, 0.3)`,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "900",
                        fontSize: "24px",
                        lineHeight: 1,
                      }}
                    >
                      {index + 1}
                    </span>
                  </div>
                  {index === 0 && (
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#FF5252",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      가장 가까움
                    </span>
                  )}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "15px",
                      color: "#222",
                    }}
                  >
                    {aed.name}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#999",
                      marginTop: "2px",
                    }}
                  >
                    {aed.place}
                  </div>
                </div>
              </div>
              <div
                style={{
                  textAlign: "right",
                  minWidth: "60px",
                }}
              >
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "14px",
                    color: "#FF5252",
                  }}
                >
                  {aed.distance_m < 1000
                    ? `${aed.distance_m}m`
                    : `${(aed.distance_m / 1000).toFixed(1)}km`}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#999",
                    marginTop: "2px",
                  }}
                >
                  도보 {aed.eta_min}분
                </div>
              </div>
            </div>

            {/* Status */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: aed.openNow ? "#4CAF50" : "#FF5252",
                  fontWeight: "600",
                }}
              >
                {aed.open24h
                  ? "24시간 운영"
                  : aed.openNow
                    ? "지금 열음"
                    : "지금 닫힘"}
              </span>
              {aed.phone && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `tel:${aed.phone}`;
                  }}
                  style={{
                    fontSize: "12px",
                    padding: "4px 8px",
                    backgroundColor: "#f0f0f0",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    color: "#666",
                  }}
                >
                  전화
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 119 Emergency button (fixed) */}
      <button
        onClick={onEmergencyCall}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "#FF5252",
          border: "none",
          color: "white",
          fontSize: "24px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(255, 82, 82, 0.3)",
          fontWeight: "700",
        }}
      >
        119
      </button>

      {/* Toast notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "12px 16px",
            borderRadius: "6px",
            fontSize: "12px",
            zIndex: 1000,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
