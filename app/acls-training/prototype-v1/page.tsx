"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type ActionId = "code" | "cpr" | "pads" | "rhythm" | "charge" | "shock" | "iv" | "epi";

type SimulationState = {
  codeCalled: boolean;
  cprActive: boolean;
  padsAttached: boolean;
  rhythmChecked: boolean;
  charged: boolean;
  shockCount: number;
  ivReady: boolean;
  epinephrineGiven: boolean;
};

type EventItem = {
  time: number;
  label: string;
  tone: "good" | "info" | "warn";
};

const INITIAL_STATE: SimulationState = {
  codeCalled: false,
  cprActive: false,
  padsAttached: false,
  rhythmChecked: false,
  charged: false,
  shockCount: 0,
  ivReady: false,
  epinephrineGiven: false,
};

const ACTIONS: Array<{ id: ActionId; label: string; detail: string; icon: string }> = [
  { id: "code", label: "코드 블루 호출", detail: "소생팀 활성화", icon: "✚" },
  { id: "cpr", label: "CPR 시작", detail: "흉부압박 시행", icon: "♥" },
  { id: "pads", label: "패드 부착", detail: "제세동기 연결", icon: "⌁" },
  { id: "rhythm", label: "리듬 확인", detail: "압박 일시 중지", icon: "⌇" },
  { id: "charge", label: "제세동기 충전", detail: "200 J", icon: "ϟ" },
  { id: "shock", label: "제세동 시행", detail: "모두 물러나세요", icon: "ϟ" },
  { id: "iv", label: "IV 확보", detail: "약물 경로 확보", icon: "+" },
  { id: "epi", label: "에피네프린", detail: "1 mg IV/IO", icon: "▰" },
];

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function AclsTrainingPage() {
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [state, setState] = useState<SimulationState>(INITIAL_STATE);
  const [events, setEvents] = useState<EventItem[]>([
    { time: 0, label: "환자 반응 없음 · 정상 호흡 없음 · 맥박 촉지 안 됨", tone: "warn" },
  ]);
  const [selectedAction, setSelectedAction] = useState<ActionId | null>(null);
  const [toast, setToast] = useState("환자 상태를 확인하고 첫 처치를 지시하세요.");
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!started) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [started]);

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(false), 260);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const cprCycle = Math.floor(elapsed / 120) + 1;
  const cprCycleSeconds = elapsed % 120;
  const score = useMemo(() => {
    let value = 0;
    if (state.codeCalled) value += 12;
    if (state.cprActive) value += 18;
    if (state.padsAttached) value += 15;
    if (state.rhythmChecked) value += 15;
    if (state.shockCount > 0) value += 25;
    if (state.ivReady) value += 10;
    if (state.epinephrineGiven) value += 5;
    return value;
  }, [state]);

  const isEnabled = (action: ActionId) => {
    switch (action) {
      case "code": return !state.codeCalled;
      case "cpr": return !state.cprActive;
      case "pads": return state.codeCalled && !state.padsAttached;
      case "rhythm": return state.padsAttached && state.cprActive && !state.rhythmChecked;
      case "charge": return state.rhythmChecked && !state.charged;
      case "shock": return state.charged;
      case "iv": return state.codeCalled && !state.ivReady;
      case "epi": return state.ivReady && state.shockCount >= 2 && !state.epinephrineGiven;
    }
  };

  const addEvent = (label: string, tone: EventItem["tone"] = "good") => {
    setEvents((current) => [{ time: elapsed, label, tone }, ...current].slice(0, 7));
  };

  const performAction = (action: ActionId) => {
    if (!started) setStarted(true);
    setSelectedAction(action);

    if (!isEnabled(action)) {
      setToast("현재 단계에서는 수행할 수 없습니다. 병실 상태와 선행 처치를 확인하세요.");
      addEvent(`부적절한 처치 시도 · ${ACTIONS.find((item) => item.id === action)?.label}`, "warn");
      return;
    }

    switch (action) {
      case "code":
        setState((current) => ({ ...current, codeCalled: true }));
        setToast("코드 블루 호출. 소생팀이 병실로 들어옵니다.");
        addEvent("코드 블루 호출 · 소생팀 도착");
        break;
      case "cpr":
        setState((current) => ({ ...current, cprActive: true }));
        setToast("흉부압박을 시작했습니다. 모니터와 제세동기를 연결하세요.");
        addEvent("고품질 CPR 시작");
        break;
      case "pads":
        setState((current) => ({ ...current, padsAttached: true }));
        setToast("제세동 패드가 부착되었습니다. 압박을 최소로 중단하고 리듬을 확인하세요.");
        addEvent("제세동 패드 부착 완료");
        break;
      case "rhythm":
        setState((current) => ({ ...current, rhythmChecked: true, cprActive: false }));
        setToast("VF입니다. Shockable rhythm — 제세동기를 충전하세요.");
        addEvent("리듬 확인 · Ventricular fibrillation", "info");
        break;
      case "charge":
        setState((current) => ({ ...current, charged: true }));
        setToast("200 J 충전 완료. 모두 환자에게서 물러났는지 확인하세요.");
        addEvent("제세동기 200 J 충전 완료", "info");
        break;
      case "shock":
        setState((current) => ({
          ...current,
          charged: false,
          shockCount: current.shockCount + 1,
          rhythmChecked: false,
          cprActive: true,
        }));
        setFlash(true);
        setToast("Shock 전달. 맥박 확인 없이 즉시 CPR을 재개했습니다.");
        addEvent(`${state.shockCount + 1}차 제세동 시행 · CPR 즉시 재개`);
        break;
      case "iv":
        setState((current) => ({ ...current, ivReady: true }));
        setToast("IV 경로가 확보되었습니다. CPR을 계속하며 약물 시점을 확인하세요.");
        addEvent("IV 접근 확보");
        break;
      case "epi":
        setState((current) => ({ ...current, epinephrineGiven: true }));
        setToast("에피네프린 1 mg 투여. 다음 투여 간격을 기록합니다.");
        addEvent("Epinephrine 1 mg IV 투여");
        break;
    }
  };

  const reset = () => {
    setStarted(false);
    setElapsed(0);
    setState(INITIAL_STATE);
    setEvents([{ time: 0, label: "환자 반응 없음 · 정상 호흡 없음 · 맥박 촉지 안 됨", tone: "warn" }]);
    setSelectedAction(null);
    setToast("환자 상태를 확인하고 첫 처치를 지시하세요.");
  };

  return (
    <main className="min-h-screen bg-[#07111f] text-slate-100 selection:bg-cyan-400/30">
      <header className="flex h-[72px] items-center justify-between border-b border-white/10 bg-[#091525] px-6">
        <div className="flex items-center gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 font-black text-[#07111f]">V</div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300">Vivus Cardio Simulation</div>
            <h1 className="text-lg font-semibold">성인 심정지 · VF 시나리오</h1>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Code timer</div>
            <div className="font-mono text-2xl font-semibold tabular-nums text-white">{formatTime(elapsed)}</div>
          </div>
          <button onClick={reset} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5">다시 시작</button>
        </div>
      </header>

      <section className="grid min-h-[calc(100vh-72px)] grid-cols-[minmax(720px,1fr)_360px]">
        <div className="flex min-w-0 flex-col">
          <div className="relative min-h-[520px] flex-1 overflow-hidden bg-slate-800">
            <Image src="/acls-training/hospital-room-v1.png" alt="코드 블루 훈련용 병실" fill priority sizes="(max-width: 1080px) 100vw, calc(100vw - 360px)" className="object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07111f]/80 via-transparent to-[#07111f]/15" />

            <div className="absolute left-[38%] top-[37%] h-[27%] w-[23%] -rotate-[2deg]">
              <div className="absolute left-[16%] top-[4%] h-[27%] w-[20%] rounded-[50%] bg-[#d8a384] shadow-lg" />
              <div className="absolute left-[28%] top-[13%] h-[42%] w-[52%] rounded-[45%_50%_35%_35%] bg-[#b9d8e8] shadow-xl" />
              <div className="absolute left-[45%] top-[46%] h-[32%] w-[35%] rounded-b-full bg-slate-100/90" />
              {state.padsAttached && <><span className="absolute left-[42%] top-[24%] h-5 w-7 rotate-12 rounded bg-slate-100 shadow ring-2 ring-cyan-500" /><span className="absolute left-[61%] top-[34%] h-5 w-7 -rotate-12 rounded bg-slate-100 shadow ring-2 ring-cyan-500" /></>}
            </div>

            {state.codeCalled && (
              <>
                <TeamMember className="left-[24%] top-[35%]" color="#0f766e" label="CPR" active={state.cprActive} />
                <TeamMember className="left-[57%] top-[34%]" color="#1d4ed8" label="AIRWAY" active={false} />
                <TeamMember className="left-[71%] top-[47%]" color="#6d28d9" label="MED" active={state.ivReady} />
              </>
            )}

            {state.cprActive && <div className="absolute left-[44.5%] top-[42%] h-16 w-16 animate-ping rounded-full border-4 border-cyan-300/70" />}
            {flash && <div className="absolute inset-0 z-30 bg-white/85" />}

            <div className="absolute right-[24%] top-[17%] w-[190px] rounded-xl border border-slate-500 bg-[#07111f]/95 p-3 shadow-2xl backdrop-blur">
              <div className="mb-2 flex items-center justify-between text-[10px] font-bold text-slate-400"><span>PATIENT MONITOR</span><span className="text-emerald-400">● LIVE</span></div>
              <div className="relative h-16 overflow-hidden rounded bg-black/80">
                <div className="ecg-grid absolute inset-0 opacity-40" />
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 220 60" preserveAspectRatio="none" aria-hidden="true">
                  <polyline points="0,33 10,12 19,48 29,7 39,45 51,14 62,50 73,9 85,43 97,16 108,49 120,8 132,44 143,12 155,47 167,10 179,43 191,15 203,48 220,22" fill="none" stroke="#5eead4" strokeWidth="2.4" />
                </svg>
              </div>
              <div className="mt-2 flex items-end justify-between"><span className="text-xs font-bold text-cyan-300">{state.rhythmChecked ? "VF" : "---"}</span><span className="font-mono text-3xl font-semibold text-emerald-400">--</span></div>
            </div>

            <div className="absolute left-5 top-5 flex gap-2">
              <StatusPill active={state.cprActive} label={state.cprActive ? "CPR 진행 중" : "CPR 중단"} />
              <StatusPill active={state.padsAttached} label={state.padsAttached ? "패드 연결됨" : "패드 미연결"} />
              <StatusPill active={state.charged} label={state.charged ? "200 J 충전 완료" : `${state.shockCount} shocks`} />
            </div>

            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl border border-white/10 bg-[#07111f]/88 px-5 py-4 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-400/15 text-cyan-300">●</div>
                <div><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-400">Team report</div><p className="mt-1 text-sm text-white">{toast}</p></div>
              </div>
              <div className="ml-4 rounded-xl bg-white/5 px-4 py-2 text-right"><div className="text-[10px] uppercase text-slate-500">CPR cycle {cprCycle}</div><div className="font-mono text-sm text-slate-200">{formatTime(cprCycleSeconds)} / 02:00</div></div>
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#0a1728] p-4">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">팀 처치 지시</h2><span className="text-xs text-slate-500">정답은 표시되지 않습니다 · 상황을 판단해 선택하세요</span></div>
            <div className="grid grid-cols-4 gap-2">
              {ACTIONS.map((action) => {
                const enabled = isEnabled(action.id);
                return <button key={action.id} onClick={() => performAction(action.id)} className={`group flex min-h-[76px] items-center gap-3 rounded-xl border px-3 text-left transition ${selectedAction === action.id ? "border-cyan-400/70 bg-cyan-400/10" : "border-white/10 bg-white/[0.035] hover:border-white/25 hover:bg-white/[0.07]"}`}>
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-lg font-bold ${enabled ? "bg-cyan-400 text-[#07111f]" : "bg-slate-700 text-slate-400"}`}>{action.icon}</span>
                  <span><span className="block text-sm font-semibold text-slate-100">{action.label}</span><span className="mt-0.5 block text-[11px] text-slate-500">{action.detail}</span></span>
                </button>;
              })}
            </div>
          </div>
        </div>

        <aside className="border-l border-white/10 bg-[#091525] p-5">
          <div className="flex items-center justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Live assessment</div><h2 className="mt-1 text-lg font-semibold">시나리오 진행</h2></div><div className="grid h-14 w-14 place-items-center rounded-full border-4 border-cyan-400/20 bg-cyan-400/10 text-lg font-bold text-cyan-300">{score}</div></div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="mb-3 flex justify-between text-xs"><span className="text-slate-400">첫 번째 CPR 주기</span><span className="font-mono text-cyan-300">{Math.min(100, Math.round((cprCycleSeconds / 120) * 100))}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${Math.min(100, (cprCycleSeconds / 120) * 100)}%` }} /></div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs"><MiniMetric label="Shock" value={`${state.shockCount}회`} /><MiniMetric label="IV access" value={state.ivReady ? "확보" : "대기"} /><MiniMetric label="Epinephrine" value={state.epinephrineGiven ? "투여" : "미투여"} /><MiniMetric label="Rhythm" value={state.rhythmChecked ? "VF" : "미확인"} /></div>
          </div>

          <div className="mt-6 flex items-center justify-between"><h3 className="text-sm font-semibold">이벤트 로그</h3><span className="text-[10px] uppercase tracking-wider text-slate-600">Latest first</span></div>
          <div className="mt-3 space-y-2">
            {events.map((event, index) => <div key={`${event.time}-${index}`} className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${event.tone === "good" ? "bg-emerald-400" : event.tone === "warn" ? "bg-amber-400" : "bg-cyan-400"}`} /><div><span className="font-mono text-[10px] text-slate-500">{formatTime(event.time)}</span><p className="mt-0.5 text-xs leading-5 text-slate-300">{event.label}</p></div></div>)}
          </div>

          <div className="mt-6 rounded-xl border border-amber-400/15 bg-amber-400/[0.06] p-3 text-[11px] leading-5 text-amber-100/70">교육용 UI 프로토타입입니다. 실제 진료 또는 공식 ACLS 자격 과정을 대체하지 않습니다.</div>
        </aside>
      </section>

      <style jsx global>{`
        .ecg-grid { background-image: linear-gradient(rgba(45,212,191,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(45,212,191,.18) 1px,transparent 1px); background-size: 10px 10px; }
      `}</style>
    </main>
  );
}

function TeamMember({ className, color, label, active }: { className: string; color: string; label: string; active: boolean }) {
  return <div className={`absolute ${className} h-[34%] w-[11%] drop-shadow-2xl ${active ? "animate-[pulse_1s_ease-in-out_infinite]" : ""}`}>
    <div className="absolute left-[31%] top-0 h-[24%] w-[38%] rounded-full bg-[#bd8768]" />
    <div className="absolute left-[17%] top-[19%] h-[48%] w-[66%] rounded-[30%_30%_18%_18%]" style={{ background: color }} />
    <div className="absolute left-[23%] top-[62%] h-[35%] w-[20%] rounded-b-lg bg-slate-700" /><div className="absolute right-[23%] top-[62%] h-[35%] w-[20%] rounded-b-lg bg-slate-700" />
    <span className="absolute left-1/2 top-[34%] -translate-x-1/2 text-[8px] font-black tracking-wider text-white/90">{label}</span>
  </div>;
}

function StatusPill({ active, label }: { active: boolean; label: string }) {
  return <div className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold backdrop-blur ${active ? "border-emerald-300/30 bg-emerald-400/20 text-emerald-100" : "border-white/15 bg-[#07111f]/70 text-slate-300"}`}><span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-300" : "bg-slate-500"}`} />{label}</div>;
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-black/15 p-3"><div className="text-[10px] uppercase tracking-wider text-slate-600">{label}</div><div className="mt-1 font-semibold text-slate-200">{value}</div></div>;
}
