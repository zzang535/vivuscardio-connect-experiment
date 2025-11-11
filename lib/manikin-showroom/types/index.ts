export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

export interface ModelType {
  id: string;
  name: string;
  description: string;
  type: "box" | "model";
  modelPath?: string;
  icon: string;
  color: number;
  dimensions: Dimensions;
  previewDimensions?: Dimensions;
}

export interface StoredObjectData {
  id: string;
  modelTypeId?: string;
  type: "box" | "model";
  color: number;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  placementDimensions: Dimensions;
  previewDimensions?: Dimensions;
}

export interface ShowroomRecord {
  name: string;
  manikinShowroomObjects: StoredObjectData[] | null;
  createdAt: string;
  updatedAt: string;
}
