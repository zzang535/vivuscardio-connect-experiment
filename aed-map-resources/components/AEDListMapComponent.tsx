"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Position } from "../lib/types";
import { initializeMarkerStyles, createCurrentLocationMarker } from "../lib/currentLocationMarker";

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

export interface AEDListMapHandle {
  goToCurrentLocation: () => void;
  fitAllMarkers: () => void;
  openInfoWindow: (aedId: string) => void;
}

interface AEDListMapComponentProps {
  aedList: AEDData[];
  currentPosition: Position;
  selectedAEDId?: string;
  onMarkerClick?: (aed: AEDData) => void;
}

const AEDListMapComponent = forwardRef<AEDListMapHandle, AEDListMapComponentProps>(
  ({ aedList, currentPosition, selectedAEDId, onMarkerClick }, ref) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
    const infoWindowsRef = useRef<google.maps.InfoWindow[]>([]);
    const aedDataRef = useRef<Map<string, AEDData>>(new Map());
    const infoWindowsByIdRef = useRef<Map<string, google.maps.InfoWindow>>(new Map());
    const markersByIdRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());

    // 마커 스타일 초기화 (한 번만 실행)
    useEffect(() => {
      initializeMarkerStyles();
    }, []);

    // 지도 초기화 및 마커 추가 (지도 데이터 변경 시에만)
    useEffect(() => {
      if (!mapContainerRef.current || !window.google) return;

      // 지도 생성
      mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: {
          lat: currentPosition.lat,
          lng: currentPosition.lng,
        },
        zoom: 15,
        disableDefaultUI: true, // 모든 기본 UI 컨트롤 숨김
        gestureHandling: "greedy",
        mapId: "aed_list_map",
      });

      // 현재 위치 마커 생성
      if (mapRef.current && window.google.maps.marker) {
        new window.google.maps.marker.AdvancedMarkerElement({
          map: mapRef.current,
          position: {
            lat: currentPosition.lat,
            lng: currentPosition.lng,
          },
          title: "현재 위치",
          content: createCurrentLocationMarker(),
        });
      }

      // AED 마커 생성 및 이전 마커 정리
      markersRef.current.forEach((marker) => {
        marker.map = null;
      });
      markersRef.current = [];

      infoWindowsRef.current.forEach((infoWindow) => {
        infoWindow.close();
      });
      infoWindowsRef.current = [];

      aedDataRef.current.clear();
      infoWindowsByIdRef.current.clear();
      markersByIdRef.current.clear();

      aedList.forEach((aed, index) => {
        if (mapRef.current && window.google.maps.marker) {
          aedDataRef.current.set(aed.id, aed);

          const marker = new window.google.maps.marker.AdvancedMarkerElement({
            map: mapRef.current,
            position: {
              lat: aed.lat,
              lng: aed.lng,
            },
            title: `${index + 1}. ${aed.name}`,
            content: createAEDMarker(index + 1, false, aed), // 초기에는 선택되지 않음
          });

          // InfoWindow 콘텐츠를 DOM 요소로 생성
          const infoWindowContent = document.createElement("div");
          infoWindowContent.style.padding = "12px";
          infoWindowContent.style.fontSize = "13px";
          infoWindowContent.style.maxWidth = "280px";
          infoWindowContent.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
          infoWindowContent.style.color = "#222";
          infoWindowContent.innerHTML = `
            <div style="margin-bottom: 8px;">
              <strong style="font-size: 15px; color: #222; display: block; margin-bottom: 4px; font-weight: 700;">${aed.name}</strong>
              <div style="color: #666; font-size: 12px; line-height: 1.4;">${aed.place}</div>
            </div>
            <div style="border-top: 1px solid #eee; padding-top: 8px; margin-top: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="color: ${aed.openNow ? "#4CAF50" : "#FF5252"}; font-weight: 600; font-size: 12px;">
                  ${aed.open24h ? "24시간 운영" : aed.openNow ? "지금 열음" : "지금 닫힘"}
                </span>
              </div>
              <div style="color: #FF5252; font-weight: 700; font-size: 14px; margin-bottom: 8px;">
                ${aed.distance_m < 1000 ? `${aed.distance_m}m` : `${(aed.distance_m / 1000).toFixed(1)}km`}
              </div>
              ${aed.phone ? `<a href="tel:${aed.phone}" style="display: inline-block; color: white; background-color: #FF5252; padding: 6px 10px; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: 600;">📞 관리처 전화</a>` : ""}
            </div>
          `;

          // InfoWindow 생성
          const infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent,
          });

          marker.addListener("click", () => {
            // 모든 InfoWindow 닫기
            infoWindowsRef.current.forEach((iw) => iw.close());

            // 선택된 InfoWindow 열기
            infoWindow.open(mapRef.current, marker);
            onMarkerClick?.(aed);
          });

          markersRef.current.push(marker);
          infoWindowsRef.current.push(infoWindow);
          infoWindowsByIdRef.current.set(aed.id, infoWindow);
          markersByIdRef.current.set(aed.id, marker);
        }
      });

      // 모든 마커 포함하는 범위로 자동 조정
      fitAllMarkers();
    }, [aedList, currentPosition, onMarkerClick]);

    // 선택된 마커 스타일 업데이트 (선택 상태 변경 시에만)
    useEffect(() => {
      markersRef.current.forEach((marker, index) => {
        const aedId = Array.from(aedDataRef.current.keys())[index];
        const isSelected = selectedAEDId === aedId;
        const aed = aedDataRef.current.get(aedId);
        marker.content = createAEDMarker(index + 1, isSelected, aed);
        // 선택된 마커를 가장 앞으로 표시
        marker.zIndex = isSelected ? 1000 : index;
      });
    }, [selectedAEDId]);

    // 모든 마커를 포함하는 범위로 화면 조정
    const fitAllMarkers = () => {
      if (!mapRef.current || !window.google) return;

      const bounds = new google.maps.LatLngBounds();
      bounds.extend({
        lat: currentPosition.lat,
        lng: currentPosition.lng,
      });

      aedList.forEach((aed) => {
        bounds.extend({
          lat: aed.lat,
          lng: aed.lng,
        });
      });

      mapRef.current.fitBounds(bounds);
    };

    // 부모 컴포넌트에서 호출할 수 있는 메서드
    useImperativeHandle(ref, () => ({
      goToCurrentLocation: () => {
        if (mapRef.current && currentPosition) {
          mapRef.current.setCenter({
            lat: currentPosition.lat,
            lng: currentPosition.lng,
          });
        }
      },
      fitAllMarkers: () => {
        fitAllMarkers();
      },
      openInfoWindow: (aedId: string) => {
        // 모든 InfoWindow 닫기
        infoWindowsRef.current.forEach((iw) => iw.close());

        // 해당 AED의 InfoWindow와 마커 가져오기
        const infoWindow = infoWindowsByIdRef.current.get(aedId);
        const marker = markersByIdRef.current.get(aedId);

        // InfoWindow 열기
        if (infoWindow && marker && mapRef.current) {
          infoWindow.open(mapRef.current, marker);
        }
      },
    }));

    const createAEDMarker = (index: number, isSelected: boolean = false, aed?: AEDData) => {
      const container = document.createElement("div");
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.alignItems = "center";
      container.style.gap = "4px";

      // 마커 핀
      const div = document.createElement("div");
      const size = isSelected ? "56px" : "48px";
      const isFirstMarker = index === 1;
      const baseColor = isFirstMarker ? "#FF5252" : "#FF9500";
      const selectedColor = isFirstMarker ? "#FF3030" : "#FF8C00";
      const backgroundColor = isSelected ? selectedColor : baseColor;
      const shadowColor = isFirstMarker ? "rgba(255, 82, 82, 0.6)" : "rgba(255, 149, 0, 0.6)";
      const shadowSize = isSelected ? `0 4px 16px ${shadowColor}` : `0 2px 8px rgba(${isFirstMarker ? "255, 82, 82" : "255, 149, 0"}, 0.4)`;
      const borderWidth = isSelected ? "4px" : "3px";

      div.style.width = size;
      div.style.height = size;
      div.style.backgroundColor = backgroundColor;
      div.style.borderRadius = "50% 50% 0";
      div.style.transform = "rotate(-45deg)";
      div.style.border = `${borderWidth} solid white`;
      div.style.boxShadow = shadowSize;
      div.style.display = "flex";
      div.style.justifyContent = "center";
      div.style.alignItems = "center";
      div.style.cursor = "pointer";
      div.style.transition = "all 0.2s ease";

      const fontSize = isSelected ? "28px" : "24px";
      div.innerHTML = `<span style="transform: rotate(45deg); color: white; font-weight: 900; font-size: ${fontSize};">${index}</span>`;

      // 1번 마커에만 "가장 가까움" 텍스트 추가
      if (index === 1) {
        const label = document.createElement("span");
        label.style.fontSize = "12px";
        label.style.fontWeight = "700";
        label.style.color = "#FF5252";
        label.style.whiteSpace = "nowrap";
        label.style.backgroundColor = "white";
        label.style.padding = "2px 6px";
        label.style.borderRadius = "4px";
        label.style.boxShadow = "0 1px 4px rgba(0,0,0,0.15)";
        label.textContent = "가장 가까움";
        container.appendChild(label);
      }

      container.appendChild(div);
      return container;
    };

    return <div ref={mapContainerRef} id="aed-list-map" style={{ width: "100%", height: "100%" }} />;
  }
);

AEDListMapComponent.displayName = "AEDListMapComponent";

export default AEDListMapComponent;
