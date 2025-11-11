"use client";

import dynamic from "next/dynamic";

// R3F Scene을 클라이언트 사이드에서만 렌더링
const ShowroomR3FScene = dynamic(
  () => import("@/components/manikin-showroom-r3f/ShowroomR3FScene"),
  { ssr: false }
);

export default function ManikinShowroomR3FPage() {
  return (
    <div className="w-screen h-screen">
      <ShowroomR3FScene />
    </div>
  );
}
