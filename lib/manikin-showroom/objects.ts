/**
 * 3D Objects 생성 유틸리티
 * Three.js 오브젝트들을 생성하는 함수 모음
 */

import * as THREE from "three";
import * as CONSTANTS from "./constants";

/**
 * Canvas를 사용하여 텍스트 텍스처 생성
 * @param title 상단에 표시할 제목 (큰 폰트)
 * @param description 하단에 표시할 설명 (작은 폰트, 여러 줄 가능)
 * @returns Three.js Texture 객체
 */
function createTextTexture(title: string, description: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to get canvas context");
  }

  // Canvas 크기 설정
  canvas.width = 512;
  canvas.height = 256;

  // 배경 그리기
  context.fillStyle = CONSTANTS.POSTER_STYLE.BACKGROUND_COLOR;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 테두리 그리기
  context.strokeStyle = "#cccccc";
  context.lineWidth = 4;
  context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  // 제목 텍스트 (상단, 큰 폰트)
  context.fillStyle = CONSTANTS.POSTER_STYLE.TEXT_COLOR;
  context.font = `bold ${CONSTANTS.POSTER_STYLE.TITLE_TEXT_SIZE}px ${CONSTANTS.POSTER_STYLE.FONT_FAMILY}`;
  context.textAlign = "center";
  context.textBaseline = "top";
  context.fillText(title, canvas.width / 2, 30);

  // 설명 텍스트 (하단, 작은 폰트, 여러 줄 지원)
  context.font = `${CONSTANTS.POSTER_STYLE.DESCRIPTION_TEXT_SIZE}px ${CONSTANTS.POSTER_STYLE.FONT_FAMILY}`;
  context.textBaseline = "top";
  
  const descriptionLines = description.split('\n');
  const lineHeight = CONSTANTS.POSTER_STYLE.DESCRIPTION_TEXT_SIZE + 8;
  const startY = canvas.height - (descriptionLines.length * lineHeight) - 30;
  
  descriptionLines.forEach((line, index) => {
    context.fillText(line, canvas.width / 2, startY + (index * lineHeight));
  });

  // 텍스처 생성
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
}

/**
 * 포스터 메쉬 생성
 * @param title 포스터 상단에 표시할 제목 (큰 폰트)
 * @param description 포스터 하단에 표시할 설명 (작은 폰트)
 * @param positionX X 위치 (마네킹 위치에 맞춤)
 * @returns Three.js Mesh 객체
 */
export function createPoster(title: string, description: string, positionX: number): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(
    CONSTANTS.POSTER_SIZE.WIDTH,
    CONSTANTS.POSTER_SIZE.HEIGHT
  );

  const texture = createTextTexture(title, description);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: false,
  });

  const poster = new THREE.Mesh(geometry, material);

  // 테이블 앞면에 배치 (테이블 면 안쪽으로 딱 붙임)
  const tableTopY = CONSTANTS.TABLE_POSITION.Y + CONSTANTS.TABLE_SIZE.HEIGHT / 2;
  const posterY = tableTopY + CONSTANTS.POSTER_STYLE.HEIGHT_OFFSET;
  // 테이블 앞면은 Z = DEPTH/2 위치, 포스터를 면 안쪽으로 붙이기 위해 약간 안쪽으로 배치
  const posterZ = CONSTANTS.TABLE_SIZE.DEPTH / 2 - CONSTANTS.POSTER_STYLE.FRONT_OFFSET;

  poster.position.set(positionX, posterY, posterZ);
  poster.rotation.y = 0; // 정면을 향하도록

  return poster;
}

/**
 * 지면 메쉬 생성
 * @returns Three.js Mesh 객체
 */
export function createGround(): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(
    CONSTANTS.GROUND_SIZE.WIDTH,
    CONSTANTS.GROUND_SIZE.HEIGHT
  );

  const material = new THREE.MeshStandardMaterial({
    color: CONSTANTS.GROUND_MATERIAL.COLOR,
    roughness: CONSTANTS.GROUND_MATERIAL.ROUGHNESS,
    metalness: CONSTANTS.GROUND_MATERIAL.METALNESS,
  });

  const ground = new THREE.Mesh(geometry, material);
  ground.rotation.x = -Math.PI / 2; // X축을 90도 회전하여 수평면으로 만듦
  ground.position.set(0, CONSTANTS.GROUND_POSITION.Y, 0);
  ground.receiveShadow = true; // 그림자만 받음 (그림자를 투사하지 않음)

  return ground;
}

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
 * @param xPosition X축 위치 (기본값: 0, 중앙)
 * @returns 배치된 마네킹의 중심 Y 좌표
 */
