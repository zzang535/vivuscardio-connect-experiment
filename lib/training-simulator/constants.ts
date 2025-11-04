// CPR 훈련 시뮬레이션 상수


// 위치 관련 설정
export const POSITION_SETTINGS = {
  // 심장 위치 (bodyRef 클릭 영역 기준 퍼센트 - Manikin.jsx의 실제 심장 위치와 일치)
  HEART_POSITION: { x: 50, y: 50 },

  // 마네킹 몸 영역 크기 (픽셀)
  MANIKIN_BODY_SIZE: { width: 192, height: 256 },

  // 피드백 게이지 크기 (픽셀)
  FEEDBACK_GAUGE_SIZE: { width: 280, height: 280 },

  // 위치 정확도 판정 기준 (심장으로부터의 거리 %)
  POSITION_TOLERANCE: 12 // 12% 이내면 합격 (클릭 영역 확대에 맞춰 조정)
};

// 압박 깊이 관련 설정
export const DEPTH_SETTINGS = {
  // 압박 깊이 증가 비율 (50ms마다 증가하는 퍼센트)
  DEPTH_INCREMENT_RATE: 10, // 2%씩 증가 (50ms마다 2% → 1초에 40% → 2.5초에 100%)

  // 압박 깊이 업데이트 주기 (밀리초)
  DEPTH_UPDATE_INTERVAL: 50, // 50ms마다 업데이트

  // 최대 압박 깊이 (퍼센트)
  MAX_DEPTH_PERCENT: 100, // 100%

  // 게이지 높이 변환 비율 (depth % -> px)
  GAUGE_HEIGHT_MULTIPLIER: 2.8, // depth * 2.8 = 게이지 높이(px)

  // 게이지 최대 높이 (픽셀)
  MAX_GAUGE_HEIGHT: 280, // 280px

  // 적정 깊이 기준선 위치 (픽셀)
  OPTIMAL_DEPTH_LINE: 165, // 165px

  // 깊이 판정 기준 (퍼센트)
  // 시각적 가이드 라인(3등분)과 일치하도록 설정
  MIN_OPTIMAL_DEPTH: 33, // 33% 이상 (1/3 지점 - Too shallow 경계선)
  MAX_OPTIMAL_DEPTH: 67,  // 67% 이하 (2/3 지점 - Too deep 경계선)

  // 게이지 시각적 가이드라인 위치 (판정 기준과 연동)
  GAUGE_GUIDE_LINES: {
    // 33% 지점 (MIN_OPTIMAL_DEPTH) - Too shallow 경계
    TOO_SHALLOW_LINE_PERCENT: 33,
    TOO_SHALLOW_LINE_PX: 93.33,   // 280px * (33/100)
    TOO_SHALLOW_LABEL_TOP: 70,    // 라벨 위치 (선 위쪽, 상단으로부터)

    // 67% 지점 (MAX_OPTIMAL_DEPTH) - Too deep 경계
    TOO_DEEP_LINE_PERCENT: 67,
    TOO_DEEP_LINE_PX: 186.67,     // 280px * (67/100)
    TOO_DEEP_LABEL_TOP: 190       // 라벨 위치 (선 아래쪽, 상단으로부터)
  }
};


