"use client";

interface PlacementModeGuideProps {
  isEditMode?: boolean; // 편집 모드 여부
}

/**
 * 배치 모드 안내 컴포넌트
 * - 원하는 위치에 객체를 배치할 수 있음을 안내
 * - ESC 키로 배치 모드를 취소할 수 있음을 안내
 * - 편집 모드에서는 원위치 복귀 안내
 * - ObjectController와 같은 위치에 표시되어 자연스럽게 전환
 */
export default function PlacementModeGuide({ isEditMode = false }: PlacementModeGuideProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: '#ffffff',
        padding: '16px 20px',
        borderRadius: '10px',
        zIndex: 1000,
        backdropFilter: 'blur(6px)',
        border: '2px solid #4A9EFF',
        boxShadow: '0 6px 16px rgba(74, 158, 255, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: '220px',
      }}
    >
      {/* 배치 안내 문구 */}
      <div
        style={{
          fontSize: '16px',
          fontWeight: '700',
          letterSpacing: '0.3px',
          marginBottom: '4px',
        }}
      >
        {isEditMode ? '오브젝트 이동' : '오브젝트 배치'}
      </div>

      <div
        style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#e0e0e0',
          lineHeight: '1.5',
        }}
      >
        {isEditMode ? (
          <>
            원하는 곳에 클릭하여<br />오브젝트를 재배치하세요
          </>
        ) : (
          <>
            원하는 곳에 클릭하여<br />오브젝트를 배치하세요
          </>
        )}
      </div>

      {/* 구분선 */}
      <div
        style={{
          width: '100%',
          height: '1px',
          backgroundColor: 'rgba(74, 158, 255, 0.3)',
          margin: '4px 0',
        }}
      />

      {/* ESC 키 안내 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: '600',
        }}
      >
        {/* ESC 키 아이콘 */}
        <div
          style={{
            backgroundColor: '#4A9EFF',
            color: '#000',
            padding: '5px 10px',
            borderRadius: '6px',
            fontWeight: '700',
            fontSize: '13px',
            fontFamily: 'monospace',
          }}
        >
          ESC
        </div>
        <span style={{ color: '#e0e0e0' }}>
          {isEditMode ? '원위치 복귀' : '취소하기'}
        </span>
      </div>
    </div>
  );
}
