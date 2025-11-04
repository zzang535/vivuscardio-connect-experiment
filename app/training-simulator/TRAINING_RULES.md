# Training 데모 프로그램 개발 규칙

이 문서는 `app/training` 디렉토리에서 작업할 때만 적용되는 특별한 규칙들을 정의합니다.

## 프로젝트 개요

- **목적**: CPR 훈련 시뮬레이션 데모 프로그램
- **기술 스택**: React, Next.js 14 (App Router), Tailwind CSS, Framer Motion
- **디자인 기준**: Figma 시안 정확한 구현
- **화면 구조**: 독립적인 화면 전환 시스템 (Intro → Preview → Training → Result)
- **최종 업데이트**: 2025년 1월

## 개발 규칙

### 1. 파일 구조

- 모든 컴포넌트는 `app/training` 디렉토리 내에 생성
- Next.js 14 App Router 규칙 준수
- 각 화면은 독립적인 전체 레이아웃 소유

### 2. 디자인 구현

- Figma 시안의 정확한 픽셀 값 사용
- 색상 코드 정확히 준수:
  - 녹색: `#56ED89`, `#34C85A`
  - 파란색: `#0061F2`, `#3B82F6`
  - 회색: `#666666`, `#999999`, `#333333`, `#D9D9D9`
  - 배경: `#F5F5F5`, `#F5F5F6`, `#F9FAFB`
  - 빨간색: `#E84858`, `#EF4444`
  - 주황색: `#F85402`
- `rounded-[50px]`, `rounded-[30px]`, `rounded-[20px]` 사용
- 아이콘 크기: 12.8px × 12.8px (헤더), 25px × 25px (사이클 카운터)

### 3. 컴포넌트 명명

- 명확하고 기능을 나타내는 이름 사용
- 화면 컴포넌트: `Screen` 접두사 (예: `ScreenIntro`, `ScreenPreview`, `ScreenTraining`, `ScreenResult`)
- 공통 컴포넌트: `Header`, `Manikin`, `ManikinGuide`, `ManikinStatus`
- 훈련 컴포넌트: `Training` 접두사 (예: `TrainingPrompt`, `TrainingCycleCounter`, `TrainingGauges`)
- 아이콘 컴포넌트: `Icon` 접두사 (예: `IconCompression`, `IconVentilation`, `IconTarget`, `IconRate`)

### 4. 동작 방식 문서화 규칙

- 화면의 동작 방식이 개발될 때마다 아래 "화면 기획서" 섹션에 추가
- 각 기능별로 구체적인 동작 원리와 구현 방법 기록
- 다른 프로젝트에서 동일한 기능을 개발할 때 사용할 수 있는 기획서 형태로 작성
- 기술적 세부사항과 시각적 피드백 방식, 사용자 시나리오 모두 포함

## 화면 레이아웃 시스템

### 전체 화면 구조 (Independent Screen System)

2025년 1월 업데이트: **embedded 패턴 제거**, 모든 화면이 독립적으로 전체 레이아웃 소유

#### 화면 전환 흐름

```
page.jsx (screenState 관리)
├─ 'intro' → ScreenIntro (시작 화면)
├─ 'preview' → ScreenPreview (마네킹 미리보기)
├─ 'training' → ScreenTraining (훈련 화면, trainingPhase: 'active' or 'loading')
└─ 'result' → ScreenResult (결과 화면)
```

#### 레이아웃 공통 규칙

| 요소          | 스타일/크기                        | 설명                          |
| ------------- | ---------------------------------- | ----------------------------- |
| 전체 컨테이너 | `w-screen h-screen`                | 브라우저 전체 너비/높이       |
| 헤더 영역     | `height: 60px`                     | 모든 화면 공통 고정 높이      |
| 메인 컨텐츠   | `height: calc(100vh - 60px)`       | 헤더 제외한 나머지 높이       |
| 좌측 영역     | `width: calc(1286px + 80px)`       | 콘텐츠 1286px + 좌우 패딩 40px |
| 우측 영역     | `flex-1`                           | 나머지 전체 공간              |
| 세로 중앙     | `h-full flex flex-col justify-center` | 콘텐츠 세로 중앙 정렬         |

#### 화면별 레이아웃 명세

