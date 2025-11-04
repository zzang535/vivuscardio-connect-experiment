import Image from "next/image";

export default function TrainingHeader({
  isResultPhase,
  onPracticeStop,
  onRestart,
  onBackToIntro
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      {/* Left: Logo */}
      <div className="flex items-center">
        <Image
          src="/training-simulator/vivus-cardio.svg"
          alt="VivusCardio Logo"
          width={52}
          height={42}
          priority
        />
      </div>

      {/* Right: Actions */}
      <div>
         {/* <button
              onClick={onRestart}
              className="px-6 py-2 bg-[#0061F2] text-white text-[16px] font-semibold rounded-lg hover:bg-[#0052D4] transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onBackToIntro}
              className="px-6 py-2 bg-[#333333] text-white text-[16px] font-semibold rounded-lg hover:bg-[#1F2937] transition-colors"
            >
              Back to Start
            </button> */}
      </div>
    </div>
  );
}
