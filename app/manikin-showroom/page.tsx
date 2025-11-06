"use client";

export default function ManikinShowroomPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-black/30 border-b border-gray-700 shadow-lg backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-white">
            Manikin Showroom
          </h1>
          <p className="text-gray-300 mt-2">
            3D 마네킹 모델 뷰어 (준비 중)
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            3D 렌더링 준비 중
          </h2>
          <p className="text-gray-400">
            Three.js 또는 React Three Fiber를 사용하여<br />
            3D 마네킹 모델을 렌더링할 예정입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