##### ScreenIntro (시작 화면)
- **전체 화면**: 다크 배경 (#1F2937)
- **중앙 정렬**: 타이틀 + Start 버튼
- **헤더 없음**

##### ScreenPreview (미리보기 화면)
- **레이아웃**: 헤더 60px + 중앙 정렬 콘텐츠
- **좌우 구성**: 마네킹(좌측) + 상태패널/버튼(우측)
- **배경**: #F5F5F5

##### ScreenTraining (훈련 화면)
- **레이아웃**: 헤더 60px + 좌우 분할
- **좌측 (1366px)**: TrainingPrompt + TrainingCycleCounter + TrainingGauges
- **우측 (flex-1)**: Manikin + ManikinGuide
- **trainingPhase**: 'active' (훈련 중) / 'loading' (결과 분석 중)

##### ScreenResult (결과 화면)
- **레이아웃**: 헤더 60px + 좌우 분할
- **좌측 (1366px)**: 제목 + 메트릭 그리드 + 액션 버튼
- **우측 (flex-1)**: Manikin (비활성) + ManikinGuide
- **메트릭**: 6개 카드 (3행 × 2열)

#### 중요: embedded 패턴 제거

**변경 전** (구버전, 사용 금지):
```jsx
// ❌ 잘못된 패턴 - embedded props 사용
<ScreenResult
  metrics={metrics}
  embedded={true}  // 조건부 레이아웃
  showFooterActions={false}  // 조건부 UI
/>
```

**변경 후** (현재, 권장):
```jsx
// ✅ 올바른 패턴 - 독립적 화면
<ScreenResult
  metrics={metrics}
  onRestart={handleRestart}
  onBackToIntro={handleBackToIntro}
/>
// ScreenResult 내부에서 전체 레이아웃 (헤더, 좌우 분할) 소유
```

#### 컴포넌트 중복 허용

각 화면은 필요한 컴포넌트를 독립적으로 import하고 사용:
- `Header`: ScreenPreview, ScreenTraining, ScreenResult에서 각각 사용
- `Manikin`: ScreenPreview, ScreenTraining, ScreenResult에서 각각 사용
- `ManikinGuide`: 동일

**장점**:
- 명확한 화면 구조
- 조건부 로직 제거
- 유지보수 용이
- 각 화면의 독립성 보장

## 화면 기획서

### 0. 공통 헤더 (Header)

#### 기능 개요

모든 주요 화면(Preview, Training, Result)에서 사용되는 공통 헤더 컴포넌트

#### 화면 구성 요소

| 위치 | 구성 요소 | 설명                                      |
| ---- | --------- | ----------------------------------------- |
| 좌측 | 로고      | VivusCardioLogo.svg (175px × 47px)        |
| 우측 | 액션 버튼 | mode에 따라 다른 버튼 표시 (향후 확장용) |

#### 시각적 명세

- **전체 크기**: `w-full h-full` (부모 컨테이너 60px에 맞춤)
- **배경색**: #FFFFFF
- **테두리**: 하단 1px #E5E7EB
- **패딩**: 좌우 24px
- **정렬**: 좌우 양끝 정렬 (justify-between)

#### Props

| Prop          | 타입     | 설명                                            |
| ------------- | -------- | ----------------------------------------------- |
| mode          | String   | 'default' (Preview) / 'training' / 'result'     |
| onPracticeStop| Function | 훈련 중단 콜백 (training mode)                  |
| onRestart     | Function | 재시작 콜백 (result mode)                       |
| onBackToIntro | Function | 처음으로 콜백 (result mode)                     |

### 1. 시작 화면 (ScreenIntro)

#### 기능 개요

사용자가 CPR 훈련을 시작하는 첫 화면

#### 화면 구성 요소

| 위치   | 구성 요소    | 설명                                 |
| ------ | ------------ | ------------------------------------ |
| 중앙   | 타이틀       | "VCC CPR Training Experience"        |
| 중앙 하단 | Start 버튼 | 클릭 시 Preview 화면으로 전환        |

#### 시각적 명세

- **전체 배경**: #1F2937 (다크 그레이)
- **타이틀**: 60px, Bold, 흰색
- **버튼**: 파란색 (#0061F2), 둥근 모서리 20px, 큰 패딩

#### 상호작용

- **Start 버튼 클릭**: `onStart()` 호출 → screenState = 'preview'

### 2. 마네킹 미리보기 (ScreenPreview)

#### 기능 개요

훈련 시작 전 마네킹 조작 방법을 미리 체험하는 화면

#### 화면 구성 요소

| 영역   | 구성 요소              | 설명                          |
| ------ | ---------------------- | ----------------------------- |
| 헤더   | Header (mode='default')| 로고 표시                     |
| 좌측   | Manikin (size='large') | 큰 마네킹, 조작 가능          |
| 좌측 하단 | ManikinGuide        | 조작 안내                     |
| 우측   | ManikinStatus          | 실시간 상태 표시              |
| 우측 하단 | 액션 버튼           | Start Training / Back to Start |

#### 레이아웃 구조

```
┌────────────────────────────────────────┐
│ Header (60px)                          │
├────────────────┬───────────────────────┤
│                │                       │
│   Manikin      │   ManikinStatus       │
│   (large)      │                       │
│                │   Start Training      │
│   Guide        │   Back to Start       │
│                │                       │
└────────────────┴───────────────────────┘
```

#### 상호작용

- **마네킹 조작**: 압박/환기 테스트, 실시간 피드백
- **Start Training 클릭**: `onStartTraining()` → screenState = 'training'
- **Back to Start 클릭**: `onBackToIntro()` → screenState = 'intro'

### 3. 구 헤더 영역 (TrainingHeader) - 사용 중단

#### 기능 개요

훈련 세션의 시간 추적과 훈련 중단 기능을 제공하는 상단 고정 헤더

#### 화면 구성 요소

| 위치 | 구성 요소          | 설명                                    |
| ---- | ------------------ | --------------------------------------- |
| 좌측 | 타이머 아이콘      | 검은 원점 아이콘 (6x6px)                |
| 좌측 | 타이머 텍스트      | "MM:SS" 형식 시간 표시 (18px, 세미볼드) |
| 우측 | Practice Stop 버튼 | 회색 배경, 흰색 텍스트, 둥근 모서리     |

#### 시각적 명세

- **전체 크기**: 화면 너비 100% × 60px 높이
- **배경색**: #FFFFFF
- **테두리**: 하단 1px #E5E7EB
- **패딩**: 좌우 24px
- **정렬**: 좌우 양끝 정렬 (justify-between)

#### 상호작용

- **타이머**: 1초마다 자동 업데이트 (MM:SS 형식)
- **Practice Stop 버튼**: 클릭 시 훈련 중단 모달 표시
- **hover 효과**: 버튼 배경색 변경 (#374151 → #1F2937)

### 4. 훈련 상태 프롬프트 (TrainingPrompt) - 카운트다운 및 실시간 피드백 시스템

**2025년 10월 업데이트**: 카운트다운, Hands Off Time, 우선순위 기반 피드백 시스템 추가

#### 기능 개요

훈련 시작 시 3, 2, 1, Start 카운트다운을 표시하고, 액션 없이 1초 경과 시 Hands Off Time을 표시하며, 압박/환기 결과에 따라 우선순위 기반 피드백을 제공하는 시스템

#### 화면 구성 요소

| 구성 요소        | 위치 | 설명                                      |
| ---------------- | ---- | ----------------------------------------- |
| 카운트다운       | 중앙 | 120px, Bold, #333333, "3", "2", "1" 표시  |
| Start 메시지     | 중앙 | 80px, Bold, #333333, 카운트다운 후 고정   |
| Hands Off Time   | 중앙 | 80px, Bold, #333333, 1초 이상 입력 없을 때 |
| 피드백 메시지    | 중앙 | 80px, Bold, #333333, 액션 판정 결과       |
| 이전 메시지 (회색) | 중앙 | 80px, Bold, #999999, 새 액션 시작 시      |

#### 시각적 명세

- **전체 크기**: 전체 너비, 최소 높이 120px
- **배경**: Radial gradient (ellipse 643px × 202px)
  ```css
  radial-gradient(ellipse 643px 202px at center, rgba(255,255,255,1) 0%, rgba(245,245,245,1) 100%)
  ```
- **테두리**: 60px 둥근 모서리
- **패딩**: px-8 py-16 (좌우 32px, 상하 64px)

#### 카운트다운 시스템

**동작 순서**:
1. 훈련 시작 시 "3" 표시 (1초)
2. "2" 표시 (1초)
3. "1" 표시 (1초)
4. "Start" 표시 및 고정 유지

**애니메이션**:
```jsx
initial: { opacity: 0, scale: 0.5 }
animate: { opacity: 1, scale: 1 }
exit: { opacity: 0, scale: 1.5 }
transition: { duration: 0.3 }
```

#### Hands Off Time 시스템

**동작 조건**:
- 카운트다운 종료 후
- 압박 또는 환기 입력이 없는 상태
- 마지막 액션 후 1초 경과 시 표시 시작

**표시 형식**:
- "Hands Off Time: 1s"
- "Hands Off Time: 2s"
- 실시간으로 초 단위 증가 (100ms 간격으로 업데이트)

**타이머 리셋 조건**:
- 압박 시작 (`isPressed === true`)
- 환기 시작 (`isVentilating === true`)

#### 동적 피드백 메시지 (압박)

**우선순위**: position > depth > rate

| 조건                              | Title            | 설명                  |
| --------------------------------- | ---------------- | --------------------- |
| 모두 성공 (position + depth + rate) | "Good"         | 3가지 모두 통과       |
| Position 실패                     | "Check Position" | 위치 문제 (최우선)    |
| Depth 실패 (얕음)                 | "Deeper"         | 깊이 부족             |
| Depth 실패 (깊음)                 | "Shallower"      | 깊이 과다             |
| Rate 실패 (빠름)                  | "Slower"         | 속도 너무 빠름        |
| Rate 실패 (느림)                  | "Faster"         | 속도 너무 느림        |

**판정 기준**:
- Position: 심장 위치로부터의 거리 (POSITION_TOLERANCE 이내)
- Depth: 33% ~ 67% 범위 (MIN_OPTIMAL_DEPTH ~ MAX_OPTIMAL_DEPTH)
- Rate: 0.4초 ~ 0.8초 범위 (TOO_FAST_THRESHOLD ~ TOO_SLOW_THRESHOLD)

#### 동적 피드백 메시지 (환기)

| 조건          | Title       | 설명       |
| ------------- | ----------- | ---------- |
| 환기 성공     | "Good"      | 적정 볼륨  |
| 볼륨 부족     | "Deeper"    | 볼륨 부족  |
| 볼륨 과다     | "Shallower" | 볼륨 과다  |

**판정 기준**:
- Volume: 33% ~ 67% 범위 (MIN_OPTIMAL_VOLUME ~ MAX_OPTIMAL_VOLUME)

#### 메시지 상태 전환

**1. 카운트다운 → Start**:
- 카운트다운 종료 후 "Start" 메시지 표시
- "Start"는 다음 액션까지 고정 유지

**2. Start → 액션 판정**:
- 액션 완료 시 판정 결과 표시
- 판정 메시지는 고정 유지 (사라지지 않음)

**3. 액션 판정 → 회색 메시지 → 새 액션 판정**:
- 새 액션 시작 시: 이전 판정이 회색(#999999)으로 변경
- 새 액션 완료 시: 새 판정이 검정색(#333333)으로 튀어나옴
- 이전 메시지와 새 메시지가 겹쳐서 표시 (absolute positioning)

**4. 액션 없음 → Hands Off Time**:
- 1초 이상 입력 없을 때: Hands Off Time 표시
- 액션 판정 메시지는 Hands Off Time으로 대체

#### 애니메이션 동작 방식

**카운트다운 애니메이션** (각 숫자마다):
```jsx
initial: { opacity: 0, scale: 0.5 }
animate: { opacity: 1, scale: 1 }
exit: { opacity: 0, scale: 1.5 }
transition: { duration: 0.3 }
```

**Hands Off Time 진입**:
```jsx
initial: { opacity: 0, y: 20 }
animate: { opacity: 1, y: 0 }
transition: { duration: 0.3 }
```

**이전 메시지 (회색)**:
```jsx
initial: { opacity: 1 }
animate: { opacity: 1 }
transition: { duration: 0.2 }
```

**새 메시지 (검정)**:
```jsx
initial: { opacity: 0, y: 30 }
animate: { opacity: 1, y: 0 }
transition: { duration: 0.15, ease: "easeOut" }
```

#### 기술적 구현 세부사항

**Props**:
- `lastCompressionResult`: 마지막 압박 결과 객체
- `lastVentilationResult`: 마지막 환기 결과 객체
- `isPressed`: 현재 압박 중 상태 (boolean)
- `isVentilating`: 현재 환기 중 상태 (boolean)
- `trainingStarted`: 훈련 시작 여부 (boolean)

**상태 관리**:
```jsx
// 카운트다운 상태
const [countdown, setCountdown] = useState(3);
const [showCountdown, setShowCountdown] = useState(true);

// 메시지 상태
const [currentMessage, setCurrentMessage] = useState(null);
const [previousMessage, setPreviousMessage] = useState(null);
const [messageKey, setMessageKey] = useState(0);

// Hands Off Time 상태
const [handsOffTime, setHandsOffTime] = useState(0);
const [showHandsOff, setShowHandsOff] = useState(false);
const handsOffTimerRef = useRef(null);
const lastActionTimeRef = useRef(Date.now());
```

**카운트다운 로직**:
- 1초마다 countdown 감소
- countdown이 0이 되면 "Start" 메시지 설정
- `showCountdown = false`로 전환

**Hands Off Time 로직**:
- `isPressed` 또는 `isVentilating`이 true이면 타이머 리셋
- 100ms 간격으로 경과 시간 계산
- 1초 이상 경과 시 Hands Off Time 표시 시작

**실시간 감지**:
- `useEffect`로 `lastCompressionResult` 변화 감지
- `useEffect`로 `lastVentilationResult` 변화 감지
- 결과 분석 후 즉시 메시지 표시
- 메시지는 사라지지 않고 고정 유지

**액션 시작 감지**:
- `useEffect`로 `isPressed`, `isVentilating` 변화 감지
- 새 액션 시작 시 `currentMessage`를 회색으로 `previousMessage`에 저장

**메시지 구조**:
```jsx
{
  title: "Good",           // 메인 메시지
  color: "#333333"         // 텍스트 색상
}
```

#### 사용자 경험

1. **명확한 시작 신호**: 3, 2, 1 카운트다운으로 훈련 시작 알림
2. **지속적인 피드백**: 액션 판정이 사라지지 않고 화면에 고정
3. **우선순위 기반 안내**: 가장 중요한 문제를 먼저 표시 (position > depth > rate)
4. **Hands Off 경고**: 1초 이상 입력 없을 때 경고 표시
5. **부드러운 전환**: 이전 메시지가 회색으로 변하고 새 메시지가 튀어나오는 자연스러운 애니메이션

### 5. 사이클 카운터 (CycleCounter)

#### 기능 개요

CPR 압박과 환기 사이클의 실시간 진행 상황과 수행 결과를 시각적으로 표시

#### 화면 구성 요소

| 구성 요소       | 위치             | 개수 | 설명                  |
| --------------- | ---------------- | ---- | --------------------- |
| 사이클 라벨     | 좌측 상단        | 1개  | 현재 사이클 번호 표시 |
| 압박 아이콘     | 압박 섹션 시작   | 1개  | 압박 동작 구분 표시   |
| 압박 인디케이터 | 압박 아이콘 우측 | 30개 | 각 압박의 수행 결과   |
| 환기 아이콘     | 환기 섹션 시작   | 1개  | 환기 동작 구분 표시   |
| 환기 인디케이터 | 환기 아이콘 우측 | 2개  | 각 환기의 수행 결과   |

#### 시각적 명세

- **사이클 라벨**: 150px × 40px, 검은 배경 (#1F2937), 흰색 텍스트, 둥근 모서리 8px
- **인디케이터 크기**: 각 25px × 25px 원형
- **간격**: 인디케이터 간 8px, 섹션 간 35px
- **정렬**: 좌측 정렬, 세로 중앙 정렬

#### 상태별 시각적 표현

| 상태 | 배경색  | 텍스트색 | 설명                    |
| ---- | ------- | -------- | ----------------------- |
| 성공 | #10B981 | #FFFFFF  | 올바른 압박/환기 수행   |
| 실패 | #EF4444 | #FFFFFF  | 부적절한 압박/환기 수행 |
| 대기 | #E5E7EB | #6B7280  | 아직 수행되지 않음      |

#### 동작 시나리오

1. **초기 상태**: 모든 인디케이터가 대기 상태로 표시
2. **압박 진행**: 압박 수행 시 해당 번호 인디케이터의 색상이 실시간 변경
3. **환기 진행**: 30회 압박 완료 후 환기 인디케이터 활성화
4. **사이클 완료**: 2회 환기 완료 시 다음 사이클로 진행

### 4. 실시간 피드백 게이지 (FeedbackGauge)

#### 기능 개요

CPR 수행 중 압박 위치, 깊이, 속도, 볼륨의 실시간 품질 측정 결과를 시각적으로 표시

#### 전체 레이아웃

| 구성 요소     | 위치   | 크기           | 설명            |
| ------------- | ------ | -------------- | --------------- |
| 좌측 화살표   | 최좌측 | 125px × 366px  | 이전 화면 이동  |
| 피드백 게이지 | 중앙   | 1036px × 366px | 4개 게이지 그룹 |
| 우측 화살표   | 최우측 | 125px × 366px  | 다음 화면 이동  |

#### 개별 게이지 명세

##### 4-1. Position 게이지

- **목적**: 압박 위치의 정확성 표시
- **크기**: 280px × 280px, 50px 둥근 모서리
- **배경**: SVG 격자 패턴 (20px 간격), #E5E7EB 색상
- **핵심 요소**: 중앙 50px 녹색 원점 (#56ED89)
- **라벨**: 상단 "Head", 하단 "Center" (14px, #666666)

##### 4-2. Depth 게이지

- **목적**: 압박 깊이의 적정성 표시
- **시각화**: 상단부터 채워지는 녹색 영역 (#56ED89) + 녹색 영역 끝에 붙은 6px 파란 기준선 (#0061F2)
- **3등분 기준선**: 게이지를 3등분하는 2개의 점선
  - Too shallow 선: 상단 1/3 지점 (93.33px)
  - Too deep 선: 하단 2/3 지점 (186.67px)
- **라벨**:
  - "Too shallow": 첫 번째 점선 바로 위 (78px) + 상향 화살표 아이콘
  - "Too deep": 두 번째 점선 바로 아래 (200px) + 하향 화살표 아이콘
- **피드백**: 파란 기준선 위치로 현재 압박 깊이의 적정성 판단

##### 4-3. Rate 게이지

- **목적**: 압박 간격의 적정성 표시 (연속 압박 간 시간 간격)
- **3등분 기준선**: 게이지를 3등분하는 2개의 세로 점선
  - Too fast 선: 왼쪽 1/3 지점 (93.33px)
  - Too slow 선: 오른쪽 2/3 지점 (186.67px)
- **실시간 Rate 표시선**: 현재 압박 간격을 나타내는 6px 세로선
  - 색상: 녹색(적정)/빨강(너무 빠름)/주황(너무 느림)
  - 위치: 0.2~1.2초 간격을 0~100% 게이지 위치로 매핑
  - 간격값 표시: 선 위에 "X.XXs" 실시간 표시
- **라벨**:
  - 하단 좌측: "Too fast" (첫 번째 점선 왼쪽)
  - 하단 우측: "Too slow" + 우측 화살표 아이콘 (두 번째 점선 오른쪽)
- **CPR 기준**: 100-120 compressions/min (0.5-0.6초 간격)

##### 4-4. Volume 게이지

- **목적**: 환기 볼륨의 적정성 표시
- **시각화**: 하단 165px 녹색 영역 (#56ED89) + 상단 6px 파란 기준선 (#0061F2)
- **라벨**:
  - 상단: "Too much" + 상향 화살표 아이콘
  - 하단: "Too little" + 하향 화살표 아이콘
- **특수 요소**: 우상단 "Damaged" 경고 태그 (회색 배경 + 주황 원점)

#### 공통 헤더 구성

| 요소   | 크기            | 색상    | 설명                       |
| ------ | --------------- | ------- | -------------------------- |
| 아이콘 | 12.8px × 12.8px | #666666 | 측정 항목별 고유 아이콘    |
| 제목   | 18px Bold       | #666666 | Position/Depth/Rate/Volume |
| 간격   | 6px             | -       | 아이콘과 제목 사이         |

#### 상호작용

- **화살표 버튼**: 좌우 스와이프로 다른 게이지 세트 확인
- **실시간 업데이트**: CPR 수행 중 게이지 값 즉시 반영
- **색상 변화**: 적정 범위 이탈 시 경고색 표시

### 5. 페이지 컨트롤 (PageControl)

#### 기능 개요

다중 화면으로 구성된 훈련 인터페이스에서 현재 위치와 전체 진행 상황을 표시

#### 화면 구성 요소

| 구성 요소     | 개수 | 크기        | 설명                       |
| ------------- | ---- | ----------- | -------------------------- |
| 인디케이터 점 | 3개  | 8px × 8px   | 각 화면을 나타내는 원형 점 |
| 컨테이너      | 1개  | 가변 × 32px | 점들을 감싸는 둥근 배경    |

#### 시각적 명세

- **컨테이너**:
  - 배경: rgba(0, 0, 0, 0.2) (20% 투명 검은색)
  - 효과: backdrop-blur(20px)
  - 모서리: 50px 둥근 모서리
  - 패딩: 상하 8px, 좌우 12px
- **인디케이터 점**:
  - 크기: 8px × 8px 원형
  - 간격: 점 사이 8px
  - 정렬: 가로 중앙 정렬

#### 상태별 시각적 표현

| 상태               | 배경색             | 설명                |
| ------------------ | ------------------ | ------------------- |
| 활성 (현재 페이지) | #000000            | 현재 보고 있는 화면 |
| 비활성             | rgba(0, 0, 0, 0.3) | 다른 화면들         |

#### 위치 및 동작

- **위치**: 화면 하단 중앙 고정
- **반응성**: 화면 크기에 관계없이 중앙 유지
- **상호작용**: 점 클릭 시 해당 화면으로 이동 (추후 구현)

#### 화면 매핑

| 점 번호  | 대응 화면     | 설명                |
| -------- | ------------- | ------------------- |
| 1 (활성) | 실시간 피드백 | 현재 표시 중인 화면 |
| 2        | 상세 분석     | 추후 구현 예정      |
| 3        | 결과 요약     | 추후 구현 예정      |

### 6. 전체 레이아웃 구조 (MainLayout)

#### 기능 개요

CPR 훈련 인터페이스와 마네킹 시각화를 동시에 표시하는 분할 화면 레이아웃

#### 화면 구성 요소

| 영역             | 위치      | 크기                 | 설명                   |
| ---------------- | --------- | -------------------- | ---------------------- |
| 헤더             | 상단 고정 | 100% × 84px          | 타이머 및 제어 버튼    |
| 좌측 인터페이스  | 좌측 고정 | 1366px × 나머지 높이 | CPR 훈련 UI 컴포넌트들 |
| 우측 마네킹 영역 | 우측 확장 | 나머지 × 나머지 높이 | 3D 마네킹 시각화       |

#### 시각적 명세

- **전체 높이**: 100vh (전체 화면 높이)
- **헤더 제외 높이**: calc(100vh - 84px)
- **좌측 영역**:
  - 고정 너비 1366px (flex-shrink-0)
  - 패딩 40px
  - 배경 #F9FAFB
- **우측 영역**:
  - 남은 공간 전체 사용 (flex-1)
  - 좌측 회색 테두리 (#E5E7EB)
  - 패딩 32px
  - 배경 #FFFFFF

#### 반응형 동작

- **와이드 모니터**: 우측 영역이 확장되어 마네킹 시각화 영역 최대화
- **표준 모니터**: 좌측 1366px 고정, 우측 최소 400px 이상 확보
- **소형 화면**: 추후 수직 스택 레이아웃으로 변경 예정

#### 향후 확장 계획

- **마네킹 연결**: 실제 CPR 마네킹 센서 데이터 연동
- **3D 시각화**: 압박 위치 및 깊이의 실시간 3D 표현
- **멀티 뷰**: 다양한 각도에서 마네킹 상태 확인

### 7. CPR 마네킹 컨트롤러 (ManikinController)

#### 기능 개요

실제 CPR 마네킹을 시뮬레이션하는 인터랙티브 컨트롤러로 압박 위치와 깊이를 측정

#### 화면 구성 요소

| 구성 요소 | 크기          | 위치                  | 설명                       |
| --------- | ------------- | --------------------- | -------------------------- |
| 머리 영역 | 128px × 96px  | 상단 중앙             | 회색 사각형, "Head" 라벨   |
| 몸 영역   | 192px × 256px | 중앙                  | 클릭 가능한 회색 사각형    |
| 심장 표시 | 16px × 16px   | 몸 영역 내 (50%, 40%) | 빨간 원점, 맥박 애니메이션 |
| 상태 패널 | 가변          | 하단                  | 현재 상태 정보 표시        |

#### 상호작용 동작

1. **위치 측정**: 몸 영역 클릭 시 심장 위치와의 거리 계산
2. **압박 시뮬레이션**: 마우스 다운 시 압박 시작, 업 시 종료
3. **깊이 변화**: 압박 시간에 따라 0-100% 깊이 증가 (50ms마다 2%씩)
4. **시각적 피드백**: 압박 중 몸 영역 색상 변화 (회색→빨강)

#### 측정 데이터

| 측정 항목   | 계산 방식           | 출력 형식                |
| ----------- | ------------------- | ------------------------ |
| 위치 정확도 | √((ΔX)² + (ΔY)²)    | "Position offset: X.XX%" |
| 압박 시간   | mouseDown → mouseUp | "Duration: XXXXms"       |
| 최대 깊이   | 압박 중 최대값      | "Max Depth: XX%"         |

#### 콘솔 출력 예시

```
Position offset from heart: 15.23% (X: 12.50%, Y: 8.75%)
Compression completed - Duration: 1250ms, Max Depth: 85%
```

#### 시각적 상태 표현

- **대기 중**: 회색 몸 영역, 맥박하는 빨간 심장점
- **압박 중**: 빨간 몸 영역, 하단부터 파란색으로 깊이 표시
- **깊이 게이지**: 압박 깊이에 따라 하단부터 파란색 영역 증가

### 8. 마네킹-피드백 게이지 연동 시스템

#### 기능 개요

마네킹 컨트롤러의 압박 동작과 Position/Depth 피드백 게이지를 실시간으로 연동하여 시각적 피드백 제공

#### 연동 데이터

| 데이터 타입 | 마네킹 → 게이지        | 업데이트 주기 | 설명                         |
| ----------- | ---------------------- | ------------- | ---------------------------- |
| 클릭 위치   | clickPosition {x, y}   | 즉시          | 압박 위치의 정확성 표시      |
| 압박 상태   | isPressed (true/false) | 즉시          | 압박 중/대기 중 시각적 구분  |
| 압박 깊이   | depth (0-100%)         | 50ms          | 압박 시간에 비례한 깊이 증가 |

#### Position 게이지 연동

- **기본 위치**: 중앙 (50%, 40%) - 마네킹 심장 위치와 매핑
- **실시간 이동**: 클릭 위치에 따라 녹색 점 즉시 이동
- **좌표 변환**: 마네킹 좌표 → 게이지 좌표 적절히 매핑
- **상태 표시**:
  - 대기 중: 녹색 점 (#56ED89)
  - 압박 중: 빨간색 점 (#EF4444) + 크기 확대 (110%)
- **애니메이션**: 200ms transition으로 부드러운 이동

#### Depth 게이지 연동

- **깊이 표현**: 위에서 아래로 "채워지는" 효과로 압박 깊이 표시
- **실시간 업데이트**: 50ms마다 깊이 증가 (2%씩)
- **최대 깊이**: 100% (최대 280px까지 채워짐)
- **시각적 구조**:
  - 압박 깊이: 상단부터 녹색 영역 (#56ED89)으로 채워짐
  - 현재 위치 표시: 녹색 영역 끝에 파란 기준선 (6px, #0061F2) 항상 붙어있음
  - 깊이 증가: 녹색 영역과 파란 기준선이 함께 아래로 이동
- **Too shallow/Too deep 라벨**: 좌측에 화살표와 함께 표시
- **실시간 피드백**: 파란 기준선이 현재 압박 깊이를 정확히 표시

#### Press Time UI 개선

- **고정 표시**: "Press Time: 0.0s" 항상 표시 (UI 흔들림 방지)
- **실시간 업데이트**: 압박 중 100ms마다 시간 증가
- **부드러운 카운트**: 0.1초 단위로 정확한 시간 표시

#### Rate 게이지 연동

- **압박 이력 관리**: 최근 10개 압박 시점을 배열로 저장
- **간격 계산**: 직전 압박과 현재 압박의 시간 차이 계산 (초 단위)
- **CPR 가이드라인 기준**:
  - 적정 간격: 0.5-0.6초 (100-120 compressions/min)
  - Too fast: 0.4초 미만 (빨간색 표시)
  - Too slow: 0.8초 초과 (주황색 표시)
  - Optimal: 0.4-0.8초 범위 (녹색 표시)
- **시각적 표현**:
  - 실시간 세로선: 현재 압박 간격을 게이지 X축에 표시
  - 상태별 색상: 녹색(적정)/빨강(너무 빠름)/주황(너무 느림)
  - 간격 값 표시: 세로선 위에 "X.XXs" 형태로 실시간 표시
- **게이지 매핑**: 0.2~1.2초 범위를 게이지 0~100% 위치로 변환

#### 성능 최적화

- **인터벌 관리**: 압박 종료 시 모든 타이머 정리
- **메모리 누수 방지**: 컴포넌트 언마운트 시 cleanup
- **전역 상태**: 상위 컴포넌트에서 상태 통합 관리

### 9. CPR 압박 이력 관리 및 Rate 계산 시스템

#### 기능 개요

CPR 압박의 연속성과 리듬을 평가하기 위한 이력 관리 시스템으로, 압박 간격을 실시간으로 계산하고 CPR 가이드라인에 따른 피드백 제공

#### 데이터 구조

| 항목               | 타입             | 설명                                   |
| ------------------ | ---------------- | -------------------------------------- |
| compressionHistory | Array<timestamp> | 최근 압박 종료 시점들 (최대 10개)      |
| rateData           | Object           | { interval, status, compressionCount } |
| interval           | Number           | 직전 압박과의 시간 간격 (초)           |
| status             | String           | 'optimal', 'too_fast', 'too_slow'      |

#### CPR 가이드라인 기준

- **표준 압박 속도**: 100-120 compressions per minute
- **적정 간격**: 0.5-0.6초 (60초 ÷ 100-120)
- **판정 기준**:
  - Too fast: < 0.4초 (150+ compressions/min)
  - Optimal: 0.4-0.8초 (75-150 compressions/min)
  - Too slow: > 0.8초 (< 75 compressions/min)

#### 계산 로직

1. **압박 종료 시**: 현재 타임스탬프를 이력 배열에 추가
2. **배열 관리**: 최대 10개 유지 (오래된 것부터 제거)
3. **간격 계산**: 최근 2개 압박 간의 시간 차이 계산
4. **상태 판정**: CPR 기준에 따른 피드백 상태 결정
5. **게이지 연동**: Rate 게이지에 실시간 반영

#### 콘솔 출력

- **압박 완료**: "Compression completed - Duration: XXXXms, Max Depth: XX%"
- **압박 간격**: "Compression interval: X.XXXs"
- **상태 변화**: Rate 게이지 색상 및 위치 실시간 업데이트

#### 시각적 피드백

- **Rate 게이지**: 압박 간격에 따른 세로선 위치 이동
- **색상 코드**: 녹색(적정), 빨강(너무 빠름), 주황(너무 느림)
- **수치 표시**: 게이지 상단에 현재 간격값 표시

### 10. 인공호흡(Ventilation) 시스템

#### 기능 개요

CPR 사이클에서 압박 후 수행하는 인공호흡을 시뮬레이션하며, 환기 볼륨을 실시간으로 측정하고 피드백을 제공

#### 마네킹 상호작용

| 구성 요소 | 위치                | 크기         | 설명                         |
| --------- | ------------------- | ------------ | ---------------------------- |
| 환기 지점 | 머리 영역 중앙 하단 | 12px × 12px  | 파란색 원점, 맥박 애니메이션 |
| 머리 영역 | 상단 중앙           | 128px × 96px | 클릭 가능한 회색 사각형      |
| 상태 변화 | 환기 중             | -            | 파란색 배경으로 변경         |

#### Ventilation 처리 로직

- **시작 감지**: 머리 영역 mouseDown 이벤트
- **볼륨 증가**: 50ms마다 2%씩 증가 (depth와 동일한 원리)
- **최대 볼륨**: 100%까지 증가 가능
- **종료 감지**: mouseUp 또는 mouseLeave 이벤트
- **데이터 전달**: 최대 볼륨, 지속 시간, 타임스탬프

#### CycleCounter 연동

- **표시 개수**: 2개 환기 인디케이터
- **위치**: 30개 압박 인디케이터 우측
- **구분 아이콘**: 파란색 테두리 원형 (압박은 회색 테두리)
- **상태별 색상**:
  - 성공: 파란색 배경 (#3B82F6)
  - 실패: 빨간색 배경 (#EF4444)
  - 대기: 회색 배경 (#E5E7EB)

#### Volume 피드백 게이지

- **시각화 방식**: 아래에서 위로 "채워지는" 효과 (Depth 게이지와 동일한 원리)
- **실시간 업데이트**: 50ms마다 볼륨 증가에 따라 녹색 영역 확장
- **기준선**: 녹색 영역 상단에 6px 파란색 기준선 (#0061F2) 항상 붙어있음
- **적정 범위**: 중앙선(140px) 기준으로 상하 적정 범위 판정
- **평가 기준**:
  - Too little: 중앙선 아래 (볼륨 부족)
  - Optimal: 중앙선 근처 (적정 볼륨)
  - Too much: 중앙선 위 (과도한 볼륨)

#### 환기 평가 시스템

- **볼륨 기준**: 40-80% 범위를 적정으로 판정
- **평가 결과**: 볼륨 평가만으로 전체 성공/실패 결정
- **결과 저장**: ventilationResults 배열에 평가 결과 저장
- **콘솔 출력**: "Ventilation completed - Duration: XXXXms, Max Volume: XX%"

#### 사용자 시나리오

1. **압박 완료**: 30회 압박 완료 후 환기 단계 진입
2. **환기 수행**: 머리 영역의 파란 점 클릭하여 환기 시작
3. **볼륨 조절**: 클릭 지속 시간으로 환기 볼륨 조절
4. **실시간 피드백**: Volume 게이지에서 현재 볼륨 상태 확인
5. **평가 확인**: CycleCounter에서 환기 성공/실패 확인
6. **사이클 완료**: 2회 환기 완료 시 다음 사이클로 진행

#### 기술적 세부사항

- **상태 관리**: isVentilating, ventilationVolume, ventilationStartTime
- **인터벌 관리**: ventilationIntervalRef로 볼륨 증가 제어
- **메모리 관리**: 컴포넌트 언마운트 시 인터벌 정리
- **Props 연동**: 상위 컴포넌트와 실시간 상태 공유
- **애니메이션**: 75ms transition으로 부드러운 볼륨 변화

### 11. 마네킹 실사 이미지 시각화

#### 기능 개요

기존 div 박스 기반 마네킹 표현을 실제 CPR 마네킹 이미지로 교체하여 사실감 있는 훈련 환경 제공

#### 이미지 구현 명세

| 항목            | 사양           | 설명                 |
| --------------- | -------------- | -------------------- |
| 이미지 컴포넌트 | Next.js Image  | 최적화된 이미지 로딩 |
| 이미지 크기     | 300px × 450px  | 고정 비율 유지       |
| 배치 방식       | object-contain | 이미지 왜곡 방지     |
| 로딩 우선순위   | priority       | 초기 로딩 최적화     |

#### 인터랙티브 요소 배치

##### 환기 지점 (파란 점)

- **위치**: 이미지 상단 30% (입 부분)
- **클릭 영역**: 80px × 80px (w-20 h-20)
- **시각적 요소**: 4px 파란색 원점 (#3B82F6) + pulse 애니메이션
- **정렬**: flex items-center justify-center로 정중앙 배치
- **배경 피드백**:
  - 대기: 투명
  - hover: 반투명 파란색 배경 (bg-blue-100/20)
  - 환기 중: 반투명 파란색 배경 (bg-blue-200/30)
- **특징**: opacity를 점 자체에 적용하지 않아 항상 선명하게 보임

##### 압박 지점 (빨간 점)

- **위치**: 이미지 중앙 67% (가슴 정중앙)
- **클릭 영역**: 112px × 112px (w-28 h-28, 넓은 영역으로 조작 편의성 확보)
- **시각적 요소**: 5px 빨간색 원점 (#EF4444) + pulse 애니메이션
- **배경 피드백**:
  - 대기: 투명
  - hover: 반투명 빨간색 배경 (bg-red-100/20)
  - 압박 중: 반투명 빨간색 배경 (bg-red-200/30)
- **특징**: opacity를 점 자체에 적용하지 않아 항상 선명하게 보임

#### 레이어 구조

```
<div className="relative w-[300px] h-[450px]">
  <Image /> (마네킹 이미지)
  <div /> (환기 지점 - 절대 위치)
    <div /> (파란 점 컨테이너)
      <div /> (pulse 애니메이션)
  <div /> (압박 지점 - 절대 위치)
    <div /> (빨간 점 컨테이너)
      <div /> (pulse 애니메이션)
</div>
```

#### 기술적 구현 세부사항

- **이미지 Import**: `import manikinImage from "./manikin.jpg"`
- **절대 위치 지정**: `position: absolute` + `transform: translate(-50%, -50%)`
- **중앙 정렬**: `left: 50%`로 좌우 중앙 유지
- **애니메이션 구조**:
  - 외부 컨테이너: relative 포지셔닝
  - 내부 요소: absolute inset-0 + animate-pulse
- **중복 방지**: 배경색은 내부 애니메이션 요소에만 적용 (외부 컨테이너는 relative만)

#### 개선 효과

- **사실감 향상**: 실제 마네킹 이미지로 훈련 몰입도 증가
- **위치 정확성**: 실제 마네킹의 해부학적 위치에 정확한 인터랙션 포인트 배치
- **시각적 명확성**: 압박 위치와 환기 위치를 이미지 위에서 직관적으로 표시
- **유지보수성**: Next.js Image 컴포넌트로 성능 최적화 및 관리 용이

### 12. 훈련 종료 시스템

#### 기능 개요

사용자가 Practice Stop 버튼을 통해 훈련을 중단하고 즉시 프리뷰 화면으로 복귀

#### 훈련 종료 조건

1. **수동 종료**: Practice Stop 버튼 클릭 시 즉시 종료 및 프리뷰 화면 이동
2. **향후 구현 예정**: 30회 압박 + 2회 환기 자동 완료 시 종료

#### 화면 구성 요소

##### Practice Stop 버튼

- **위치**: 헤더 우측
- **스타일**:
  - 배경: `#333333`
  - 텍스트: 흰색, `px-6 py-2`
  - 모서리: `rounded-lg`
  - Hover: `#1F2937`

#### 상호작용 흐름

1. **훈련 중단**:
   - 사용자가 "Practice Stop" 버튼 클릭
   - 모든 훈련 데이터 즉시 초기화
   - `screenState`를 'preview'로 변경
   - 프리뷰 화면으로 즉시 전환
   - 콘솔 로그: "Training stopped by user and moved to preview"

#### 데이터 초기화 목록

Practice Stop 버튼 클릭 시 다음 데이터가 초기화됨:

- `compressionResults`: []
- `ventilationResults`: []
- `rateData`: null
- `ventilationVolume`: 0
- `isVentilating`: false

#### 기술적 구현 세부사항

**상태 관리** (page.jsx):

```jsx
const handlePracticeStop = () => {
  setCompressionResults([]);
  setVentilationResults([]);
  setRateData(null);
  setVentilationVolume(0);
  setIsVentilating(false);
  setScreenState("preview");
  console.log("Training stopped by user and moved to preview");
};
```

**Props 전달 흐름**:

```
page.jsx (상태 관리)
  → ScreenTraining.jsx (props 전달)
    → TrainingHeader.jsx (Practice Stop 버튼)
```

**버튼 연결** (ScreenTraining.jsx):

```jsx
<TrainingHeader onStop={onPracticeStop} />
```

#### 향후 확장 계획

- ~~**자동 완료**: 30회 압박 + 2회 환기 완료 시 자동 종료~~ ✅ 구현 완료
- **저장 기능**: 훈련 결과를 로컬 또는 서버에 저장
- **재개 기능**: 일시 정지 후 훈련 재개 옵션

---

### 13. 훈련 완료 및 결과 화면 시스템

#### 기능 개요

훈련 목표(30회 압박 + 2회 환기)를 달성하면 자동으로 로딩 화면(2초)을 거쳐 결과 화면으로 전환됩니다. 결과 화면에서는 8가지 메트릭을 분석하여 점수와 상세 퍼센티지를 표시합니다.

#### 훈련 완료 조건

- **압박 30회** + **환기 2회** 완료 시 자동으로 훈련 종료
- 조건 충족 시 즉시 로딩 화면으로 전환

#### 화면 전환 흐름

```
ScreenTraining (훈련 화면 - 고정 유지)
├─ trainingPhase: 'active' (훈련 중)
│   └─ 좌측: TrainingPrompt + TrainingCycleCounter + TrainingGauges
│   └─ 우측: Manikin + ManikinGuide (고정)
│
├─ trainingPhase: 'loading' (로딩 중, 2초)
│   └─ 좌측: 로딩 바 + 퍼센트
│   └─ 우측: Manikin + ManikinGuide (고정)
│
└─ trainingPhase: 'result' (결과 화면)
    └─ 좌측: 메트릭 카드 그리드 + Try Again/Back to Start 버튼
    └─ 우측: Manikin + ManikinGuide (고정)
```

---

### 14. 로딩 화면 (TrainingLoadingScreen)

#### 기능 개요

훈련 완료 후 결과 계산 중임을 시각적으로 표현하는 로딩 화면. 2초간 프로그레스 바가 0%에서 100%로 채워지며, 완료 후 자동으로 결과 화면으로 전환됩니다.

#### 화면 구성 요소

| 요소              | 스타일              | 설명                                                |
| ----------------- | ------------------- | --------------------------------------------------- |
| **타이틀**        | 48px, 굵게, #333333 | "Analyzing Results..."                              |
| **프로그레스 바** | 600px × 12px        | 배경: #F5F5F5, 채움: 그라디언트 (#0061F2 → #56ED89) |
| **퍼센트 표시**   | 24px, 중간, #666666 | 0% → 100% (실시간 업데이트)                         |

#### 상호작용 흐름

1. 훈련 완료 조건 충족 시 자동 진입
2. 2초 동안 프로그레스 바가 0 → 100%로 애니메이션
3. 100% 도달 후 0.2초 대기
4. `onLoadingComplete` 콜백 호출
5. 결과 화면으로 자동 전환

#### 기술적 구현 세부사항

**애니메이션 로직**:

```jsx
const duration = 2000; // 2초
const interval = 30; // 30ms마다 업데이트
const steps = duration / interval;
const increment = 100 / steps;

const timer = setInterval(() => {
  currentProgress += increment;
  if (currentProgress >= 100) {
    currentProgress = 100;
    clearInterval(timer);
    setTimeout(() => onLoadingComplete?.(), 200);
  }
  setProgress(currentProgress);
}, interval);
```

---

### 15. 결과 화면 (ScreenResult)

#### 기능 개요

훈련 완료 후 8가지 메트릭을 분석하여 점수와 상세 퍼센티지를 시각화하는 화면. 사용자는 결과를 검토하고 재시작하거나 처음으로 돌아갈 수 있습니다.

#### 화면 구성 요소

**헤더 섹션**:

- **제목**: "Training Complete" (48px, 굵게, #333333)
- **부제**: "Review your performance metrics below" (20px, #666666)

**메트릭 그리드**: 3행 × 2열 레이아웃 (일부 메트릭 주석 처리)

| 행  | 열 1               | 열 2              |
| --- | ------------------ | ----------------- |
| 1행 | Compression Depth  | Compression Rate  |
| 2행 | Hand Position      | Compression Count |
| 3행 | Ventilation Volume | Ventilation Count |

**주석 처리된 메트릭** (계산 어려움):

- ~~Compression Release~~ - 압박 해제 완전성 계산 복잡
- ~~Compression Fraction~~ - 전체 시간 대비 압박 시간 비율 계산 복잡
- ~~총점 (Score)~~ - 모든 메트릭의 총점 계산 불가

**액션 버튼**:

- **Try Again**: 파란색 (#0061F2), 훈련 재시작
- **Back to Start**: 회색 (#333333), 처음 화면으로

#### 메트릭 카드 컴포넌트 (MetricCard)

각 메트릭은 다음 구조로 표시됩니다:

**Props**:

- `title`: 메트릭 제목 (필수)
- `score`: 점수 0-100 (선택적 - undefined 시 표시 안됨)
- `criteria`: 평가 기준 배열 `[{label, value, color}]` (필수)
- `specialLabel`: 특수 라벨 (Compression Fraction 전용)

**구조**:

```
┌─────────────────────────────────┐
│ [제목]              [점수]      │
├─────────────────────────────────┤
│ [수직바] [평가기준1] ....  xx% │
│          [평가기준2] ....  xx% │
│          [평가기준3] ....  xx% │
└─────────────────────────────────┘
```

**수직 바 차트**:

- **크기**: 20px × 80px
- **배경**: 투명 (각 항목이 개별 배경색 보유)
- **Good**: #0061F2 (파란색)
- **Bad**: #D9D9D9 (밝은 회색)
- **방향**: 아래에서 위로 채워짐
- **순서**: 라벨 순서와 동일 (위에서 아래로)
- **정렬**: `flex flex-col justify-end` - 아래쪽 정렬
- **간격**: 각 항목 사이 2px 간격
- **모서리**: 각 항목마다 개별적으로 `rounded-[4px]` 적용
- **높이 계산**: (80px - 간격 총합) × (항목 비율 / 100)

**평가 기준 행**:

- **라벨**: 16px, 중간, #666666
- **점선**: 1px 점선, #D9D9D9
- **퍼센티지**: 16px, 중간, #666666

#### 8가지 메트릭 상세

##### 1. Compression Depth (압박 깊이)

**점수 계산**: Good 비율

| 기준        | 조건                 | 색상   |
| ----------- | -------------------- | ------ |
| Too Shallow | maxDepth < 33%       | 회색   |
| Good        | 33% ≤ maxDepth ≤ 67% | 파란색 |
| Too Deep    | maxDepth > 67%       | 회색   |

##### 2. Compression Release (압박 해제)

**점수 계산**: Good 비율

| 기준       | 조건                                  | 색상   |
| ---------- | ------------------------------------- | ------ |
| Good       | duration ≥ 0.3초 && 33% ≤ depth ≤ 67% | 파란색 |
| Incomplete | 그 외                                 | 회색   |

##### 3. Compression Rate (압박 속도)

**점수 계산**: Good 비율

| 기준     | 조건                     | 색상   |
| -------- | ------------------------ | ------ |
| Too Slow | interval > 0.8초         | 회색   |
| Good     | 0.4초 ≤ interval ≤ 0.8초 | 파란색 |
| Too Fast | interval < 0.4초         | 회색   |

##### 4. Hand Position (손 위치)

**점수 계산**: Good 비율

| 기준                | 조건                     | 색상   |
| ------------------- | ------------------------ | ------ |
| Incorrect (Abdomen) | dy > 15 (복부 방향)      | 회색   |
| Good                | positionCorrect === true | 파란색 |
| Incorrect (LR)      | dx 벗어남 (좌우)         | 회색   |

##### 5. Compression Count (압박 횟수)

**점수 계산**: Good 비율

| 기준     | 조건         | 퍼센티지          |
| -------- | ------------ | ----------------- |
| Too Few  | count < 30   | 100%              |
| Good     | count === 30 | 100%              |
| Too Many | count > 30   | (30/count) × 100% |

##### 6. Compression Fraction (압박 비율)

**점수 계산**: (총 압박 시간 / 전체 시간) × 100

**특수 케이스**: 바 차트 없이 "No Metric Criteria" 라벨만 표시

##### 7. Ventilation Volume (환기 볼륨)

**점수 계산**: Good 비율

| 기준       | 조건               | 색상   |
| ---------- | ------------------ | ------ |
| Too Little | volume < 33%       | 회색   |
| Good       | 33% ≤ volume ≤ 67% | 파란색 |
| Too Much   | volume > 67%       | 회색   |

##### 8. Ventilation Count (환기 횟수)

**점수 계산**: Good 비율

| 기준     | 조건        | 퍼센티지         |
| -------- | ----------- | ---------------- |
| Too Few  | count < 2   | 100%             |
| Good     | count === 2 | 100%             |
| Too Many | count > 2   | (2/count) × 100% |

#### 상호작용 흐름

1. **결과 검토**: 8가지 메트릭의 점수와 세부 항목 확인
2. **Try Again 클릭**:
   - 모든 상태 초기화
   - Preview 화면으로 이동
   - 새로운 훈련 세션 시작
3. **Back to Start 클릭**:
   - 페이지 새로고침
   - Intro 화면으로 복귀

#### 데이터 흐름

```
page.jsx
  ↓ (30회 압박 + 2회 환기 완료)
useEffect 감지
  ↓
calculateMetrics(compressionResults, ventilationResults)
  ↓
8가지 메트릭 점수 계산
  ↓
setTrainingMetrics(metrics)
  ↓
setScreenState('loading')
  ↓ (2초 후)
setScreenState('result')
  ↓
ScreenResult 렌더링 (metrics prop)
```

#### 기술적 구현 세부사항

**상태 관리** (page.jsx):

```jsx
const [trainingMetrics, setTrainingMetrics] = useState(null);

// 훈련 완료 조건 체크
useEffect(() => {
  if (
    screenState === "training" &&
    compressionResults.length >= 30 &&
    ventilationResults.length >= 2
  ) {
    const metrics = calculateMetrics(compressionResults, ventilationResults);
    setTrainingMetrics(metrics);
    setScreenState("loading");
  }
}, [compressionResults, ventilationResults, screenState]);
```

**메트릭 계산** (calculateMetrics.js):

```jsx
export function calculateMetrics(compressionResults, ventilationResults) {
  return {
    compressionDepth: calculateCompressionDepth(compressionResults),
    compressionRelease: calculateCompressionRelease(compressionResults),
    compressionRate: calculateCompressionRate(compressionResults),
    handPosition: calculateHandPosition(compressionResults),
    compressionCount: calculateCompressionCount(compressionResults),
    compressionFraction: calculateCompressionFraction(compressionResults),
    ventilationVolume: calculateVentilationVolume(ventilationResults),
    ventilationCount: calculateVentilationCount(ventilationResults),
  };
}
```

**애니메이션** (ScreenResult.jsx):

```jsx
// 헤더: 위에서 아래로 페이드인
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>

// 메트릭 그리드: 페이드인
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.8, delay: 0.2 }}
>

// 액션 버튼: 페이드인
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.6, delay: 0.4 }}
>
```

**바 차트 높이 계산** (MetricCard.jsx):

```jsx
const calculateBarHeights = () => {
  const totalHeight = 80; // 전체 바 높이 (px)
  const gapSize = 2; // 항목 간 간격 (px)

  // value가 0이 아닌 항목만 필터링
  const nonZeroItems = criteria.filter((c) => c.value > 0);

  // 총 간격 계산 (항목 수 - 1)
  const totalGaps = (nonZeroItems.length - 1) * gapSize;

  // 실제 차트 높이 (전체 높이 - 간격)
  const availableHeight = totalHeight - totalGaps;

  // 각 항목의 실제 높이 계산
  return criteria.map((item) => {
    if (item.value === 0) return 0;
    return (availableHeight * item.value) / 100;
  });
};

// 예시: Compression Rate (3개 항목)
// criteria 배열: [Too Slow, Good, Too Fast]
// Too Slow: 0%, Good: 91%, Too Fast: 9%
//
// 라벨 순서 (위→아래):
// 1. Too Slow - 0%
// 2. Good - 91%
// 3. Too Fast - 9%
//
// 바 차트 순서 (위→아래, flex flex-col justify-end):
// 1. Too Slow - (0px, 표시 안됨)
// 2. Good - 71.02px (파란색)
// 3. Too Fast - 7.02px (회색)
//
// 높이 계산:
// 간격: 1개 × 2px = 2px (Too Slow는 0%이므로 제외)
// 실제 차트 높이: 80px - 2px = 78px
// Good: 78px × 0.91 = 71.02px
// Too Fast: 78px × 0.09 = 7.02px
```

#### 생성된 파일

- `calculateMetrics.js` - 메트릭 계산 유틸리티
- `TrainingLoadingScreen.jsx` - 로딩 화면 컴포넌트
- `MetricCard.jsx` - 개별 메트릭 카드 컴포넌트
- `ScreenResult.jsx` - 결과 화면 컴포넌트

#### 향후 확장 계획

- **결과 저장**: 로컬 스토리지 또는 서버에 결과 저장
- **결과 내보내기**: PDF 또는 이미지로 결과 다운로드
- **통계 비교**: 이전 훈련 결과와 비교
- **목표 설정**: 사용자별 목표 점수 설정 및 달성률 표시
- **상세 분석**: 각 메트릭별 타임라인 그래프 표시
