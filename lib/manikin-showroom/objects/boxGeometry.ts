import * as THREE from "three";
import * as CONSTANTS from "../constants";

/**
 * 테이블 메쉬 생성
 */
export function createBoxGeometry(
  width: number = CONSTANTS.BOX_SIZE.WIDTH,
  height: number = CONSTANTS.BOX_SIZE.HEIGHT,
  depth: number = CONSTANTS.BOX_SIZE.DEPTH
): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(width, height, depth);

  const material = new THREE.MeshStandardMaterial({
    color: CONSTANTS.BOX_MATERIAL.COLOR,
    roughness: CONSTANTS.BOX_MATERIAL.ROUGHNESS,
    metalness: CONSTANTS.BOX_MATERIAL.METALNESS,
  });

  const box = new THREE.Mesh(geometry, material);
  box.position.set(0, CONSTANTS.BOX_POSITION.Y, 0);
  box.castShadow = true;
  box.receiveShadow = true;

  return box;
}
