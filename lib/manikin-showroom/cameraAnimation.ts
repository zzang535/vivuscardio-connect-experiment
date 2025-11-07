/**
 * 카메라 애니메이션 유틸리티
 * 자동 360도 회전 무빙 등 카메라 애니메이션 기능 관리
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * 카메라 자동 무빙 상태 인터페이스
 */
export interface AutoMoveState {
  isActive: boolean;
  startTime: number;
  duration: number; // 밀리초
  startPosition: THREE.Vector3;
  startTarget: THREE.Vector3;
  startYOffset: number; // Y축 시작 오프셋
}

/**
 * 카메라 자동 무빙 상태 초기화
 * @param duration 무빙 지속 시간 (밀리초, 기본값: 10000ms = 10초)
 * @returns 초기화된 AutoMoveState 객체
 */
export function createAutoMoveState(duration: number = 10000): AutoMoveState {
  return {
    isActive: false,
    startTime: 0,
    duration,
    startPosition: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    startYOffset: 0,
  };
}

/**
 * 카메라 자동 무빙 시작
 * @param state 자동 무빙 상태 객체
 * @param camera 카메라 객체
 * @param controls OrbitControls 객체
 */
export function startAutoMove(
  state: AutoMoveState,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls
): void {
  // 현재 카메라 위치와 타겟 저장
  state.startPosition.copy(camera.position);
  state.startTarget.copy(controls.target);
  state.startTime = Date.now();
  state.isActive = true;

  // Y축 오프셋 계산: 현재 Y값보다 조금 더 높은 곳에서 시작
  // 초기 거리의 30%만큼 Y값 증가
  const initialDistance = state.startPosition
    .clone()
    .sub(state.startTarget)
    .length();
  state.startYOffset = initialDistance;

  // OrbitControls 비활성화 (무빙 중에는 수동 조작 불가)
  controls.enableRotate = false;
  controls.enableZoom = false;
  controls.enablePan = false;

  console.log("Camera auto-move started");
  console.log("Start position:", state.startPosition);
  console.log("Start target:", state.startTarget);
  console.log("Y offset:", state.startYOffset);
}

/**
 * 카메라 자동 무빙 업데이트
 * 애니메이션 루프에서 매 프레임마다 호출되어야 함
 *
 * 동작:
 * 1. 아주 멀리서 시작 (반지름 확대)
 * 2. 천천히 타겟을 향해 이동 (반지름 축소)
 * 3. 동시에 세로축(Y축) 기준으로 360도 회전
 *
 * @param state 자동 무빙 상태 객체
 * @param camera 카메라 객체
 * @param controls OrbitControls 객체
 * @returns 무빙이 완료되었는지 여부
 */
export function updateAutoMove(
  state: AutoMoveState,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls
): boolean {
  if (!state.isActive) {
    return false;
  }

  const now = Date.now();
  const elapsed = now - state.startTime;
  const progress = Math.min(elapsed / state.duration, 1);

  // 초기 카메라 위치에서 타겟으로 향하는 방향 벡터
  const directionToTarget = state.startTarget
    .clone()
    .sub(state.startPosition)
    .normalize();

  // 초기 거리
  const initialDistance = state.startPosition
    .clone()
    .sub(state.startTarget)
    .length();

  // ease-in-out 곡선을 사용하여 더 자연스러운 움직임
  const easeProgress = (1 - Math.cos(progress * Math.PI)) / 2;

  // 멀리서 시작 (초기 거리의 1.7배)하여 천천히 타겟으로 이동
  // 시작: initialDistance * 1.7 (70% 더 멀리)
  // 끝: initialDistance * 1 (초기 위치)
  const currentDistance =
    initialDistance * 1.7 -
    (initialDistance * 1.7 - initialDistance) * easeProgress;

  // 같은 축 방향으로 먼 거리에서 시작하여 가까워지는 위치 계산
  const basePosition = state.startTarget
    .clone()
    .sub(directionToTarget.clone().multiplyScalar(currentDistance));

  // Y축 중심으로 360도 회전
  // 회전 중심은 targetX, targetZ이고, Y는 기본 위치의 Y값 유지
  const angle = progress * Math.PI * 2; // 한 바퀴 (360도)

  // 회전을 위한 반지름 (XZ 평면에서의 거리)
  const rotationRadius = basePosition.clone().sub(state.startTarget).length();
  const baseAngle = Math.atan2(
    basePosition.z - state.startTarget.z,
    basePosition.x - state.startTarget.x
  );

  // 회전된 위치 계산
  const newX =
    state.startTarget.x + rotationRadius * Math.cos(baseAngle + angle);
  const newZ =
    state.startTarget.z + rotationRadius * Math.sin(baseAngle + angle);

  // Y축 로그 곡선을 사용한 감소
  // 처음에는 빠르게 감소하다가 점점 느려지는 로그 함수 형태
  // 로그 함수: 1 - log(1 + progress * 9) / log(10)
  // progress가 0일 때: 1 - log(1) / log(10) = 1
  // progress가 1일 때: 1 - log(10) / log(10) = 0
  const logProgress = 1 - Math.log(1 + progress * 9) / Math.log(10);
  const newY = basePosition.y + state.startYOffset * logProgress;

  camera.position.set(newX, newY, newZ);
  camera.lookAt(state.startTarget.x, state.startTarget.y, state.startTarget.z);

  // 진행도 표시 (콘솔)
  if (Math.round(progress * 100) % 10 === 0) {
    console.log(
      `Camera auto-move progress: ${Math.round(
        progress * 100
      )}% (distance: ${currentDistance.toFixed(2)})`
    );
  }

  // 무빙 완료 여부 반환
  return progress >= 1;
}

/**
 * 카메라 자동 무빙 완료 처리
 * @param state 자동 무빙 상태 객체
 * @param camera 카메라 객체
 * @param controls OrbitControls 객체
 */
export function completeAutoMove(
  state: AutoMoveState,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls
): void {
  state.isActive = false;

  // 카메라를 초기 위치로 복원
  camera.position.copy(state.startPosition);
  camera.lookAt(state.startTarget.x, state.startTarget.y, state.startTarget.z);

  // OrbitControls 타겟도 복원
  controls.target.copy(state.startTarget);
  controls.update();

  // OrbitControls 다시 활성화
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.enablePan = true;

  console.log("Camera auto-move completed");
}
