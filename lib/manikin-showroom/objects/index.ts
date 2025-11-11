/**
 * 3D Objects 생성 유틸리티
 * Three.js 오브젝트들을 생성하는 함수 모음
 */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import * as CONSTANTS from "../constants";
export * from "./logoBanner";
export * from "./boxGeometry";
export * from "./iPad";
export * from "./poster";

const BOX_HEIGHT = 2;
const BOX_DEPTH = 2;
const BOX_POSITION_Y = 0;

/**
 * Canvas를 사용하여 텍스트 텍스처 생성
 * @param title 상단에 표시할 제목 (큰 폰트)
 * @param description 하단에 표시할 설명 (작은 폰트, 여러 줄 가능)
 * @returns Three.js Texture 객체
 */
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
  ground.position.set(0, 0, 0);
  ground.receiveShadow = true; // 그림자만 받음 (그림자를 투사하지 않음)

  return ground;
}

/**
 * 조명 설정 생성 및 씬에 추가
 * @param scene Three.js Scene 객체
 */
export function setupLights(scene: THREE.Scene): void {
  const ambientLight = new THREE.AmbientLight(
    0xffffff,
    CONSTANTS.AMBIENT_LIGHT.INTENSITY
  );
  scene.add(ambientLight);

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

type ManikinMaterialOptions = {
  material?: THREE.Material;
} & Partial<Pick<THREE.MeshStandardMaterialParameters, "color" | "roughness" | "metalness">>;

/**
 * 단일 마네킹 객체 생성 (재질 생성 포함)
 * @param template 원본 마네킹 3D 객체
 * @param options 재질 옵션 또는 기존 재질
 * @returns 생성된 마네킹 3D 객체
 */
export function createManikin(
  template: THREE.Object3D,
  options: ManikinMaterialOptions = {}
): THREE.Object3D {
  const material =
    options.material ??
    new THREE.MeshStandardMaterial({
      color: options.color ?? CONSTANTS.MANIKIN_MATERIAL.COLOR,
      roughness: options.roughness ?? CONSTANTS.MANIKIN_MATERIAL.ROUGHNESS,
      metalness: options.metalness ?? CONSTANTS.MANIKIN_MATERIAL.METALNESS,
    });

  const manikin = template.clone();

  manikin.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      node.material = material;
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  return manikin;
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
  const tableTopY = BOX_POSITION_Y + BOX_HEIGHT / 2;

  // 마네킹을 지정된 X 위치에 배치, Y축은 테이블 위에 딱 붙도록 조정
  // 마네킹의 바닥(bottom) = center.y - size.y / 2
  // 마네킹의 바닥을 테이블 상단에 맞추려면: position.y = tableTopY - (center.y - size.y / 2)
  // 즉: position.y = tableTopY - center.y + size.y / 2
  manikin.position.x = xPosition - center.x;
  manikin.position.y = tableTopY - center.y + size.y / 2; // 오프셋 제거하여 테이블에 딱 붙게
  manikin.position.z = -center.z;

  console.log("Manikin positioned on table at X:", manikin.position.x.toFixed(2), "Y:", manikin.position.y.toFixed(2));

  // 마네킹의 중심 Y 좌표 반환 (카메라 타겟용)
  return tableTopY + size.y / 2;
}

export interface LoadBackgroundManikinsOptions {
  scene: THREE.Scene;
  templatePath: string;
  count?: number;
  layout?: ReadonlyArray<(typeof CONSTANTS.BACKGROUND_MANIKINS)[number]>;
  onComplete?: (result: {
    template: THREE.Object3D;
    manikins: THREE.Object3D[];
    centerY: number;
    positions: number[];
  }) => void;
  onProgress?: (event: ProgressEvent<EventTarget>) => void;
  onError?: (error: unknown) => void;
}

export function loadBackgroundManikins({
  scene,
  templatePath,
  count = CONSTANTS.BACKGROUND_MANIKINS.length,
  layout = CONSTANTS.BACKGROUND_MANIKINS,
  onComplete,
  onProgress,
  onError,
}: LoadBackgroundManikinsOptions): void {
  const loader = new OBJLoader();

  loader.load(
    templatePath,
    (template) => {
      console.log("=== OBJ file loaded successfully ===");
      const manikins: THREE.Object3D[] = [];

      for (let i = 0; i < count; i++) {
        const manikin = createManikin(template);
        manikins.push(manikin);
        scene.add(manikin);
      }

      console.log(`Created ${manikins.length} manikins`);

      const fallbackLayout =
        layout[layout.length - 1] ?? {
          id: "fallback-manikin",
          position: { x: 0, y: 0, z: 0 },
          rotationY: 0,
        };

      const positions: number[] = [];
      const tableTopY = BOX_POSITION_Y + BOX_HEIGHT / 2;
      const sampleSize =
        manikins.length > 0
          ? new THREE.Box3()
              .setFromObject(manikins[0])
              .getSize(new THREE.Vector3())
          : new THREE.Vector3(0, 0, 0);

      manikins.forEach((manikin, index) => {
        const config = layout[index] ?? fallbackLayout;
        const xPosition = config.position.x;
        positionManikinOnTable(manikin, xPosition);
        if (config.position.z !== undefined) {
          manikin.position.z = config.position.z;
        }
        if (config.rotationY !== undefined) {
          manikin.rotation.y = config.rotationY;
        }
        positions.push(xPosition);
      });

      const centerY = tableTopY + sampleSize.y / 2;

      onComplete?.({ template, manikins, centerY, positions });
    },
    onProgress,
    (error) => {
      console.error("=== Error loading manikin ===", error);
      onError?.(error);
    }
  );
}

/**
 * 로고 배너 생성 (SVG 이미지 사용)
 * @param scene Three.js Scene 객체
 * @param positionX 배너의 X 위치
 * @param positionY 배너의 Y 위치
 * @param positionZ 배너의 Z 위치
 * @param width 배너 너비 (기본값: 20)
 * @param height 배너 높이 (기본값: 10)
 * @param onLoadComplete 로드 완료 콜백 함수
 */
/**
 * AED-T 모델을 테이블 위에 로드 및 배치
 * @param scene Three.js Scene 객체
 * @param tablePositionX 테이블의 X 위치
 * @param tablePositionZ 테이블의 Z 위치
 * @param tableTopY 테이블 상단의 Y 위치
 * @param rotationY Y축 회전 각도 (라디안, 기본값: 0)
 * @param onLoadComplete 모델 로드 완료 후 호출되는 콜백 함수 (포스터 생성 등에 사용)
 */
export function loadAEDModelOnTable(
  scene: THREE.Scene,
  tablePositionX: number,
  tablePositionZ: number,
  tableTopY: number,
  rotationY: number = 0,
  onLoadComplete?: (modelPositionX: number) => void
): void {
  const gltfLoader = new GLTFLoader();

  gltfLoader.load(
    "/manikin-showroom/aed-t.glb",
    (gltf) => {
      console.log("=== AED-T GLB file loaded successfully ===");
      const aedModel = gltf.scene;

      // 재질 및 그림자 설정
      aedModel.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });

      // Bounding box 계산
      const box = new THREE.Box3().setFromObject(aedModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // 테이블 위에 배치 (테이블에 딱 붙도록)
      aedModel.position.x = tablePositionX - center.x;
      aedModel.position.y = tableTopY - center.y + size.y / 2; // 오프셋 제거하여 테이블에 딱 붙게
      aedModel.position.z = tablePositionZ - center.z;

      // Y축 회전 적용
      if (rotationY !== 0) {
        aedModel.rotation.y = rotationY;
      }

      scene.add(aedModel);
      console.log("AED-T model positioned on table at Y:", aedModel.position.y.toFixed(2), "rotation Y:", rotationY.toFixed(2));

      // 로드 완료 콜백 호출 (포스터 생성 등에 사용)
      if (onLoadComplete) {
        onLoadComplete(aedModel.position.x);
      }
    },
    (progress) => {
      if (progress.total > 0) {
        const percent = ((progress.loaded / progress.total) * 100).toFixed(0);
        console.log(`AED-T Loading progress: ${percent}%`);
      }
    },
    (error) => {
      console.error("=== Error loading AED-T ===", error);
    }
  );
}

