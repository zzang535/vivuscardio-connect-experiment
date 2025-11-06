"use client";

import { useEffect, useRef, useState } from "react";
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
  loadAEDModelOnTable,
  createLogoBanner,
} from "@/lib/manikin-showroom/objects";

export default function ShowroomScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  
  // 모든 객체 로딩 상태 추적
  const loadingStateRef = useRef({
    manikins: false,
    aedModel: false,
    logoBanner: false,
  });
  const [isLoading, setIsLoading] = useState(true);

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

    // 모든 객체 로딩 상태 초기화
    loadingStateRef.current = {
      manikins: false,
      aedModel: false,
      logoBanner: false,
    };
    
    // 로딩 상태 설정
    setIsLoading(true);
    
    // 모든 객체 로딩 완료 확인 함수
    const checkAllLoaded = () => {
      const { manikins, aedModel, logoBanner } = loadingStateRef.current;
      if (manikins && aedModel && logoBanner) {
        // 모든 객체 로딩 완료 - 다음 프레임에 로딩 화면을 숨기도록 약간의 지연 추가 (부드러운 전환)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsLoading(false);
            console.log("=== All objects loaded successfully ===");
          });
        });
      }
    };

    // 로고 배너 생성 (마네킹 뒤쪽에 배치, 지면에 닿도록)
    const table1Width = 13;
    // positionY는 함수 내부에서 계산되므로 임시 값 전달 (실제로는 받침대를 기준으로 계산됨)
    const bannerZ = -8; // 마네킹 뒤쪽 (Z축 음수)
    createLogoBanner(scene, 0, 0, bannerZ, 15, 8, () => {
      // 로고 배너 로드 완료
      loadingStateRef.current.logoBanner = true;
      checkAllLoaded();
    }); // 크기: 15 x 8, Y 위치는 함수 내부에서 지면 기준으로 계산

    // 첫 번째 테이블 생성 (가로 방향, 길이 13)
    const table1 = createTable(table1Width, CONSTANTS.TABLE_SIZE.HEIGHT, CONSTANTS.TABLE_SIZE.DEPTH);
    scene.add(table1);
    console.log("Table 1 created at Y:", CONSTANTS.TABLE_POSITION.Y, "width:", table1Width);

    // 두 번째 테이블 생성 (세로 방향, L자 형태로 배치, 길이는 반으로)
    const table2Width = table1Width / 2; // 첫 번째 테이블 길이의 반
    const table2 = createTable(
      table2Width, // 길이를 반으로
      CONSTANTS.TABLE_SIZE.HEIGHT, // 높이는 동일
      CONSTANTS.TABLE_SIZE.DEPTH // 깊이는 동일
    );
    // 두 번째 테이블을 90도 회전시켜 세로 방향으로 만들고
    // 첫 번째 테이블의 오른쪽 끝과 겹치도록 배치하여 L자 형태 만듦
    // 회전 후: WIDTH(table2Width) → DEPTH, DEPTH(1.5) → WIDTH
    const table1HalfWidth = table1Width / 2; // 첫 번째 테이블의 반 너비
    const table2RotatedWidth = CONSTANTS.TABLE_SIZE.DEPTH / 2; // 회전 후 두 번째 테이블의 반 너비 (0.75)
    const table2RotatedDepth = table2Width / 2; // 회전 후 두 번째 테이블의 반 깊이
    
    // 두 번째 테이블의 중심 위치 계산
    // X: 첫 번째 테이블의 오른쪽 끝 - 두 번째 테이블의 반 너비 (겹치도록)
    // Z: 첫 번째 테이블의 앞쪽으로 배치하여 L자 형태 만듦
    table2.position.set(
      table1HalfWidth + table2RotatedWidth, // 겹치도록 배치
      CONSTANTS.TABLE_POSITION.Y, // 같은 높이
      table2RotatedDepth - CONSTANTS.TABLE_SIZE.DEPTH / 2 // 앞쪽으로 배치
    );
    // 두 번째 테이블을 90도 회전시켜 세로 방향으로 만듦
    table2.rotation.y = Math.PI / 2; // 90도 회전 (Y축 기준)
    
    // AED-T 테이블 색상을 빨간색(약간 죽인 톤)으로 변경
    // 원본 #CC0000에서 약간 채도와 밝기를 낮춘 #B01A1A
    if (table2.material instanceof THREE.MeshStandardMaterial) {
      table2.material.color.setHex(0xB01A1A);
    }
    
    scene.add(table2);
    console.log("Table 2 created (half width) at X:", table1HalfWidth + table2RotatedWidth, "Z:", table2RotatedDepth - CONSTANTS.TABLE_SIZE.DEPTH / 2, "rotation: 90deg, color: red (#B01A1A)");

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
        // IM17-P 마네킹(인덱스 3)의 위치를 카메라 타겟으로 설정
        const IM17_P_INDEX = 3; // IM17-P는 MANIKIN_INFO 배열의 인덱스 3
        const im17pX = positions.length > IM17_P_INDEX ? positions[IM17_P_INDEX] : 0;
        const im17pZ = 0; // 마네킹은 테이블 중앙(Z=0)에 배치됨
        
        autoAdjustCamera({
          camera,
          controls,
          manikinSize: overallSize,
          centerY,
          targetX: im17pX, // IM17-P의 X 좌표
          targetZ: im17pZ, // IM17-P의 Z 좌표 (테이블 중앙)
          manikinPositions: positions,
        });
        console.log("=== Manikins setup complete ===");

        // 두 번째 테이블 위에 AED-T 모델 로드
        const table1HalfWidthCalc = table1Width / 2;
        const table2WidthCalc = table1Width / 2;
        const table2RotatedWidthCalc = CONSTANTS.TABLE_SIZE.DEPTH / 2;
        const table2RotatedDepthCalc = table2WidthCalc / 2;
        const table2PositionX = table1HalfWidthCalc + table2RotatedWidthCalc;
        const table2PositionZ = table2RotatedDepthCalc - CONSTANTS.TABLE_SIZE.DEPTH / 2;
        const table2TopY = CONSTANTS.TABLE_POSITION.Y + CONSTANTS.TABLE_SIZE.HEIGHT / 2;

        // 마네킹 로드 완료
        loadingStateRef.current.manikins = true;
        checkAllLoaded();

        // AED-T 모델 로드 및 포스터 생성
        const table2RotationY = Math.PI / 2; // 두 번째 테이블의 회전 각도
        loadAEDModelOnTable(
          scene,
          table2PositionX,
          table2PositionZ + 1,
          table2TopY,
          Math.PI / 2 * 3,
          (modelPositionX) => {
            // AED-T 앞에 포스터 생성 (두 번째 테이블의 회전 각도 고려)
            const aedPoster = createPoster(
              "AED-T",
              "Automatic External Defibrillator\nTraining Device\nProfessional Grade",
              modelPositionX,
              table2RotationY, // 테이블 회전 각도 전달
              table2PositionZ + 1 // 테이블 Z 위치 전달
            );
            scene.add(aedPoster);
            console.log(`Created poster for AED-T at X: ${modelPositionX.toFixed(2)}, Z: ${(table2PositionZ + 1).toFixed(2)}, rotation: ${table2RotationY.toFixed(2)}`);
            
            // AED-T 모델 로드 완료
            loadingStateRef.current.aedModel = true;
            checkAllLoaded();
          }
        );
      },
      (progress) => {
        if (progress.total > 0) {
          const percent = ((progress.loaded / progress.total) * 100).toFixed(0);
          console.log(`Loading progress: ${percent}% (${progress.loaded}/${progress.total} bytes)`);
        }
      },
      (error) => {
        console.error("=== Error loading manikin ===", error);
        // 에러 발생 시에도 로딩 상태 업데이트 (로딩 화면이 계속 표시되지 않도록)
        loadingStateRef.current.manikins = true;
        checkAllLoaded();
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
    <>
      {/* 3D 씬 컨테이너 */}
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
      
      {/* 로딩 화면 */}
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(42, 42, 42, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            color: '#ffffff',
          }}
        >
          {/* 로딩 스피너 */}
          <div
            style={{
              width: '50px',
              height: '50px',
              border: '4px solid rgba(255, 255, 255, 0.3)',
              borderTop: '4px solid #ffffff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '20px',
            }}
          />
          
          {/* 로딩 텍스트 */}
          <div
            style={{
              fontSize: '18px',
              fontWeight: '500',
              letterSpacing: '0.5px',
            }}
          >
            Loading 3D Models...
          </div>
          
          {/* CSS 애니메이션 */}
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
