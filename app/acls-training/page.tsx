import Link from "next/link";

export default function AclsTrainingIndexPage() {
  return (
    <main className="min-h-screen bg-[#f3f5f7] px-6 py-12 text-[#17212b]">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-[#cfd5dc] pb-8">
          <Link href="/" className="text-sm text-[#66717d] hover:text-[#17212b]">
            ← 전체 실험
          </Link>
          <p className="mt-10 text-sm font-semibold text-[#176b87]">ACLS 훈련</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.025em] md:text-4xl">
            심정지 대응 시나리오
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#596571]">
            상황을 눈으로 확인하고 현장 음성을 들으며, 다음 행동을 직접 선택하는
            인터랙티브 교육 자료입니다.
          </p>
        </header>

        <section className="py-8" aria-labelledby="available-scenarios">
          <div className="flex items-end justify-between border-b border-[#d9dee4] pb-3">
            <h2 id="available-scenarios" className="text-base font-bold">
              훈련 가능한 시나리오
            </h2>
            <span className="text-xs text-[#77828d]">1개</span>
          </div>

          <Link
            href="/acls-training/vf-01"
            className="group grid gap-5 border-b border-[#d9dee4] bg-white px-5 py-6 transition-colors hover:bg-[#f9fafb] md:grid-cols-[88px_1fr_auto] md:items-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-[#176b87] text-sm font-bold text-white">
              VF-01
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">야간 병동 VF 심정지</h3>
                <span className="rounded-sm border border-[#b8c2cb] px-1.5 py-0.5 text-[10px] font-semibold text-[#66717d]">
                  기초
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66717d]">
                알람 확인부터 환자 평가, 코드 호출, 첫 제세동 직후 CPR 재개까지의
                초기 대응을 연습합니다.
              </p>
              <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#77828d]">
                <div className="flex gap-1.5"><dt>역할</dt><dd className="font-semibold text-[#46515c]">최초 반응 간호사</dd></div>
                <div className="flex gap-1.5"><dt>소요 시간</dt><dd className="font-semibold text-[#46515c]">약 2분</dd></div>
                <div className="flex gap-1.5"><dt>음성</dt><dd className="font-semibold text-[#46515c]">필수</dd></div>
              </dl>
            </div>
            <span className="text-sm font-semibold text-[#176b87] group-hover:underline">
              훈련 시작 →
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
}