/**
 * 클릭 가능 표시를 위한 화살표 생성
 * @param position 화살표 위치
 * @param color 화살표 색상 (기본값: 0x4a9eff)
 * @returns Three.js Group 객체
 */

/**
 * 바닥 그리드 생성
 * @param size 그리드 전체 크기
 * @param divisions 그리드 칸 수
 * @returns Three.js GridHelper 객체
 */
export function createGrid(size: number, divisions: number): THREE.GridHelper {
  const gridHelper = new THREE.GridHelper(size, divisions);
  gridHelper.position.y = 0 + 0.01; // 지면보다 살짝 위에 위치
  gridHelper.material.opacity = 0.25;
  gridHelper.material.transparent = true;
  return gridHelper;
}

/**
 * 축 헬퍼 생성 (X, Y, Z 축 시각화)
 * @param size 축의 길이
 * @returns Three.js AxesHelper 객체
 */
export function createAxesHelper(size: number): THREE.AxesHelper {
  const axesHelper = new THREE.AxesHelper(size);
  axesHelper.position.y = 0 + 0.01; // 지면보다 살짝 위에 위치
  return axesHelper;
}

function createAxisLabel(text: string, color: string, size: number): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const fontSize = 64;
  canvas.width = 128;
  canvas.height = 128;
  
  if (context) {
    context.font = `bold ${fontSize}px Arial`;
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(size * 0.2, size * 0.2, 1);
  return sprite;
}

