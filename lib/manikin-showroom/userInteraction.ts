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
import { createGhostBox, createPlacementIndicator } from './objectControl';
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
  userAddedObjectsRef: React.MutableRefObject<THREE.Mesh[]>;
  isPlacementModeRef: React.MutableRefObject<boolean>;
  objectToPlaceRef: React.MutableRefObject<THREE.Mesh | null>;
  editingObjectRef: React.MutableRefObject<THREE.Mesh | null>;
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
  setEditingObject: (obj: THREE.Mesh | null) => void;
  setOriginalPosition: (pos: THREE.Vector3 | null) => void;
  setUserAddedObjects: React.Dispatch<React.SetStateAction<THREE.Mesh[]>>;
  setIsPlacementValid: (valid: boolean) => void;
  saveObjectsToStorage: (objects: THREE.Mesh[]) => void;
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
  private userAddedObjectsRef: React.MutableRefObject<THREE.Mesh[]>;
  private isPlacementModeRef: React.MutableRefObject<boolean>;
  private objectToPlaceRef: React.MutableRefObject<THREE.Mesh | null>;
  private editingObjectRef: React.MutableRefObject<THREE.Mesh | null>;
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
    const ghostBox = createGhostBox(this.scene, modelType);
    this.callbacks.setObjectToPlace(ghostBox);
    this.callbacks.setIsPlacementMode(true);

    // 배치 위치 인디케이터 생성
    if (!this.placementIndicatorRef.current) {
      this.placementIndicatorRef.current = createPlacementIndicator(this.scene);
    }
    this.placementIndicatorRef.current.visible = true;
  }

  /**
   * 편집 모드 진입 (외부에서 호출 가능)
   * @param object 편집할 객체
   */
  public enterEditMode(object: THREE.Mesh): void {
    console.log('Entering edit mode for object:', object.uuid);

    this.callbacks.setEditingObject(object);
    this.callbacks.setOriginalPosition(object.position.clone());

    // 고스트 박스 생성 (기존 객체를 숨기고 고스트로 대체)
    // 편집 모드에서는 모델 타입 없이 기본 크기 사용
    const ghostBox = createGhostBox(this.scene);
    ghostBox.position.copy(object.position);
    this.callbacks.setObjectToPlace(ghostBox);
    this.callbacks.setIsPlacementMode(true);

    // 원본 객체 숨김
    object.visible = false;

    // 인디케이터 표시
    if (!this.placementIndicatorRef.current) {
      this.placementIndicatorRef.current = createPlacementIndicator(this.scene);
    }
    this.placementIndicatorRef.current.visible = true;
  }

  /**
   * 편집 모드 종료 (배치 완료)
   */
  public exitEditMode(): void {
    console.log('Exiting edit mode');

    // 편집 모드: 기존 객체 위치 업데이트 및 다시 표시
    if (this.editingObjectRef.current && this.objectToPlaceRef.current) {
      this.editingObjectRef.current.position.copy(this.objectToPlaceRef.current.position);
      this.editingObjectRef.current.visible = true;
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
        false
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
    } else {
      // 신규 배치: 고스트 박스를 실제 객체로 변환
      this.finalizeNewPlacement();
    }
  }

  /**
   * 신규 객체 배치 완료
   */
  private finalizeNewPlacement(): void {
    if (!this.objectToPlaceRef.current) return;

    console.log('UserInteractionManager: Finalizing new placement');

    // 고스트 박스를 실제 객체로 변환
    const ghostBox = this.objectToPlaceRef.current;
    const finalBox = ghostBox.clone();

    // 불투명한 재질로 변경 (선택된 모델 타입의 색상 사용)
    const color = this.currentModelType?.color || 0xcccccc;
    finalBox.material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.8,
      metalness: 0.2,
      transparent: false,
      opacity: 1,
    });

    this.scene.add(finalBox);

    // 사용자 추가 객체 목록에 추가 및 저장
    this.callbacks.setUserAddedObjects((prev) => {
      const updatedObjects = [...prev, finalBox];
      this.callbacks.saveObjectsToStorage(updatedObjects);
      return updatedObjects;
    });

    // 고스트 박스 제거
    this.scene.remove(ghostBox);

    // 배치 모드 종료
    this.callbacks.setObjectToPlace(null);
    this.callbacks.setIsPlacementMode(false);
    this.currentModelType = null; // 모델 타입 초기화

    if (this.placementIndicatorRef.current) {
      this.placementIndicatorRef.current.visible = false;
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

    // scene 전체에서 검색하되 userAddedObjects에 포함된 객체만 선택
    const allIntersects = this.raycaster.intersectObjects(this.scene.children, true);

    // userAddedObjects에 포함된 객체만 필터링
    const userAddedObjectUuids = new Set(
      this.userAddedObjectsRef.current.map((obj) => obj.uuid)
    );
    const intersects = allIntersects.filter((intersect) =>
      userAddedObjectUuids.has(intersect.object.uuid)
    );

    console.log(`Click detected: ${intersects.length} user objects intersected`);

    if (intersects.length > 0) {
      console.log('첫 번째 intersect:', intersects[0]);
      const clickedObject = intersects[0].object as THREE.Mesh;
      console.log('객체 클릭됨!', clickedObject);

      // 편집 모드 진입
      this.enterEditMode(clickedObject);
    }
  }
}
