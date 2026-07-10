// VF-01 시나리오 전반에서 공유하는 타입·상수·유틸.
// page.tsx, VitalsMonitor, ProgressLog 등에서 import 한다.

export type Scene = "ready" | "ward" | "alarm" | "check" | "response" | "team" | "rhythm" | "shock" | "debrief";
export type LogTone = "normal" | "good" | "warn";
export type TimelineItem = { at: number; text: string; tone: LogTone };

export const SCENE_LABEL: Record<Scene, string> = {
  ready: "브리핑",
  ward: "병동 관찰",
  alarm: "모니터 알람",
  check: "환자 확인",
  response: "초기 대응",
  team: "코드팀 도착",
  rhythm: "리듬 확인",
  shock: "제세동",
  debrief: "디브리핑",
};

// 진행 상황판(ProgressLog)과 상단 HUD 스텝퍼가 공유하는 순서 (ready/debrief 제외).
export const PROGRESS_STEPS: Scene[] = ["ward", "alarm", "check", "response", "team", "rhythm", "shock"];

export function mmss(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}
