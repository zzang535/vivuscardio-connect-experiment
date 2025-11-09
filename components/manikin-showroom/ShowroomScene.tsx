"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import * as CONSTANTS from "@/lib/manikin-showroom/constants";
import * as TEXT from "@/lib/manikin-showroom/texts";
import * as ASSETS from "@/lib/manikin-showroom/assets";
import { CAMERA_TOUR_MUSIC_PATH } from "@/lib/manikin-showroom/assets";
import {
  createGround,
  createBoxGeometry,
  setupLights,
  createManikinMaterial,
  createManikin,
  positionMultipleManikinsOnTable,
  autoAdjustCamera,
  createPoster,
  loadAEDModelOnTable,
  loadIPadModelOnTable,
  createLogoBanner,
  createGrid,
  createAxesHelper,
  createAxesLabels,
  createCoordinateLabels,
} from "@/lib/manikin-showroom/objects";
import {
  type AutoMoveState,
  createAutoMoveState,
  startAutoMove,
  updateAutoMove,
  completeAutoMove,
} from "@/lib/manikin-showroom/cameraAnimation";
import {
  alignObjectToPlacement,
  snapToGrid,
  type Dimensions,
} from "@/lib/manikin-showroom/objectControl";
import { UserInteractionManager } from "@/lib/manikin-showroom/userInteraction";
import { AVAILABLE_MODELS, AVAILABLE_MANIKINS, ModelType } from "@/lib/manikin-showroom/modelTypes";
import Editor from "./editor/Editor";
import PlacementModeGuide from "./guide/PlacementModeGuide";
import DeleteZone from "./editor/DeleteZone";
import ModelSelector from "./editor/ModelSelector";
import MouseControlGuide from "./camera/MouseControlGuide";
import Camera360Button from "./action/Camera360Button";
import IPadModal from "./modal/IPadModal";
import LoadingOverlay from "./LoadingOverlay";

