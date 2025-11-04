"use client";

import { useState } from "react";
import { Position } from "../lib/types";

interface AddressSearchProps {
  onSearchComplete: (position: Position) => void;
  onBack: () => void;
  onEmergencyCall: () => void;
}

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || "";

export default function AddressSearch({
  onSearchComplete,
  onBack,
  onEmergencyCall,
}: AddressSearchProps) {
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      // Google Geocoding API를 통해 주소를 좌표로 변환
      const encodedAddress = encodeURIComponent(searchInput);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error("지오코딩 실패");
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        const position: Position = {
          lat: location.lat,
          lng: location.lng,
        };
        onSearchComplete(position);
      } else {
        setError("검색 결과가 없습니다. 다른 주소를 시도해주세요.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("검색 중 오류가 발생했습니다.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        padding: "20px",
        boxSizing: "border-box",
        backgroundColor: "#fff",
      }}
    >
      {/* 검색 폼 */}
      <form onSubmit={handleSearch} style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="주소/건물명 검색 (예: 서울시 강남구 역삼동)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "14px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            marginBottom: "12px",
            boxSizing: "border-box",
          }}
        />
        <button
          type="submit"
          disabled={isSearching || !searchInput.trim()}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "14px",
            fontWeight: "700",
            color: "white",
            backgroundColor: isSearching || !searchInput.trim() ? "#ccc" : "#FF5252",
            border: "none",
            borderRadius: "8px",
            cursor: isSearching || !searchInput.trim() ? "default" : "pointer",
            marginBottom: "20px",
          }}
        >
          {isSearching ? "검색 중..." : "검색"}
        </button>
      </form>

      {/* 에러 메시지 */}
      {error && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "6px",
            color: "#856404",
            fontSize: "13px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* 뒤로가기 버튼 */}
      <button
        onClick={onBack}
        style={{
          padding: "12px",
          fontSize: "14px",
          color: "#666",
          backgroundColor: "#f0f0f0",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        돌아가기
      </button>

      {/* 119 전화 버튼 (하단 고정) */}
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
