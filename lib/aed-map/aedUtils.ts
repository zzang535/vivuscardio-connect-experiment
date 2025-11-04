import { Position } from "@/lib/aed-map/types";

export interface AED {
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

export interface AEDWithDistance extends AED {
  distance: number;
}

/**
 * 두 좌표 간의 거리를 미터 단위로 계산 (Haversine 공식)
 */
export const calculateDistanceInMeters = (
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

/**
 * 현재 위치 기반 근처 AED 찾기
 * @param currentPosition 현재 위치
 * @param aedList AED 목록
 * @param radius 반경 (미터)
 * @returns 거리순으로 정렬된 AED 목록
 */
export const findNearbyAEDs = (
  currentPosition: Position,
  aedList: AED[],
  radius: number = 500
): AEDWithDistance[] => {
  const nearbyAEDs = aedList
    .map((aed) => ({
      ...aed,
      distance: calculateDistanceInMeters(
        currentPosition.lat,
        currentPosition.lng,
        parseFloat(aed.wgs84lat),
        parseFloat(aed.wgs84lon)
      ),
    }))
    .filter((aed) => aed.distance <= radius)
    .sort((a, b) => a.distance - b.distance);

  return nearbyAEDs;
};

/**
 * AED 데이터를 필터링하여 현재 위치 근처 AED 반환
 */
export const getNearbyAEDsByDistance = (
  currentPosition: Position,
  aedList: AED[]
): {
  within300m: AEDWithDistance[];
  within300to500m: AEDWithDistance[];
} => {
  const all = findNearbyAEDs(currentPosition, aedList, 500);

  return {
    within300m: all.filter((aed) => aed.distance <= 300),
    within300to500m: all.filter((aed) => aed.distance > 300 && aed.distance <= 500),
  };
};
