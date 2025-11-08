/**
 * 배치 가능한 3D 모델 타입 정의
 */

export interface ModelType {
  id: string;
  name: string;
  description: string;
  type: 'box' | 'model'; // 모델 타입: 기본 도형 또는 외부 모델
  modelPath?: string; // 외부 모델일 경우 경로
  icon: string; // emoji 또는 icon
  color: number; // THREE.js color hex
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  previewDimensions?: {
    width: number;
    height: number;
    depth: number;
  };
}

/**
 * 사용 가능한 박스 모델 타입 리스트
 */
export const AVAILABLE_MODELS: ModelType[] = [
  {
    id: 'small-box',
    name: '작은 박스',
    description: '1x1x1 크기의 작은 박스',
    type: 'box',
    icon: '📦',
    color: 0xcccccc,
    dimensions: { width: 1, height: 1, depth: 1 },
  },
  {
    id: 'medium-box',
    name: '중간 박스',
    description: '1.5x1.5x1.5 크기의 중간 박스',
    type: 'box',
    icon: '📦',
    color: 0x99ccff,
    dimensions: { width: 1.5, height: 1.5, depth: 1.5 },
  },
  {
    id: 'large-box',
    name: '큰 박스',
    description: '2x2x2 크기의 큰 박스',
    type: 'box',
    icon: '📦',
    color: 0xff9999,
    dimensions: { width: 2, height: 2, depth: 2 },
  },
  {
    id: 'table',
    name: '테이블',
    description: '2x1x1.5 크기의 테이블 형태',
    type: 'box',
    icon: '🪑',
    color: 0x8B4513,
    dimensions: { width: 2, height: 1, depth: 1.5 },
  },
  {
    id: 'platform',
    name: '플랫폼',
    description: '3x0.5x2 크기의 낮은 플랫폼',
    type: 'box',
    icon: '🟫',
    color: 0x666666,
    dimensions: { width: 3, height: 0.5, depth: 2 },
  },
  {
    id: 'tall-box',
    name: '세로 박스',
    description: '1x3x1 크기의 세로 박스',
    type: 'box',
    icon: '📦',
    color: 0xffcc99,
    dimensions: { width: 1, height: 3, depth: 1 },
  },
];


/**
 * 사용 가능한 마네킹 모델 타입 리스트
 */
export const AVAILABLE_MANIKINS: ModelType[] = [
  {
    id: 'manikin-standard',
    name: '마네킹 (황인)',
    description: '황인 계열 피부톤의 성인 마네킹',
    type: 'model',
    modelPath: '/manikin-showroom/manikin.obj',
    icon: '🧑',
    color: 0xE0A372, // 황인 피부톤
    dimensions: { width: 1.5, height: 4, depth: 0.75 }, // 실제 모델 크기 근사치
    previewDimensions: { width: 2, height: 2, depth: 2 },
  },
  {
    id: 'manikin-red',
    name: '마네킹 (백인)',
    description: '밝은 백인 피부톤의 성인 마네킹',
    type: 'model',
    modelPath: '/manikin-showroom/manikin.obj',
    icon: '🧑',
    color: 0xF5CBAA,
    dimensions: { width: 1.5, height: 4, depth: 0.75 },
    previewDimensions: { width: 2, height: 2, depth: 2 },
  },
  {
    id: 'manikin-blue',
    name: '마네킹 (흑인)',
    description: '흑인 피부톤의 성인 마네킹',
    type: 'model',
    modelPath: '/manikin-showroom/manikin.obj',
    icon: '🧑',
    color: 0x8D5524,
    dimensions: { width: 1.5, height: 4, depth: 0.75 },
    previewDimensions: { width: 2, height: 2, depth: 2 },
  },
];
