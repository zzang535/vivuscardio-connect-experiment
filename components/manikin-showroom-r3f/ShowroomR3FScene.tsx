"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, TransformControls } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";
import HelperVisuals from "./HelperVisuals";
import HelperToggleButton from "./HelperToggleButton";

export default function ShowroomR3FScene() {
  const [selectedMesh, setSelectedMesh] = useState<THREE.Mesh | null>(null);
  const [showHelpers, setShowHelpers] = useState(true);
  const orbitControlsRef = useRef<any>(null);
  const boxRef = useRef<THREE.Mesh>(null);

  return (
    <div className="relative w-full h-full">
      {/* 헬퍼 토글 버튼 */}
      <HelperToggleButton
        showHelpers={showHelpers}
        onToggle={() => setShowHelpers(!showHelpers)}
      />

      <Canvas
        camera={{
          position: [5, 5, 5],
          fov: 50,
        }}
      >
        {/* 조명 */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

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

        {/* 박스 */}
        <mesh
          ref={boxRef}
          position={[0.5, 0.5, 0.5]}
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            setSelectedMesh(boxRef.current);
          }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={selectedMesh === boxRef.current ? "#ff8040" : "#4080ff"} />
        </mesh>

        {/* TransformControls - 박스가 선택되었을 때만 표시 */}
        {selectedMesh && (
          <TransformControls
            object={selectedMesh}
            mode="translate"
            onMouseDown={() => {
              if (orbitControlsRef.current) {
                orbitControlsRef.current.enabled = false;
              }
            }}
            onMouseUp={() => {
              if (orbitControlsRef.current) {
                orbitControlsRef.current.enabled = true;
              }
            }}
          />
        )}

        {/* 헬퍼들 */}
        <HelperVisuals showHelpers={showHelpers} selectedMesh={selectedMesh} />

        {/* 카메라 컨트롤 */}
        <OrbitControls ref={orbitControlsRef} makeDefault />
      </Canvas>
    </div>
  );
}
