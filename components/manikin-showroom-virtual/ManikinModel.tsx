"use client";

import { useGLTF, useAnimations } from "@react-three/drei";
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";

interface ManikinModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: THREE.ColorRepresentation;
}

export interface ManikinModelRef {
  playAnimation: () => void;
  stopAnimation: () => void;
}

const ManikinModel = forwardRef<ManikinModelRef, ManikinModelProps>(
  ({ position = [0, 0, 0], rotation = [0, 0, 0], color = 0xcccccc }, ref) => {
    const group = useRef<THREE.Group>(null);

    // GLB 파일 로드
    const { scene, animations } = useGLTF(
      "/manikin-showroom-virtual/manikin-with-ani.glb"
    );

    // 애니메이션 설정
    const { actions, names } = useAnimations(animations, group);

    // 재질 적용 - group의 자식들에 직접 적용
    useEffect(() => {
      if (group.current) {
        group.current.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.material = new THREE.MeshStandardMaterial({
              color,
              roughness: 0.8,
              metalness: 0.2,
            });
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
      }
    }, [color]);

    // 외부에서 애니메이션 제어할 수 있도록 ref 노출
    useImperativeHandle(ref, () => ({
      playAnimation: () => {
        if (names.length > 0 && actions[names[0]]) {
          const action = actions[names[0]];
          if (action) {
            action.reset();
            action.setLoop(THREE.LoopOnce, 1);
            action.clampWhenFinished = true;
            action.play();
          }
        }
      },
      stopAnimation: () => {
        if (names.length > 0 && actions[names[0]]) {
          actions[names[0]]?.stop();
        }
      },
    }));

    return (
      <group ref={group} position={position} rotation={rotation}>
        <primitive object={scene} />
      </group>
    );
  }
);

ManikinModel.displayName = "ManikinModel";

export default ManikinModel;

// GLB 파일 프리로드
useGLTF.preload("/manikin-showroom-virtual/manikin-with-ani.glb");