export function positionManikinOnTable(manikin: THREE.Object3D, xPosition: number = 0): number {
  // Bounding box 계산
  const box = new THREE.Box3().setFromObject(manikin);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  console.log("Model center:", center.x.toFixed(2), center.y.toFixed(2), center.z.toFixed(2));
  console.log("Model size:", size.x.toFixed(2), size.y.toFixed(2), size.z.toFixed(2));

  // 테이블 상단 위치 계산
  const tableTopY = CONSTANTS.TABLE_POSITION.Y + CONSTANTS.TABLE_SIZE.HEIGHT / 2;

  // 마네킹을 지정된 X 위치에 배치, Y축은 테이블 위에 놓이도록 조정
  manikin.position.x = xPosition - center.x;
  manikin.position.y = tableTopY - center.y + size.y / 2 + CONSTANTS.MANIKIN_TABLE_OFFSET;
  manikin.position.z = -center.z;

  console.log("Manikin positioned on table at X:", manikin.position.x.toFixed(2), "Y:", manikin.position.y.toFixed(2));

  // 마네킹의 중심 Y 좌표 반환 (카메라 타겟용)
  return tableTopY + size.y / 2;
}

/**
 * 여러 마네킹을 테이블 위에 일정 간격으로 배치
 * @param manikins 마네킹 Object3D 배열
 * @returns 배치된 마네킹들의 중심 Y 좌표와 X 위치 배열
 */
export function positionMultipleManikinsOnTable(manikins: THREE.Object3D[]): { centerY: number; positions: number[] } {
  if (manikins.length === 0) return { centerY: 0, positions: [] };

  // 첫 번째 마네킹의 크기로 계산 (모든 마네킹이 같은 크기라고 가정)
  const box = new THREE.Box3().setFromObject(manikins[0]);
  const size = box.getSize(new THREE.Vector3());
  const tableTopY = CONSTANTS.TABLE_POSITION.Y + CONSTANTS.TABLE_SIZE.HEIGHT / 2;

  // 테이블 사용 가능한 공간 (여백 포함)
  const usableWidth = CONSTANTS.TABLE_SIZE.WIDTH * 0.8; // 테이블의 80% 사용
  
  // 마네킹 간격 계산
  const spacing = usableWidth / (manikins.length - 1 || 1);
  const startX = -usableWidth / 2;

  const positions: number[] = [];

  // 각 마네킹 배치
  manikins.forEach((manikin, index) => {
    const xPosition = startX + (index * spacing);
    positionManikinOnTable(manikin, xPosition);
    positions.push(xPosition);
  });

  console.log(`Positioned ${manikins.length} manikins with spacing: ${spacing.toFixed(2)}`);

  return { centerY: tableTopY + size.y / 2, positions };
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

  // 카메라 위치 설정 - 정면 뷰 (Z축 양수 방향, 마네킹 중앙 높이 + 오프셋)
  const cameraY = centerY + CONSTANTS.AUTO_CAMERA.HEIGHT_OFFSET;
  camera.position.set(
    0, // X: 중앙
    cameraY, // Y: 마네킹 중앙 높이 + 오프셋 (오프셋을 높이면 카메라가 위로 올라감)
    cameraDistance // Z: 정면에서 충분한 거리
  );
  camera.lookAt(0, centerY, 0); // 마네킹 중앙을 바라봄

  // OrbitControls 타겟 설정
  controls.target.set(0, centerY, 0);
  controls.update();

  console.log("Camera position (front view):", camera.position.x.toFixed(2), camera.position.y.toFixed(2), camera.position.z.toFixed(2));
  console.log("Camera target Y:", centerY.toFixed(2));
  console.log("Camera height offset:", CONSTANTS.AUTO_CAMERA.HEIGHT_OFFSET);
}
