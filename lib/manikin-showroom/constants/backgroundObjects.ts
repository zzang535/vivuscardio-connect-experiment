// ============================================
// 테이블(박스) 설정
// ============================================

/**
 * 박스 크기 (가로 x 높이 x 세로)
 */
export const MANIKIN_BOX_OFFSET = 0.05;

export const BACKGROUND_TABLES = {
  MAIN: {
    id: "table-main",
    dimensions: { width: 13, height: 2, depth: 2 },
    position: { x: 0, y: 0, z: 0 },
    rotationY: 0,
    color: 0x8b7355,
  },
  SECONDARY: {
    id: "table-secondary",
    dimensions: { width: 13, height: 2, depth: 2 },
    position: { x: 7.25, y: 0, z: 5.5 },
    rotationY: Math.PI / 2,
    color: 0xb01a1a,
  },
} as const;
