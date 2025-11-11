"use client";

import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import * as THREE from "three";
import { useMemo } from "react";

interface ManikinModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: THREE.ColorRepresentation;
}

export default function ManikinModel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = 0xcccccc,
}: ManikinModelProps) {
  // OBJ 파일 로드
  const obj = useLoader(OBJLoader, "/manikin-showroom/manikin.obj");

  // 재질 생성 (메모이제이션)
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.8,
        metalness: 0.2,
      }),
    [color]
  );

  // 복제된 객체 생성 및 재질 적용
  const manikin = useMemo(() => {
    const cloned = obj.clone();
    cloned.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.material = material;
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return cloned;
  }, [obj, material]);

  return (
    <primitive
      object={manikin}
      position={position}
      rotation={rotation}
    />
  );
}
