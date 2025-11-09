"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import LoadingOverlay from "@/components/manikin-showroom/LoadingOverlay";
import ErrorOverlay from "@/components/manikin-showroom/ErrorOverlay";

import type { StoredObjectData } from "@/lib/manikin-showroom/storage";

const ShowroomScene = dynamic(
  () => import("@/components/manikin-showroom/ShowroomScene"),
  { ssr: false }
);

export default function ManikinShowroomWithNamePage() {
  const params = useParams<{ name?: string }>();
  const visitorName = decodeURIComponent(params?.name ?? "").trim();
  const [initialObjects, setInitialObjects] = useState<StoredObjectData[] | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchRecord = async () => {
      if (!visitorName) {
        setFetchError("이름 정보가 필요합니다. 뒤로 돌아가 다시 시도해 주세요.");
        setIsFetching(false);
        return;
      }

      setIsFetching(true);
      setFetchError(null);
      try {
        const response = await fetch(`/api/manikin-showroom/${encodeURIComponent(visitorName)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = await response.json();
        if (!active) return;

        setInitialObjects(data.manikinShowroomObjects ?? null);
        setHasLoadedOnce(true);
        setBannerError(null);
      } catch (error) {
        console.error("Failed to load showroom data", error);
        if (!active) return;
        setFetchError("쇼룸 데이터를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.");
      } finally {
        if (active) {
          setIsFetching(false);
        }
      }
    };

    fetchRecord();

    return () => {
      active = false;
    };
  }, [visitorName, reloadFlag]);

  const handlePersistObjects = useCallback(
    async (objects: StoredObjectData[]) => {
      if (!visitorName) return;

      setIsSaving(true);
      try {
        const response = await fetch(`/api/manikin-showroom/${encodeURIComponent(visitorName)}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ manikinShowroomObjects: objects }),
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        setInitialObjects(objects);
        setBannerError(null);
      } catch (error) {
        console.error("Failed to persist showroom objects", error);
        setBannerError("쇼룸 상태 저장에 실패했습니다. 연결을 확인한 뒤 다시 시도해 주세요.");
      } finally {
        setIsSaving(false);
      }
    },
    [visitorName]
  );

  const handleRetry = () => {
    setFetchError(null);
    setReloadFlag(prev => prev + 1);
  };

  const showLoading = isFetching && !hasLoadedOnce;
  const showError = !!fetchError && !hasLoadedOnce;

  const loadingView = (
    <LoadingOverlay message="쇼룸 데이터를 불러오는 중입니다..." />
  );

  const errorView = (
    <ErrorOverlay
      title="쇼룸 데이터를 불러오지 못했습니다."
      description="네트워크 상태를 확인한 뒤 다시 시도해 주세요."
      actionLabel="다시 시도"
      onAction={handleRetry}
    />
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {showLoading && loadingView}
      {showError && errorView}
      {!showLoading && !showError && (
        <Suspense
          fallback={<LoadingOverlay message="3D 모델 로딩 중..." />}
        >
          <ShowroomScene
            key={visitorName}
            visitorName={visitorName}
            initialObjects={initialObjects}
            onObjectsChange={handlePersistObjects}
          />
        </Suspense>
      )}

      {isSaving && (
        <div className="pointer-events-none fixed bottom-6 right-6 rounded-2xl border border-white/10 bg-black/70 px-4 py-2 text-sm text-white shadow-lg">
          저장 중...
        </div>
      )}

      {bannerError && hasLoadedOnce && (
        <div className="fixed top-6 right-6 flex max-w-sm items-start gap-3 rounded-2xl border border-red-400/30 bg-red-500/20 px-4 py-3 text-sm text-red-100 shadow-lg">
          <span>{bannerError}</span>
          <button
            type="button"
            className="text-red-200 transition hover:text-white"
            onClick={() => setBannerError(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
