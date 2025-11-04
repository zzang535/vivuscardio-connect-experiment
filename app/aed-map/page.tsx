"use client";

import { useState } from "react";
import { Position } from "@/aed-map-resources/lib/types";
import ResultScreen from "@/aed-map-resources/components/ResultScreen";
import AddressSearch from "@/aed-map-resources/components/AddressSearch";
import AEDMapScreen from "@/aed-map-resources/components/AEDMapScreen";

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

type Screen = "initial" | "result" | "search" | "map";

export default function AEDMapPage() {
  const [screen, setScreen] = useState<Screen>("initial");
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [aedList, setAedList] = useState<AEDData[]>([]);
  const [selectedAED, setSelectedAED] = useState<AEDData | null>(null);

  const handleFindAED = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos: Position = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentPosition(pos);
          setScreen("result");
        },
        (error) => {
          console.error("위치 접근 실패:", error);
          setScreen("search");
        }
      );
    }
  };

  const handleEmergencyCall = () => {
    window.location.href = "tel:119";
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* T0: 진입 화면 */}
      {screen === "initial" && (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#fff",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          {/* 메인 버튼 */}
          <button
            onClick={handleFindAED}
            style={{
              width: "100%",
              padding: "24px",
              fontSize: "20px",
              fontWeight: "700",
              color: "white",
              backgroundColor: "#FF5252",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              marginBottom: "20px",
              boxShadow: "0 4px 12px rgba(255, 82, 82, 0.3)",
            }}
          >
            내 주변 가장 가까운 AED 찾기
          </button>

          {/* 119 전화 버튼 (하단) */}
          <button
            onClick={handleEmergencyCall}
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
      )}

      {/* T1-2초: 결과 화면 (AED 리스트) */}
      {screen === "result" && currentPosition && (
        <ResultScreen
          currentPosition={currentPosition}
          onBack={() => setScreen("initial")}
          onEmergencyCall={handleEmergencyCall}
          onViewMap={(list, position, selected) => {
            setAedList(list);
            setCurrentPosition(position);
            setSelectedAED(selected || null);
            setScreen("map");
          }}
        />
      )}

      {/* 지도 화면 */}
      {screen === "map" && currentPosition && aedList.length > 0 && (
        <AEDMapScreen
          aedList={aedList}
          currentPosition={currentPosition}
          initialSelectedAED={selectedAED}
          onBack={() => setScreen("result")}
          onEmergencyCall={handleEmergencyCall}
        />
      )}

      {/* GPS 실패: 검색 화면 */}
      {screen === "search" && (
        <AddressSearch
          onSearchComplete={(position) => {
            setCurrentPosition(position);
            setScreen("result");
          }}
          onBack={() => setScreen("initial")}
          onEmergencyCall={handleEmergencyCall}
        />
      )}
    </div>
  );
}