export default function ShowroomScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const groundRef = useRef<THREE.Mesh | null>(null);
  const manikinTemplateRef = useRef<THREE.Object3D | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  // UserInteractionManager 인스턴스
  const interactionManagerRef = useRef<UserInteractionManager | null>(null);

  // 모든 객체 로딩 상태 추적
  const loadingStateRef = useRef({
    manikins: false,
    aedModel: false,
    ipadModel: false,
    logoBanner: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userAddedObjects, setUserAddedObjects] = useState<THREE.Object3D[]>([]);
  const [isPlacementMode, setIsPlacementMode] = useState(false);
  const [objectToPlace, setObjectToPlace] = useState<THREE.Mesh | null>(null);
  const placementIndicatorRef = useRef<THREE.Mesh | null>(null);

  // 편집 모드 상태 (기존 객체를 이동하는 모드)
  const [editingObject, setEditingObject] = useState<THREE.Object3D | null>(null);
  const [originalPosition, setOriginalPosition] = useState<THREE.Vector3 | null>(null);

  // 배치 가능 여부 상태
  const [isPlacementValid, setIsPlacementValid] = useState(true);

  // 배치 모드 상태를 참조하기 위한 ref
  const isPlacementModeRef = useRef(isPlacementMode);
  isPlacementModeRef.current = isPlacementMode;
  const objectToPlaceRef = useRef(objectToPlace);
  objectToPlaceRef.current = objectToPlace;
  const editingObjectRef = useRef(editingObject);
  editingObjectRef.current = editingObject;
  const originalPositionRef = useRef(originalPosition);
  originalPositionRef.current = originalPosition;
  const userAddedObjectsRef = useRef<THREE.Object3D[]>(userAddedObjects);
  userAddedObjectsRef.current = userAddedObjects;
  const isPlacementValidRef = useRef(isPlacementValid);
  isPlacementValidRef.current = isPlacementValid;

  // 로컬 스토리지에서 초기 객체 로딩을 한 번만 실행하기 위한 플래그
  const initialObjectsLoadedRef = useRef(false);

  // 마우스 위치를 저장할 ref (Vector2 타입 사용)
  const mouseRef = useRef(new THREE.Vector2());

  // 모델 선택 패널 관련 상태
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [modelsToShow, setModelsToShow] = useState<ModelType[]>([]);

  // 좌표계 표시 상태
  const [showCoordinates, setShowCoordinates] = useState(true);
  const coordinateObjectsRef = useRef<THREE.Object3D[]>([]); // 좌표계 객체들 저장

  // 아이패드 모달 상태
  const [showIPadModal, setShowIPadModal] = useState(false);
  const ipadModelRef = useRef<THREE.Object3D | null>(null); // 아이패드 모델 참조

  // 박스 모델 선택 패널 열기
  const handleOpenBoxSelector = () => {
    setModelsToShow(AVAILABLE_MODELS);
    setShowModelSelector(true);
  };

  // 마네킹 모델 선택 패널 열기
  const handleOpenManikinSelector = () => {
    setModelsToShow(AVAILABLE_MANIKINS);
    setShowModelSelector(true);
  };

  // 모델 선택 패널 닫기
  const handleCloseModelSelector = () => {
    setShowModelSelector(false);
  };

  // 모델 선택 처리
  const handleSelectModel = (modelType: ModelType) => {
    console.log('Model selected:', modelType);
    setShowModelSelector(false);

    // UserInteractionManager를 통해 배치 모드 시작
    if (interactionManagerRef.current) {
      interactionManagerRef.current.startPlacementMode(modelType);
    }
  };

  // 좌표계 토글 처리
  const handleToggleCoordinates = () => {
    const newShowCoordinates = !showCoordinates;
    setShowCoordinates(newShowCoordinates);
    coordinateObjectsRef.current.forEach(obj => {
      obj.visible = newShowCoordinates;
    });
  };

  const registerObjectMetadata = (object: THREE.Object3D, modelType: ModelType) => {
    object.userData.modelType = modelType;
    object.userData.modelTypeId = modelType.id;
    object.userData.placementDimensions = modelType.dimensions;
    object.userData.previewDimensions = modelType.previewDimensions;
    object.traverse(child => {
      child.userData.rootObject = object;
    });
  };

  interface StoredObjectData {
    id: string;
    modelTypeId?: string;
    type: ModelType['type'];
    color: number;
    position: number[];
    rotation: number[];
    scale: number[];
    placementDimensions: Dimensions;
    previewDimensions?: Dimensions;
  }

  const getObjectColor = (object: THREE.Object3D): number => {
    let detectedColor = 0xffffff;
    object.traverse(node => {
      if (node instanceof THREE.Mesh) {
        const material = node.material as THREE.MeshStandardMaterial;
        if (material?.color) {
          detectedColor = material.color.getHex();
        }
      }
    });
    return detectedColor;
  };

  const getObjectDimensions = (object: THREE.Object3D): Dimensions => {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    return {
      width: size.x || 1,
      height: size.y || 1,
      depth: size.z || 1,
    };
  };

  const toVector3Array = (
    value: number[] | undefined,
    defaultValue: [number, number, number] = [0, 0, 0]
  ): [number, number, number] => {
    const [defaultX, defaultY, defaultZ] = defaultValue;
    const [x = defaultX, y = defaultY, z = defaultZ] = value ?? [];
    return [x, y, z];
  };

  const serializeObjectForStorage = (object: THREE.Object3D): StoredObjectData => {
    const modelType = object.userData?.modelType as ModelType | undefined;
    const placementDimensions =
      (object.userData?.placementDimensions as Dimensions | undefined) ||
      getObjectDimensions(object);
    const previewDimensions =
      object.userData?.previewDimensions as Dimensions | undefined;
    const type = modelType?.type || 'box';

    return {
      id: object.uuid,
      modelTypeId: modelType?.id,
      type,
      color: modelType?.color ?? getObjectColor(object),
      position: object.position.toArray() as [number, number, number],
      rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
      scale: object.scale.toArray() as [number, number, number],
      placementDimensions,
      previewDimensions,
    };
  };

  const resolveModelTypeFromStorage = (data: StoredObjectData): ModelType => {
    const availableTypes = [...AVAILABLE_MODELS, ...AVAILABLE_MANIKINS];
    const existing = data.modelTypeId
      ? availableTypes.find(model => model.id === data.modelTypeId)
      : undefined;

    const fallbackDimensions =
      data.placementDimensions || existing?.dimensions || {
        width: 1,
        height: 1,
        depth: 1,
      };

    return {
      id: data.modelTypeId || existing?.id || data.id,
      name: existing?.name || 'Saved Object',
      description: existing?.description || '',
      type: data.type || existing?.type || 'box',
      modelPath:
        existing?.modelPath ||
        ((data.type || existing?.type) === 'model'
          ? ASSETS.MANIKIN_MODEL_PATH
          : undefined),
      icon:
        existing?.icon ||
        ((data.type || existing?.type) === 'model' ? '🧑' : '📦'),
      color: data.color ?? existing?.color ?? 0xcccccc,
      dimensions: fallbackDimensions,
      previewDimensions: data.previewDimensions || existing?.previewDimensions,
    };
  };

  // 최종 객체 배치 콜백
  const handleObjectPlaced = (modelType: ModelType, position: THREE.Vector3) => {
    const scene = sceneRef.current;
    if (!scene) return;

    let newObject: THREE.Object3D | null = null;

    if (modelType.type === 'box') {
      const geometry = new THREE.BoxGeometry(
        modelType.dimensions.width,
        modelType.dimensions.height,
        modelType.dimensions.depth
      );
      const material = new THREE.MeshStandardMaterial({
        color: modelType.color,
        roughness: 0.8,
        metalness: 0.2,
      });
      newObject = new THREE.Mesh(geometry, material);
    } else if (modelType.type === 'model' && manikinTemplateRef.current) {
      const material = new THREE.MeshStandardMaterial({
        color: modelType.color,
        roughness: CONSTANTS.MANIKIN_MATERIAL.ROUGHNESS,
        metalness: CONSTANTS.MANIKIN_MATERIAL.METALNESS,
      });
      newObject = createManikin(manikinTemplateRef.current, material);
    }

    if (newObject) {
      registerObjectMetadata(newObject, modelType);
      alignObjectToPlacement(newObject, modelType.dimensions, position);
      scene.add(newObject);
      setUserAddedObjects(prev => {
        const updated = [...prev, newObject];
        saveObjectsToStorage(updated);
        return updated;
      });
    }
  };
  
  const handleDeleteObject = () => {
    const scene = sceneRef.current;
    if (!scene || !editingObject) return;

    // 편집 중인 객체를 삭제
    scene.remove(editingObject);

    // 고스트 박스 제거
    if (objectToPlace) {
      scene.remove(objectToPlace);
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
  const saveObjectsToStorage = (objects: THREE.Object3D[]) => {
    try {
      const objectsData = objects.map(obj => serializeObjectForStorage(obj));
      localStorage.setItem('manikinShowroomObjects', JSON.stringify(objectsData));
    } catch (error) {
      console.error('Failed to save objects:', error);
    }
  };

  const loadObjectsFromStorage = (): THREE.Object3D[] => {
    try {
      const savedData = localStorage.getItem('manikinShowroomObjects');
      const scene = sceneRef.current;
      if (!savedData || !scene) return [];

      const rawObjectsData: any[] = JSON.parse(savedData);
      const normalizedData: StoredObjectData[] = rawObjectsData.map((data) => {
        if (data.placementDimensions) {
          return data;
        }

        const geometry = data.geometry || { width: 2, height: 2, depth: 2 };
        return {
          id: data.id,
          modelTypeId: data.modelTypeId,
          type: data.type || 'box',
          color: data.color || 0xcccccc,
          position: data.position || [0, 0, 0],
          rotation: data.rotation || [0, 0, 0],
          scale: data.scale || [1, 1, 1],
          placementDimensions: {
            width: geometry.width || 2,
            height: geometry.height || 2,
            depth: geometry.depth || 2,
          },
          previewDimensions: geometry,
        } as StoredObjectData;
      });

      const loadedObjects: THREE.Object3D[] = [];

      normalizedData.forEach((data) => {
        const modelType = resolveModelTypeFromStorage(data);
        const color = data.color ?? modelType.color;
        const placementDimensions = data.placementDimensions || modelType.dimensions;

        let restoredObject: THREE.Object3D | null = null;
        if (modelType.type === 'box') {
          const geometry = new THREE.BoxGeometry(
            placementDimensions.width,
            placementDimensions.height,
            placementDimensions.depth
          );
          const material = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.8,
            metalness: 0.2,
          });
          restoredObject = new THREE.Mesh(geometry, material);
        } else if (modelType.type === 'model') {
          if (!manikinTemplateRef.current) {
            console.warn('Manikin template not ready. Skipping stored model', data.id);
            return;
          }
          const material = new THREE.MeshStandardMaterial({
            color,
            roughness: CONSTANTS.MANIKIN_MATERIAL.ROUGHNESS,
            metalness: CONSTANTS.MANIKIN_MATERIAL.METALNESS,
          });
          restoredObject = createManikin(manikinTemplateRef.current, material);
        }

        if (!restoredObject) {
          console.warn('Failed to recreate object from storage', data.id);
          return;
        }

        restoredObject.uuid = data.id;

        const resolvedModelType: ModelType = {
          ...modelType,
          color,
          dimensions: placementDimensions,
          previewDimensions: data.previewDimensions || modelType.previewDimensions,
        };

        registerObjectMetadata(restoredObject, resolvedModelType);

        const position = toVector3Array(data.position);
        const rotation = toVector3Array(data.rotation);
        const scale = toVector3Array(data.scale, [1, 1, 1]);

        restoredObject.position.set(position[0], position[1], position[2]);
        restoredObject.rotation.set(rotation[0], rotation[1], rotation[2]);
        restoredObject.scale.set(scale[0], scale[1], scale[2]);

        scene.add(restoredObject);
        loadedObjects.push(restoredObject);
      });

      return loadedObjects;
    } catch (error) {
      console.error('Failed to load objects:', error);
      return [];
    }
  };

  useEffect(() => {
    const backgroundAudio = new Audio(CAMERA_TOUR_MUSIC_PATH);
    backgroundAudio.loop = true;
    backgroundAudio.volume = 0.35;
    backgroundAudio.preload = "auto";
    backgroundAudio.crossOrigin = "anonymous";
    musicRef.current = backgroundAudio;

    return () => {
      backgroundAudio.pause();
      musicRef.current = null;
    };
  }, []);

  const playBackgroundMusic = () => {
    const audio = musicRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  const stopBackgroundMusic = () => {
    const audio = musicRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  };

  useEffect(() => {
    if (!isAutoMoving) {
      stopBackgroundMusic();
    }
  }, [isAutoMoving]);



  // 메인 씬 설정
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // 이미 캔버스가 있으면 제거 (중복 방지)
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // Scene 설정
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(CONSTANTS.SCENE_BACKGROUND_COLOR);
    sceneRef.current = scene;

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

    // OrbitControls 설정
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = CONSTANTS.CAMERA_DAMPING.ENABLED;
    controls.dampingFactor = CONSTANTS.CAMERA_DAMPING.FACTOR;
    controls.minDistance = CONSTANTS.CAMERA_DISTANCE.MIN;
    controls.maxDistance = CONSTANTS.CAMERA_DISTANCE.MAX;
    controls.target.set(
      CONSTANTS.INITIAL_CAMERA_TARGET.X,
      CONSTANTS.INITIAL_CAMERA_TARGET.Y,
      CONSTANTS.INITIAL_CAMERA_TARGET.Z
    );

    // 줌 설정
    controls.enableZoom = true;
    controls.zoomSpeed = CONSTANTS.CAMERA_CONTROL_SPEED.ZOOM;

    // 패닝 설정 (우클릭 드래그)
    controls.enablePan = true;
    controls.panSpeed = CONSTANTS.CAMERA_CONTROL_SPEED.PAN;

    // 회전 설정
    controls.enableRotate = true;
    controls.rotateSpeed = CONSTANTS.CAMERA_CONTROL_SPEED.ROTATE;

    // 터치 제스처 설정 (모바일)
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };

    controlsRef.current = controls;
    controls.update();

    // --- UserInteractionManager 초기화 ---
    // ground가 생성된 후에 초기화해야 하므로 나중에 초기화
    const raycaster = new THREE.Raycaster();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -CONSTANTS.GROUND_POSITION.Y);

    // 조명 설정
    setupLights(scene);

    // 지면 생성
    const ground = createGround();
    scene.add(ground);
    groundRef.current = ground;

    // 그리드 및 좌표계 생성
    const grid = createGrid(
      CONSTANTS.GROUND_SIZE.WIDTH,
      CONSTANTS.GROUND_SIZE.WIDTH
    );

    const axesHelper = createAxesHelper(10);
    const axesLabels = createAxesLabels(10);
    const coordinateLabels = createCoordinateLabels(
      scene,
      CONSTANTS.GROUND_SIZE.WIDTH,
      5
    );

    coordinateObjectsRef.current = [
      grid,
      axesHelper,
      ...axesLabels,
      ...coordinateLabels,
    ];

    coordinateObjectsRef.current.forEach((obj) => {
      scene.add(obj);
      obj.visible = showCoordinates;
    });

    // 모든 객체 로딩 상태 초기화
    loadingStateRef.current = {
      manikins: false,
      aedModel: false,
      ipadModel: false,
      logoBanner: false,
    };

    // 로딩 상태 설정
    setIsLoading(true);

    // 모든 객체 로딩 완료 확인 함수
    const checkAllLoaded = () => {
      if (initialObjectsLoadedRef.current) return; // 이미 로드되었으면 중복 실행 방지

      const { manikins, aedModel, ipadModel, logoBanner } = loadingStateRef.current;
      if (manikins && aedModel && ipadModel && logoBanner) {
        initialObjectsLoadedRef.current = true; // 로드 실행 플래그 설정

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
    // positionY는 함수 내부에서 계산되므로 임시 값 전달 (실제로는 받침대를 기준으로 계산됨)
    const bannerZ = -8; // 마네킹 뒤쪽 (Z축 음수)
    createLogoBanner(scene, 0, 0, bannerZ, 15, 8, () => {
      // 로고 배너 로드 완료
      loadingStateRef.current.logoBanner = true;
      checkAllLoaded();
    }); // 크기: 15 x 8, Y 위치는 함수 내부에서 지면 기준으로 계산

    const mainTableConfig = CONSTANTS.BACKGROUND_TABLES.MAIN;
    const mainTable = createBoxGeometry({
      width: mainTableConfig.dimensions.width,
      height: mainTableConfig.dimensions.height,
      depth: mainTableConfig.dimensions.depth,
      color: mainTableConfig.color,
    });
    mainTable.position.set(
      mainTableConfig.position.x,
      mainTableConfig.position.y,
      mainTableConfig.position.z
    );
    mainTable.rotation.y = mainTableConfig.rotationY;
    scene.add(mainTable);

    const secondaryTableConfig = CONSTANTS.BACKGROUND_TABLES.SECONDARY;
    const secondaryTable = createBoxGeometry({
      width: secondaryTableConfig.dimensions.width,
      height: secondaryTableConfig.dimensions.height,
      depth: secondaryTableConfig.dimensions.depth,
      color: secondaryTableConfig.color,
    });
    secondaryTable.position.set(
      secondaryTableConfig.position.x,
      secondaryTableConfig.position.y,
      secondaryTableConfig.position.z
    );
    secondaryTable.rotation.y = secondaryTableConfig.rotationY;
    scene.add(secondaryTable);

    // OBJ 모델 로드 (마네킹 5개)
    const loader = new OBJLoader();

    // 마네킹용 재질 생성
    const manikinMaterial = createManikinMaterial();

    loader.load(
      ASSETS.MANIKIN_MODEL_PATH,
      (object) => {
        console.log("=== OBJ file loaded successfully ===");
        manikinTemplateRef.current = object; // 마네킹 템플릿 저장

        // 마네킹을 5개 복제
        const manikins: THREE.Object3D[] = [];
        const MANIKIN_COUNT = 5;

        for (let i = 0; i < MANIKIN_COUNT; i++) {
          const manikin = createManikin(object, manikinMaterial);
          manikins.push(manikin);
          scene.add(manikin);
        }

        console.log(`Created ${MANIKIN_COUNT} manikins`);

        // 마네킹들을 테이블 위에 일정 간격으로 배치
        const { centerY, positions } =
          positionMultipleManikinsOnTable(manikins);

        // 각 마네킹 앞에 포스터 생성 및 배치
        positions.forEach((xPosition, index) => {
          const manikinInfo = TEXT.MANIKIN_INFO[index];
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
        const table2PositionX = secondaryTableConfig.position.x;
        const table2PositionZ = secondaryTableConfig.position.z;
        const table2TopY =
          secondaryTableConfig.position.y +
          secondaryTableConfig.dimensions.height / 2;

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

        // 아이패드 모델 로드 (AED-T 옆에 배치)
        // AED-T 위치에서 Z축으로 -3 떨어진 곳에 배치
        loadIPadModelOnTable(
          scene,
          table2PositionX,
          table2PositionZ + 3, // AED-T 옆 (Z축 음수 방향)
          table2TopY,
          (Math.PI / 2) * 3, // AED-T와 같은 회전 각도
          (ipadPositionX) => {
            console.log(
              `iPad model loaded at X: ${ipadPositionX.toFixed(2)}, Z: ${(table2PositionZ - 2).toFixed(2)}`
            );

            // 아이패드 모델 참조 저장 (클릭 이벤트를 위해)
            const ipadModel = scene.children.find(
              child => child.userData.type === 'ipad'
            );
            if (ipadModel) {
              ipadModelRef.current = ipadModel;
            }

            // 아이패드 모델 로드 완료
            loadingStateRef.current.ipadModel = true;
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

    // UserInteractionManager 초기화 (ground 생성 이후)
    if (groundRef.current) {
      const interactionManager = new UserInteractionManager(
        {
          scene,
          camera,
          renderer,
          controls,
          ground: groundRef.current,
          userAddedObjectsRef,
          isPlacementModeRef,
          objectToPlaceRef,
          editingObjectRef,
          originalPositionRef,
          isPlacementValidRef,
          mouseRef,
          placementIndicatorRef,
        },
        {
          setIsPlacementMode,
          setObjectToPlace,
          setEditingObject,
          setOriginalPosition,
          setUserAddedObjects,
          setIsPlacementValid,
          saveObjectsToStorage,
          onObjectPlaced: handleObjectPlaced, // 콜백 전달
          getModelTemplate: (modelType: ModelType) => {
            if (modelType.type === 'model') {
              return manikinTemplateRef.current;
            }
            return null;
          },
        }
      );

      interactionManager.setup();
      interactionManagerRef.current = interactionManager;

      console.log("UserInteractionManager initialized and setup complete");
    }

    // 아이패드 클릭 이벤트 핸들러
    const handleIPadClick = (event: MouseEvent) => {
      // 배치 모드일 때는 무시
      if (isPlacementModeRef.current) return;

      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      // 아이패드 모델만 체크
      if (ipadModelRef.current) {
        const intersects = raycaster.intersectObject(ipadModelRef.current, true);
        if (intersects.length > 0) {
          console.log("iPad clicked!");
          setShowIPadModal(true);
        }
      }
    };

    // 클릭 이벤트 리스너 등록
    renderer.domElement.addEventListener('click', handleIPadClick);

    console.log("iPad click event listener registered");

    const highlightColorHex = 0x4a9eff;
    const updateGhostPreviewColor = (ghostObject: THREE.Object3D, color: number) => {
      if (!ghostObject) return;
      ghostObject.traverse(child => {
        if (!(child instanceof THREE.Mesh)) return;
        const materialList = Array.isArray(child.material)
          ? child.material
          : [child.material];
        materialList.forEach(material => {
          const meshMaterial = material as THREE.MeshStandardMaterial;
          if (!meshMaterial.color) return;
          if (meshMaterial.color.getHex() === highlightColorHex) return;
          meshMaterial.color.setHex(color);
        });
      });
    };

    // 충돌 감지 헬퍼 함수
    const checkCollision = (object: THREE.Object3D, objects: THREE.Object3D[]): boolean => {
      if (!object) return false;
      const box1 = new THREE.Box3().setFromObject(object);
      // 바운딩 박스를 약간 확장하여 미세한 겹침을 방지
      box1.expandByScalar(-0.01);

      for (const otherObject of objects) {
        if (object === otherObject) continue;
        // 편집 중인 객체는 충돌 검사에서 제외
        if (editingObjectRef.current && otherObject.uuid === editingObjectRef.current.uuid) {
          continue;
        }
        const box2 = new THREE.Box3().setFromObject(otherObject);
        if (box1.intersectsBox(box2)) {
          return true;
        }
      }
      return false;
    };

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

      // 클릭 인디케이터 화살표 애니메이션 (위아래로 움직임)
      if (ipadModelRef.current && ipadModelRef.current.userData.clickIndicator) {
        const indicator = ipadModelRef.current.userData.clickIndicator as THREE.Group;
        const time = Date.now() * 0.002;
        const offset = indicator.userData.animationOffset || 0;
        indicator.position.y = ipadModelRef.current.position.y + 1.5 + Math.sin(time + offset) * 0.2;
      }

      // 배치 모드일 때 로직 처리
      if (
        isPlacementModeRef.current &&
        objectToPlaceRef.current &&
        placementIndicatorRef.current &&
        cameraRef.current
      ) {
        raycaster.setFromCamera(mouseRef.current, cameraRef.current);

        const objectsToIntersect = [ground, ...userAddedObjectsRef.current];
        const intersects = raycaster.intersectObjects(objectsToIntersect, true);

        // Find the first valid surface to place on (ground or top face of an object)
        const validIntersect = intersects.find(
          i => i.object === ground || (i.face && i.face.normal.y > 0.99)
        );

        if (validIntersect) {
          const { point } = validIntersect;
          const intersectedObject = validIntersect.object;
          const targetObject = (intersectedObject.userData?.rootObject as THREE.Object3D) || intersectedObject;
          const ghostObject = objectToPlaceRef.current;
          const placementDimensions = ghostObject.userData?.placementDimensions as
            | { width: number; height: number; depth: number }
            | undefined;
          const objectHeight = placementDimensions?.height ??
            (ghostObject.geometry as THREE.BoxGeometry).parameters.height;
          const isGround = targetObject === ground;
          const targetHeight = isGround
            ? 0
            : targetObject.userData?.placementDimensions?.height ??
              new THREE.Box3().setFromObject(targetObject).getSize(new THREE.Vector3()).y;

          // Calculate potential position
          const snappedPoint = snapToGrid(point, 1);
          const newY = isGround
            ? CONSTANTS.GROUND_POSITION.Y + objectHeight / 2
            : targetObject.position.y + targetHeight / 2 + objectHeight / 2;
          ghostObject.position.set(snappedPoint.x, newY, snappedPoint.z);

          // Check for collision at this potential position
          const hasCollision = checkCollision(ghostObject, userAddedObjectsRef.current);
          const isPlacementCurrentlyValid = !hasCollision;
          setIsPlacementValid(isPlacementCurrentlyValid);

          // Update indicator
          placementIndicatorRef.current.visible = true; // Always show indicator on valid surface
          placementIndicatorRef.current.position.set(
            snappedPoint.x,
            isGround
              ? CONSTANTS.GROUND_POSITION.Y + 0.02
              : targetObject.position.y + targetHeight / 2 + 0.01,
            snappedPoint.z
          );

          // Update color based on collision status
          const newColor = isPlacementCurrentlyValid ? 0xffffff : 0xff0000;
          updateGhostPreviewColor(ghostObject, newColor);
        } else {
          // No valid surface under cursor. Hide everything and mark as invalid.
          setIsPlacementValid(false);
          if (placementIndicatorRef.current) {
            placementIndicatorRef.current.visible = false;
          }
          if (objectToPlaceRef.current) {
            objectToPlaceRef.current.position.y = -1000;
          }
        }
      } else if (placementIndicatorRef.current) {
        placementIndicatorRef.current.visible = false;
      }

      // --- 마우스 커서 변경 로직 (UserInteractionManager 사용) ---
      if (interactionManagerRef.current) {
        interactionManagerRef.current.updateCursor();
      }

      // --- 아이패드 호버 시 커서 변경 ---
      if (!isPlacementModeRef.current && ipadModelRef.current && cameraRef.current) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseRef.current, cameraRef.current);
        const intersects = raycaster.intersectObject(ipadModelRef.current, true);

        if (intersects.length > 0) {
          renderer.domElement.style.cursor = 'pointer';
        } else if (!isPlacementModeRef.current && !editingObjectRef.current) {
          // 다른 객체 위가 아니면 기본 커서로
          const userObjectIntersects = raycaster.intersectObjects(userAddedObjectsRef.current, true);
          if (userObjectIntersects.length === 0) {
            renderer.domElement.style.cursor = 'auto';
          }
        }
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

      // 아이패드 클릭 이벤트 리스너 제거
      renderer.domElement.removeEventListener('click', handleIPadClick);

      // UserInteractionManager cleanup
      if (interactionManagerRef.current) {
        interactionManagerRef.current.cleanup();
        interactionManagerRef.current = null;
      }

      if (
        container &&
        renderer.domElement &&
        container.contains(renderer.domElement)
      ) {
        renderer.domElement.style.cursor = 'auto'; // 커서 스타일 초기화
        container.removeChild(renderer.domElement);
        console.log("Canvas removed from container");
      }

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

      {/* 마우스 컨트롤 안내 - 우측 상단 */}
      {!isLoading && <MouseControlGuide />}

      {/* 360도 둘러보기 버튼 - 우측 하단 */}
      {!isLoading && !isPlacementMode && (
        <Camera360Button
          isMoving={isAutoMoving}
          onClick={() => {
            if (cameraRef.current && controlsRef.current) {
              startAutoMove(
                autoMoveRef.current,
                cameraRef.current,
                controlsRef.current
              );
              setIsAutoMoving(true);
              playBackgroundMusic();
            }
          }}
        />
      )}

      {/* 오브젝트 컨트롤러 (항상 표시) */}
      {!isLoading && (
        <Editor
          onOpenModelSelector={handleOpenBoxSelector}
          onOpenManikinSelector={handleOpenManikinSelector}
          isPlacementMode={isPlacementMode}
          hasEditingObject={editingObject !== null}
          showCoordinates={showCoordinates}
          onToggleCoordinates={handleToggleCoordinates}
        />
      )}

      {/* 모델 선택 패널 */}
      {!isLoading && showModelSelector && (
        <ModelSelector
          models={modelsToShow}
          onSelectModel={handleSelectModel}
          onClose={handleCloseModelSelector}
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

      {/* 아이패드 모달 */}
      <IPadModal
        isOpen={showIPadModal}
        onClose={() => setShowIPadModal(false)}
      />

      {/* 로딩 화면 */}
      {isLoading && <LoadingOverlay />}
    </>
  );
}
