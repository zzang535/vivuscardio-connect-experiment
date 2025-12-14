"use client";

import { useThree } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";

interface HelperVisualsProps {
  showHelpers: boolean;
  selectedMesh: THREE.Mesh | null;
}

export default function HelperVisuals({ showHelpers, selectedMesh }: HelperVisualsProps) {
  const { scene } = useThree();
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);
  const boxHelperRef = useRef<THREE.BoxHelper | null>(null);
  const axisLabelsRef = useRef<THREE.Sprite[]>([]);

  useEffect(() => {
    // GridHelper
    if (showHelpers && !gridHelperRef.current) {
      gridHelperRef.current = new THREE.GridHelper(20, 20);
      scene.add(gridHelperRef.current);
    } else if (!showHelpers && gridHelperRef.current) {
      scene.remove(gridHelperRef.current);
      gridHelperRef.current = null;
    }

    // AxesHelper
    if (showHelpers && !axesHelperRef.current) {
      axesHelperRef.current = new THREE.AxesHelper(5);
      scene.add(axesHelperRef.current);

      // 축 라벨 생성
      const createTextSprite = (text: string, color: string) => {
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');

        if (context) {
          context.fillStyle = color;
          context.font = 'Bold 120px Arial';
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText(text, size / 2, size / 2);
        }

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(0.5, 0.5, 1);

        return sprite;
      };

      // X축 라벨 (빨강)
      const xLabel = createTextSprite('X', '#ff0000');
      xLabel.position.set(5.5, 0.3, 0);
      scene.add(xLabel);
      axisLabelsRef.current.push(xLabel);

      // Y축 라벨 (초록)
      const yLabel = createTextSprite('Y', '#00ff00');
      yLabel.position.set(0, 5.5, 0);
      scene.add(yLabel);
      axisLabelsRef.current.push(yLabel);

      // Z축 라벨 (파랑)
      const zLabel = createTextSprite('Z', '#0000ff');
      zLabel.position.set(0, 0.3, 5.5);
      scene.add(zLabel);
      axisLabelsRef.current.push(zLabel);
    } else if (!showHelpers && axesHelperRef.current) {
      scene.remove(axesHelperRef.current);
      axesHelperRef.current = null;

      // 축 라벨 제거
      axisLabelsRef.current.forEach(label => scene.remove(label));
      axisLabelsRef.current = [];
    }

    return () => {
      if (gridHelperRef.current) scene.remove(gridHelperRef.current);
      if (axesHelperRef.current) scene.remove(axesHelperRef.current);
      axisLabelsRef.current.forEach(label => scene.remove(label));
      axisLabelsRef.current = [];
    };
  }, [showHelpers, scene]);

  // BoxHelper for selected mesh
  useEffect(() => {
    if (boxHelperRef.current) {
      scene.remove(boxHelperRef.current);
      boxHelperRef.current = null;
    }

    if (showHelpers && selectedMesh) {
      boxHelperRef.current = new THREE.BoxHelper(selectedMesh, 0xffff00);
      scene.add(boxHelperRef.current);
    }

    return () => {
      if (boxHelperRef.current) {
        scene.remove(boxHelperRef.current);
        boxHelperRef.current = null;
      }
    };
  }, [showHelpers, selectedMesh, scene]);

  // Update BoxHelper when mesh moves
  useEffect(() => {
    if (boxHelperRef.current && selectedMesh) {
      const animate = () => {
        if (boxHelperRef.current) {
          boxHelperRef.current.update();
        }
      };
      const interval = setInterval(animate, 16);
      return () => clearInterval(interval);
    }
  }, [selectedMesh]);

  return null;
}
