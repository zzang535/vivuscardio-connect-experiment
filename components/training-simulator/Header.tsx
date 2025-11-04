import Image from "next/image";

interface HeaderProps {
  mode?: 'default' | 'training' | 'result';
  onPracticeStop?: () => void;
  onRestart?: () => void;
  onBackToIntro?: () => void;
}

export default function Header({
  mode = 'default',
  onPracticeStop,
  onRestart,
  onBackToIntro,
}: HeaderProps) {
  const handlePracticeStop = () => {
    if (onPracticeStop) {
      onPracticeStop();
    }
  };

  return (
    <div className="flex items-center justify-between px-6 bg-white border-b border-gray-200 w-full h-full">
      {/* Left: Logo */}
      <div className="flex items-center">
        <Image
          src="/training-simulator/VivusCardioLogo.svg"
          alt="VivusCardio Connect Logo"
          width={175}
          height={47}
          priority
        />
      </div>
      {mode === 'training' && (
        <div>
          <button
            onClick={handlePracticeStop}
            className="px-6 py-2 bg-[#333333] 
            text-white text-[16px] font-semibold rounded-lg 
            hover:bg-[#1F2937] transition-colors
            cursor-pointer
            "
          >
            Practice Stop
          </button>
        </div>
      )}
      {mode === 'result' && (
        <div className="flex gap-3">
          {onRestart && (
            <button
              onClick={onRestart}
              className="px-6 py-2 bg-[#333333] 
              text-white text-[16px] font-semibold rounded-lg 
              hover:bg-[#1F2937] transition-colors
              cursor-pointer
              "
            >
              Restart
            </button>
          )}
          {onBackToIntro && (
            <button
              onClick={onBackToIntro}
              className="px-6 py-2 bg-gray-200 
              text-gray-800 text-[16px] font-semibold rounded-lg 
              hover:bg-gray-300 transition-colors
              cursor-pointer
              "
            >
              Back to Intro
            </button>
          )}
        </div>
      )}
    </div>
  );
}
