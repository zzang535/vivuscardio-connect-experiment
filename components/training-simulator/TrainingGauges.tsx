import TrainingGaugePosition from "./TrainingGaugePosition";
import TrainingGaugeDepth from "./TrainingGaugeDepth";
import TrainingGaugeRate from "./TrainingGaugeRate";
import TrainingGaugeVolume from "./TrainingGaugeVolume";
import PageControl from "./PageControl";

interface TrainingGaugesProps {
  clickPosition: { x: number; y: number };
  isPressed: boolean;
  depth: number;
  rateData: { interval: number; status?: string } | null;
  ventilationVolume: number;
  isVentilating: boolean;
  lastMaxDepth: number | null;
  lastMaxVolume: number | null;
}

export default function TrainingGauges({ clickPosition, isPressed, depth, rateData, ventilationVolume, isVentilating, lastMaxDepth, lastMaxVolume }: TrainingGaugesProps) {
  return (
    <div className="flex flex-col items-center gap-[10px] w-full max-w-[1286px]">
      <div className="flex items-center justify-between w-full bg-white rounded-[20px] p-0">
        {/* Left arrow */}
        <button className="w-[125px] h-[366px] flex items-center justify-center rounded-[20px]">
          <svg width="25" height="25" viewBox="0 0 25 25" className="text-[#333333]">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </button>

        {/* Feedback gauges */}
        <div className="flex gap-[13px] py-[10px]">
          <TrainingGaugePosition
            clickPosition={clickPosition}
            isPressed={isPressed}
          />
          <TrainingGaugeDepth
            depth={depth}
            isPressed={isPressed}
            lastMaxDepth={lastMaxDepth}
          />
          <TrainingGaugeRate
            rateData={rateData}
          />
          <TrainingGaugeVolume
            ventilationVolume={ventilationVolume}
            isVentilating={isVentilating}
            lastMaxVolume={lastMaxVolume}
          />
        </div>

        {/* Right arrow */}
        <button className="w-[125px] h-[366px] flex items-center justify-center rounded-[20px]">
          <svg width="25" height="25" viewBox="0 0 25 25" className="text-[#333333]">
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </button>
      </div>

      {/* <PageControl /> */}
    </div>
  );
}
