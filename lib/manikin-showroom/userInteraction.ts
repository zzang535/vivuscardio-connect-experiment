/**
 * 사용자 인터랙션 관리 클래스
 * Three.js 씬에서 마우스/키보드 인터랙션 처리
 * - 클릭/드래그 구분
 * - 객체 선택 및 편집
 * - 배치 모드 관리
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import React from 'react';
import { createGhostBox, createPlacementIndicator, alignObjectToPlacement } from './objectControl';
import { ModelType } from './modelTypes';

/**
 * 인터랙션 컨텍스트 인터페이스
 * Three.js 객체 및 React refs를 포함
 */
export interface InteractionContext {
  // Three.js 객체
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  ground: THREE.Mesh;

  // React Refs (실시간 동기화 필요)
  userAddedObjectsRef: React.MutableRefObject<THREE.Object3D[]>;
  isPlacementModeRef: React.MutableRefObject<boolean>;
  objectToPlaceRef: React.MutableRefObject<THREE.Mesh | null>;
  editingObjectRef: React.MutableRefObject<THREE.Object3D | null>;
  originalPositionRef: React.MutableRefObject<THREE.Vector3 | null>;
  isPlacementValidRef: React.MutableRefObject<boolean>;
  mouseRef: React.MutableRefObject<THREE.Vector2>;
  placementIndicatorRef: React.MutableRefObject<THREE.Mesh | null>;
}

/**
 * 인터랙션 콜백 인터페이스
 * React state setter 함수들
 */
export interface InteractionCallbacks {
  setIsPlacementMode: (value: boolean) => void;
  setObjectToPlace: (obj: THREE.Mesh | null) => void;
  setEditingObject: (obj: THREE.Object3D | null) => void;
  setOriginalPosition: (pos: THREE.Vector3 | null) => void;
  setUserAddedObjects: React.Dispatch<React.SetStateAction<THREE.Object3D[]>>;
  setIsPlacementValid: (valid: boolean) => void;
  saveObjectsToStorage: (objects: THREE.Object3D[]) => void;
  onObjectPlaced: (modelType: ModelType, position: THREE.Vector3) => void;
  getModelTemplate?: (modelType: ModelType) => THREE.Object3D | null;
}

/**
 * 사용자 인터랙션 관리 클래스
 */
export class UserInteractionManager {
  // Three.js 객체
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private ground: THREE.Mesh;

  // React Refs
  private userAddedObjectsRef: React.MutableRefObject<THREE.Object3D[]>;
  private isPlacementModeRef: React.MutableRefObject<boolean>;
  private objectToPlaceRef: React.MutableRefObject<THREE.Mesh | null>;
  private editingObjectRef: React.MutableRefObject<THREE.Object3D | null>;
  private originalPositionRef: React.MutableRefObject<THREE.Vector3 | null>;
  private isPlacementValidRef: React.MutableRefObject<boolean>;
  private mouseRef: React.MutableRefObject<THREE.Vector2>;
  private placementIndicatorRef: React.MutableRefObject<THREE.Mesh | null>;

  // Callbacks
  private callbacks: InteractionCallbacks;

  // 내부 상태 (클릭/드래그 구분용)
  private mouseDownPosition = { x: 0, y: 0 };
  private isDragging = false;

  // Raycaster (재사용)
  private raycaster = new THREE.Raycaster();

  // 현재 선택된 모델 타입
  private currentModelType: ModelType | null = null;

  /**
   * 생성자
   */
  constructor(context: InteractionContext, callbacks: InteractionCallbacks) {
    // Three.js 객체 초기화
    this.scene = context.scene;
    this.camera = context.camera;
    this.renderer = context.renderer;
    this.controls = context.controls;
    this.ground = context.ground;

    // Refs 초기화
    this.userAddedObjectsRef = context.userAddedObjectsRef;
    this.isPlacementModeRef = context.isPlacementModeRef;
    this.objectToPlaceRef = context.objectToPlaceRef;
    this.editingObjectRef = context.editingObjectRef;
    this.originalPositionRef = context.originalPositionRef;
    this.isPlacementValidRef = context.isPlacementValidRef;
    this.mouseRef = context.mouseRef;
    this.placementIndicatorRef = context.placementIndicatorRef;

    // Callbacks 초기화
    this.callbacks = callbacks;
  }

