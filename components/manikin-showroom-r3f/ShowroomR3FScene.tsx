"use client";

import { Canvas } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";
import { useRef, useState, Suspense } from "react";
import * as THREE from "three";
import HelperVisuals from "./HelperVisuals";
import HelperToggleButton from "./HelperToggleButton";
import ManikinModel from "./ManikinModel";
import IntroScene from "./IntroScene";
import IntroText from "./IntroText";
import SkipButton from "./SkipButton";

export default function ShowroomR3FScene() {
  const [selectedMesh, setSelectedMesh] = useState<THREE.Mesh | null>(null);
  const [showHelpers, setShowHelpers] = useState(true);
  const [isIntroActive, setIsIntroActive] = useState(true);
  const boxRef = useRef<THREE.Mesh>(null);

  const handleIntroComplete = () => {
    // 인트로 완료 - 그 상태에서 정지
    setIsIntroActive(false);
  };

  const handleSkipIntro = () => {
    // 스킵 - 그 상태에서 정지
    setIsIntroActive(false);
  };

  return (
    <div className="relative w-full h-full">
      {/* 인트로 텍스트 */}
      {/* <IntroText isActive={isIntroActive} /> */}

      {/* 스킵 버튼 */}
      <SkipButton isVisible={isIntroActive} onClick={handleSkipIntro} />

      {/* 헬퍼 토글 버튼 - 인트로 완료 후 표시 */}
      {!isIntroActive && (
        <HelperToggleButton
          showHelpers={showHelpers}
          onToggle={() => setShowHelpers(!showHelpers)}
        />
      )}

      <Canvas
        camera={{
          position: [5, 5, 5],
          fov: 50,
        }}
        shadows
      >
        {/* 인트로 씬 애니메이션 */}
        <IntroScene isActive={isIntroActive} onComplete={handleIntroComplete} />

        {/* 지면 */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
          onClick={(e) => {
            e.stopPropagation();
            setSelectedMesh(null);
          }}
        >
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#808080" />
        </mesh>

        {/* 마네킹 모델 */}
        <Suspense fallback={null}>
          <ManikinModel position={[0, 0, 0]} color={0xffd7b5} />
        </Suspense>

        {/* 박스 */}
        {/* <mesh
          ref={boxRef}
          position={[3, 0.5, 0]}
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            setSelectedMesh(boxRef.current);
          }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={selectedMesh === boxRef.current ? "#ff8040" : "#4080ff"} />
        </mesh> */}

        {/* TransformControls - 박스가 선택되었을 때만 표시 */}
        {selectedMesh && (
          <TransformControls
            object={selectedMesh}
            mode="translate"
          />
        )}

        {/* 헬퍼들 - 인트로 완료 후 표시 */}
        {!isIntroActive && (
          <HelperVisuals showHelpers={showHelpers} selectedMesh={selectedMesh} />
        )}
      </Canvas>
    </div>
  );
}
