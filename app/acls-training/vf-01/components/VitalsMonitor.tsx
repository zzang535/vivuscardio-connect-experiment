"use client";

import { useEffect, useRef, useState } from "react";

// 환자 모니터(ECG) — VF 세동파 + SpO₂ 평탄 맥파를 실제 모니터처럼 쓸어 그리는 canvas 위젯.
// 각 요소에 ? 아이콘(InfoDot)으로 설명 팝오버를 제공한다.
// shifted: 우측 진행 상황판이 열렸을 때 가리지 않도록 왼쪽으로 비켜난다.
export function VitalsMonitor({ cpr, shifted }: { cpr: boolean; shifted: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cprRef = useRef(cpr);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    cprRef.current = cpr;
  }, [cpr]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || 440;
    const h = canvas.clientHeight || 200;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.scale(dpr, dpr);

    const ecgY = h * 0.3;
    const ecgA = h * 0.2;
    const plethY = h * 0.78;
    const plethA = h * 0.1;
    const speed = 62; // px/s sweep
    const eraseW = 20;

    const vf = (t: number) => {
      const env = 0.62 + 0.38 * Math.sin(t * 2 * Math.PI * 0.43);
      let v =
        Math.sin(t * 2 * Math.PI * 4.1) * 0.5 +
        Math.sin(t * 2 * Math.PI * 6.9 + 1.2) * 0.33 +
        Math.sin(t * 2 * Math.PI * 9.3 + 0.6) * 0.2 +
        (Math.random() - 0.5) * 0.35;
      v *= env;
      if (cprRef.current) v += Math.sin(t * 2 * Math.PI * 1.83) * 0.85; // ~110/min 압박 아티팩트
      return v;
    };
    const pleth = (t: number) => (Math.random() - 0.5) * 0.12 + Math.sin(t * 2 * Math.PI * 0.3) * 0.05;

    let x = 0;
    let prevYe = ecgY;
    let prevYp = plethY;
    let t = 0;
    let last = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;
      let nx = x + speed * dt;
      let wrapped = false;
      if (nx >= w) {
        nx -= w;
        wrapped = true;
      }

      ctx.clearRect(nx, 0, eraseW, h);
      if (nx + eraseW > w) ctx.clearRect(0, 0, nx + eraseW - w, h);

      const ye = ecgY - vf(t) * ecgA;
      const yp = plethY - pleth(t) * plethA;

      if (!wrapped) {
        ctx.lineWidth = 1.5;
        ctx.lineJoin = "round";
        ctx.shadowBlur = 6;
        ctx.strokeStyle = "#3bf07d";
        ctx.shadowColor = "rgba(59,240,125,0.75)";
        ctx.beginPath();
        ctx.moveTo(x, prevYe);
        ctx.lineTo(nx, ye);
        ctx.stroke();
        ctx.strokeStyle = "#31d3ff";
        ctx.shadowColor = "rgba(49,211,255,0.6)";
        ctx.beginPath();
        ctx.moveTo(x, prevYp);
        ctx.lineTo(nx, yp);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      prevYe = ye;
      prevYp = yp;
      x = nx;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div onClick={() => setInfo(null)} className={`absolute top-[13%] w-[440px] max-w-[46%] overflow-hidden rounded-2xl border border-slate-500/60 bg-[#050a12]/95 shadow-2xl backdrop-blur transition-[right] duration-300 ${shifted ? "right-[360px]" : "right-[4%]"}`}>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 text-[13px] font-bold">
        <span className="tracking-wide text-slate-200">BED 3 · PATIENT MONITOR</span>
        <span className="flex items-center gap-1.5 text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-400" />CONNECTED<InfoDot id="conn" info={info} onOpen={setInfo} align="right" text="리드·센서가 환자에 정상 연결된 상태." /></span>
      </div>
      <div className="flex animate-pulse items-center justify-between bg-red-600/90 px-4 py-1.5">
        <span className="flex items-center gap-1.5 text-sm font-black tracking-widest text-white">⚠ VF / VT<InfoDot id="alarm" info={info} onOpen={setInfo} text="심실세동/심실빈맥 감지 알람. 즉시 제세동이 필요한 쇼커블 리듬이며, 빨강은 최고 우선순위 경보입니다." /></span>
        <span className="text-[11px] font-bold text-red-100">CHECK PATIENT</span>
      </div>
      <div className="relative h-[200px] bg-black">
        <div className="vf-grid absolute inset-0 opacity-40" />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        <span className="absolute left-3 top-1.5 flex items-center gap-1 text-xs font-bold text-emerald-400">II<InfoDot id="ii" info={info} onOpen={setInfo} text="심전도 리드 II. 초록 파형이 심장의 전기활동이며, 지금은 조직화된 박동이 없는 VF 세동파입니다." /></span>
        <span className="absolute left-3 top-[52%] flex items-center gap-1 text-xs font-bold text-cyan-400">Pleth<InfoDot id="pleth" info={info} onOpen={setInfo} text="맥박산소측정 용적맥파(SpO₂ 파형). 맥박이 있으면 규칙적 파형이 뛰고, 무맥이면 이렇게 평탄합니다." /></span>
        <span className="absolute right-3 top-1.5 flex items-center gap-1 font-mono text-xs text-slate-500">x1.0<InfoDot id="gain" info={info} onOpen={setInfo} align="right" text="ECG 파형의 진폭 배율(게인). 1.0배로 표시 중입니다." /></span>
      </div>
      <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10">
        <Vital id="hr" label="HR bpm" value="--" color="text-emerald-400" info={info} onOpen={setInfo} tip="심박수(분당 횟수). VF는 조직화된 박동이 없어 산출 불가여서 --로 표시됩니다." />
        <Vital id="spo2" label="SpO₂ %" value="--" color="text-cyan-400" info={info} onOpen={setInfo} tip="동맥혈 산소포화도. 맥박이 없어 측정할 수 없어 --입니다." />
        <Vital id="resp" label="RESP" value="--" color="text-amber-300" info={info} onOpen={setInfo} tip="분당 호흡수. 무호흡 상태라 --로 표시됩니다." />
      </div>
      <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">NIBP <span className="font-mono text-slate-300">--/-- (--)</span><InfoDot id="nibp" info={info} onOpen={setInfo} dir="up" text="비침습 혈압 — 수축기/이완기(평균). 심정지로 측정값이 없습니다." /></span>
        <span className="font-mono">22:14</span>
      </div>
    </div>
  );
}