export function createAxesLabels(size: number): THREE.Object3D[] {
  const xLabel = createAxisLabel('X', '#ff0000', size);
  xLabel.position.set(size, 0.5, 0);

  const yLabel = createAxisLabel('Y', '#00ff00', size);
  yLabel.position.set(0, size + 0.5, 0);

  const zLabel = createAxisLabel('Z', '#0000ff', size);
  zLabel.position.set(0, 0.5, size);

  return [xLabel, yLabel, zLabel];
}

/**
 * 좌표 라벨 텍스처 생성
 * @param text 표시할 텍스트
 * @returns Three.js Texture 객체
 */
function createCoordinateLabelTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to get canvas context");
  }

  canvas.width = 128;
  canvas.height = 64;

  // 배경 (반투명 검정)
  context.fillStyle = "rgba(0, 0, 0, 0.7)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 텍스트 (흰색)
  context.fillStyle = "#ffffff";
  context.font = "bold 32px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * 바닥에 좌표 라벨 생성
 * @param scene Three.js Scene 객체
 * @param size 그리드 전체 크기
 * @param step 라벨 표시 간격
 * @returns 생성된 좌표 라벨 객체 배열
 */
export function createCoordinateLabels(
  scene: THREE.Scene,
  size: number,
  step: number = 5
): THREE.Object3D[] {
  const halfSize = size / 2;
  const labelHeight = 0 + 0.02;
  const labels: THREE.Object3D[] = [];

  // X축과 Z축의 좌표 생성
  for (let x = -halfSize; x <= halfSize; x += step) {
    for (let z = -halfSize; z <= halfSize; z += step) {
      // 원점(0,0)과 주요 축(X=0 또는 Z=0)에만 라벨 표시
      if ((x === 0 && z === 0) || (x === 0 && z % 10 === 0) || (z === 0 && x % 10 === 0)) {
        const labelText = `(${x},${z})`;
        const texture = createCoordinateLabelTexture(labelText);

        const geometry = new THREE.PlaneGeometry(1.5, 0.75);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide,
        });

        const label = new THREE.Mesh(geometry, material);
        label.position.set(x, labelHeight, z);
        label.rotation.x = -Math.PI / 2; // 바닥에 평평하게

        scene.add(label);
        labels.push(label);
      }
    }
  }

  console.log(`Created coordinate labels with step: ${step}`);
  return labels;
}
