// ============================================
// 테이블(박스) 설정
// ============================================

/**
 * 박스 크기 (가로 x 높이 x 세로)
 */
export const BOX_SIZE = {
  WIDTH: 10.0,
  HEIGHT: 2,
  DEPTH: 2,
} as const;

/**
 * 박스 위치
 */
export const BOX_POSITION = {
  Y: 0,
} as const;

/**
 * 박스 재질 설정
 */
export const BOX_MATERIAL = {
  COLOR: 0x8b7355,
  ROUGHNESS: 0.7,
  METALNESS: 0.0,
} as const;

/**
 * 박스 위 객체 높이 오프셋
 */
export const MANIKIN_BOX_OFFSET = 0.05;

export const BACKGROUND_TABLES = {
  MAIN: {
    id: "table-main",
    dimensions: {
      width: 13,
      height: BOX_SIZE.HEIGHT,
      depth: BOX_SIZE.DEPTH,
    },
    position: {
      x: 0,
      y: BOX_POSITION.Y,
      z: 0,
    },
    rotationY: 0,
    color: BOX_MATERIAL.COLOR,
  },
  SECONDARY: {
    id: "table-secondary",
    dimensions: {
      width: 13,
      height: BOX_SIZE.HEIGHT,
      depth: BOX_SIZE.DEPTH,
    },
    position: {
      x: 7.25,
      y: BOX_POSITION.Y,
      z: 5.5,
    },
    rotationY: Math.PI / 2,
    color: 0xb01a1a,
  },
} as const;
