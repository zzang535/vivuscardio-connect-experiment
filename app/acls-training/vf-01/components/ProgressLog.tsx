"use client";

import { PROGRESS_STEPS, SCENE_LABEL, mmss } from "../scenario";
import type { Scene, TimelineItem } from "../scenario";

export function ProgressLog({ scene, timeline, onClose }: { scene: Scene; timeline: TimelineItem[]; onClose: () => void }) {
  const currentIndex = PROGRESS_STEPS.indexOf(scene);

  return (
    <aside className="absolute right-0 top-0 z-50 flex h-full w-[340px] flex-col overflow-y-auto border-l border-[#2d3945] bg-[#111a22] p-5 shadow-[-8px_0_24px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between border-b border-[#2d3945] pb-4">
        <div>
          <h2 className="text-base font-bold">훈련 기록</h2>
          <p className="mt-0.5 text-xs text-slate-400">현재 단계와 수행 내역</p>
        </div>
        <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded border border-[#3a4651] text-slate-300 hover:bg-white/5" aria-label="훈련 기록 닫기">✕</button>
      </div>

      <h3 className="mt-5 text-xs font-semibold text-slate-400">진행 단계</h3>
      <ol className="mt-2 border-l border-[#3a4651] pl-4">
        {PROGRESS_STEPS.map((item, index) => (
          <li key={item} className={`relative py-2 text-xs ${item === scene ? "font-bold text-white" : index < currentIndex ? "text-emerald-400" : "text-slate-500"}`}>
            <span className={`absolute -left-[21px] top-3 h-2.5 w-2.5 rounded-full border-2 border-[#111a22] ${item === scene ? "bg-[#4fa3bd]" : index < currentIndex ? "bg-emerald-500" : "bg-[#46515c]"}`} />
            {SCENE_LABEL[item]}
          </li>
        ))}
      </ol>

      <div className="mt-6 flex items-center justify-between border-b border-[#2d3945] pb-2">
        <h3 className="text-xs font-semibold text-slate-300">수행 내역</h3>
        <span className="text-[10px] text-slate-500">최근 항목 순</span>
      </div>
      <div className="divide-y divide-[#26313b]">
        {timeline.slice().reverse().map((item, index) => (
          <div key={`${item.at}-${index}`} className="grid grid-cols-[42px_1fr] gap-3 py-3">
            <span className="font-mono text-[10px] text-slate-500">{mmss(item.at)}</span>
            <p className={`text-xs leading-5 ${item.tone === "good" ? "text-emerald-300" : item.tone === "warn" ? "text-amber-300" : "text-slate-300"}`}>{item.text}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
