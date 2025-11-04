"use client";

import { useState } from "react";

export default function Home() {
  const [activeSection, setActiveSection] = useState("section1");

  const sections = [
    { id: "section1", name: "AED Map" },
    { id: "section2", name: "Section 2" },
  ];

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const handleOpenAEDMap = () => {
    window.open("/aed-map", "_blank");
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
            Menu
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
