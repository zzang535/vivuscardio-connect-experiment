/**
 * Manikin Showroom 3D Viewer 설정
 */

// ============================================
// OrbitControls 카메라 제어 설정
// ============================================

/**
 * 카메라 줌 제한 설정
 */
export const CAMERA_DISTANCE = {
  /**
   * 최소 거리 (카메라가 모델에 얼마나 가까이 갈 수 있는지)
   * - 값이 작을수록 더 가까이 줌 가능
   * - 0.1: 모델 내부까지 들어갈 수 있음
   * - 1-2: 모델 표면 근처까지만 가능
   * - 5-10: 전체적인 형태만 볼 수 있음
   */
  MIN: 1,

  /**
   * 최대 거리 (카메라가 모델에서 얼마나 멀리 갈 수 있는지)
   * - 값이 클수록 더 멀리 줌 아웃 가능
   * - 기본값: 2000
   */
  MAX: 100,
} as const;

/**
 * 카메라 조작 속도 설정
 */
export const CONTROL_SPEED = {
  /**
   * 줌 속도 (마우스 휠 감도)
   * - 기본값: 1.0
   * - 1.0보다 크면: 빠르게 줌
   * - 1.0보다 작으면: 느리게 줌
   * - 권장 범위: 0.5 ~ 3.0
   */
  ZOOM: 2.0,

  /**
   * 회전 속도 (마우스 드래그 감도)
   * - 기본값: 1.0
   * - 1.0보다 크면: 빠르게 회전
   * - 1.0보다 작으면: 느리게 회전
   * - 권장 범위: 0.3 ~ 2.0
   */
  ROTATE: 1.0,

  /**
   * 패닝 속도 (우클릭 드래그 이동 속도)
   * - 기본값: 1.0
   * - 1.0보다 크면: 빠르게 이동
   * - 1.0보다 작으면: 느리게 이동
   * - 권장 범위: 0.5 ~ 2.0
   */
  PAN: 1.5,
} as const;

/**
 * 카메라 댐핑(부드러운 움직임) 설정
 */
export const DAMPING = {
  /**
   * 댐핑 활성화 여부
   * - true: 카메라가 부드럽게 멈춤 (관성 효과)
   * - false: 카메라가 즉시 멈춤
   */
  ENABLED: true,

  /**
   * 댐핑 강도
   * - 0에 가까울수록: 더 부드럽게 멈춤 (관성이 오래 지속)
   * - 1에 가까울수록: 빠르게 멈춤 (관성이 짧음)
   * - 권장 범위: 0.03 ~ 0.15
   */
  FACTOR: 0.05,
} as const;

// ============================================
// 카메라 초기 위치 설정
// ============================================

/**
 * Three.js 좌표계 (Right-Handed Coordinate System)
 * 
 *     Y (위)
 *     |
 *     |
 *     +---- X (오른쪽)
 *    /
 *   /
 *  Z (앞으로/뷰어 방향)
 * 
 * - X축: 좌우 (양수: 오른쪽, 음수: 왼쪽)
 * - Y축: 상하 (양수: 위로 올라감, 음수: 아래로 내려감) ⬆️
 * - Z축: 전후 (양수: 앞으로/뷰어 방향, 음수: 뒤로/뷰어 반대 방향)
 * 
 * 카메라를 위로 올리려면 Y 값을 증가시키세요!
 * 예: Y: 50 → Y: 80 (30만큼 위로 올라감)
 */

/**
 * 카메라 초기 위치 (x, y, z)
 * - X: 좌우 위치 (양수: 오른쪽, 음수: 왼쪽)
 * - Y: 높이 (양수: 위, 음수: 아래)
 * - Z: 전후 위치 (양수: 앞, 음수: 뒤)
 * 
 * ⚠️ 중요: 이 값은 마네킹이 로드되기 전의 임시 위치입니다.
 * 마네킹이 로드되면 autoAdjustCamera 함수가 호출되어 카메라 위치가 재설정됩니다.
 * 
 * 실제 카메라 높이를 조정하려면 아래의 AUTO_CAMERA.HEIGHT_OFFSET 값을 변경하세요!
 */
export const INITIAL_CAMERA_POSITION = {
  X: 0,    // 좌우 중앙
  Y: 10,   // 높이 (마네킹 로드 전 임시 값)
  Z: 300,  // 전후 거리
} as const;

/**
 * 카메라가 바라보는 목표 지점 (x, y, z)
 */
export const INITIAL_CAMERA_TARGET = {
  X: 0,
  Y: 50,
  Z: 0,
} as const;

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
// 렌더링 설정
// ============================================

/**
 * Scene 배경색
 * - 16진수 컬러 코드
 * - 예: 0x000000 (검정), 0xFFFFFF (흰색), 0x2a2a2a (진한 회색)
 */
