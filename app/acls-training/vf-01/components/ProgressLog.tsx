"use client";

import { PROGRESS_STEPS, SCENE_LABEL, mmss } from "../scenario";
import type { Scene, TimelineItem } from "../scenario";

// 진행 상황판 — 우측에서 열리는 비차단(non-blocking) 드로어.
// 시나리오 진행 단계 스텝퍼 + 현장 보고(타임라인 로그)를 보여준다.
export function ProgressLog({ scene, timeline, onClose }: { scene: Scene; timeline: TimelineItem[]; onClose: () => void }) {
  const currentIndex = PROGRESS_STEPS.indexOf(scene);
  return (
    <aside className="absolute right-0 top-0 z-50 flex h-full w-[340px] flex-col overflow-y-auto border-l border-white/10 bg-[#091525] p-5 shadow-[-10px_0_36px_rgba(0,0,0,0.55)]">
      <div className="flex items-center justify-between">
        <div><h2 className="text-sm font-bold">진행 상황판</h2><p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">Progress &amp; field log</p></div>
        <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-400 hover:bg-white/5" aria-label="상황판 닫기">✕</button>
      </div>
      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Scenario progression</p>
      <div className="mt-3 space-y-1">{PROGRESS_STEPS.map((item, index) => <div key={item} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs ${item === scene ? "bg-cyan-300/10 text-cyan-200" : index < currentIndex ? "text-emerald-400" : "text-slate-600"}`}><span>{index < currentIndex ? "✓" : item === scene ? "●" : "○"}</span>{SCENE_LABEL[item]}</div>)}</div>
      <div className="my-5 h-px bg-white/10" />
      <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">현장 보고</h3><span className="text-[9px] uppercase tracking-wider text-slate-600">No score shown</span></div>
      <div className="mt-3 space-y-2">{timeline.slice().reverse().map((item, index) => <div key={`${item.at}-${index}`} className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.tone === "good" ? "bg-emerald-400" : item.tone === "warn" ? "bg-amber-400" : "bg-cyan-400"}`} /><div><span className="font-mono text-[9px] text-slate-600">{mmss(item.at)}</span><p className="mt-1 text-xs leading-5 text-slate-300">{item.text}</p></div></div>)}</div>
    </aside>
  );
}
