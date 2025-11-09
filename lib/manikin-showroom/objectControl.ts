import * as THREE from 'three';
import * as CONSTANTS from './constants';

const DEFAULT_BOX_HEIGHT = 2;
const DEFAULT_BOX_DEPTH = 2;
const DEFAULT_BOX_POSITION_Y = 0;
import { ModelType } from './modelTypes';

interface GhostCreationOptions {
  modelTemplate?: THREE.Object3D | null;
}

/**
 * 고스트 박스 생성 (배치 모드용 반투명 미리보기 객체)
 * - 바닥면은 하늘색으로 표시되어 배치 위치를 명확히 함
 * @param scene Three.js Scene 객체
 * @param modelType 선택된 모델 타입 (옵션, 없으면 기본값 사용)
 * @returns 생성된 고스트 박스 메쉬
 */
export function createGhostBox(
  scene: THREE.Scene,
  modelType?: ModelType,
  options: GhostCreationOptions = {}
): THREE.Mesh {
  // 모델 타입이 주어지면 해당 크기 사용, 아니면 기본값
  const placementDimensions = modelType?.dimensions || {
    width: DEFAULT_BOX_DEPTH,
    height: DEFAULT_BOX_HEIGHT,
    depth: DEFAULT_BOX_DEPTH,
  };
  const previewDimensions = modelType?.previewDimensions || placementDimensions;

  const boxGeometry = new THREE.BoxGeometry(
    previewDimensions.width,
    previewDimensions.height,
    previewDimensions.depth
  );

  const previewOffsetY = (placementDimensions.height - previewDimensions.height) / 2;
  if (previewOffsetY !== 0) {
    // 미리보기 박스가 실제 높이보다 낮을 때 바닥과 맞닿도록 하단을 내린다
    boxGeometry.translate(0, -previewOffsetY, 0);
  }

  // 모델 타입이 있으면 해당 색상 사용, 없으면 기본 흰색
  const ghostColor = modelType ? modelType.color : 0xffffff;

  const faceOpacity = modelType?.type === 'model' ? 0.12 : 0.5;
  const createFaceMaterial = () => new THREE.MeshStandardMaterial({
    color: ghostColor,
    opacity: faceOpacity,
    transparent: true,
    roughness: 0.8,
    metalness: 0.2,
  });

  // 각 면마다 다른 재질 적용 (바닥면만 하늘색)
  // Three.js 박스 면 순서: [right, left, top, bottom, front, back]
  const materials = [
    // Right (오른쪽)
    createFaceMaterial(),
    // Left (왼쪽)
    createFaceMaterial(),
    // Top (윗면)
    createFaceMaterial(),
    // Bottom (바닥면) - 하늘색으로 강조
    new THREE.MeshStandardMaterial({
      color: 0x4A9EFF, // 인디케이터와 같은 하늘색
      opacity: 0.7, // 바닥면은 조금 더 진하게
      transparent: true,
      roughness: 0.8,
      metalness: 0.2,
    }),
    // Front (앞면)
    createFaceMaterial(),
    // Back (뒷면)
    createFaceMaterial(),
  ];

  const ghostBox = new THREE.Mesh(boxGeometry, materials);
  ghostBox.castShadow = true;
  ghostBox.receiveShadow = true;
  ghostBox.position.y = -1000; // 처음에는 화면 밖에 배치
  ghostBox.name = 'ghost-box';
  ghostBox.userData.placementDimensions = placementDimensions;

  if (modelType?.type === 'model' && options.modelTemplate) {
    const ghostModel = options.modelTemplate.clone();
    ghostModel.name = 'ghost-model-visual';
    ghostModel.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        const applyGhostMaterial = () =>
          new THREE.MeshStandardMaterial({
            color: ghostColor,
            opacity: 0.45,
            transparent: true,
            roughness: 0.6,
            metalness: 0.1,
          });

        if (Array.isArray(node.material)) {
          node.material = node.material.map(() => applyGhostMaterial());
        } else {
          node.material = applyGhostMaterial();
        }

        node.castShadow = false;
        node.receiveShadow = false;
      }
    });

    ghostModel.updateMatrixWorld(true);
    const modelBox = new THREE.Box3().setFromObject(ghostModel);
    const modelCenter = modelBox.getCenter(new THREE.Vector3());
    const modelSize = modelBox.getSize(new THREE.Vector3());
    ghostModel.position.sub(modelCenter);
    const heightOffset = (modelSize.y - placementDimensions.height) / 2;
    ghostModel.position.y += heightOffset;

    ghostBox.add(ghostModel);
  }

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
  // 1x1 단위 크기로 생성. 실제 크기는 scale로 조절.
  const indicatorGeometry = new THREE.PlaneGeometry(1, 1);
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
    CONSTANTS.GROUND_POSITION.Y + DEFAULT_BOX_HEIGHT / 2,
    snappedPosition.z
  );
}

export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

export function alignObjectToPlacement(
  object: THREE.Object3D,
  placementDimensions: Dimensions,
  targetPosition: THREE.Vector3
): void {
  object.updateMatrixWorld(true);
  const boundingBox = new THREE.Box3().setFromObject(object);
  const size = boundingBox.getSize(new THREE.Vector3());
  const worldCenter = boundingBox.getCenter(new THREE.Vector3());
  const localCenter = worldCenter.clone();
  object.worldToLocal(localCenter);
  const baseY = targetPosition.y - placementDimensions.height / 2;

  object.position.set(
    targetPosition.x - localCenter.x,
    baseY + size.y / 2 - localCenter.y,
    targetPosition.z - localCenter.z
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
    DEFAULT_BOX_DEPTH, // width
    DEFAULT_BOX_HEIGHT, // height
    DEFAULT_BOX_DEPTH // depth
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
  position.y = DEFAULT_BOX_POSITION_Y + DEFAULT_BOX_HEIGHT / 2 + 2;

  newBox.position.copy(position);

  scene.add(newBox);

  return newBox;
}
