// CPR 피드백 관련 API 함수

import { loginMultiCourse } from "../auth/api";

// 토큰 캐시 (메모리)
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;
const TOKEN_VALIDITY_DURATION = 60 * 60 * 1000; // 1시간

// 간단한 토큰 관리
async function getAuthToken(): Promise<string> {
  // 캐시된 토큰이 유효한 경우
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  // 로그인하여 새 토큰 획득
  const organization = process.env.NEXT_PUBLIC_AUTH_ORGANIZATION || "";
  const email = process.env.NEXT_PUBLIC_AUTH_EMAIL || "";
  const password = process.env.NEXT_PUBLIC_AUTH_PASSWORD || "";

  const response = await loginMultiCourse({ organization, email, password });
  cachedToken = response.data.token;
  tokenExpiry = Date.now() + TOKEN_VALIDITY_DURATION;

  return cachedToken;
}

interface RecordListPayload {
  userId?: string;
  searchKeyword?: string;
  manikinType?: string[];
  trainingMode?: string[];
  trainingType?: string[];
  aed?: string[];
  passFailStatus?: string[];
  startDate?: string;
  endDate?: string;
  sort?: string;
  sortkey?: string;
  page: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string | null;
}

interface TrainingRecord {
  id: number;
  trainingDate: string;
  manikinType: string;
  trainingType: string;
  trainingMode: string;
  isPassed: boolean | null;
  user: User;
  score: number;
  withAed: boolean;
}

// 상세 응답 타입
interface CPRScore {
  total: number;
  compression_depth: number;
  compression_rate: number;
  compression_count: number;
  compression_recoil: number;
  handposition: number;
  ccf: number;
  ventilation_volume: number;
  ventilation_speed: number;
  ventilation_count: number;
  ventilation_rate: number;
  rescue_vent: number;
}

interface MetricCriteria {
  compression_depth: {
    too_shallow: number;
    good: number;
    too_deep: number;
    n_too_shallow: number;
    n_good: number;
    n_too_deep: number;
  };
  recoil: {
    incomplete: number;
    good: number;
    n_incomplete: number;
    n_good: number;
  };
  compression_rate: {
    too_slow: number;
    good: number;
    too_fast: number;
    n_too_slow: number;
    n_good: number;
    n_too_fast: number;
  };
  handposition: {
    incorrect_lr: number;
    good: number;
    incorrect_stomach: number;
    n_incorrect_lr: number;
    n_good: number;
    n_incorrect_stomach: number;
  };
  ventilation_volume: {
    good: number;
    too_much: number;
    too_little: number;
    n_good: number;
    n_too_much: number;
    n_too_little: number;
  };
  score_of_ccf: number;
  ventilation_speed: {
    "%_TooSlow": number;
    "%_Good": number;
    "%_TooFast": number;
    n_TooSlow: number;
    n_Good: number;
    n_TooFast: number;
  };
}

interface CPRGuideline {
  title: string;
  manikin_type: string;
  compression_depth_max: number;
  compression_depth_min: number;
  compression_rate_max: number;
  compression_rate_min: number;
  ventilation_volume_max: number;
  ventilation_volume_min: number;
}

interface TrainingDetailResponse {
  id: number;
  datetime: string;
  is_passed: boolean | null;
  user: User & {
    employee_id: string | null;
    last_login: string;
    roles: string[];
    login_type: string;
  };
  cpr: {
    score: CPRScore;
    metric_criteria: MetricCriteria;
    guide_prompt: string[];
  } | null;
  training_program: {
    id: number;
    title: string;
    manikin_type: string;
    training_type: string;
    training_mode: string;
    cpr_guideline: CPRGuideline;
  };
  chart_dataset_url: string;
}

interface RecordListResponse {
  success: boolean;
  data: {
    results: TrainingRecord[];
    count: number;
    next: string | null;
    previous: string | null;
  };
  message: string;
  timestamp: string;
}

// 공통 필터 처리 함수
const appendFiltersToParams = (
  params: URLSearchParams,
  payload: RecordListPayload
) => {
  console.log("payload", payload);

  // keyword
  if (payload.searchKeyword) {
    params.append("search_keyword", payload.searchKeyword);
  }

  // attribute - 실제 constant 파일이 없으므로 일단 그대로 전달
  if (payload.manikinType && payload.manikinType.length > 0) {
    params.append("manikin_type", payload.manikinType.join(","));
  }
  if (payload.trainingMode && payload.trainingMode.length > 0) {
    params.append("training_mode", payload.trainingMode.join(","));
  }
  if (payload.trainingType && payload.trainingType.length > 0) {
    params.append("training_type", payload.trainingType.join(","));
  }

  // 값은 1개이지만 구조상 배열로 취급
  if (payload.aed && payload.aed.length > 0) {
    params.append("is_with_aed", "true");
  }

  // pass fail status
  if (payload.passFailStatus && payload.passFailStatus.length > 0) {
    console.log("payload.passFailStatus", payload.passFailStatus);
    if (payload.passFailStatus.includes("PASS")) {
      params.append("is_passed", "true");
    } else {
      params.append("is_passed", "false");
    }
  }

  // date
  if (payload.startDate) {
    params.append("fromDate", payload.startDate);
  }
  if (payload.endDate) {
    params.append("toDate", payload.endDate);
  }

  // sort
  if (payload.sort) {
    params.append("sort", payload.sort);
  }
  if (payload.sortkey) {
    params.append("sortKey", payload.sortkey);
  }
};

export const getRecordListV1 = async (
  payload: RecordListPayload
): Promise<RecordListResponse> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL이 설정되지 않았습니다.");
  }

  const params = new URLSearchParams();

  // user
  if (payload.userId) {
    params.append("user_id", payload.userId);
  }

  // filter
  appendFiltersToParams(params, payload);

  // page
  params.append("page", payload.page.toString());

  const url = `${baseUrl}/v1/trainings?${params.toString()}`;

  try {
    // 동적으로 토큰 가져오기
    const token = await getAuthToken();

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("getRecordListV1 error:", error);
    throw error;
  }
};

export const getRecordDetail = async (
  trainingId: number
): Promise<TrainingDetailResponse> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL이 설정되지 않았습니다.");
  }

  const url = `${baseUrl}/trainings/${trainingId}`;

  try {
    // 동적으로 토큰 가져오기
    const token = await getAuthToken();

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("getRecordDetail error:", error);
    throw error;
  }
};

// Chart Dataset 가져오기
export const getChartDataset = async (url: string): Promise<any> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Chart dataset 요청 실패: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("getChartDataset error:", error);
    throw error;
  }
};

export type {
  RecordListPayload,
  TrainingRecord,
  RecordListResponse,
  TrainingDetailResponse,
  CPRScore,
  MetricCriteria,
  CPRGuideline,
};
