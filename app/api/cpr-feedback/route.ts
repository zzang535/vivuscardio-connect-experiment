import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chartData, trainingInfo } = body;

    if (!chartData) {
      return NextResponse.json(
        { error: "Chart data is required" },
        { status: 400 }
      );
    }

    // CPR 데이터 분석을 위한 프롬프트 생성
    const prompt = createCPRAnalysisPrompt(chartData, trainingInfo);

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `당신은 전문 CPR(심폐소생술) 교육자입니다.
훈련 데이터를 분석하여 구체적이고 건설적인 피드백을 제공합니다.
피드백은 한국어로 작성하며, 다음 구조를 따릅니다:

1. 전체 평가 요약
2. 잘한 점 (구체적인 수치와 함께)
3. 개선이 필요한 점 (구체적인 수치와 함께)
4. 개선 방법 및 권장사항

전문적이면서도 친근하고 격려하는 톤을 유지하세요.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const feedback = completion.choices[0]?.message?.content || "피드백을 생성할 수 없습니다.";

    return NextResponse.json({
      success: true,
      feedback,
      usage: completion.usage,
    });
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate feedback",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

function createCPRAnalysisPrompt(chartData: any, trainingInfo: any): string {
  const prompt = `
다음은 CPR 훈련 세션의 상세 데이터입니다:

## 기본 정보
- 훈련 날짜: ${trainingInfo?.datetime || 'N/A'}
- 마네킹 타입: ${trainingInfo?.manikin_type || 'N/A'}
- 총점: ${trainingInfo?.score?.total || 0}점

## 점수 요약
- 압박 깊이: ${trainingInfo?.score?.compression_depth || 0}점
- 압박 속도: ${trainingInfo?.score?.compression_rate || 0}점
- 압박 이완: ${trainingInfo?.score?.compression_recoil || 0}점
- 손 위치: ${trainingInfo?.score?.handposition || 0}점
- CCF: ${trainingInfo?.score?.ccf || 0}점
- 환기량: ${trainingInfo?.score?.ventilation_volume || 0}점
- 환기 속도: ${trainingInfo?.score?.ventilation_speed || 0}점
- 환기 횟수: ${trainingInfo?.score?.ventilation_count || 0}점

## 세부 평가 기준
${trainingInfo?.metric_criteria ? JSON.stringify(trainingInfo.metric_criteria, null, 2) : 'N/A'}

## 상세 CPR 수행 데이터
다음은 실시간으로 기록된 CPR 수행 데이터입니다:
${JSON.stringify(chartData, null, 2)}

위 데이터를 바탕으로 CPR 훈련 수행에 대한 상세한 피드백을 제공해주세요.

분석 시 다음을 포함해주세요:
1. 전체적인 수행 평가 (강점과 약점)
2. 압박 패턴 분석 (깊이, 속도, 이완의 일관성)
3. 인공호흡 분석 (양, 속도의 적절성)
4. 시간 흐름에 따른 수행 변화 (피로도 영향 등)
5. 구체적인 개선 방법과 연습 팁

특히 점수가 낮은 항목에 대해서는 왜 그런 결과가 나왔는지 데이터를 근거로 설명하고,
실질적으로 개선할 수 있는 방법을 제시해주세요.
`;

  return prompt;
}
