// 로그인 API 함수

interface LoginPayload {
  organization: string;
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user?: any;
  };
  message?: string;
}

export const loginMultiCourse = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL이 설정되지 않았습니다.");
  }

  const url = `${baseUrl}/v1/login/`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Type": "WEB",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`로그인 요청 실패: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("loginMultiCourse error:", error);
    throw error;
  }
};

export type { LoginPayload, LoginResponse };
