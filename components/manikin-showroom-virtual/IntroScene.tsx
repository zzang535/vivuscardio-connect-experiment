"use client";

import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface IntroSceneProps {
  isActive: boolean;
  onComplete: () => void;
}

export default function IntroScene({ isActive, onComplete }: IntroSceneProps) {
  const { camera, scene } = useThree();
  const startTime = useRef<number>(0);
  const hasStarted = useRef(false);
  const hasCompleted = useRef(false);

  // 인트로 시작 시 초기화
  useEffect(() => {
    if (isActive && !hasStarted.current) {
      hasStarted.current = true;
      startTime.current = Date.now();

      // 배경을 밝게 설정
      scene.background = new THREE.Color(0xf0f0f0);

      // 카메라 초기 위치 (가까운 정면)
      camera.position.set(0, 1.5, 3);
      camera.lookAt(0, 1, 0);
    }
  }, [isActive, camera, scene]);

  // 애니메이션 프레임
  useFrame(() => {
    if (!isActive || !hasStarted.current || hasCompleted.current) return;

    const elapsed = (Date.now() - startTime.current) / 1000; // 초 단위
    const duration = 13; // 13초로 연장 (줌인 3초 + 오비트 10초)

    if (elapsed >= duration) {
      // 인트로 애니메이션 완료 - 마지막 상태 고정
      hasCompleted.current = true;

      // 최종 상태 설정 (오비트 마지막 위치)
      const finalAngle = Math.PI * 2; // 360도
      const radius = 2;
      camera.position.x = Math.sin(finalAngle) * radius; // 0
      camera.position.y = 1.5;
      camera.position.z = Math.cos(finalAngle) * radius; // 2 (원래 위치로 돌아옴)
      camera.lookAt(0, 1, 0);

      onComplete();
      return;
    }

    // 카메라 줌인 (2초 ~ 5초)
    if (elapsed >= 2 && elapsed < 5) {
      const zoomProgress = (elapsed - 2) / 3;
      const startZ = 3;
      const endZ = 2;
      camera.position.z = THREE.MathUtils.lerp(startZ, endZ, zoomProgress);
      camera.position.x = 0;
      camera.position.y = 1.5;
      camera.lookAt(0, 1, 0);
    }
    // 카메라 오비트 (5초 ~ 13초, 360도 회전)
    else if (elapsed >= 5) {
      const orbitProgress = (elapsed - 5) / 8; // 8초 동안
      const radius = 2;

      // 줌인 끝 위치(0, 1.5, 2)에서 시작하여 360도 회전
      // 시작 각도: 0도 (z=2, x=0 위치)
      const angle = orbitProgress * Math.PI * 2; // 0 ~ 360도

      camera.position.x = Math.sin(angle) * radius;
      camera.position.y = 1.5;
      camera.position.z = Math.cos(angle) * radius;
      camera.lookAt(0, 1, 0);
    }
  });

  return null;
}