function Vital({ id, label, value, color, tip, info, onOpen }: { id: string; label: string; value: string; color: string; tip: string; info: string | null; onOpen: (v: string | null) => void }) { return <div className="px-3 py-2.5"><div className="flex items-center gap-1"><p className="text-[9px] uppercase tracking-wide text-slate-500">{label}</p><InfoDot id={id} info={info} onOpen={onOpen} dir="up" text={tip} /></div><p className={`font-mono text-4xl leading-none ${color}`}>{value}</p></div>; }

function InfoDot({ id, text, info, onOpen, dir = "down", align = "left" }: { id: string; text: string; info: string | null; onOpen: (v: string | null) => void; dir?: "up" | "down"; align?: "left" | "right" }) {
  return (
    <span className="relative inline-flex align-middle">
      <button type="button" onClick={(event) => { event.stopPropagation(); onOpen(info === id ? null : id); }} className="grid h-4 w-4 place-items-center rounded-full border border-slate-400/50 text-[9px] font-bold leading-none text-slate-300 hover:bg-white/15">?</button>
      {info === id && <span className={`absolute z-50 w-56 rounded-lg border border-white/15 bg-[#0b1524] px-3 py-2 text-[11px] font-normal normal-case leading-4 tracking-normal text-slate-100 shadow-2xl ${dir === "up" ? "bottom-6" : "top-6"} ${align === "right" ? "right-0" : "left-0"}`}>{text}</span>}
    </span>
  );
}
