import * as THREE from 'three';
import * as CONSTANTS from './constants';

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