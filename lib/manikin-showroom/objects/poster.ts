import * as THREE from "three";
import * as CONSTANTS from "../constants";

export function createPosterAtPosition(
  title: string,
  description: string,
  position: { x: number; y: number; z: number },
  rotationY: number = 0
): THREE.Mesh {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to get canvas context");
  }

  canvas.width = 512;
  canvas.height = 256;

  context.fillStyle = CONSTANTS.POSTER_STYLE.BACKGROUND_COLOR;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "#cccccc";
  context.lineWidth = 4;
  context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  context.fillStyle = CONSTANTS.POSTER_STYLE.TEXT_COLOR;
  context.font = `bold ${CONSTANTS.POSTER_STYLE.TITLE_TEXT_SIZE}px ${CONSTANTS.POSTER_STYLE.FONT_FAMILY}`;
  context.textAlign = "center";
  context.textBaseline = "top";
  context.fillText(title, canvas.width / 2, 30);

  context.font = `${CONSTANTS.POSTER_STYLE.DESCRIPTION_TEXT_SIZE}px ${CONSTANTS.POSTER_STYLE.FONT_FAMILY}`;
  context.textBaseline = "top";
  const descriptionLines = description.split("\n");
  const lineHeight = CONSTANTS.POSTER_STYLE.DESCRIPTION_TEXT_SIZE + 8;
  const startY = canvas.height - descriptionLines.length * lineHeight - 30;
  descriptionLines.forEach((line, index) => {
    context.fillText(line, canvas.width / 2, startY + index * lineHeight);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const geometry = new THREE.PlaneGeometry(
    CONSTANTS.POSTER_SIZE.WIDTH,
    CONSTANTS.POSTER_SIZE.HEIGHT
  );

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: false,
  });

  const poster = new THREE.Mesh(geometry, material);
  poster.position.set(position.x, position.y, position.z);
  poster.rotation.y = rotationY;
  return poster;
}
