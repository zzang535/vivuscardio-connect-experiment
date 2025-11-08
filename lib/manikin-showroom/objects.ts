/**
 * 3D Objects 생성 유틸리티
 * Three.js 오브젝트들을 생성하는 함수 모음
 */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
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
 * @param tableRotationY 테이블의 Y축 회전 각도 (라디안, 기본값: 0)
 * @param tablePositionZ 테이블의 Z 위치 (기본값: 0)
 * @returns Three.js Mesh 객체
 */
export function createPoster(
  title: string,
  description: string,
  positionX: number,
  tableRotationY: number = 0,
  tablePositionZ: number = 0
): THREE.Mesh {
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
  
  // 테이블 회전 각도를 고려하여 포스터 위치 계산
  // 회전이 없으면: Z = DEPTH/2 위치 (앞면, 정면에서 보임)
  // 90도 회전이면: X축 양의 방향으로 이동 (오른쪽 면, 정면에서 보임)
  const tableDepthHalf = CONSTANTS.TABLE_SIZE.DEPTH / 2;
  const offset = tableDepthHalf - CONSTANTS.POSTER_STYLE.FRONT_OFFSET;
  
  // 회전 각도를 0~2π 범위로 정규화
  const normalizedRotation = ((tableRotationY % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
  
  if (Math.abs(normalizedRotation) < 0.01 || Math.abs(normalizedRotation - Math.PI * 2) < 0.01) {
    // 첫 번째 테이블 (가로 방향, 회전 없음) - Z축 앞면에 포스터
    const posterZ = tablePositionZ + offset;
    poster.position.set(positionX, posterY, posterZ);
    poster.rotation.y = 0; // 정면을 향하도록
  } else if (Math.abs(normalizedRotation - Math.PI / 2) < 0.01) {
    // 두 번째 테이블 (세로 방향, 90도 회전) - X축 왼쪽 면에 포스터
    // 테이블이 90도 회전되면 원래 Z축 앞면이 X축 방향으로 바뀜
    // 카메라 정면에서 보면 테이블의 왼쪽 면이 보이므로, 포스터를 X축 음의 방향에 배치
    const posterX = positionX - offset;
    const posterZ = tablePositionZ;
    poster.position.set(posterX, posterY, posterZ);
    // 포스터도 -90도 회전하여 테이블 면과 평행하게 배치 (카메라 정면을 바라보도록)
    poster.rotation.y = -Math.PI / 2;
  } else if (Math.abs(normalizedRotation - Math.PI) < 0.01 || Math.abs(normalizedRotation + Math.PI) < 0.01) {
    // 180도 회전된 경우
    const posterZ = tablePositionZ - offset;
    poster.position.set(positionX, posterY, posterZ);
    poster.rotation.y = Math.PI;
  } else if (Math.abs(normalizedRotation - Math.PI * 3 / 2) < 0.01 || Math.abs(normalizedRotation + Math.PI / 2) < 0.01) {
    // 270도 회전된 경우 (또는 -90도)
    const posterX = positionX - offset;
    const posterZ = tablePositionZ;
    poster.position.set(posterX, posterY, posterZ);
    poster.rotation.y = -Math.PI / 2;
  } else {
    // 기타 회전 각도는 기본값 사용
    const posterZ = tablePositionZ + offset;
    poster.position.set(positionX, posterY, posterZ);
    poster.rotation.y = 0;
  }

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
 * @param width 테이블 너비 (기본값: TABLE_SIZE.WIDTH)
 * @param height 테이블 높이 (기본값: TABLE_SIZE.HEIGHT)
 * @param depth 테이블 깊이 (기본값: TABLE_SIZE.DEPTH)
 * @returns Three.js Mesh 객체
 */
export function createTable(
  width: number = CONSTANTS.TABLE_SIZE.WIDTH,
  height: number = CONSTANTS.TABLE_SIZE.HEIGHT,
  depth: number = CONSTANTS.TABLE_SIZE.DEPTH
): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(width, height, depth);

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
 * 단일 마네킹 객체 생성
 * @param template 원본 마네킹 3D 객체
 * @param material 적용할 재질
 * @returns 생성된 마네킹 3D 객체
 */
export function createManikin(template: THREE.Object3D, material: THREE.Material): THREE.Object3D {
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
  const tableTopY = CONSTANTS.TABLE_POSITION.Y + CONSTANTS.TABLE_SIZE.HEIGHT / 2;

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

/**
 * 여러 마네킹을 테이블 위에 일정 간격으로 배치
 * @param manikins 마네킹 Object3D 배열
 * @param tableWidth 테이블 너비 (기본값: TABLE_SIZE.WIDTH)
 * @returns 배치된 마네킹들의 중심 Y 좌표와 X 위치 배열
 */
export function positionMultipleManikinsOnTable(
  manikins: THREE.Object3D[],
  tableWidth: number = CONSTANTS.TABLE_SIZE.WIDTH
): { centerY: number; positions: number[] } {
  if (manikins.length === 0) return { centerY: 0, positions: [] };

  // 첫 번째 마네킹의 크기로 계산 (모든 마네킹이 같은 크기라고 가정)
  const box = new THREE.Box3().setFromObject(manikins[0]);
  const size = box.getSize(new THREE.Vector3());
  const tableTopY = CONSTANTS.TABLE_POSITION.Y + CONSTANTS.TABLE_SIZE.HEIGHT / 2;

  // 테이블 사용 가능한 공간 (여백 포함)
  const usableWidth = tableWidth * 0.8; // 테이블의 80% 사용
  
  // 마네킹 간격 계산 (균등하게 배치)
  const spacing = usableWidth / (manikins.length - 1 || 1);
  const startX = -usableWidth / 2;

  const positions: number[] = [];

  // 각 마네킹 배치
  manikins.forEach((manikin, index) => {
    const xPosition = startX + (index * spacing);
    positionManikinOnTable(manikin, xPosition);
    positions.push(xPosition);
  });

  console.log(`Positioned ${manikins.length} manikins on table width ${tableWidth} with spacing: ${spacing.toFixed(2)}`);

  return { centerY: tableTopY + size.y / 2, positions };
}

/**
 * 카메라 자동 조정 옵션
 */
export interface AutoAdjustCameraOptions {
  /** Three.js Camera */
  camera: THREE.PerspectiveCamera;
  /** OrbitControls */
  controls: any;
  /** 마네킹 크기 */
  manikinSize: THREE.Vector3;
  /** 바라볼 중심 Y 좌표 */
  centerY: number;
  /** 타겟 X 위치 (기본값: 0) */
  targetX?: number;
  /** 타겟 Z 위치 (기본값: 0) */
  targetZ?: number;
  /** 마네킹 X 위치 배열 (다섯번째 마네킹 위치를 카메라 X 좌표로 사용) */
  manikinPositions?: number[];
}

/**
 * 카메라를 씬에 맞게 자동 조정
 */
export function autoAdjustCamera({
  camera,
  controls,
  manikinSize,
  centerY,
  targetX = 0,
  targetZ = 0,
  manikinPositions,
}: AutoAdjustCameraOptions): void {
  // 전체 씬의 높이 고려 (테이블 + 마네킹)
  const totalHeight = manikinSize.y + CONSTANTS.TABLE_SIZE.HEIGHT + CONSTANTS.MANIKIN_TABLE_OFFSET;
  const maxDim = Math.max(manikinSize.x, totalHeight, manikinSize.z);
  console.log("Max dimension:", maxDim.toFixed(2));

  const fov = camera.fov * (Math.PI / 180);
  const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2)) * CONSTANTS.AUTO_CAMERA.DISTANCE_MULTIPLIER;

  console.log("Camera distance:", cameraDistance.toFixed(2));

  // 카메라 위치 X 좌표: 다섯번째 마네킹의 X 좌표 사용 (인덱스 4)
  // 마네킹 위치가 제공되지 않으면 타겟 X 사용
  const cameraX = manikinPositions && manikinPositions.length > 4 
    ? manikinPositions[0] // 다섯번째 마네킹 (인덱스 4)
    : targetX;

  // 카메라 위치 설정 - 정면 뷰 (Z축 양수 방향, 마네킹 중앙 높이 + 오프셋)
  const cameraY = centerY + CONSTANTS.AUTO_CAMERA.HEIGHT_OFFSET;
  camera.position.set(
    cameraX, // X: 다섯번째 마네킹의 X 좌표
    cameraY, // Y: 마네킹 중앙 높이 + 오프셋 (오프셋을 높이면 카메라가 위로 올라감)
    targetZ + cameraDistance // Z: 타겟 앞에서 충분한 거리
  );
  camera.lookAt(targetX, centerY, targetZ); // 타겟 위치는 그대로 유지

  // OrbitControls 타겟 설정
  controls.target.set(targetX, centerY, targetZ);
  controls.update();

  console.log("Camera position (front view):", camera.position.x.toFixed(2), camera.position.y.toFixed(2), camera.position.z.toFixed(2));
  console.log("Camera target:", targetX.toFixed(2), centerY.toFixed(2), targetZ.toFixed(2));
  console.log("Fifth manikin X position:", cameraX.toFixed(2));
  console.log("Camera height offset:", CONSTANTS.AUTO_CAMERA.HEIGHT_OFFSET);
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
export function createLogoBanner(
  scene: THREE.Scene,
  positionX: number = 0,
  positionY: number = 0,
  positionZ: number = -10,
  width: number = 20,
  height: number = 10,
  onLoadComplete?: () => void
): void {
  const textureLoader = new THREE.TextureLoader();
  
  textureLoader.load(
    "/manikin-showroom/VivusCardioLogo.svg",
    (texture) => {
      // SVG 비율 유지 (438:117)
      const svgAspectRatio = 438 / 117;
      const bannerAspectRatio = width / height;
      
      // 마진을 추가하기 위해 배너 크기의 85%를 사용 (좌우, 상하 각각 7.5% 마진)
      const marginRatio = 0.85;
      const logoAreaWidth = width * marginRatio;
      const logoAreaHeight = height * marginRatio;
      
      // 로고 크기 계산 (SVG 비율 유지하면서 마진 영역 내에 배치)
      let finalWidth = logoAreaWidth;
      let finalHeight = logoAreaHeight;
      
      if (bannerAspectRatio > svgAspectRatio) {
        // 배너가 더 넓으면 높이를 기준으로 조정
        finalWidth = logoAreaHeight * svgAspectRatio;
      } else {
        // 배너가 더 높으면 너비를 기준으로 조정
        finalHeight = logoAreaWidth / svgAspectRatio;
      }
      
      // 텍스처 설정
      texture.flipY = true; // 올바른 방향으로 표시
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.premultiplyAlpha = false; // 투명도 처리 개선 (투명 영역이 검정색으로 보이는 문제 해결)
      
      // 배경 재질 생성 (배너 판자) - 흰색으로 복원
      // MeshBasicMaterial을 사용하여 조명에 영향받지 않고 항상 흰색으로 표시
      const backgroundMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff, // 흰색으로 복원
        side: THREE.DoubleSide,
      });
      
      // 로고 텍스처 재질 생성 (원본 색상 유지, 투명도 처리)
      // MeshBasicMaterial을 사용하여 조명에 영향받지 않고 원본 색상 유지
      const logoMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true, // 투명도 활성화
        opacity: 1.0,
        side: THREE.DoubleSide,
        alphaTest: 0.1, // 투명한 픽셀 제거
        // color를 설정하지 않아 원본 SVG 색상 유지
      });
      
      // 배너 받침대 생성 (검정색 직육면체)
      const standWidth = width + 0.5; // 배너보다 약간 넓게
      const standHeight = 0.3; // 받침대 높이
      const standDepth = 0.5; // 받침대 깊이
      const standGeometry = new THREE.BoxGeometry(standWidth, standHeight, standDepth);
      const standMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000, // 검정색
        side: THREE.DoubleSide,
      });
      const stand = new THREE.Mesh(standGeometry, standMaterial);
      
      // 받침대 하단이 지면에 닿도록 위치 계산
      const groundY = CONSTANTS.GROUND_POSITION.Y; // 지면 Y 위치
      const standY = groundY + standHeight / 2; // 받침대 중앙 = 지면 + 받침대 높이/2
      stand.position.set(positionX, standY, positionZ);
      
      // 배너 배경 판자 생성 (흰색)
      // 배너 하단이 받침대 상단에 닿도록 배치
      const backgroundGeometry = new THREE.PlaneGeometry(width, height);
      const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
      const backgroundY = standY + standHeight / 2 + height / 2; // 받침대 상단 + 배너 높이/2
      background.position.set(positionX, backgroundY, positionZ);
      
      // positionY를 업데이트하여 로고도 같은 높이에 배치
      const updatedPositionY = backgroundY;
      // MeshBasicMaterial은 그림자를 지원하지 않음
      
      // 로고 메쉬 생성 (배경보다 약간 앞에 배치)
      const logoGeometry = new THREE.PlaneGeometry(finalWidth, finalHeight);
      const logo = new THREE.Mesh(logoGeometry, logoMaterial);
      logo.position.set(positionX, updatedPositionY, positionZ + 0.01); // 배경보다 0.01 앞에 배치
      // MeshBasicMaterial은 그림자를 지원하지 않음
      
      scene.add(stand);
      scene.add(background);
      scene.add(logo);
      console.log(`Logo banner created at (${positionX.toFixed(2)}, ${positionY.toFixed(2)}, ${positionZ.toFixed(2)}), background size: ${width.toFixed(2)} x ${height.toFixed(2)}, logo size: ${finalWidth.toFixed(2)} x ${finalHeight.toFixed(2)}, stand size: ${standWidth.toFixed(2)} x ${standHeight.toFixed(2)} x ${standDepth.toFixed(2)}`);
      
      // 로드 완료 콜백 호출
      if (onLoadComplete) {
        onLoadComplete();
      }
    },
    undefined,
    (error) => {
      console.error("=== Error loading logo banner ===", error);
      // 에러 발생 시에도 콜백 호출 (로딩 상태 업데이트)
      if (onLoadComplete) {
        onLoadComplete();
      }
    }
  );
}

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
export function createClickIndicatorArrow(
  position: THREE.Vector3,
  color: number = 0x4a9eff
): THREE.Group {
  const arrowGroup = new THREE.Group();

  // 화살표 원뿔 (아래를 가리킴)
  const coneGeometry = new THREE.ConeGeometry(0.3, 0.6, 8);
  const coneMaterial = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.5,
  });
  const cone = new THREE.Mesh(coneGeometry, coneMaterial);
  cone.rotation.x = Math.PI; // 아래를 가리키도록 회전

  // 화살표 막대
  const cylinderGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
  const cylinderMaterial = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.5,
  });
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinder.position.y = 0.7;

  arrowGroup.add(cone);
  arrowGroup.add(cylinder);
  arrowGroup.position.copy(position);

  // 애니메이션을 위한 userData 설정
  arrowGroup.userData.animationOffset = Math.random() * Math.PI * 2;
  arrowGroup.userData.type = 'clickIndicator';

  return arrowGroup;
}

