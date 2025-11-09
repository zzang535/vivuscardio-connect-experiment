import type { Dimensions } from "./objectControl";

export interface StoredObjectData {
  id: string;
  modelTypeId?: string;
  type: 'box' | 'model';
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
