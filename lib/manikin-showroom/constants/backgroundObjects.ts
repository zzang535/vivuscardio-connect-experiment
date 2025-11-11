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

const POSTER_DEFAULT_Y = 0.3;
const POSTER_MAIN_Z = 1.1;

export type BackgroundAEDConfig = {
  id: string;
  position: { x: number; y: number; z: number };
  rotationY: number;
};

export const BACKGROUND_AEDS: readonly BackgroundAEDConfig[] = [
  {
    id: "aed-main",
    position: { x: 7, y: 1, z: 6 },
    rotationY: (Math.PI / 2) * 3,
  },
] as const;

export type BackgroundPosterConfig = {
  id: string;
  title: string;
  description: string;
  position: { x: number; y: number; z: number };
  rotationY: number;
  /** 특정 장비가 로드된 후 배치해야 할 경우 장비 ID 지정 */
  equipmentId?: (typeof BACKGROUND_AEDS)[number]["id"];
};

export const BACKGROUND_POSTERS: readonly BackgroundPosterConfig[] = [
  {
    id: "poster-01",
    title: "IM16-R",
    description: "Adult CPR Training Manikin\nHigh-quality materials\nRealistic anatomy",
    position: { x: -4.8, y: POSTER_DEFAULT_Y, z: POSTER_MAIN_Z },
    rotationY: 0,
  },
  {
    id: "poster-02",
    title: "IM16-JHS",
    description: "Junior High School Manikin\nPerfect for training\nDurable construction",
    position: { x: -2.4, y: POSTER_DEFAULT_Y, z: POSTER_MAIN_Z },
    rotationY: 0,
  },
  {
    id: "poster-03",
    title: "IM16-RO",
    description: "Infant CPR Manikin\nLife-like features\nEasy to use",
    position: { x: 0, y: POSTER_DEFAULT_Y, z: POSTER_MAIN_Z },
    rotationY: 0,
  },
  {
    id: "poster-04",
    title: "IM17-P",
    description: "Professional Training Model\nAdvanced features\nIndustry standard",
    position: { x: 2.4, y: POSTER_DEFAULT_Y, z: POSTER_MAIN_Z },
    rotationY: 0,
  },
  {
    id: "poster-05",
    title: "Brayden Pro",
    description: "Professional CPR Manikin\nPremium quality\nComprehensive training",
    position: { x: 4.8, y: POSTER_DEFAULT_Y, z: POSTER_MAIN_Z },
    rotationY: 0,
  },
  {
    id: "poster-06",
    title: "AED-T",
    description:
      "Automatic External Defibrillator\nTraining Device\nProfessional Grade",
    position: { x: 5.9, y: POSTER_DEFAULT_Y, z: 6 },
    rotationY: Math.PI / 2 * 3,
    equipmentId: "aed-main",
  },
] as const;
