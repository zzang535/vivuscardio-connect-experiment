import IconCompression from './IconCompression';
import IconVentilation from './IconVentilation';
import IconCheckCircle from './IconCheckCircle';
import IconXCircle from './IconXCircle';

export default function TrainingCycleCounter({ compressionResults = [], ventilationResults = [] }) {
  const compressionCycles = Array.from({ length: 30 }, (_, i) => i + 1);
  const ventilationCycles = [1, 2];

  // 압박 결과를 기반으로 상태 배열 생성
  const getCompressionStates = () => {
    const states = Array(30).fill("pending");

    compressionResults.forEach((result, index) => {
      if (index < 30) { // 30개 압박까지만 표시
        // 새로운 flat 구조에서 success 필드 직접 사용
        states[index] = result.success ? "success" : "error";
      }
    });

    return states;
  };

  const compressionStates = getCompressionStates();

  // 환기 결과를 기반으로 상태 배열 생성
  const getVentilationStates = () => {
    const states = Array(2).fill("pending"); // 2개 환기

    ventilationResults.forEach((result, index) => {
      if (index < 2) { // 2개 환기까지만 표시
        // 새로운 flat 구조에서 success 필드 직접 사용
        states[index] = result.success ? "success" : "error";
      }
    });

    return states;
  };

  const ventilationStates = getVentilationStates();

  const getCompressionStateClass = (state) => {
    switch (state) {
      case "success": return "";
      case "error": return "";
      default: return "bg-[#F5F5F6] text-[#D9D9D9]";
    }
  };

  const getVentilationStateClass = (state) => {
    switch (state) {
      case "success": return "";
      case "error": return "";
      default: return "bg-[#F5F5F6] text-[#D9D9D9]";
    }
  };

  const renderCompressionContent = (cycle, state) => {
    if (state === "success") {
      return (
        <div className="animate-[pop_0.3s_ease-out]">
          <IconCheckCircle width={26} height={26} />
        </div>
      );
    }
    if (state === "error") {
      return (
        <div className="animate-[pop_0.3s_ease-out]">
          <IconXCircle width={26} height={26} />
        </div>
      );
    }
    return cycle;
  };

  const renderVentilationContent = (cycle, state) => {
    if (state === "success") {
      return (
        <div className="animate-[pop_0.3s_ease-out]">
          <IconCheckCircle width={26} height={26} />
        </div>
      );
    }
    if (state === "error") {
      return (
        <div className="animate-[pop_0.3s_ease-out]">
          <IconXCircle width={26} height={26} />
        </div>
      );
    }
    return cycle;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-[10px]">
        {/* Cycle title */}
        <div className="bg-[#333333] text-white rounded-[20px] h-[40px] w-[150px] flex items-center justify-center font-bold text-[18px] gap-[10px] shrink-0">
          <span>Cycle</span>
          <span>1</span>
        </div>

        {/* Counter process */}
        <div className="flex-1 flex items-center justify-between h-[40px]">
          {/* Compression icon */}
          <div className="w-[35px] flex items-center justify-end shrink-0">
            <IconCompression width={25} height={25} color="#333333" />
          </div>

          {/* Compression cycles */}
          {compressionCycles.map((cycle, index) => (
            <div
              key={`comp-${cycle}`}
              className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-[14px] font-bold shrink-0 ${getCompressionStateClass(compressionStates[index])}`}
            >
              {renderCompressionContent(cycle, compressionStates[index])}
            </div>
          ))}

          {/* Ventilation icon */}
          <div className="w-[35px] flex items-center justify-end shrink-0">
            <IconVentilation width={25} height={25} color="#333333" />
          </div>

          {/* Ventilation cycles */}
          {ventilationCycles.map((cycle, index) => (
            <div
              key={`vent-${cycle}`}
              className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-[14px] font-bold shrink-0 ${getVentilationStateClass(ventilationStates[index])}`}
            >
              {renderVentilationContent(cycle, ventilationStates[index])}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}