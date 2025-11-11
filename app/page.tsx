"use client";

import { useState } from "react";

export default function Home() {
  const [activeSection, setActiveSection] = useState("section1");

  const sections = [
    { id: "section1", name: "AED Map" },
    { id: "section2", name: "Training Simulator" },
    { id: "section3", name: "Manikin Showroom" },
    { id: "section4", name: "Manikin Showroom Virtual" },
  ];

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const handleOpenAEDMap = () => {
    window.open("/aed-map", "_blank");
  };

  const handleOpenTrainingSimulator = () => {
    window.open("/training-simulator", "_blank");
  };

  const handleOpenManikinShowroom = () => {
    window.open("/manikin-showroom", "_blank");
  };

  const handleOpenManikinShowroomVirtual = () => {
    window.open("/manikin-showroom-virtual", "_blank");
  };

  const renderActiveContent = () => {
    if (activeSection === "section1") {
      return (
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            AED Map
          </h2>
          <p className="text-gray-600 mb-8">
            내 주변 가장 가까운 AED를 찾아보세요.
          </p>
          <button
            onClick={handleOpenAEDMap}
            className="
              px-6 py-3
              bg-[#FF5252]
              text-white
              font-semibold
              rounded-lg
              shadow-lg
              hover:bg-[#FF3838]
              transition-all
              duration-300
              hover:shadow-xl
              hover:scale-105
            "
          >
            AED Map 열기
          </button>
        </div>
      );
    }

    if (activeSection === "section2") {
      return (
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Training Simulator
          </h2>
          <p className="text-gray-600 mb-8">
            심폐소생술 훈련 시뮬레이터를 시작하세요.
          </p>
          <button
            onClick={handleOpenTrainingSimulator}
            className="
              px-6 py-3
              bg-[#FF5252]
              text-white
              font-semibold
              rounded-lg
              shadow-lg
              hover:bg-[#FF3838]
              transition-all
              duration-300
              hover:shadow-xl
              hover:scale-105
            "
          >
            Training Simulator 열기
          </button>
        </div>
      );
    }

    if (activeSection === "section3") {
      return (
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Manikin Showroom
          </h2>
          <p className="text-gray-600 mb-8">
            다양한 마네킹 모델을 확인하세요.
          </p>
          <button
            onClick={handleOpenManikinShowroom}
            className="
              px-6 py-3
              bg-[#FF5252]
              text-white
              font-semibold
              rounded-lg
              shadow-lg
              hover:bg-[#FF3838]
              transition-all
              duration-300
              hover:shadow-xl
              hover:scale-105
            "
          >
            Manikin Showroom 열기
          </button>
        </div>
      );
    }

    if (activeSection === "section4") {
      return (
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Manikin Showroom Virtual
          </h2>
          <p className="text-gray-600 mb-8">
            R3F 기반 가상 마네킹 쇼룸을 경험하세요.
          </p>
          <button
            onClick={handleOpenManikinShowroomVirtual}
            className="
              px-6 py-3
              bg-[#FF5252]
              text-white
              font-semibold
              rounded-lg
              shadow-lg
              hover:bg-[#FF3838]
              transition-all
              duration-300
              hover:shadow-xl
              hover:scale-105
            "
          >
            Manikin Showroom Virtual 열기
          </button>
        </div>
      );
    }

    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {sections.find((s) => s.id === activeSection)?.name}
        </h2>
        <p className="text-gray-600">
          This is the content for {sections.find((s) => s.id === activeSection)?.name}
        </p>
      </div>
    );
  };

  return (
    <div className="h-screen flex w-full">
      {/* Left Navigation */}
      <div
        className="
          h-screen
          w-64
          bg-gradient-to-b from-gray-50 to-white
          border-r
          border-gray-100
          overflow-y-auto
          shadow-sm
        "
      >
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Experiment
            <div className="w-8 h-0.5 bg-[#0061F2] mt-2 rounded-full"></div>
          </h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => handleSectionClick(section.id)}
                  className={`
                    w-full text-left px-4 py-2 rounded-lg font-medium text-[14px]
                    transition-all duration-300 ease-out
                    group relative overflow-hidden
                    ${
                      activeSection === section.id
                        ? "bg-[#0061F2] text-white scale-105"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:scale-102"
                    }
                  `}
                >
                  <span className="relative z-10">{section.name}</span>
                  {activeSection === section.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0061F2] to-[#0061F2] opacity-100"></div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div
        className="
          h-screen
          bg-gray-50
          overflow-y-auto
          box-border
        "
        style={{ width: "calc(100% - 256px)" }}
      >
        <div>{renderActiveContent()}</div>
      </div>
    </div>
  );
}
