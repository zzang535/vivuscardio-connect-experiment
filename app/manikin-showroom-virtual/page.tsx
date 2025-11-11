"use client";

import dynamic from "next/dynamic";

// R3F Scene을 클라이언트 사이드에서만 렌더링
const ShowroomVirtualScene = dynamic(
  () => import("@/components/manikin-showroom-virtual/ShowroomR3FScene"),
  { ssr: false }
);

export default function ManikinShowroomVirtualPage() {
  return (
    <div className="w-screen h-screen">
      <ShowroomVirtualScene />
    </div>
  );
}