// CPR Rate 관련 설정
export const RATE_SETTINGS = {
  // CPR 가이드라인: 100-120 compressions per minute
  // 적정 압박 간격 (초)
  OPTIMAL_MIN_INTERVAL: 0.5, // 120 compressions/min (60/120)
  OPTIMAL_MAX_INTERVAL: 0.6, // 100 compressions/min (60/100)

  // Rate 판정 기준 (초)
  TOO_FAST_THRESHOLD: 0.4, // 0.4초 미만은 너무 빠름
  TOO_SLOW_THRESHOLD: 0.8, // 0.8초 초과는 너무 느림

  // Rate 계산용 압박 이력 보관 개수
  MAX_COMPRESSION_HISTORY: 10, // 최근 10개 압박만 보관

  // Rate 게이지 좌표 매핑 (간격 초 -> 게이지 X 좌표 %)
  GAUGE_MAPPING: {
    MIN_INTERVAL: 0, // 최소 간격 (초) - 게이지 오른쪽 끝
    MAX_INTERVAL: 1.2, // 최대 간격 (초) - 게이지 왼쪽 끝
    GAUGE_WIDTH: 280   // 게이지 너비 (px)
  },

  // 게이지 시각적 가이드라인 위치 (판정 기준과 연동)
  // 3등분 구조 (역순 매핑):
  // 0px (너무 느림 >1.2s) | 93.33px (0.8s 경계) | 186.67px (0.4s 경계) | 280px (너무 빠름 <0s)
  // 왼쪽 = slow (긴 간격), 오른쪽 = fast (짧은 간격)
  GAUGE_GUIDE_LINES: {
    // TOO_SLOW_THRESHOLD (0.8초) 위치 - 왼쪽 1/3 지점
    TOO_SLOW_LINE_PERCENT: 33.33,     // 게이지 1/3 지점
    TOO_SLOW_LINE_PX: 93.33,          // 280px * (1/3)
    TOO_SLOW_LABEL_PX: 10,            // 라벨 위치 (선 왼쪽)

    // TOO_FAST_THRESHOLD (0.4초) 위치 - 오른쪽 2/3 지점
    TOO_FAST_LINE_PERCENT: 66.67,     // 게이지 2/3 지점
    TOO_FAST_LINE_PX: 186.67,         // 280px * (2/3)
    TOO_FAST_LABEL_PX: 193            // 라벨 위치 (선 오른쪽)
  }
};

// 환기(Ventilation) 관련 설정
export const VENTILATION_SETTINGS = {
  // 환기 볼륨 증가 비율 (50ms마다 증가하는 퍼센트)
  VOLUME_INCREMENT_RATE: 5, // 5%씩 증가 (기존 2%보다 빠르게)

  // 환기 볼륨 업데이트 주기 (밀리초)
  VOLUME_UPDATE_INTERVAL: 50, // 50ms마다 업데이트

  // 최대 환기 볼륨 (퍼센트)
  MAX_VOLUME_PERCENT: 100, // 100%

  // 게이지 높이 변환 비율 (volume % -> px)
  GAUGE_HEIGHT_MULTIPLIER: 2.8, // volume * 2.8 = 게이지 높이(px)

  // 게이지 최대 높이 (픽셀)
  MAX_GAUGE_HEIGHT: 280, // 280px

  // 볼륨 판정 기준 (퍼센트)
  // 시각적 가이드 라인(3등분)과 일치하도록 설정
  MIN_OPTIMAL_VOLUME: 33, // 33% 이상 (1/3 지점 - Too little 경계선)
  MAX_OPTIMAL_VOLUME: 67,  // 67% 이하 (2/3 지점 - Too much 경계선)

  // 게이지 시각적 가이드라인 위치 (판정 기준과 연동)
  GAUGE_GUIDE_LINES: {
    // 33% 지점 (MIN_OPTIMAL_VOLUME) - Too little 경계 (아래쪽)
    TOO_LITTLE_LINE_PERCENT: 33,
    TOO_LITTLE_LINE_PX: 93.33,    // 280px * (33/100)
    TOO_LITTLE_LABEL_BOTTOM: 70,  // 라벨 위치 (선 아래쪽, 하단으로부터)

    // 67% 지점 (MAX_OPTIMAL_VOLUME) - Too much 경계 (위쪽)
    TOO_MUCH_LINE_PERCENT: 67,
    TOO_MUCH_LINE_PX: 186.67,     // 280px * (67/100)
    TOO_MUCH_LABEL_TOP: 70        // 라벨 위치 (선 위쪽, 상단으로부터)
  }
};

// 시간 업데이트 관련 설정
export const TIME_SETTINGS = {
  // 시간 표시 업데이트 주기 (밀리초)
  TIME_UPDATE_INTERVAL: 100, // 100ms마다 업데이트

  // 시간 표시 소수점 자릿수
  TIME_DECIMAL_PLACES: 1 // 0.1초 단위
};



// 애니메이션 관련 설정
export const ANIMATION_SETTINGS = {
  // 깊이 게이지 트랜지션 시간 (밀리초)
  DEPTH_TRANSITION_DURATION: 75,

  // 위치 게이지 트랜지션 시간 (밀리초)
  POSITION_TRANSITION_DURATION: 200
};

// 반응형 레이아웃 설정
export const LAYOUT_SETTINGS = {
  // 마네킹 사이즈 변경 브레이크포인트 (픽셀)
  MANIKIN_SIZE_BREAKPOINT: 1900 // 1800px 이하에서 small, 초과에서 medium
};