"use client";

import { useEffect } from "react";

interface IPadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IPadModal({ isOpen, onClose }: IPadModalProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.2)",
      }}
      onClick={onClose}
    >
      {/* 모달 컨텐츠 */}
      <div
        className="relative bg-white rounded-lg shadow-2xl"
        style={{
          width: "90vw",
          height: "90vh",
          maxWidth: "1400px",
          maxHeight: "900px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 모달 내용 */}
        <div className="w-full h-full p-8 overflow-auto">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              iPad Training Interface
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Interactive training module for AED-T device
            </p>

            {/* 여기에 실제 iPad 컨텐츠를 추가할 수 있습니다 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-12 shadow-inner">
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg p-8 shadow-lg mb-6">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    Training Modules
                  </h3>
                  <ul className="text-left space-y-3 text-gray-700">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Basic CPR Training
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      AED Device Operation
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Emergency Response Protocol
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Real-time Feedback System
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-8 shadow-lg">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    Features
                  </h3>
                  <p className="text-gray-600 text-left leading-relaxed">
                    This interactive training system provides comprehensive
                    guidance for medical professionals and first responders.
                    Get real-time feedback on your CPR technique and AED usage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
