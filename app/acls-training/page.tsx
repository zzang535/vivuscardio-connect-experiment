import Link from "next/link";

export default function AclsTrainingIndexPage() {
  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">Vivus Cardio Simulation</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">ACLS Training Experiments</h1>
        <p className="mt-3 max-w-2xl text-slate-400">기존 대시보드형 프로토타입과 단일 VF 상황에 집중한 시나리오형 프로토타입을 분리했습니다.</p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <VersionCard
            href="/acls-training/vf-01"
            eyebrow="Current · Scenario VF-01"
            title="야간 병동 VF 심정지"
            description="알람 발생부터 환자 확인, 코드 호출, 첫 제세동 직후 CPR 재개까지 시간·음향·팀 연출로 진행합니다."
            accent
          />
          <VersionCard
            href="/acls-training/prototype-v1"
            eyebrow="Archive · Prototype V1"
            title="ACLS 처치 대시보드"
            description="전체 처치 버튼과 병실 상태를 한 화면에 표현했던 이전 프로토타입입니다. 비교 목적으로 보존합니다."
          />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
          기획 기준 문서: <code className="text-slate-200">app/acls-training/SCENARIO_VF_01.md</code>
        </div>
      </div>
    </main>
  );
}

function VersionCard({ href, eyebrow, title, description, accent = false }: { href: string; eyebrow: string; title: string; description: string; accent?: boolean }) {
  return (
    <Link href={href} className={`group rounded-3xl border p-6 transition hover:-translate-y-1 ${accent ? "border-cyan-300/40 bg-cyan-300/[0.08] hover:border-cyan-300/70" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}>
      <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${accent ? "text-cyan-300" : "text-slate-500"}`}>{eyebrow}</p>
      <h2 className="mt-4 text-2xl font-semibold">{title}</h2>
      <p className="mt-3 min-h-16 text-sm leading-6 text-slate-400">{description}</p>
      <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white">열기 <span className="transition group-hover:translate-x-1">→</span></span>
    </Link>
  );
}
