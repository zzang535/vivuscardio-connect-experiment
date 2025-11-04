"use client";

import { useRef, useState } from "react";
import { Status, Wrapper } from "@googlemaps/react-wrapper";
import { Position } from "../lib/types";
import AEDListMapComponent, { AEDListMapHandle } from "./AEDListMapComponent";
import IconTarget from "./IconTarget";

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

interface AEDMapScreenProps {
  aedList: AEDData[];
  currentPosition: Position;
  initialSelectedAED?: AEDData | null;
  onBack: () => void;
  onEmergencyCall: () => void;
}

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          로딩중...
        </div>
      );
    case Status.FAILURE:
      return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "red" }}>
          지도 로드 실패
        </div>
      );
    case Status.SUCCESS:
      return <></>;
  }
};

export default function AEDMapScreen({
  aedList,
  currentPosition,
  initialSelectedAED,
  onBack,
  onEmergencyCall,
}: AEDMapScreenProps) {
  const mapRef = useRef<AEDListMapHandle>(null);
  const [selectedAED, setSelectedAED] = useState<AEDData | null>(initialSelectedAED || null);

  const handleGoToCurrentLocation = () => {
    mapRef.current?.goToCurrentLocation();
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          backgroundColor: "#fff",
          borderBottom: "1px solid #eee",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
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
          AED 지도 ({aedList.length}개)
        </h1>
        <div style={{ width: "24px" }} />
      </div>

      {/* AED List (헤더 바로 아래) */}
      <div
        style={{
          maxHeight: "120px",
          overflowY: "auto",
          backgroundColor: "#fff",
          borderBottom: "1px solid #eee",
          padding: "8px 16px",
          display: "flex",
          gap: "8px",
          zIndex: 10,
        }}
      >
        {aedList.map((aed, index) => (
          <div
            key={aed.id}
            style={{
              flex: "0 0 auto",
              minWidth: "140px",
              padding: "8px",
              backgroundColor: selectedAED?.id === aed.id ? "#FFE5E5" : "#f9f9f9",
              border: selectedAED?.id === aed.id ? "2px solid #FF5252" : "1px solid #eee",
              borderRadius: "6px",
              fontSize: "11px",
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
            onClick={() => {
              setSelectedAED(aed);
              mapRef.current?.openInfoWindow(aed.id);
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "6px",
              }}
            >
              <span
                style={{
                  fontWeight: "900",
                  fontSize: "20px",
                  color: index === 0 ? "#FF5252" : "#FF9500",
                  lineHeight: 1,
                }}
              >
                {index + 1}
              </span>
              {index === 0 && (
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "900",
                    color: "#FF5252",
                    backgroundColor: "#FFE5E5",
                    padding: "3px 6px",
                    borderRadius: "3px",
                    whiteSpace: "nowrap",
                  }}
                >
                  가장 가까움
                </span>
              )}
            </div>
            <div
              style={{
                fontWeight: "600",
                marginBottom: "2px",
                color: "#222",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {aed.name}
            </div>
            <div
              style={{
                color: "#999",
              }}
            >
              {aed.distance_m < 1000
                ? `${aed.distance_m}m`
                : `${(aed.distance_m / 1000).toFixed(1)}km`}
            </div>
          </div>
        ))}
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, position: "relative", width: "100%" }}>
        <Wrapper
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || ""}
          render={render}
          libraries={["marker"]}
        >
          <AEDListMapComponent
            ref={mapRef}
            aedList={aedList}
            currentPosition={currentPosition}
            selectedAEDId={selectedAED?.id}
            onMarkerClick={setSelectedAED}
          />
        </Wrapper>
      </div>

      {/* 내 위치로 이동 버튼 */}
      <button
        onClick={handleGoToCurrentLocation}
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          backgroundColor: "#4285F4",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          zIndex: 100,
          transition: "background-color 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#3367D6";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.35)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#4285F4";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.25)";
        }}
        title="내 위치로 이동"
      >
        <IconTarget size={24} color="white" />
      </button>

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
          zIndex: 20,
        }}
      >
        119
      </button>
    </div>
  );
}
