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
  createGrid,
} from "@/lib/manikin-showroom/objects";
import {
  type AutoMoveState,
  createAutoMoveState,
  startAutoMove,
  updateAutoMove,
  completeAutoMove,
} from "@/lib/manikin-showroom/cameraAnimation";
import {
  createGhostBox,
  createPlacementIndicator,
  finalizeBoxPlacement,
  placeObjectOnGrid,
  snapToGrid
} from "@/lib/manikin-showroom/objectControl";
import ObjectController from "./ObjectController";
import PlacementModeGuide from "./PlacementModeGuide";
import DeleteZone from "./DeleteZone";

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
  const [userAddedObjects, setUserAddedObjects] = useState<THREE.Mesh[]>([]);
  const [isPlacementMode, setIsPlacementMode] = useState(false);
  const [objectToPlace, setObjectToPlace] = useState<THREE.Mesh | null>(null);
  const placementIndicatorRef = useRef<THREE.Mesh | null>(null);

  // 편집 모드 상태 (기존 객체를 이동하는 모드)
  const [editingObject, setEditingObject] = useState<THREE.Mesh | null>(null);
  const [originalPosition, setOriginalPosition] = useState<THREE.Vector3 | null>(null);

  // 배치 모드 상태를 참조하기 위한 ref
  const isPlacementModeRef = useRef(isPlacementMode);
  isPlacementModeRef.current = isPlacementMode;
  const objectToPlaceRef = useRef(objectToPlace);
  objectToPlaceRef.current = objectToPlace;
  const editingObjectRef = useRef(editingObject);
  editingObjectRef.current = editingObject;
  const originalPositionRef = useRef(originalPosition);
  originalPositionRef.current = originalPosition;
  const userAddedObjectsRef = useRef<THREE.Mesh[]>(userAddedObjects);
  userAddedObjectsRef.current = userAddedObjects;

  // 마우스 위치를 저장할 ref (Vector2 타입 사용)
  const mouseRef = useRef(new THREE.Vector2());

  const handleAddBox = () => {
    if (isPlacementMode) return; // 이미 배치 모드이면 중복 실행 방지
    if (!sceneRef.current) return;

    setIsPlacementMode(true);

    // 고스트 박스 생성 (유틸리티 함수 사용)
    const ghostBox = createGhostBox(sceneRef.current);
    setObjectToPlace(ghostBox);

    // 배치 위치 인디케이터 생성 (한 번만)
    if (!placementIndicatorRef.current) {
      placementIndicatorRef.current = createPlacementIndicator(sceneRef.current);
    }
  };

  const handleDeleteObject = () => {
    if (!sceneRef.current || !editingObject) return;

    // 편집 중인 객체를 삭제
    sceneRef.current.remove(editingObject);
    setUserAddedObjects(prev => prev.filter(obj => obj !== editingObject));

    // 고스트 박스 제거
    if (objectToPlace) {
      sceneRef.current.remove(objectToPlace);
    }

    // 배치 인디케이터 숨김
    if (placementIndicatorRef.current) {
      placementIndicatorRef.current.visible = false;
    }

    // 상태 초기화
    setObjectToPlace(null);
    setEditingObject(null);
    setOriginalPosition(null);
    setIsPlacementMode(false);

    // 변경사항 저장
    setUserAddedObjects(prev => {
      const updatedObjects = prev.filter(obj => obj !== editingObject);
      saveObjectsToStorage(updatedObjects);
      return updatedObjects;
    });
  };

  // 자동 카메라 무빙 상태 추적
  const [isAutoMoving, setIsAutoMoving] = useState(false);
  const autoMoveRef = useRef<AutoMoveState>(createAutoMoveState());

  // 오브젝트 저장/로딩 함수들
  const saveObjectsToStorage = (objects: THREE.Mesh[]) => {
    try {
      const objectsData = objects.map(obj => ({
        id: obj.uuid,
        type: 'box', // 현재는 박스만 지원
        position: obj.position.toArray(),
        rotation: obj.rotation.toArray(),
        scale: obj.scale.toArray(),
      }));
      localStorage.setItem('manikinShowroomObjects', JSON.stringify(objectsData));
    } catch (error) {
      console.error('Failed to save objects:', error);
    }
  };

  const loadObjectsFromStorage = (): THREE.Mesh[] => {
    try {
      const savedData = localStorage.getItem('manikinShowroomObjects');
      if (!savedData || !sceneRef.current) return [];

      const objectsData = JSON.parse(savedData);
      const loadedObjects: THREE.Mesh[] = [];

      objectsData.forEach((data: any) => {
        // 박스 오브젝트 재생성
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
          color: 0x4A9EFF,
          transparent: true,
          opacity: 0.8,
        });
        const mesh = new THREE.Mesh(geometry, material);

        // 저장된 속성 복원
        mesh.position.fromArray(data.position);
        mesh.rotation.fromArray(data.rotation);
        mesh.scale.fromArray(data.scale);
        mesh.uuid = data.id;

        // 씬에 추가
        if (sceneRef.current) {
          sceneRef.current.add(mesh);
        }
        loadedObjects.push(mesh);
      });

      return loadedObjects;
    } catch (error) {
      console.error('Failed to load objects:', error);
      return [];
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // 이미 캔버스가 있으면 제거 (중복 방지)
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    console.log("=== Three.js Scene Initialization ===");
    console.log(
      "Container dimensions:",
      container.clientWidth,
      "x",
      container.clientHeight
    );

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
    console.log(
      "Camera created at position:",
      camera.position.x,
      camera.position.y,
      camera.position.z
    );

    // Renderer 설정
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 캔버스 스타일 설정 (중요!)
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "none";

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    console.log("Renderer created and added to DOM");
    console.log("Canvas element:", renderer.domElement);
    console.log(
      "Canvas in container:",
      container.contains(renderer.domElement)
    );

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
      TWO: THREE.TOUCH.DOLLY_PAN,
    };

    // 패닝 제한: 지면 아래로 이동하지 못하도록 제한
    const minTargetY = CONSTANTS.GROUND_POSITION.Y + 0.1; // 지면보다 약간 위로 제한
    const handlePanLimit = () => {
      if (controls.target.y < minTargetY) {
        controls.target.y = minTargetY;
        controls.update();
      }
    };
    controls.addEventListener("change", handlePanLimit);

    controlsRef.current = controls;
    controls.update();

    console.log("OrbitControls initialized:");
    console.log("- enableZoom:", controls.enableZoom);
    console.log("- enableRotate:", controls.enableRotate);
    console.log("- enablePan:", controls.enablePan);
    console.log("- minDistance:", controls.minDistance);
    console.log("- maxDistance:", controls.maxDistance);
    console.log("- minTargetY (panning limit):", minTargetY);

    // --- 배치 모드 로직 ---
    const raycaster = new THREE.Raycaster();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -CONSTANTS.GROUND_POSITION.Y);

    const handleWindowMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.set(x, y);
    };
    
    window.addEventListener('mousemove', handleWindowMouseMove);

    const handleRendererClick = (event: MouseEvent) => {
      // 배치 모드일 때의 동작
      if (isPlacementModeRef.current && objectToPlaceRef.current) {
        // 신규 배치 또는 재배치
        if (editingObjectRef.current) {
          // 편집 모드: 기존 객체 위치 업데이트 및 다시 표시
          editingObjectRef.current.position.copy(objectToPlaceRef.current.position);
          editingObjectRef.current.visible = true;
          scene.remove(objectToPlaceRef.current);

          // 편집된 오브젝트 저장
          saveObjectsToStorage(userAddedObjectsRef.current);
        } else {
          // 신규 배치: 고스트 박스를 실제 객체로 변환
          const newBox = finalizeBoxPlacement(objectToPlaceRef.current);
          scene.add(newBox);
          setUserAddedObjects(prev => {
            const updatedObjects = [...prev, newBox];
            saveObjectsToStorage(updatedObjects);
            return updatedObjects;
          });
          scene.remove(objectToPlaceRef.current);
        }

        // 배치 모드 종료
        setObjectToPlace(null);
        setIsPlacementMode(false);
        setEditingObject(null);
        setOriginalPosition(null);
        if (placementIndicatorRef.current) {
          placementIndicatorRef.current.visible = false;
        }
        return;
      }

      // 일반 모드: 사용자가 추가한 객체 클릭 감지
      if (!isPlacementModeRef.current) {
        console.log('=== 객체 클릭 감지 시도 ===');
        console.log('userAddedObjects 개수:', userAddedObjectsRef.current.length);
        console.log('클릭 위치:', event.clientX, event.clientY);

        // 캔버스 기준으로 마우스 좌표 계산
        const rect = renderer.domElement.getBoundingClientRect();
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1
        );
        console.log('normalized mouse:', mouse.x, mouse.y);
        raycaster.setFromCamera(mouse, camera);

        // 각 객체의 정보 출력
        userAddedObjectsRef.current.forEach((obj, idx) => {
          console.log(`Object ${idx}:`, {
            position: obj.position,
            visible: obj.visible,
            geometry: obj.geometry,
            material: obj.material
          });
        });

        // userAddedObjects에서만 감지 (recursive=true로 자식까지 검색)
        const intersects = raycaster.intersectObjects(userAddedObjectsRef.current, true);
        console.log('intersects 개수:', intersects.length);
        if (intersects.length > 0) {
          console.log('첫 번째 intersect:', intersects[0]);
        }

        if (intersects.length > 0) {
          const clickedObject = intersects[0].object as THREE.Mesh;
          console.log('객체 클릭됨!', clickedObject);

          // 편집 모드 시작
          setEditingObject(clickedObject);
          setOriginalPosition(clickedObject.position.clone());

          // 고스트 박스 생성 (기존 객체를 숨기고 고스트로 대체)
          const ghostBox = createGhostBox(scene);
          ghostBox.position.copy(clickedObject.position);
          setObjectToPlace(ghostBox);
          setIsPlacementMode(true);

          // 원본 객체 숨김
          clickedObject.visible = false;

          // 인디케이터 표시
          if (!placementIndicatorRef.current) {
            placementIndicatorRef.current = createPlacementIndicator(scene);
          }
          placementIndicatorRef.current.visible = true;
        }
      }
    };

    renderer.domElement.addEventListener('click', handleRendererClick);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isPlacementModeRef.current) {
        // 편집 모드: 원위치 복귀
        if (editingObjectRef.current && originalPositionRef.current) {
          // 원본 객체를 원래 위치로 복귀하고 다시 표시
          editingObjectRef.current.position.copy(originalPositionRef.current);
          editingObjectRef.current.visible = true;

          // 고스트 박스 제거
          if (objectToPlaceRef.current) {
            scene.remove(objectToPlaceRef.current);
          }

          // 상태 초기화
          setObjectToPlace(null);
          setIsPlacementMode(false);
          setEditingObject(null);
          setOriginalPosition(null);
          if (placementIndicatorRef.current) {
            placementIndicatorRef.current.visible = false;
          }
        }
        // 신규 배치 모드: 취소
        else {
          if (objectToPlaceRef.current) {
            scene.remove(objectToPlaceRef.current);
          }
          setObjectToPlace(null);
          setIsPlacementMode(false);
          if (placementIndicatorRef.current) {
            placementIndicatorRef.current.visible = false;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    console.log("Event listeners attached to canvas");
    console.log(
      "Canvas size:",
      renderer.domElement.width,
      "x",
      renderer.domElement.height
    );
    console.log(
      "Canvas position in DOM:",
      renderer.domElement.getBoundingClientRect()
    );

    // 캔버스 클릭 테스트
    setTimeout(() => {
      console.log("=== Testing canvas interaction after 1 second ===");
      console.log("Canvas parent:", renderer.domElement.parentElement);
      console.log(
        "Canvas is visible:",
        renderer.domElement.offsetParent !== null
      );
      console.log("Controls exists:", controlsRef.current !== null);
      console.log("Controls enabled:", {
        zoom: controlsRef.current?.enableZoom,
        rotate: controlsRef.current?.enableRotate,
        pan: controlsRef.current?.enablePan,
      });

      // 수동으로 이벤트 테스트
      const testClick = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 100,
        button: 0,
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

    // 그리드 생성
    const grid = createGrid(CONSTANTS.GROUND_SIZE.WIDTH, CONSTANTS.GROUND_SIZE.WIDTH); // 50x50 그리드
    scene.add(grid);
    console.log("Grid created on the ground");

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
            // 저장된 오브젝트들 로드
            const loadedObjects = loadObjectsFromStorage();
            setUserAddedObjects(loadedObjects);

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
    const table1 = createTable(
      table1Width,
      CONSTANTS.TABLE_SIZE.HEIGHT,
      CONSTANTS.TABLE_SIZE.DEPTH
    );
    scene.add(table1);
    console.log(
      "Table 1 created at Y:",
      CONSTANTS.TABLE_POSITION.Y,
      "width:",
      table1Width
    );

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
      table2.material.color.setHex(0xb01a1a);
    }

    scene.add(table2);
    console.log(
      "Table 2 created (half width) at X:",
      table1HalfWidth + table2RotatedWidth,
      "Z:",
      table2RotatedDepth - CONSTANTS.TABLE_SIZE.DEPTH / 2,
      "rotation: 90deg, color: red (#B01A1A)"
    );

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
        const { centerY, positions } =
          positionMultipleManikinsOnTable(manikins);

        // 각 마네킹 앞에 포스터 생성 및 배치
        positions.forEach((xPosition, index) => {
          const manikinInfo = CONSTANTS.MANIKIN_INFO[index];
          if (manikinInfo) {
            const poster = createPoster(
              manikinInfo.name,
              manikinInfo.description,
              xPosition
            );
            scene.add(poster);
            console.log(
              `Created poster for ${manikinInfo.name} at X: ${xPosition.toFixed(
                2
              )}`
            );
          }
        });

        // 모든 마네킹을 포함하는 전체 크기 계산
        const boxes = manikins.map((manikin) =>
          new THREE.Box3().setFromObject(manikin)
        );
        const overallBox = boxes.reduce((acc, box) => acc.union(box), boxes[0]);
        const overallSize = overallBox.getSize(new THREE.Vector3());

        console.log(
          "Overall scene size:",
          overallSize.x.toFixed(2),
          overallSize.y.toFixed(2),
          overallSize.z.toFixed(2)
        );

        // 카메라 자동 조정 (전체 씬을 고려)
        // IM17-P 마네킹(인덱스 3)의 위치를 카메라 타겟으로 설정
        const IM17_P_INDEX = 3; // IM17-P는 MANIKIN_INFO 배열의 인덱스 3
        const im17pX =
          positions.length > IM17_P_INDEX ? positions[IM17_P_INDEX] : 0;
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
        const table2PositionZ =
          table2RotatedDepthCalc - CONSTANTS.TABLE_SIZE.DEPTH / 2;
        const table2TopY =
          CONSTANTS.TABLE_POSITION.Y + CONSTANTS.TABLE_SIZE.HEIGHT / 2;

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
          (Math.PI / 2) * 3,
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
            console.log(
              `Created poster for AED-T at X: ${modelPositionX.toFixed(
                2
              )}, Z: ${(table2PositionZ + 1).toFixed(
                2
              )}, rotation: ${table2RotationY.toFixed(2)}`
            );

            // AED-T 모델 로드 완료
            loadingStateRef.current.aedModel = true;
            checkAllLoaded();
          }
        );
      },
      (progress) => {
        if (progress.total > 0) {
          const percent = ((progress.loaded / progress.total) * 100).toFixed(0);
          console.log(
            `Loading progress: ${percent}% (${progress.loaded}/${progress.total} bytes)`
          );
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

      // 자동 무빙 업데이트
      if (cameraRef.current && controlsRef.current) {
        const isCompleted = updateAutoMove(
          autoMoveRef.current,
          cameraRef.current,
          controlsRef.current
        );

        // 무빙 완료 시 처리
        if (isCompleted && autoMoveRef.current.isActive) {
          completeAutoMove(
            autoMoveRef.current,
            cameraRef.current,
            controlsRef.current
          );
          setIsAutoMoving(false);
        }
      }

      // 배치 모드일 때 로직 처리
      if (isPlacementModeRef.current && objectToPlaceRef.current && placementIndicatorRef.current) {
        raycaster.setFromCamera(mouseRef.current, camera);
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(groundPlane, intersection);

        const gridSize = 1; // 그리드 한 칸의 크기

        // 고스트 객체 위치 업데이트 (유틸리티 함수 사용)
        placeObjectOnGrid(objectToPlaceRef.current, intersection, gridSize);

        // 인디케이터 위치 및 가시성 업데이트
        const snappedPosition = snapToGrid(intersection, gridSize);
        placementIndicatorRef.current.position.set(
          snappedPosition.x,
          CONSTANTS.GROUND_POSITION.Y + 0.02,
          snappedPosition.z
        );
        placementIndicatorRef.current.visible = true;
      }

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

      window.removeEventListener('mousemove', handleWindowMouseMove);
      renderer.domElement.removeEventListener('click', handleRendererClick);
      window.removeEventListener('keydown', handleKeyDown);

      if (
        container &&
        renderer.domElement &&
        container.contains(renderer.domElement)
      ) {
        container.removeChild(renderer.domElement);
        console.log("Canvas removed from container");
      }

      // 패닝 제한 이벤트 리스너 제거
      controls.removeEventListener("change", handlePanLimit);
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
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      />

      {/* 마우스 컨트롤 안내 박스 */}
      {!isLoading && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "20px",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            color: "#ffffff",
            padding: "16px 20px",
            borderRadius: "10px",
            fontSize: "14px",
            lineHeight: "1.6",
            zIndex: 1000,
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.4)",
            minWidth: "200px",
          }}
        >
          <div
            style={{
              fontWeight: "700",
              marginBottom: "12px",
              fontSize: "16px",
              letterSpacing: "0.3px",
            }}
          >
            마우스 컨트롤
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {/* 드래그 */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {/* 왼쪽: 마우스 좌클릭 */}
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="10"
                  y="6"
                  width="20"
                  height="28"
                  rx="10"
                  fill="#E8E8E8"
                  stroke="#555"
                  strokeWidth="2"
                />
                <path
                  d="M20 6C14.477 6 10 10.477 10 16V18H20V6Z"
                  fill="#4A9EFF"
                />
                <line
                  x1="20"
                  y1="6"
                  x2="20"
                  y2="18"
                  stroke="#555"
                  strokeWidth="2"
                />
              </svg>

              {/* 중앙: + 기호 */}
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#999",
                  lineHeight: "1",
                }}
              >
                +
              </div>

              {/* 오른쪽: 회전 화살표 */}
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M30 20C30 25 27 28 23 29.5"
                  stroke="#4A9EFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path d="M20 27L23 29.5L25 26" fill="#4A9EFF" />
                <path
                  d="M10 20C10 15 13 12 17 10.5"
                  stroke="#4A9EFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path d="M20 13L17 10.5L15 14" fill="#4A9EFF" />
                <circle
                  cx="20"
                  cy="20"
                  r="3"
                  fill="none"
                  stroke="#4A9EFF"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
              </svg>

              <div style={{ marginLeft: "4px" }}>
                <div style={{ fontWeight: "600", marginBottom: "2px" }}>
                  드래그
                </div>
                <div style={{ fontSize: "12px", opacity: 0.85 }}>화면 회전</div>
              </div>
            </div>

            {/* 스크롤 */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {/* 왼쪽: 마우스 휠 */}
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="10"
                  y="6"
                  width="20"
                  height="28"
                  rx="10"
                  fill="#E8E8E8"
                  stroke="#555"
                  strokeWidth="2"
                />
                <line
                  x1="20"
                  y1="6"
                  x2="20"
                  y2="18"
                  stroke="#555"
                  strokeWidth="2"
                />
                {/* 중앙 휠 영역 파란색 */}
                <rect
                  x="17"
                  y="10"
                  width="6"
                  height="12"
                  rx="3"
                  fill="#4A9EFF"
                />
                {/* 휠 상하 화살표 */}
                <path
                  d="M19 13L20 11L21 13"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 17L20 19L19 17"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* 중앙: = 기호 */}
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#999",
                  lineHeight: "1",
                }}
              >
                =
              </div>

              {/* 오른쪽: 확대/축소 */}
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="12"
                  stroke="#4A9EFF"
                  strokeWidth="2.5"
                  fill="none"
                />
                <line
                  x1="14"
                  y1="20"
                  x2="26"
                  y2="20"
                  stroke="#4A9EFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <line
                  x1="20"
                  y1="14"
                  x2="20"
                  y2="26"
                  stroke="#4A9EFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M28 28L33 33"
                  stroke="#4A9EFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>

              <div style={{ marginLeft: "4px" }}>
                <div style={{ fontWeight: "600", marginBottom: "2px" }}>
                  스크롤
                </div>
                <div style={{ fontSize: "12px", opacity: 0.85 }}>확대/축소</div>
              </div>
            </div>

            {/* 재생 버튼 */}
            <button
              onClick={() => {
                if (cameraRef.current && controlsRef.current) {
                  startAutoMove(
                    autoMoveRef.current,
                    cameraRef.current,
                    controlsRef.current
                  );
                  setIsAutoMoving(true);
                }
              }}
              disabled={isAutoMoving}
              style={{
                marginTop: "8px",
                width: "100%",
                padding: "10px",
                backgroundColor: isAutoMoving ? "#666" : "#4A9EFF",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: isAutoMoving ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                if (!isAutoMoving) {
                  e.currentTarget.style.backgroundColor = "#3A8EEF";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(74, 158, 255, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isAutoMoving) {
                  e.currentTarget.style.backgroundColor = "#4A9EFF";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3 1.5v13l10-6.5L3 1.5z" fill="currentColor" />
              </svg>
              {isAutoMoving ? "무빙 중..." : "360° 둘러보기"}
            </button>
          </div>
        </div>
      )}

      {/* 오브젝트 컨트롤러 (항상 표시) */}
      {!isLoading && (
        <ObjectController
          onAddBox={handleAddBox}
          isPlacementMode={isPlacementMode}
          hasEditingObject={editingObject !== null}
        />
      )}

      {/* 배치 모드 안내 (ESC 취소) - ObjectController 자리에 표시 */}
      {!isLoading && isPlacementMode && <PlacementModeGuide isEditMode={editingObject !== null} />}

      {/* 휴지통 영역 (편집 모드일 때만 표시) */}
      {!isLoading && (
        <DeleteZone
          isActive={isPlacementMode && editingObject !== null}
          onDelete={handleDeleteObject}
        />
      )}

      {/* 로딩 화면 */}
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(42, 42, 42, 0.9)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            color: "#ffffff",
          }}
        >
          {/* 로딩 스피너 */}
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "4px solid rgba(255, 255, 255, 0.3)",
              borderTop: "4px solid #ffffff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "20px",
            }}
          />

          {/* 로딩 텍스트 */}
          <div
            style={{
              fontSize: "18px",
              fontWeight: "500",
              letterSpacing: "0.5px",
            }}
          >
            Loading 3D Models...
          </div>

          {/* CSS 애니메이션 */}
          <style jsx>{`
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
