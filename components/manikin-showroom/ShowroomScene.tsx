"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import * as CONSTANTS from "@/lib/manikin-showroom/constants";
import {
  createGround,
  createTable,
  setupLights,
  createManikinMaterial,
  positionMultipleManikinsOnTable,
  autoAdjustCamera,
  createPoster,
} from "@/lib/manikin-showroom/objects";

export default function ShowroomScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // 이미 캔버스가 있으면 제거 (중복 방지)
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    console.log("=== Three.js Scene Initialization ===");
    console.log("Container dimensions:", container.clientWidth, "x", container.clientHeight);

    // Scene 설정
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(CONSTANTS.SCENE_BACKGROUND_COLOR);
    sceneRef.current = scene;
    console.log("Scene created");

    // Camera 설정
    const camera = new THREE.PerspectiveCamera(
      CONSTANTS.CAMERA_FOV,
      container.clientWidth / container.clientHeight,
      CONSTANTS.CAMERA_CLIPPING.NEAR,
      CONSTANTS.CAMERA_CLIPPING.FAR
    );
    camera.position.set(
      CONSTANTS.INITIAL_CAMERA_POSITION.X,
      CONSTANTS.INITIAL_CAMERA_POSITION.Y,
      CONSTANTS.INITIAL_CAMERA_POSITION.Z
    );
    camera.lookAt(
      CONSTANTS.INITIAL_CAMERA_TARGET.X,
      CONSTANTS.INITIAL_CAMERA_TARGET.Y,
      CONSTANTS.INITIAL_CAMERA_TARGET.Z
    );
    cameraRef.current = camera;
    console.log("Camera created at position:", camera.position.x, camera.position.y, camera.position.z);

    // Renderer 설정
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 캔버스 스타일 설정 (중요!)
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    console.log("Renderer created and added to DOM");
    console.log("Canvas element:", renderer.domElement);
    console.log("Canvas in container:", container.contains(renderer.domElement));

    // OrbitControls 설정
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = CONSTANTS.DAMPING.ENABLED;
    controls.dampingFactor = CONSTANTS.DAMPING.FACTOR;
    controls.minDistance = CONSTANTS.CAMERA_DISTANCE.MIN;
    controls.maxDistance = CONSTANTS.CAMERA_DISTANCE.MAX;
    controls.target.set(
      CONSTANTS.INITIAL_CAMERA_TARGET.X,
      CONSTANTS.INITIAL_CAMERA_TARGET.Y,
      CONSTANTS.INITIAL_CAMERA_TARGET.Z
    );

    // 줌 설정
    controls.enableZoom = true;
    controls.zoomSpeed = CONSTANTS.CONTROL_SPEED.ZOOM;

    // 패닝 설정 (우클릭 드래그)
    controls.enablePan = true;
    controls.panSpeed = CONSTANTS.CONTROL_SPEED.PAN;

    // 회전 설정
    controls.enableRotate = true;
    controls.rotateSpeed = CONSTANTS.CONTROL_SPEED.ROTATE;

    // 터치 제스처 설정 (모바일)
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };

    // 패닝 제한: 지면 아래로 이동하지 못하도록 제한
    const minTargetY = CONSTANTS.GROUND_POSITION.Y + 0.1; // 지면보다 약간 위로 제한
    const handlePanLimit = () => {
      if (controls.target.y < minTargetY) {
        controls.target.y = minTargetY;
        controls.update();
      }
    };
    controls.addEventListener('change', handlePanLimit);

    controlsRef.current = controls;
    controls.update();

    console.log("OrbitControls initialized:");
    console.log("- enableZoom:", controls.enableZoom);
    console.log("- enableRotate:", controls.enableRotate);
    console.log("- enablePan:", controls.enablePan);
    console.log("- minDistance:", controls.minDistance);
    console.log("- maxDistance:", controls.maxDistance);
    console.log("- minTargetY (panning limit):", minTargetY);

    // 이벤트 리스너 추가 (디버깅용)
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("Wheel event detected:", e.deltaY);
    };

    const handleMouseDown = (e: MouseEvent) => {
      console.log("Mouse down:", e.button, "at", e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (e.buttons !== 0) {
        console.log("Mouse drag detected, buttons:", e.buttons);
      }
    };

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      console.log("Context menu prevented");
    };

    // 이벤트 리스너 등록
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('contextmenu', handleContextMenu);
    renderer.domElement.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

    console.log("Event listeners attached to canvas");
    console.log("Canvas size:", renderer.domElement.width, "x", renderer.domElement.height);
    console.log("Canvas position in DOM:", renderer.domElement.getBoundingClientRect());

    // 캔버스 클릭 테스트
    setTimeout(() => {
      console.log("=== Testing canvas interaction after 1 second ===");
      console.log("Canvas parent:", renderer.domElement.parentElement);
      console.log("Canvas is visible:", renderer.domElement.offsetParent !== null);
      console.log("Controls exists:", controlsRef.current !== null);
      console.log("Controls enabled:", {
        zoom: controlsRef.current?.enableZoom,
        rotate: controlsRef.current?.enableRotate,
        pan: controlsRef.current?.enablePan
      });

      // 수동으로 이벤트 테스트
      const testClick = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
        button: 0
      });
      console.log("Dispatching test mousedown event...");
      renderer.domElement.dispatchEvent(testClick);
    }, 1000);

    // 조명 설정
    setupLights(scene);

    // 지면 생성
    const ground = createGround();
    scene.add(ground);
    console.log("Ground created at Y:", CONSTANTS.GROUND_POSITION.Y);

    // 테이블 생성
    const table = createTable();
    scene.add(table);
    console.log("Table created at Y:", CONSTANTS.TABLE_POSITION.Y);

    // OBJ 모델 로드 (마네킹 5개)
    const loader = new OBJLoader();

    // 마네킹용 재질 생성
    const manikinMaterial = createManikinMaterial();

    loader.load(
      CONSTANTS.MODEL_PATH,
      (object) => {
        console.log("=== OBJ file loaded successfully ===");
        
        // 마네킹을 5개 복제
        const manikins: THREE.Object3D[] = [];
        const MANIKIN_COUNT = 5;

        for (let i = 0; i < MANIKIN_COUNT; i++) {
          const manikin = object.clone();
          
          // 재질 및 그림자 설정
          let meshCount = 0;
          manikin.traverse((node) => {
            if (node instanceof THREE.Mesh) {
              node.material = manikinMaterial;
              node.castShadow = true;
              node.receiveShadow = true;
              meshCount++;
            }
          });

          manikins.push(manikin);
          scene.add(manikin);
        }

        console.log(`Created ${MANIKIN_COUNT} manikins`);

        // 마네킹들을 테이블 위에 일정 간격으로 배치
        const { centerY, positions } = positionMultipleManikinsOnTable(manikins);

        // 각 마네킹 앞에 포스터 생성 및 배치
        positions.forEach((xPosition, index) => {
          const manikinInfo = CONSTANTS.MANIKIN_INFO[index];
          if (manikinInfo) {
            const poster = createPoster(manikinInfo.name, manikinInfo.description, xPosition);
            scene.add(poster);
            console.log(`Created poster for ${manikinInfo.name} at X: ${xPosition.toFixed(2)}`);
          }
        });

        // 모든 마네킹을 포함하는 전체 크기 계산
        const boxes = manikins.map(manikin => new THREE.Box3().setFromObject(manikin));
        const overallBox = boxes.reduce((acc, box) => acc.union(box), boxes[0]);
        const overallSize = overallBox.getSize(new THREE.Vector3());

        console.log("Overall scene size:", overallSize.x.toFixed(2), overallSize.y.toFixed(2), overallSize.z.toFixed(2));

        // 카메라 자동 조정 (전체 씬을 고려)
        autoAdjustCamera(camera, controls, overallSize, centerY);
        console.log("=== Manikins setup complete ===");
      },
      (progress) => {
        if (progress.total > 0) {
          const percent = ((progress.loaded / progress.total) * 100).toFixed(0);
          console.log(`Loading progress: ${percent}% (${progress.loaded}/${progress.total} bytes)`);
        }
      },
      (error) => {
        console.error("=== Error loading manikin ===", error);
      }
    );

    // 애니메이션 루프
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 리사이즈 핸들러
    const handleResize = () => {
      if (!container || !camera || !renderer) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // 클린업
    return () => {
      console.log("=== Cleaning up Three.js scene ===");
      window.removeEventListener("resize", handleResize);

      renderer.domElement.removeEventListener('wheel', handleWheel);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('contextmenu', handleContextMenu);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
        console.log("Canvas removed from container");
      }

      // 패닝 제한 이벤트 리스너 제거
      controls.removeEventListener('change', handlePanLimit);
      controls.dispose();
      renderer.dispose();

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });

      console.log("Cleanup complete");
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
    />
  );
}