  /**
   * 이벤트 리스너 등록
   * useEffect에서 호출
   */
  public setup(): void {
    this.renderer.domElement.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    this.renderer.domElement.addEventListener('click', this.handleClick);
    window.addEventListener('keydown', this.handleKeyDown);

    console.log('UserInteractionManager: Event listeners attached');
  }

  /**
   * 이벤트 리스너 제거
   * useEffect cleanup에서 호출
   */
  public cleanup(): void {
    this.renderer.domElement.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    this.renderer.domElement.removeEventListener('click', this.handleClick);
    window.removeEventListener('keydown', this.handleKeyDown);

    console.log('UserInteractionManager: Event listeners removed');
  }

  /**
   * 신규 배치 모드 시작 (외부에서 호출 가능)
   * @param modelType 배치할 모델 타입
   */
  public startPlacementMode(modelType: ModelType): void {
    console.log('Starting placement mode for model:', modelType.name);

    // 모델 타입 저장
    this.currentModelType = modelType;

    // 고스트 박스 생성
    const template =
      modelType.type === 'model'
        ? this.callbacks.getModelTemplate?.(modelType) || null
        : null;
    const ghostBox = createGhostBox(this.scene, modelType, {
      modelTemplate: template,
    });
    this.callbacks.setObjectToPlace(ghostBox);
    this.callbacks.setIsPlacementMode(true);

    // 배치 위치 인디케이터 생성 또는 크기 조절
    if (!this.placementIndicatorRef.current) {
      this.placementIndicatorRef.current = createPlacementIndicator(this.scene);
    }
    
    // 인디케이터 크기를 모델의 바닥면 크기에 맞게 조절
    const width = modelType.previewDimensions?.width || modelType.dimensions.width;
    const depth = modelType.previewDimensions?.depth || modelType.dimensions.depth;
    this.placementIndicatorRef.current.scale.set(width, depth, 1);
    this.placementIndicatorRef.current.visible = true;
  }

  /**
   * 편집 모드 진입 (외부에서 호출 가능)
   * @param object 편집할 객체
   */
  public enterEditMode(object: THREE.Object3D): void {
    console.log('Entering edit mode for object:', object.uuid);

    this.callbacks.setEditingObject(object);
    this.callbacks.setOriginalPosition(object.position.clone());

    const storedModelType = object.userData?.modelType as ModelType | undefined;
    const ghostModelType = storedModelType ?? this.createFallbackModelType(object);

    // 고스트 박스 생성 (기존 객체를 숨기고 고스트로 대체)
    const template =
      ghostModelType.type === 'model'
        ? this.callbacks.getModelTemplate?.(ghostModelType) || null
        : null;
    const ghostBox = createGhostBox(this.scene, ghostModelType, {
      modelTemplate: template,
    });
    ghostBox.position.copy(object.position);
    this.callbacks.setObjectToPlace(ghostBox);
    this.callbacks.setIsPlacementMode(true);

    // 원본 객체 숨김
    object.visible = false;

    // 인디케이터 표시 및 크기 조절
    if (!this.placementIndicatorRef.current) {
      this.placementIndicatorRef.current = createPlacementIndicator(this.scene);
    }
    const previewWidth =
      ghostModelType.previewDimensions?.width || ghostModelType.dimensions.width;
    const previewDepth =
      ghostModelType.previewDimensions?.depth || ghostModelType.dimensions.depth;
    this.placementIndicatorRef.current.scale.set(previewWidth, previewDepth, 1);
    this.placementIndicatorRef.current.visible = true;
  }

  /**
   * 편집 모드 종료 (배치 완료)
   */
  public exitEditMode(): void {
    console.log('Exiting edit mode');

    // 편집 모드: 기존 객체 위치 업데이트 및 다시 표시
    if (this.editingObjectRef.current && this.objectToPlaceRef.current) {
      const targetPosition = this.objectToPlaceRef.current.position.clone();
      const editingObject = this.editingObjectRef.current;
      const modelType = (editingObject.userData?.modelType as ModelType) ||
        this.createFallbackModelType(editingObject);

      alignObjectToPlacement(editingObject, modelType.dimensions, targetPosition);
      editingObject.visible = true;
      this.scene.remove(this.objectToPlaceRef.current);

      // 편집된 오브젝트 저장
      this.callbacks.saveObjectsToStorage(this.userAddedObjectsRef.current);
    }

    // 상태 초기화
    this.callbacks.setObjectToPlace(null);
    this.callbacks.setIsPlacementMode(false);
    this.callbacks.setEditingObject(null);
    this.callbacks.setOriginalPosition(null);
    this.currentModelType = null; // 모델 타입 초기화

    if (this.placementIndicatorRef.current) {
      this.placementIndicatorRef.current.visible = false;
    }
  }

