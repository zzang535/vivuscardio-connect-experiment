import { NextRequest, NextResponse } from "next/server";

interface AED {
  mfg: string;
  clerktel: string;
  wgs84lat: string;
  model: string;
  manager: string;
  wgs84lon: string;
  buildplace: string;
  buildaddress: string;
  zipcode1: string;
  org: string;
  zipcode2: string;
  managertel: string;
}

interface AEDDataFile {
  DESCRIPTION: Record<string, string>;
  DATA: AED[];
}

interface NearestAEDResponse {
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
  address?: string;
  org?: string;
}

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000; // 지구 반지름 (미터)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const estimateETA = (distanceM: number): number => {
  // 보행 속도 약 1.4 m/s (시속 5km)
  const walkingSpeedMperSec = 1.4;
  return Math.ceil(distanceM / walkingSpeedMperSec / 60);
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radius = parseFloat(searchParams.get("radius") || "1000"); // 기본값 1km
    const limit = parseInt(searchParams.get("limit") || "1", 10);

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Missing latitude or longitude" },
        { status: 400 }
      );
    }

    // AED 데이터 동적 로드
    const aedDataFile: AEDDataFile = await import("@/public/aed-map/aed-data.json");
    const aedList = aedDataFile.DATA;

    // 거리 계산 및 정렬
    const nearbyAEDs = aedList
      .map((aed, index) => {
        const distance = calculateDistance(
          lat,
          lng,
          parseFloat(aed.wgs84lat),
          parseFloat(aed.wgs84lon)
        );

        return {
          id: `aed_${String(index).padStart(6, "0")}`,
          name: aed.org || "AED",
          place: aed.buildplace || "위치 정보 미제공",
          lat: parseFloat(aed.wgs84lat),
          lng: parseFloat(aed.wgs84lon),
          distance_m: Math.round(distance),
          eta_min: estimateETA(distance),
          phone: aed.managertel || aed.clerktel || "정보 없음",
          address: aed.buildaddress,
          org: aed.org,
          // 임시: open24h는 모두 true로, openNow는 현재 시간 기반으로 판단
          open24h: true,
          openNow: true,
        };
      })
      .filter((aed) => aed.distance_m <= radius)
      .sort((a, b) => a.distance_m - b.distance_m)
      .slice(0, limit);

    if (nearbyAEDs.length === 0) {
      return NextResponse.json(
        { data: [], message: "No AED found within specified radius" },
        { status: 200 }
      );
    }

    return NextResponse.json({ data: nearbyAEDs }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
