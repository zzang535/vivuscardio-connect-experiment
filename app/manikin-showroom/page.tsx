"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Three.js는 클라이언트 사이드에서만 작동하므로 dynamic import 사용
const ShowroomScene = dynamic(
  () => import("@/components/manikin-showroom/ShowroomScene"),
  { ssr: false }
);

export default function ManikinShowroomPage() {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <Suspense
        fallback={
          <div className="flex items-center justify-center w-full h-full bg-gray-900">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-300">3D 모델 로딩 중...</p>
            </div>
          </div>
        }
      >
        <ShowroomScene />
      </Suspense>
    </div>
  );
}
