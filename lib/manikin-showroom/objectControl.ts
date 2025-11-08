import * as THREE from 'three';
import * as CONSTANTS from './constants';
import { ModelType } from './modelTypes';

/**
 * 고스트 박스 생성 (배치 모드용 반투명 미리보기 객체)
 * - 바닥면은 하늘색으로 표시되어 배치 위치를 명확히 함
 * @param scene Three.js Scene 객체
 * @param modelType 선택된 모델 타입 (옵션, 없으면 기본값 사용)
 * @returns 생성된 고스트 박스 메쉬
 */
export function createGhostBox(scene: THREE.Scene, modelType?: ModelType): THREE.Mesh {
  // 모델 타입이 주어지면 해당 크기 사용, 아니면 기본값
  const dimensions = modelType?.dimensions || {
    width: CONSTANTS.TABLE_SIZE.DEPTH,
    height: CONSTANTS.TABLE_SIZE.HEIGHT,
    depth: CONSTANTS.TABLE_SIZE.DEPTH,
  };

  const boxGeometry = new THREE.BoxGeometry(
    dimensions.width,
    dimensions.height,
    dimensions.depth
  );

  // 각 면마다 다른 재질 적용 (바닥면만 하늘색)
  // Three.js 박스 면 순서: [right, left, top, bottom, front, back]
  const materials = [
    // Right (오른쪽)
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      opacity: 0.5,
      transparent: true,
      roughness: 0.8,
      metalness: 0.2,
    }),
    // Left (왼쪽)
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      opacity: 0.5,
      transparent: true,
      roughness: 0.8,
      metalness: 0.2,
    }),
    // Top (윗면)
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      opacity: 0.5,
      transparent: true,
      roughness: 0.8,
      metalness: 0.2,
    }),
    // Bottom (바닥면) - 하늘색으로 강조
    new THREE.MeshStandardMaterial({
      color: 0x4A9EFF, // 인디케이터와 같은 하늘색
      opacity: 0.7, // 바닥면은 조금 더 진하게
      transparent: true,
      roughness: 0.8,
      metalness: 0.2,
    }),
    // Front (앞면)
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      opacity: 0.5,
      transparent: true,
      roughness: 0.8,
      metalness: 0.2,
    }),
    // Back (뒷면)
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      opacity: 0.5,
      transparent: true,
      roughness: 0.8,
      metalness: 0.2,
    }),
  ];

  const ghostBox = new THREE.Mesh(boxGeometry, materials);
  ghostBox.castShadow = true;
  ghostBox.receiveShadow = true;
  ghostBox.position.y = -1000; // 처음에는 화면 밖에 배치
  scene.add(ghostBox);
  return ghostBox;
}

/**
 * 배치 위치 인디케이터 생성 (그리드 위에 표시되는 파란색 사각형)
 * - 박스의 바닥면과 같은 크기로 생성됨
 * @param scene Three.js Scene 객체
 * @returns 생성된 인디케이터 메쉬
 */
export function createPlacementIndicator(scene: THREE.Scene): THREE.Mesh {
  // 박스 크기와 동일하게 설정 (2x2)
  const indicatorGeometry = new THREE.PlaneGeometry(
    CONSTANTS.TABLE_SIZE.DEPTH, // width (박스와 동일)
    CONSTANTS.TABLE_SIZE.DEPTH  // height (박스와 동일)
  );
  const indicatorMaterial = new THREE.MeshBasicMaterial({
    color: 0x4A9EFF,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5
  });
  const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
  indicator.rotation.x = -Math.PI / 2; // 바닥과 평행하게
  indicator.position.y = CONSTANTS.GROUND_POSITION.Y + 0.02; // 그리드보다 살짝 위에
  scene.add(indicator);
  return indicator;
}

/**
 * 고스트 박스를 실제 배치용 객체로 변환
 * @param ghostBox 고스트 박스 메쉬
 * @param modelType 선택된 모델 타입 (옵션, 없으면 기본 회색)
 * @returns 최종 배치용 박스 메쉬
 */
export function finalizeBoxPlacement(ghostBox: THREE.Mesh, modelType?: ModelType): THREE.Mesh {
  const finalBox = ghostBox.clone();
  // 불투명한 재질로 변경 (모델 타입의 색상 사용)
  const color = modelType?.color || 0xcccccc;
  finalBox.material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.8,
    metalness: 0.2,
    transparent: false,
    opacity: 1,
  });
  return finalBox;
}

/**
 * 위치를 그리드에 스냅 (정렬)
 * @param position 원본 위치 벡터
 * @param gridSize 그리드 한 칸의 크기 (기본값: 1)
 * @returns 그리드에 정렬된 위치 벡터
 */
export function snapToGrid(position: THREE.Vector3, gridSize: number = 1): THREE.Vector3 {
  return new THREE.Vector3(
    Math.round(position.x / gridSize) * gridSize,
    position.y,
    Math.round(position.z / gridSize) * gridSize
  );
}

/**
 * 객체를 그리드에 스냅하여 배치
 * @param object 배치할 객체
 * @param position 배치할 위치
 * @param gridSize 그리드 크기
 */
export function placeObjectOnGrid(
  object: THREE.Mesh,
  position: THREE.Vector3,
  gridSize: number = 1
): void {
  const snappedPosition = snapToGrid(position, gridSize);
  object.position.set(
    snappedPosition.x,
    CONSTANTS.GROUND_POSITION.Y + CONSTANTS.TABLE_SIZE.HEIGHT / 2,
    snappedPosition.z
  );
}

/**
 * @deprecated 이 함수는 더 이상 사용되지 않습니다. createGhostBox와 finalizeBoxPlacement를 사용하세요.
 */
export function addBoxToScene(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
): THREE.Mesh {
  // 테이블과 유사한 크기 및 재질의 박스 생성
  const boxGeometry = new THREE.BoxGeometry(
    CONSTANTS.TABLE_SIZE.DEPTH, // width
    CONSTANTS.TABLE_SIZE.HEIGHT, // height
    CONSTANTS.TABLE_SIZE.DEPTH // depth
  );
  const boxMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc, // 밝은 회색
    roughness: 0.8,
    metalness: 0.2,
  });
  const newBox = new THREE.Mesh(boxGeometry, boxMaterial);

  // 그림자 설정
  newBox.castShadow = true;
  newBox.receiveShadow = true;

  // 초기 위치는 카메라 앞쪽, 테이블 위
  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);

  const distance = 5; // 카메라로부터의 거리
  const position = camera.position.clone().add(cameraDirection.multiplyScalar(distance));

  // 바닥에 떨어지지 않도록 높이 조절
  position.y = CONSTANTS.TABLE_POSITION.Y + CONSTANTS.TABLE_SIZE.HEIGHT / 2 + 2;

  newBox.position.copy(position);

  scene.add(newBox);

  return newBox;
}