import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { IPAD_MODEL_PATH } from "../assets";

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

  const coneGeometry = new THREE.ConeGeometry(0.3, 0.6, 8);
  const coneMaterial = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.5,
  });
  const cone = new THREE.Mesh(coneGeometry, coneMaterial);
  cone.rotation.x = Math.PI;

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

  arrowGroup.userData.animationOffset = Math.random() * Math.PI * 2;
  arrowGroup.userData.type = "clickIndicator";

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
    IPAD_MODEL_PATH,
    (gltf) => {
      console.log("=== iPad GLB file loaded successfully ===");
      const ipadModel = gltf.scene;

      ipadModel.scale.set(0.3, 0.3, 0.3);

      ipadModel.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });

      ipadModel.userData.isClickable = true;
      ipadModel.userData.type = "ipad";

      const box = new THREE.Box3().setFromObject(ipadModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      ipadModel.position.x = tablePositionX - center.x;
      ipadModel.position.y = tableTopY - center.y + size.y / 2;
      ipadModel.position.z = tablePositionZ - center.z;

      ipadModel.rotation.x = -Math.PI / 2;

      scene.add(ipadModel);
      console.log(
        "iPad model positioned on table at Y:",
        ipadModel.position.y.toFixed(2),
        "rotation X:",
        ipadModel.rotation.x.toFixed(2),
        "rotation Y:",
        rotationY.toFixed(2),
        "scale: 0.3"
      );

      const arrowPosition = new THREE.Vector3(
        ipadModel.position.x,
        ipadModel.position.y + 1.5,
        ipadModel.position.z
      );
      const clickIndicator = createClickIndicatorArrow(arrowPosition);
      scene.add(clickIndicator);

      ipadModel.userData.clickIndicator = clickIndicator;

      console.log("Click indicator arrow added above iPad");

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
