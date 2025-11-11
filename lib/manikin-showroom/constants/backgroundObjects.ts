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
    dimensions: { width: 12, height: 2, depth: 2 },
    position: { x: 0, y: 0, z: 0 },
    rotationY: 0,
    color: 0x8b7355,
  },
  SECONDARY: {
    id: "table-secondary",
    dimensions: { width: 12, height: 2, depth: 2 },
    position: { x: 7, y: 0, z: 5 },
    rotationY: Math.PI / 2,
    color: 0xb01a1a,
  },
} as const;


export type BackgroundManikinConfig = {
  id: string;
  /** 월드 좌표 */
  position: { x: number; y: number; z: number };
  /** Y축 회전 (라디안) */
  rotationY: number;
  /** 배치될 테이블 (기본값: MAIN) */
  tableId?: keyof typeof BACKGROUND_TABLES;
};

export const BACKGROUND_MANIKINS: readonly BackgroundManikinConfig[] = [
  {
    id: "manikin-01",
    position: { x: -4.8, y: 0, z: 0 },
    rotationY: 0,
    tableId: "MAIN",
  },
  {
    id: "manikin-02",
    position: { x: -2.4, y: 0, z: 0 },
    rotationY: 0,
    tableId: "MAIN",
  },
  {
    id: "manikin-03",
    position: { x: 0, y: 0, z: 0 },
    rotationY: 0,
    tableId: "MAIN",
  },
  {
    id: "manikin-04",
    position: { x: 2.4, y: 0, z: 0 },
    rotationY: 0,
    tableId: "MAIN",
  },
  {
    id: "manikin-05",
    position: { x: 4.8, y: 0, z: 0 },
    rotationY: 0,
    tableId: "MAIN",
  },
] as const;

export type BackgroundPosterConfig = {
  id: string;
  /** TEXT.MANIKIN_INFO 참조 인덱스 */
  manikinInfoIndex: number;
  /** 포스터 X 위치 */
  positionX: number;
  /** 포스터가 붙을 테이블 (기본값: MAIN) */
  tableId?: keyof typeof BACKGROUND_TABLES;
};

export const BACKGROUND_POSTERS: readonly BackgroundPosterConfig[] = [
  { id: "poster-01", manikinInfoIndex: 0, positionX: -4.8, tableId: "MAIN" },
  { id: "poster-02", manikinInfoIndex: 1, positionX: -2.4, tableId: "MAIN" },
  { id: "poster-03", manikinInfoIndex: 2, positionX: 0, tableId: "MAIN" },
  { id: "poster-04", manikinInfoIndex: 3, positionX: 2.4, tableId: "MAIN" },
  { id: "poster-05", manikinInfoIndex: 4, positionX: 4.8, tableId: "MAIN" },
] as const;
