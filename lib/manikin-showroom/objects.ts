/**
 * 3D Objects 생성 유틸리티
 * Three.js 오브젝트들을 생성하는 함수 모음
 */

import * as THREE from "three";
import * as CONSTANTS from "./constants";

/**
 * 테이블 메쉬 생성
 * @returns Three.js Mesh 객체
 */
export function createTable(): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(
    CONSTANTS.TABLE_SIZE.WIDTH,
    CONSTANTS.TABLE_SIZE.HEIGHT,
    CONSTANTS.TABLE_SIZE.DEPTH
  );

  const material = new THREE.MeshStandardMaterial({
    color: CONSTANTS.TABLE_MATERIAL.COLOR,
    roughness: CONSTANTS.TABLE_MATERIAL.ROUGHNESS,
    metalness: CONSTANTS.TABLE_MATERIAL.METALNESS,
  });

  const table = new THREE.Mesh(geometry, material);
  table.position.set(0, CONSTANTS.TABLE_POSITION.Y, 0);
  table.castShadow = true;
  table.receiveShadow = true;

  return table;
}

/**
 * 조명 설정 생성 및 씬에 추가
 * @param scene Three.js Scene 객체
 */
export function setupLights(scene: THREE.Scene): void {
  // Ambient Light (전체 환경 조명)
  const ambientLight = new THREE.AmbientLight(
    0xffffff,
    CONSTANTS.AMBIENT_LIGHT.INTENSITY
  );
  scene.add(ambientLight);

  // Main Directional Light (주 조명)
  const mainLight = new THREE.DirectionalLight(
    0xffffff,
    CONSTANTS.MAIN_LIGHT.INTENSITY
  );
  mainLight.position.set(
    CONSTANTS.MAIN_LIGHT.POSITION.X,
    CONSTANTS.MAIN_LIGHT.POSITION.Y,
    CONSTANTS.MAIN_LIGHT.POSITION.Z
  );
  scene.add(mainLight);

  // Fill Light 1 (보조 조명 1)
  const fillLight1 = new THREE.DirectionalLight(
    0xffffff,
    CONSTANTS.FILL_LIGHT_1.INTENSITY
  );
  fillLight1.position.set(
    CONSTANTS.FILL_LIGHT_1.POSITION.X,
    CONSTANTS.FILL_LIGHT_1.POSITION.Y,
    CONSTANTS.FILL_LIGHT_1.POSITION.Z
  );
  scene.add(fillLight1);

  // Fill Light 2 (보조 조명 2)
  const fillLight2 = new THREE.DirectionalLight(
    0xffffff,
    CONSTANTS.FILL_LIGHT_2.INTENSITY
  );
  fillLight2.position.set(
    CONSTANTS.FILL_LIGHT_2.POSITION.X,
    CONSTANTS.FILL_LIGHT_2.POSITION.Y,
    CONSTANTS.FILL_LIGHT_2.POSITION.Z
  );
  scene.add(fillLight2);
}

/**
 * 마네킹용 재질 생성
 * @returns Three.js MeshStandardMaterial
 */
export function createManikinMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: CONSTANTS.MANIKIN_MATERIAL.COLOR,
    roughness: CONSTANTS.MANIKIN_MATERIAL.ROUGHNESS,
    metalness: CONSTANTS.MANIKIN_MATERIAL.METALNESS,
  });
}

/**
 * 마네킹을 테이블 위에 배치
 * @param manikin 마네킹 Object3D
 * @returns 배치된 마네킹의 중심 Y 좌표
 */
export function positionManikinOnTable(manikin: THREE.Object3D): number {
  // Bounding box 계산
  const box = new THREE.Box3().setFromObject(manikin);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  console.log("Model center:", center.x.toFixed(2), center.y.toFixed(2), center.z.toFixed(2));
  console.log("Model size:", size.x.toFixed(2), size.y.toFixed(2), size.z.toFixed(2));

  // 테이블 상단 위치 계산
  const tableTopY = CONSTANTS.TABLE_POSITION.Y + CONSTANTS.TABLE_SIZE.HEIGHT / 2;

  // 마네킹을 중앙 정렬하되, Y축은 테이블 위에 놓이도록 조정
  manikin.position.x = -center.x;
  manikin.position.y = tableTopY - center.y + size.y / 2 + CONSTANTS.MANIKIN_TABLE_OFFSET;
  manikin.position.z = -center.z;

  console.log("Manikin positioned on table at Y:", manikin.position.y.toFixed(2));

  // 마네킹의 중심 Y 좌표 반환 (카메라 타겟용)
  return tableTopY + size.y / 2;
}

/**
 * 카메라를 씬에 맞게 자동 조정
 * @param camera Three.js Camera
 * @param controls OrbitControls
 * @param manikinSize 마네킹 크기
 * @param centerY 바라볼 중심 Y 좌표
 */
export function autoAdjustCamera(
  camera: THREE.PerspectiveCamera,
  controls: any,
  manikinSize: THREE.Vector3,
  centerY: number
): void {
  // 전체 씬의 높이 고려 (테이블 + 마네킹)
  const totalHeight = manikinSize.y + CONSTANTS.TABLE_SIZE.HEIGHT + CONSTANTS.MANIKIN_TABLE_OFFSET;
  const maxDim = Math.max(manikinSize.x, totalHeight, manikinSize.z);
  console.log("Max dimension:", maxDim.toFixed(2));

  const fov = camera.fov * (Math.PI / 180);
  const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2)) * CONSTANTS.AUTO_CAMERA.DISTANCE_MULTIPLIER;

  console.log("Camera distance:", cameraDistance.toFixed(2));

  // 카메라 위치 설정
  camera.position.set(
    cameraDistance * 0.5,
    cameraDistance * 0.3 + centerY,
    cameraDistance
  );
  camera.lookAt(0, centerY, 0);

  // OrbitControls 타겟 설정
  controls.target.set(0, centerY, 0);
  controls.update();

  console.log("Camera position:", camera.position.x.toFixed(2), camera.position.y.toFixed(2), camera.position.z.toFixed(2));
  console.log("Camera target Y:", centerY.toFixed(2));
}
