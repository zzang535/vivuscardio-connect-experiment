import * as THREE from "three";
const DEFAULT_DIMENSIONS = { width: 10, height: 2, depth: 2 } as const;
const DEFAULT_POSITION_Y = 0;
const DEFAULT_MATERIAL = {
  color: 0x8b7355,
  roughness: 0.7,
  metalness: 0.0,
} as const;

export interface BoxGeometryOptions {
  width?: number;
  height?: number;
  depth?: number;
  color?: number;
  roughness?: number;
  metalness?: number;
}

export function createBoxGeometry(options: BoxGeometryOptions = {}): THREE.Mesh {
  const width = options.width ?? DEFAULT_DIMENSIONS.width;
  const height = options.height ?? DEFAULT_DIMENSIONS.height;
  const depth = options.depth ?? DEFAULT_DIMENSIONS.depth;

  const geometry = new THREE.BoxGeometry(width, height, depth);

  const material = new THREE.MeshStandardMaterial({
    color: options.color ?? DEFAULT_MATERIAL.color,
    roughness: options.roughness ?? DEFAULT_MATERIAL.roughness,
    metalness: options.metalness ?? DEFAULT_MATERIAL.metalness,
  });

  const box = new THREE.Mesh(geometry, material);
  box.position.set(0, DEFAULT_POSITION_Y, 0);
  box.castShadow = true;
  box.receiveShadow = true;

  return box;
}
