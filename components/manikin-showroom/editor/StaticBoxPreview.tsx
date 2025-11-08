"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface StaticBoxPreviewProps {
  size?: number;
  color?: number;
}

export default function StaticBoxPreview({
  size = 40,
  color = 0xcccccc
}: StaticBoxPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene 설정
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a2a2a);

    // Camera 설정
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(1.5, 1.5, 1.5);
    camera.lookAt(0, 0, 0);

    // Renderer 설정
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 조명 추가
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // 1x1x1 박스 생성
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.3,
      roughness: 0.6,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 테두리 추가
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      opacity: 0.3,
      transparent: true
    });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    mesh.add(wireframe);

    // 정적인 각도로 설정 (회전 없음)
    mesh.rotation.y = Math.PI / 4; // 45도
    mesh.rotation.x = -Math.PI / 6; // -30도

    // 한 번만 렌더링
    renderer.render(scene, camera);

    // 클린업
    return () => {
      geometry.dispose();
      material.dispose();
      lineMaterial.dispose();
      edges.dispose();
      renderer.dispose();
    };
  }, [size, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        borderRadius: '6px',
      }}
    />
  );
}
