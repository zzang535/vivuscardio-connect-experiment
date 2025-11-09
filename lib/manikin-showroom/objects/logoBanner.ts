import * as THREE from "three";
import * as CONSTANTS from "../constants";

/**
 * 로고 배너 생성 (SVG 이미지 사용)
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
    texture => {
      const svgAspectRatio = 438 / 117;
      const bannerAspectRatio = width / height;

      const marginRatio = 0.85;
      const logoAreaWidth = width * marginRatio;
      const logoAreaHeight = height * marginRatio;

      let finalWidth = logoAreaWidth;
      let finalHeight = logoAreaHeight;

      if (bannerAspectRatio > svgAspectRatio) {
        finalWidth = logoAreaHeight * svgAspectRatio;
      } else {
        finalHeight = logoAreaWidth / svgAspectRatio;
      }

      texture.flipY = true;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.premultiplyAlpha = false;

      const backgroundMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
      });

      const logoMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide,
        alphaTest: 0.1,
      });

      const standWidth = width + 0.5;
      const standHeight = 0.3;
      const standDepth = 0.5;
      const standGeometry = new THREE.BoxGeometry(standWidth, standHeight, standDepth);
      const standMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        side: THREE.DoubleSide,
      });
      const stand = new THREE.Mesh(standGeometry, standMaterial);

      const groundY = CONSTANTS.GROUND_POSITION.Y;
      const standY = groundY + standHeight / 2;
      stand.position.set(positionX, standY, positionZ);

      const backgroundGeometry = new THREE.PlaneGeometry(width, height);
      const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
      const backgroundY = standY + standHeight / 2 + height / 2;
      background.position.set(positionX, backgroundY, positionZ);

      const logoGeometry = new THREE.PlaneGeometry(finalWidth, finalHeight);
      const logo = new THREE.Mesh(logoGeometry, logoMaterial);
      logo.position.set(positionX, backgroundY, positionZ + 0.01);

      scene.add(stand);
      scene.add(background);
      scene.add(logo);

      if (onLoadComplete) {
        onLoadComplete();
      }
    },
    undefined,
    error => {
      console.error("=== Error loading logo banner ===", error);
      if (onLoadComplete) {
        onLoadComplete();
      }
    }
  );
}