export const SCENE_BACKGROUND_COLOR = 0x2a2a2a;

/**
 * 카메라 FOV (Field of View, 시야각)
 * - 값이 클수록: 넓은 시야 (광각 효과, 원근 왜곡 증가)
 * - 값이 작을수록: 좁은 시야 (망원 효과, 원근 왜곡 감소, 평평함)
 * - 권장 범위: 30 ~ 75
 * - 원근 왜곡을 줄이려면: 30-40 정도 권장
 * - 기본값: 35 (왜곡 최소화)
 */
export const CAMERA_FOV = 35;

/**
 * 카메라 클리핑 평면
 */
export const CAMERA_CLIPPING = {
  /** Near plane (너무 가까운 객체는 렌더링 안 함) */
  NEAR: 0.1,
  /** Far plane (너무 먼 객체는 렌더링 안 함) */
  FAR: 10000,
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
 * OBJ 파일 경로
 */
export const MANIKIN_MODEL_PATH = "/manikin-showroom/manikin.obj";

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
// 테이블 설정
// ============================================

/**
 * 테이블 크기 (가로 x 높이 x 세로)
 */
export const TABLE_SIZE = {
  /**
   * 테이블 길이 (가로)
   * - 마네킹 크기보다 충분히 커야 함
   */
  WIDTH: 10.0,

  /**
   * 테이블 두께 (높이)
   */
  HEIGHT: 2,

  /**
   * 테이블 깊이 (세로)
   */
  DEPTH: 2,
} as const;

/**
 * 테이블 위치
 */
export const TABLE_POSITION = {
  /**
   * 테이블의 Y 위치 (높이)
   * - 0: 바닥
   * - 양수: 바닥에서 위로
   */
  Y: 0,
} as const;

/**
 * 테이블 재질 설정
 */
export const TABLE_MATERIAL = {
  /**
   * 테이블 색상 (16진수 컬러 코드)
   * - 0x8b7355: 나무색 (밝은 갈색)
   * - 0x654321: 어두운 나무색
   * - 0xA0522D: 시에나 (적갈색)
   */
  COLOR: 0x8b7355,

  /**
   * 거칠기 (0.0 ~ 1.0)
   * - 0.7: 나무 재질의 적당한 거칠기
   */
  ROUGHNESS: 0.7,

  /**
   * 금속성 (0.0 ~ 1.0)
   * - 0.0: 나무는 비금속
   */
  METALNESS: 0.0,
} as const;

/**
 * 마네킹이 테이블 위에 놓이는 높이 오프셋
 * - 테이블 위치 + 테이블 두께/2 + 이 값 = 마네킹 바닥 위치
 */
export const MANIKIN_TABLE_OFFSET = 0.05;

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

/**
 * 마네킹 정보 (모델 이름과 설명)
 */
export const MANIKIN_INFO = [
  {
    name: "IM16-R",
    description: "Adult CPR Training Manikin\nHigh-quality materials\nRealistic anatomy",
  },
  {
    name: "IM16-JHS",
    description: "Junior High School Manikin\nPerfect for training\nDurable construction",
  },
  {
    name: "IM16-RO",
    description: "Infant CPR Manikin\nLife-like features\nEasy to use",
  },
  {
    name: "IM17-P",
    description: "Professional Training Model\nAdvanced features\nIndustry standard",
  },
  {
    name: "Brayden Pro",
    description: "Professional CPR Manikin\nPremium quality\nComprehensive training",
  },
] as const;

// ============================================
// 지면 설정
// ============================================

/**
 * 지면 크기 (가로 x 세로)
 */
export const GROUND_SIZE = {
  /**
   * 지면 너비 (가로)
   */
  WIDTH: 50,

  /**
   * 지면 깊이 (세로)
   */
  HEIGHT: 50,
} as const;

/**
 * 지면 위치
 */
export const GROUND_POSITION = {
  /**
   * 지면의 Y 위치 (높이)
   * - 테이블보다 약간 낮게 설정
   */
  Y: -0.5,
} as const;

/**
 * 지면 재질 설정
 */
export const GROUND_MATERIAL = {
  /**
   * 지면 색상 (16진수 컬러 코드)
   * - 0x808080: 회색
   * - 0x6a6a6a: 밝은 회색
   * - 0x4a4a4a: 어두운 회색
   * - 0x2a2a2a: 매우 어두운 회색
   */
  COLOR: 0x6a6a6a, // 약간 밝게 조정

  /**
   * 거칠기 (0.0 ~ 1.0)
   */
  ROUGHNESS: 0.8,

  /**
   * 금속성 (0.0 ~ 1.0)
   */
  METALNESS: 0.0,
} as const;
