import * as THREE from "three";
import * as CONSTANTS from "../constants";

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
