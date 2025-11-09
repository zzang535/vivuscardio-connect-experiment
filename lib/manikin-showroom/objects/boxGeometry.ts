import * as THREE from "three";
import * as CONSTANTS from "../constants";

export interface BoxGeometryOptions {
  width?: number;
  height?: number;
  depth?: number;
  color?: number;
  roughness?: number;
  metalness?: number;
}

export function createBoxGeometry(options: BoxGeometryOptions = {}): THREE.Mesh {
  const width = options.width ?? CONSTANTS.BOX_SIZE.WIDTH;
  const height = options.height ?? CONSTANTS.BOX_SIZE.HEIGHT;
  const depth = options.depth ?? CONSTANTS.BOX_SIZE.DEPTH;

  const geometry = new THREE.BoxGeometry(width, height, depth);

  const material = new THREE.MeshStandardMaterial({
    color: options.color ?? CONSTANTS.BOX_MATERIAL.COLOR,
    roughness: options.roughness ?? CONSTANTS.BOX_MATERIAL.ROUGHNESS,
    metalness: options.metalness ?? CONSTANTS.BOX_MATERIAL.METALNESS,
  });

  const box = new THREE.Mesh(geometry, material);
  box.position.set(0, CONSTANTS.BOX_POSITION.Y, 0);
  box.castShadow = true;
  box.receiveShadow = true;

  return box;
}