  /**
   * 배치 취소 (ESC 키 또는 외부 취소)
   */
  public cancelPlacement(): void {
    console.log('Canceling placement');

    // 편집 모드: 원위치 복귀
    if (this.editingObjectRef.current && this.originalPositionRef.current) {
      this.editingObjectRef.current.position.copy(this.originalPositionRef.current);
      this.editingObjectRef.current.visible = true;

      // 고스트 박스 제거
      if (this.objectToPlaceRef.current) {
        this.scene.remove(this.objectToPlaceRef.current);
      }
    }
    // 신규 배치 모드: 고스트 박스만 제거
    else {
      if (this.objectToPlaceRef.current) {
        this.scene.remove(this.objectToPlaceRef.current);
      }
    }

    // 상태 초기화
    this.callbacks.setObjectToPlace(null);
    this.callbacks.setIsPlacementMode(false);
    this.callbacks.setEditingObject(null);
    this.callbacks.setOriginalPosition(null);
    this.currentModelType = null; // 모델 타입 초기화

    if (this.placementIndicatorRef.current) {
      this.placementIndicatorRef.current.visible = false;
    }
  }

  /**
   * 커서 스타일 업데이트
   * 애니메이션 루프에서 호출
   */
  public updateCursor(): void {
    // 1. 편집 모드 (기존 객체 이동)일 때: 'grabbing'
    if (this.isPlacementModeRef.current && this.editingObjectRef.current) {
      this.renderer.domElement.style.cursor = 'grabbing';
    }
    // 2. 배치 모드 (신규 객체 추가)일 때: 'crosshair'
    else if (this.isPlacementModeRef.current) {
      this.renderer.domElement.style.cursor = 'crosshair';
    }
    // 3. 일반 모드일 때
    else {
      this.raycaster.setFromCamera(this.mouseRef.current, this.camera);
      const intersects = this.raycaster.intersectObjects(
        this.userAddedObjectsRef.current,
        true // 자식 객체도 포함 (마네킹의 경우 여러 메쉬로 구성됨)
      );

      // 3.1. 잡을 수 있는 객체 위에 마우스가 있을 때: 'grab'
      if (intersects.length > 0) {
        this.renderer.domElement.style.cursor = 'grab';
      }
      // 3.2. 그 외 (배경 등): 'auto' (기본 커서)
      else {
        this.renderer.domElement.style.cursor = 'auto';
      }
    }
  }

  // ============================================
  // Private 이벤트 핸들러들 (화살표 함수로 this 바인딩)
  // ============================================

  /**
   * 마우스 다운 이벤트 핸들러
   * 클릭/드래그 구분을 위한 시작점 기록
   */
  private handleMouseDown = (event: MouseEvent): void => {
    this.mouseDownPosition.x = event.clientX;
    this.mouseDownPosition.y = event.clientY;
    this.isDragging = false;
  };

