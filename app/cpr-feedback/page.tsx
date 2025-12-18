"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  getRecordListV1,
  getRecordDetail,
  getChartDataset,
  type TrainingRecord,
  type TrainingDetailResponse,
} from "@/app/api/cpr-feedback/api";

type FilterType = "all" | "pass" | "fail";

export default function CPRFeedbackPage() {
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<TrainingRecord | null>(
    null
  );


  const [detailData, setDetailData] = useState<TrainingDetailResponse | null>(
    null
  );
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [feedback, setFeedback] = useState<string>("");
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  // 필터 상태
  const [filter, setFilter] = useState<FilterType>("all");

  // 차트 데이터
  const [chartData, setChartData] = useState<any>(null);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [showChartData, setShowChartData] = useState(false);

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 컴포넌트 마운트 시 훈련 기록 리스트 가져오기
  useEffect(() => {
    fetchTrainingRecords();
  }, []);

  const fetchTrainingRecords = async (filterType: FilterType = filter) => {
    setIsLoadingRecords(true);
    try {
      const payload: any = { page: 1 };

      // 필터 적용
      if (filterType === "pass") {
        payload.passFailStatus = ["PASS"];
      } else if (filterType === "fail") {
        payload.passFailStatus = ["FAIL"];
      }

      const response = await getRecordListV1(payload);
      if (response.success && response.data.results) {
        setTrainingRecords(response.data.results);
      }
    } catch (error) {
      console.error("Error fetching training records:", error);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const handleFilterChange = (filterType: FilterType) => {
    setFilter(filterType);
    setSelectedRecord(null);
    setDetailData(null);
    setFeedback("");
    fetchTrainingRecords(filterType);
  };

  const handleSelectRecord = async (record: TrainingRecord) => {
    setSelectedRecord(record);
    setFeedback("");
    setChartData(null);
    setShowChartData(false);
    setIsModalOpen(true);
    setIsLoadingDetail(true);

    try {
      const detail = await getRecordDetail(record.id);
      setDetailData(detail);
    } catch (error) {
      console.error("Error fetching record detail:", error);
      setDetailData(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
    setDetailData(null);
    setChartData(null);
    setFeedback("");
    setShowChartData(false);
  };

  const handleLoadChartData = async () => {
    if (!detailData?.chart_dataset_url) {
      return;
    }

    setIsLoadingChart(true);
    try {
      const data = await getChartDataset(detailData.chart_dataset_url);
      setChartData(data);
      setShowChartData(true);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setChartData({ error: "차트 데이터를 불러오는데 실패했습니다." });
    } finally {
      setIsLoadingChart(false);
    }
  };

  const handleGetFeedback = async () => {
    if (!detailData) {
      setFeedback("먼저 훈련 기록을 선택해주세요.");
      return;
    }

    if (!chartData) {
      setFeedback("먼저 차트 데이터를 불러와주세요.");
      return;
    }

    setIsLoadingFeedback(true);

    try {
      const response = await fetch("/api/cpr-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chartData: chartData,
          trainingInfo: {
            datetime: detailData.datetime,
            manikin_type: detailData.training_program.manikin_type,
            score: detailData.cpr?.score,
            metric_criteria: detailData.cpr?.metric_criteria,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.feedback) {
        setFeedback(data.feedback);
      } else {
        setFeedback("피드백을 생성할 수 없습니다.");
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setFeedback(
        "피드백을 가져오는 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            CPR Feedback
          </h1>
          <p className="text-gray-600">
            훈련 기록을 선택하여 상세 정보와 AI 피드백을 확인하세요
          </p>
        </div>

        {/* 모달: 훈련 상세 정보 + AI 피드백 */}
        {isModalOpen && detailData && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* 배경 오버레이 */}
            <div
              className="fixed inset-0 bg-black/5 transition-opacity"
              onClick={handleCloseModal}
            ></div>

            {/* 모달 컨텐츠 */}
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
                {/* 모달 헤더 */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    훈련 상세 정보 및 AI 피드백
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* 모달 바디 */}
                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* 좌측: 훈련 상세 정보 */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          훈련 상세 정보
                        </h3>

                        {isLoadingDetail ? (
                          <div className="flex items-center justify-center h-32">
                            <p className="text-gray-400">
                              상세 정보를 불러오는 중...
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Chart Dataset 섹션 (상단) */}
                            <div className="pb-6 border-b">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-700">
                                  상세 CPR 데이터
                                </h3>
                                <button
                                  onClick={handleLoadChartData}
                                  disabled={isLoadingChart}
                                  className={`
                                    px-4 py-2 rounded-lg font-medium text-sm
                                    ${isLoadingChart
                                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                      : "bg-blue-500 text-white hover:bg-blue-600"
                                    }
                                    transition-colors
                                  `}
                                >
                                  {isLoadingChart
                                    ? "로딩 중..."
                                    : "차트 데이터 불러오기"}
                                </button>
                              </div>

                              {showChartData && chartData && (
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600">
                                      JSON 데이터
                                    </span>
                                    <button
                                      onClick={() => setShowChartData(false)}
                                      className="text-sm text-gray-500 hover:text-gray-700"
                                    >
                                      닫기
                                    </button>
                                  </div>
                                  <div className="bg-gray-900 text-green-400 rounded p-4 overflow-auto max-h-64 text-xs font-mono">
                                    <pre>
                                      {JSON.stringify(chartData, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 기본 정보 */}
                            <div>
                              <h3 className="font-semibold text-gray-900 border-b pb-2 mb-3">
                                기본 정보
                              </h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-700">
                                    훈련 날짜:
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {new Date(
                                      detailData.datetime
                                    ).toLocaleDateString("ko-KR")}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-700">사용자:</span>
                                  <span className="font-medium text-gray-900">
                                    {detailData.user.name}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-700">마네킹:</span>
                                  <span className="font-medium text-gray-900">
                                    {detailData.training_program
                                      .manikin_type === "adult"
                                      ? "성인"
                                      : detailData.training_program
                                        .manikin_type === "infant"
                                        ? "유아"
                                        : "소아"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-700">통과:</span>
                                  <span
                                    className={`font-semibold ${detailData.is_passed === true
                                        ? "text-green-600"
                                        : detailData.is_passed === false
                                          ? "text-red-600"
                                          : "text-gray-900"
                                      }`}
                                  >
                                    {detailData.is_passed === true
                                      ? "통과"
                                      : detailData.is_passed === false
                                        ? "불합격"
                                        : "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* CPR 점수 */}
                            {detailData.cpr && (
                              <div>
                                <h3 className="font-semibold text-gray-900 border-b pb-2 mb-3">
                                  CPR 점수
                                </h3>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">총점:</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                      {detailData.cpr.score.total}점
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">
                                      압박 깊이:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {detailData.cpr.score.compression_depth}점
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">
                                      압박 속도:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {detailData.cpr.score.compression_rate}점
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">
                                      압박 이완:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {detailData.cpr.score.compression_recoil}
                                      점
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">
                                      손 위치:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {detailData.cpr.score.handposition}점
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">CCF:</span>
                                    <span className="font-medium text-gray-900">
                                      {detailData.cpr.score.ccf}점
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 인공호흡 점수 */}
                            {detailData.cpr && (
                              <div>
                                <h3 className="font-semibold text-gray-900 border-b pb-2 mb-3">
                                  인공호흡 점수
                                </h3>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">
                                      환기량:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {detailData.cpr.score.ventilation_volume}
                                      점
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">
                                      환기 속도:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {detailData.cpr.score.ventilation_speed}점
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">
                                      환기 횟수:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {detailData.cpr.score.ventilation_count}점
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">
                                      구조 환기:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {detailData.cpr.score.rescue_vent}점
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 우측: AI 피드백 */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900">
                            AI 피드백
                          </h3>
                          <button
                            onClick={handleGetFeedback}
                            disabled={isLoadingFeedback || !chartData}
                            className={`
                              px-6 py-2 rounded-lg font-semibold text-sm
                              ${isLoadingFeedback || !chartData
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-[#FF5252] text-white hover:bg-[#FF3838] shadow-lg hover:shadow-xl"
                              }
                              transition-all duration-300
                            `}
                          >
                            {isLoadingFeedback
                              ? "분석 중..."
                              : chartData
                                ? "AI 피드백 받기"
                                : "먼저 차트 데이터를 불러오세요"}
                          </button>
                        </div>

                        {feedback ? (
                          <div className="bg-white rounded-lg p-6 border border-gray-200">
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown
                                components={{
                                  h2: ({ children }) => (
                                    <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3 pb-2 border-b border-gray-200">
                                      {children}
                                    </h2>
                                  ),
                                  h3: ({ children }) => (
                                    <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
                                      {children}
                                    </h3>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="list-disc list-inside space-y-2 my-3">
                                      {children}
                                    </ul>
                                  ),
                                  ol: ({ children }) => (
                                    <ol className="list-decimal list-inside space-y-2 my-3">
                                      {children}
                                    </ol>
                                  ),
                                  li: ({ children }) => (
                                    <li className="text-gray-700 leading-relaxed">
                                      {children}
                                    </li>
                                  ),
                                  p: ({ children }) => (
                                    <p className="text-gray-700 leading-relaxed mb-3">
                                      {children}
                                    </p>
                                  ),
                                  strong: ({ children }) => (
                                    <strong className="font-semibold text-gray-900">
                                      {children}
                                    </strong>
                                  ),
                                }}
                              >
                                {feedback}
                              </ReactMarkdown>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed border-gray-200">
                            <div className="text-center">
                              <p className="text-gray-400 mb-2">
                                AI 피드백이 여기에 표시됩니다
                              </p>
                              <p className="text-sm text-gray-500">
                                {!chartData
                                  ? "먼저 차트 데이터를 불러온 후 'AI 피드백 받기'를 클릭하세요"
                                  : "'AI 피드백 받기' 버튼을 클릭하여 분석을 시작하세요"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 훈련 기록 테이블 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              훈련 기록 리스트
            </h2>
            <button
              onClick={() => fetchTrainingRecords()}
              disabled={isLoadingRecords}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              {isLoadingRecords ? "로딩 중..." : "새로고침"}
            </button>
          </div>

          {/* 필터 */}
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">필터:</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleFilterChange("all")}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${filter === "all"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                전체
              </button>
              <button
                onClick={() => handleFilterChange("pass")}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${filter === "pass"
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                통과
              </button>
              <button
                onClick={() => handleFilterChange("fail")}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${filter === "fail"
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                불합격
              </button>
            </div>
          </div>

          {isLoadingRecords ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-400">훈련 기록을 불러오는 중...</p>
            </div>
          ) : trainingRecords.length === 0 ? (
            <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
              <p className="text-gray-400">훈련 기록이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      날짜
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      사용자
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      마네킹
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      훈련 유형
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      모드
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      점수
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      통과
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trainingRecords.map((record) => (
                    <tr
                      key={record.id}
                      onClick={() => handleSelectRecord(record)}
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {record.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(record.trainingDate).toLocaleDateString(
                          "ko-KR",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {record.user.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {record.manikinType === "adult"
                          ? "성인"
                          : record.manikinType === "infant"
                            ? "유아"
                            : "소아"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {record.trainingType}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {record.trainingMode === "training" ? "훈련" : "평가"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`font-bold ${record.score >= 80
                              ? "text-green-600"
                              : record.score >= 60
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                        >
                          {record.score}점
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {record.isPassed === true && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded font-semibold">
                            통과
                          </span>
                        )}
                        {record.isPassed === false && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded font-semibold">
                            불합격
                          </span>
                        )}
                        {record.isPassed === null && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            N/A
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