/**
 * 아이패드 모델을 테이블 위에 로드 및 배치
 * @param scene Three.js Scene 객체
 * @param tablePositionX 테이블의 X 위치
 * @param tablePositionZ 테이블의 Z 위치
 * @param tableTopY 테이블 상단의 Y 위치
 * @param rotationY Y축 회전 각도 (라디안, 기본값: 0)
 * @param onLoadComplete 모델 로드 완료 후 호출되는 콜백 함수
 */
export function loadIPadModelOnTable(
  scene: THREE.Scene,
  tablePositionX: number,
  tablePositionZ: number,
  tableTopY: number,
  rotationY: number = 0,
  onLoadComplete?: (modelPositionX: number) => void
): void {
  const gltfLoader = new GLTFLoader();

  gltfLoader.load(
    "/manikin-showroom/ipad_base_basic_pbr.glb",
    (gltf) => {
      console.log("=== iPad GLB file loaded successfully ===");
      const ipadModel = gltf.scene;

      // 스케일 조정 (0.3으로 축소)
      ipadModel.scale.set(0.3, 0.3, 0.3);

      // 재질 및 그림자 설정
      ipadModel.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });

      // 클릭 가능한 객체로 표시
      ipadModel.userData.isClickable = true;
      ipadModel.userData.type = 'ipad';

      // Bounding box 계산 (스케일 적용 후)
      const box = new THREE.Box3().setFromObject(ipadModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // 테이블 위에 배치 (테이블에 딱 붙도록)
      ipadModel.position.x = tablePositionX - center.x;
      ipadModel.position.y = tableTopY - center.y + size.y / 2;
      ipadModel.position.z = tablePositionZ - center.z;

      // X축 회전 (90도 눕히기)
      ipadModel.rotation.x = -Math.PI / 2;

      // Y축 회전 적용
      // if (rotationY !== 0) {
      //   ipadModel.rotation.y = rotationY;
      // }

      scene.add(ipadModel);
      console.log("iPad model positioned on table at Y:", ipadModel.position.y.toFixed(2), "rotation X:", ipadModel.rotation.x.toFixed(2), "rotation Y:", rotationY.toFixed(2), "scale: 0.3");

      // 클릭 가능 표시 화살표 추가 (아이패드 위쪽)
      const arrowPosition = new THREE.Vector3(
        ipadModel.position.x,
        ipadModel.position.y + 1.5, // 아이패드 위 1.5 유닛
        ipadModel.position.z
      );
      const clickIndicator = createClickIndicatorArrow(arrowPosition);
      scene.add(clickIndicator);

      // 아이패드 모델에 화살표 참조 저장
      ipadModel.userData.clickIndicator = clickIndicator;

      console.log("Click indicator arrow added above iPad");

      // 로드 완료 콜백 호출
      if (onLoadComplete) {
        onLoadComplete(ipadModel.position.x);
      }
    },
    (progress) => {
      if (progress.total > 0) {
        const percent = ((progress.loaded / progress.total) * 100).toFixed(0);
        console.log(`iPad Loading progress: ${percent}%`);
      }
    },
    (error) => {
      console.error("=== Error loading iPad ===", error);
    }
  );
}

/**
 * 바닥 그리드 생성
 * @param size 그리드 전체 크기
 * @param divisions 그리드 칸 수
 * @returns Three.js GridHelper 객체
 */
export function createGrid(size: number, divisions: number): THREE.GridHelper {
  const gridHelper = new THREE.GridHelper(size, divisions);
  gridHelper.position.y = CONSTANTS.GROUND_POSITION.Y + 0.01; // 지면보다 살짝 위에 위치
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
  axesHelper.position.y = CONSTANTS.GROUND_POSITION.Y + 0.01; // 지면보다 살짝 위에 위치
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
  const labelHeight = CONSTANTS.GROUND_POSITION.Y + 0.02;
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