  /**
   * 마우스 이동 이벤트 핸들러
   * - 마우스 위치 업데이트 (배치 모드용)
   * - 드래그 감지 (5픽셀 이상 이동 시)
   */
  private handleMouseMove = (event: MouseEvent): void => {
    // 마우스 위치 업데이트 (normalized device coordinates)
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.mouseRef.current.set(x, y);

    // 드래그 감지 (5픽셀 threshold)
    const dx = event.clientX - this.mouseDownPosition.x;
    const dy = event.clientY - this.mouseDownPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      this.isDragging = true;
    }
  };

  /**
   * 클릭 이벤트 핸들러
   * 드래그가 아닐 때만 처리
   */
  private handleClick = (event: MouseEvent): void => {
    // 드래그였으면 클릭 처리 안함 (패닝과 구분)
    if (this.isDragging) {
      console.log('UserInteractionManager: Drag detected, ignoring click');
      return;
    }

    // 배치 모드일 때의 클릭 처리
    if (this.isPlacementModeRef.current && this.objectToPlaceRef.current) {
      this.handlePlacementClick();
      return;
    }

    // 일반 모드: 객체 클릭 감지
    if (!this.isPlacementModeRef.current) {
      this.handleObjectClick(event);
    }
  };

  /**
   * 키보드 이벤트 핸들러
   * ESC 키로 배치 취소
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.isPlacementModeRef.current) {
      this.cancelPlacement();
    }
  };

  // ============================================
  // Private 헬퍼 메서드들
  // ============================================

  /**
   * 배치 모드에서의 클릭 처리
   * 유효한 위치에 객체 배치
   */
  private handlePlacementClick(): void {
    // 유효하지 않은 위치에는 배치할 수 없음
    if (!this.isPlacementValidRef.current) {
      console.log('UserInteractionManager: Placement is invalid, cannot place object');
      return;
    }

    // 편집 모드인지 신규 배치인지 확인
    if (this.editingObjectRef.current) {
      // 편집 모드: exitEditMode 호출
      this.exitEditMode();
    } else if (this.currentModelType && this.objectToPlaceRef.current) {
      // 신규 배치: 외부 콜백 호출
      this.callbacks.onObjectPlaced(this.currentModelType, this.objectToPlaceRef.current.position);
      
      // 배치 후 상태 초기화
      this.scene.remove(this.objectToPlaceRef.current);
      this.callbacks.setObjectToPlace(null);
      this.callbacks.setIsPlacementMode(false);
      this.currentModelType = null;
      if (this.placementIndicatorRef.current) {
        this.placementIndicatorRef.current.visible = false;
      }
    }
  }

  /**
   * 일반 모드에서 객체 클릭 감지
   * 클릭된 사용자 추가 객체를 편집 모드로 전환
   */
  private handleObjectClick(event: MouseEvent): void {
    console.log('=== UserInteractionManager: 객체 클릭 감지 시도 ===');
    console.log('userAddedObjects 개수:', this.userAddedObjectsRef.current.length);
    console.log('클릭 위치:', event.clientX, event.clientY);

    // 캔버스 기준으로 마우스 좌표 계산
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    console.log('normalized mouse:', mouse.x, mouse.y);
    this.raycaster.setFromCamera(mouse, this.camera);

    const allIntersects = this.raycaster.intersectObjects(this.scene.children, true);
    const selectableUuids = new Set(
      this.userAddedObjectsRef.current.map((obj) => obj.uuid)
    );

    let selectedObject: THREE.Object3D | null = null;
    for (const intersect of allIntersects) {
      const resolved = this.resolveSelectableObject(
        intersect.object,
        selectableUuids
      );
      if (resolved) {
        selectedObject = resolved;
        break;
      }
    }

    console.log('Selectable object found:', selectedObject?.uuid ?? 'none');

    if (selectedObject) {
      this.enterEditMode(selectedObject);
    }
  }

  private resolveSelectableObject(
    object: THREE.Object3D,
    selectableUuids: Set<string>
  ): THREE.Object3D | null {
    let current: THREE.Object3D | null = object;
    while (current) {
      if (selectableUuids.has(current.uuid)) {
        return current;
      }
      const rootObject = current.userData?.rootObject as THREE.Object3D | undefined;
      if (rootObject && selectableUuids.has(rootObject.uuid)) {
        return rootObject;
      }
      current = current.parent as THREE.Object3D | null;
    }
    return null;
  }

  private createFallbackModelType(object: THREE.Object3D): ModelType {
    const dimensions = this.getObjectDimensions(object);
    return {
      id: object.uuid,
      name: 'editing_object',
      description: '',
      type: 'box',
      icon: '',
      color: this.getObjectColor(object),
      dimensions,
    };
  }

  private getObjectDimensions(object: THREE.Object3D) {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    return {
      width: size.x || 1,
      height: size.y || 1,
      depth: size.z || 1,
    };
  }

  private getObjectColor(object: THREE.Object3D): number {
    let detectedColor = 0xffffff;
    object.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        const material = node.material as THREE.MeshStandardMaterial;
        if (material?.color) {
          detectedColor = material.color.getHex();
        }
      }
    });
    return detectedColor;
  }
}
