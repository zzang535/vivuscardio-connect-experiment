"use client";

import { Canvas } from "@react-three/fiber";
import { TransformControls, OrbitControls } from "@react-three/drei";
import { useRef, useState, Suspense } from "react";
import * as THREE from "three";
import HelperVisuals from "./HelperVisuals";
import HelperToggleButton from "./HelperToggleButton";
import ManikinModel, { ManikinModelRef } from "./ManikinModel";

export default function ShowroomR3FScene() {
  const [selectedMesh, setSelectedMesh] = useState<THREE.Mesh | null>(null);
  const [showHelpers, setShowHelpers] = useState(true);
  const boxRef = useRef<THREE.Mesh>(null);
  const manikinRef = useRef<ManikinModelRef>(null);

  const handlePlayAnimation = () => {
    manikinRef.current?.playAnimation();
  };

  return (
    <div className="relative w-full h-full">
      {/* 헬퍼 토글 버튼 */}
      <HelperToggleButton
        showHelpers={showHelpers}
        onToggle={() => setShowHelpers(!showHelpers)}
      />

      {/* 흉부 압박 버튼 */}
      <button
        onClick={handlePlayAnimation}
        className="
          absolute bottom-[calc(4rem)] left-1/2 -translate-x-1/2
          w-96 h-96
          rounded-full
          bg-[#FF5252]/10
          border-4 border-[#FF5252]/40
          shadow-2xl
          hover:bg-[#FF5252]/20
          hover:border-[#FF3838]/60
          transition-all
          duration-300
          hover:scale-105
          active:scale-95
          z-10
        "
      >
      </button>

      <Canvas
        camera={{
          position: [0, 1.5, 2],
          fov: 50,
        }}
        shadows
        onCreated={({ camera, scene }) => {
          camera.lookAt(0, 1, 0);
          scene.background = new THREE.Color(0x000000);
        }}
      >
        {/* 카메라 컨트롤 */}
        <OrbitControls
          target={[0, 1, 0]}
          enableDamping
          dampingFactor={0.05}
        />

        {/* 조명 */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />

        {/* 지면 object */}
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
          <ManikinModel ref={manikinRef} position={[0, 0, 0]} color={0xffd7b5} />
        </Suspense>

        {/* TransformControls - 박스가 선택되었을 때만 표시 */}
        {selectedMesh && (
          <TransformControls
            object={selectedMesh}
            mode="translate"
          />
        )}

        {/* 헬퍼들 */}
        <HelperVisuals showHelpers={showHelpers} selectedMesh={selectedMesh} />
      </Canvas>
    </div>
  );
}
