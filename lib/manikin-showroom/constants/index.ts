// Scene 배경색
export const SCENE_BACKGROUND_COLOR = 0x2a2a2a;

export * from "./camera";
export * from "./ground";
export * from "./backgroundObjects";

// ============================================
// 조명 설정
// ============================================

/**
 * Ambient Light (전체 환경 조명)
 */
export const AMBIENT_LIGHT = {
  /** 밝기 (0.0 ~ 1.0) */
  INTENSITY: 0.6,
} as const;

/**
 * Directional Light (방향성 조명) - 메인 라이트
 */
export const MAIN_LIGHT = {
  /** 밝기 (0.0 ~ 2.0) */
  INTENSITY: 0.8,
  /** 위치 (x, y, z) */
  POSITION: { X: 100, Y: 200, Z: 100 },
} as const;

/**
 * Fill Light 1 (보조 조명 1)
 */
export const FILL_LIGHT_1 = {
  /** 밝기 (0.0 ~ 1.0) */
  INTENSITY: 0.4,
  /** 위치 (x, y, z) */
  POSITION: { X: -100, Y: 100, Z: -100 },
} as const;

/**
 * Fill Light 2 (보조 조명 2)
 */
export const FILL_LIGHT_2 = {
  /** 밝기 (0.0 ~ 1.0) */
  INTENSITY: 0.3,
  /** 위치 (x, y, z) */
  POSITION: { X: 0, Y: -100, Z: 100 },
} as const;

// ============================================
// 마테리얼 설정
// ============================================

/**
 * 마네킹 재질 설정
 */
export const MANIKIN_MATERIAL = {
  /**
   * 색상 (16진수 컬러 코드)
   * - 0xffd7a8: 피부색
   * - 0xFFFFFF: 흰색
   * - 0x808080: 회색
   */
  COLOR: 0xffd7a8,

  /**
   * 거칠기 (0.0 ~ 1.0)
   * - 0: 매끄러운 표면 (거울처럼 반사)
   * - 1: 거친 표면 (반사 없음)
   */
  ROUGHNESS: 0.6,

  /**
   * 금속성 (0.0 ~ 1.0)
   * - 0: 비금속 재질
   * - 1: 금속 재질
   */
  METALNESS: 0.2,
} as const;

// ============================================
// 모델 로딩 설정
// ============================================


/**
 * 모델 자동 카메라 조정 설정
 */
export const AUTO_CAMERA = {
  /**
   * 자동 거리 배율
   * - 모델 크기에 따라 카메라 거리를 자동 계산할 때 사용
   * - 값이 클수록 카메라가 더 멀리 위치 (원근 왜곡 감소)
   * - 값이 작을수록 카메라가 가까이 위치 (원근 왜곡 증가)
   * - 권장 범위: 0.5 ~ 1.5
   * - 원근 왜곡을 줄이려면: 0.8 ~ 1.2 정도 권장
   */
  DISTANCE_MULTIPLIER: 0.65,

  /**
   * 카메라 높이 오프셋
   * - 마네킹 중심 높이에서 카메라를 얼마나 위로 올릴지 설정
   * - 양수: 카메라가 위로 올라감 (위에서 내려다보는 각도)
   * - 0: 마네킹 중심 높이와 동일
   * - 음수: 카메라가 아래로 내려감
   * - 예: 30 → 마네킹 중심보다 30 단위 위에서 카메라 배치
   * 
   * ⚠️ 이 값이 실제 카메라 높이를 결정합니다!
   * INITIAL_CAMERA_POSITION.Y를 변경해도 마네킹 로드 후에는 이 값으로 덮어씌워집니다.
   */
  HEIGHT_OFFSET: 3,
} as const;

// ============================================
// 포스터 설정
// ============================================

/**
 * 포스터 크기
 */
export const POSTER_SIZE = {
  /**
   * 포스터 너비
   */
  WIDTH: 1.5,

  /**
   * 포스터 높이
   */
  HEIGHT: 1.2,
} as const;

/**
 * 포스터 스타일 설정
 */
export const POSTER_STYLE = {
  /**
   * 배경색 (16진수 컬러 코드)
   */
  BACKGROUND_COLOR: "#ffffff",

  /**
   * 텍스트 색상
   */
  TEXT_COLOR: "#000000",

  /**
   * 제목 텍스트 크기 (픽셀) - 큰 폰트
   */
  TITLE_TEXT_SIZE: 72,

  /**
   * 설명 텍스트 크기 (픽셀) - 작은 폰트
   */
  DESCRIPTION_TEXT_SIZE: 24,

  /**
   * 폰트 패밀리
   */
  FONT_FAMILY: "Arial, sans-serif",

  /**
   * 테이블 앞면에서의 오프셋 (테이블 앞쪽으로 얼마나 떨어뜨릴지)
   */
  FRONT_OFFSET: -0.1,

  /**
   * 테이블 위에서의 높이 오프셋
   */
  HEIGHT_OFFSET: -0.7,
} as const;
