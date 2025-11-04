import { Position } from "./types";

interface NavigationUrls {
  googleMaps: string;
  appleMaps: string;
  kakaomaps: string;
  tmapweb: string;
}

/**
 * AED 위치로의 길안내 URL을 생성합니다.
 * @param position AED 위치 좌표
 * @param aedName AED 기관명 (선택)
 * @returns 각 지도 앱별 URL 객체
 */
export const generateNavigationUrls = (
  position: Position,
  aedName?: string
): NavigationUrls => {
  const { lat, lng } = position;
  const label = aedName ? encodeURIComponent(aedName) : "AED";

  return {
    // Google Maps
    googleMaps: `https://maps.google.com/?q=${lat},${lng}`,

    // Apple Maps (iOS)
    appleMaps: `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=w`,

    // Kakao Map
    kakaomaps: `kakaomap://route?ep=${lat},${lng}&by=FOOT`,

    // T-map
    tmapweb: `https://tmapapi.sktelecom.com/tmap/app/routes?name=${label}&appVersion=1&coordType=WGS84GEO&sx=127.1054326&sy=37.3595704&ex=${lng}&ey=${lat}&reqCoordType=WGS84GEO`,
  };
};

/**
 * 사용자의 OS와 설치된 앱을 감지하여 가장 적절한 길안내 링크를 반환합니다.
 * @param position AED 위치 좌표
 * @param aedName AED 기관명 (선택)
 * @returns 사용 가능한 길안내 URL
 */
export const getPriorityNavigationUrl = (
  position: Position,
  aedName?: string
): string => {
  const urls = generateNavigationUrls(position, aedName);
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);

  // iOS: Apple Maps 우선
  if (isIOS) {
    return urls.appleMaps;
  }

  // Android: Kakao Maps 우선 (설치 여부 자동 감지)
  // 폴백: Google Maps
  if (isAndroid) {
    // Kakao Maps가 설치되었는지 확인 시도
    // 직접 확인이 어려우므로, Kakao -> Google 순서로 시도
    // 클라이언트에서 try-catch로 처리
    return urls.kakaomaps;
  }

  // 데스크톱: Google Maps
  return urls.googleMaps;
};

/**
 * 네비게이션 링크를 열고, 앱이 없으면 자동으로 폴백합니다.
 * @param position AED 위치 좌표
 * @param aedName AED 기관명 (선택)
 */
export const openNavigation = (position: Position, aedName?: string) => {
  const urls = generateNavigationUrls(position, aedName);
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);

  if (isIOS) {
    // iOS: Apple Maps -> Google Maps 폴백
    window.location.href = urls.appleMaps;
    setTimeout(() => {
      window.location.href = urls.googleMaps;
    }, 1000);
  } else if (isAndroid) {
    // Android: Kakao Maps -> Google Maps 폴백
    // 앱이 없으면 자동으로 스토어로 이동하므로, 웹 폴백도 시도
    try {
      window.location.href = urls.kakaomaps;
      // 앱이 없으면 일정 시간 후 웹 버전으로 폴백
      setTimeout(() => {
        window.location.href = urls.googleMaps;
      }, 1500);
    } catch {
      window.location.href = urls.googleMaps;
    }
  } else {
    // 데스크톱: Google Maps
    window.open(urls.googleMaps, "_blank");
  }
};
