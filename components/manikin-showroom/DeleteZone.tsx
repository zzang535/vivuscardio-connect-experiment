"use client";

interface DeleteZoneProps {
  isActive: boolean; // 편집 모드일 때만 활성화
  onDelete: () => void; // 삭제 콜백 함수
}

/**
 * 휴지통 영역 컴포넌트
 * - 오른쪽 하단에 위치
 * - 편집 모드일 때만 표시
 * - 객체를 드래그하여 이 영역으로 가져오거나 클릭하여 삭제
 */
export default function DeleteZone({ isActive, onDelete }: DeleteZoneProps) {
  if (!isActive) return null;

  return (
    <div
      id="delete-zone"
      onClick={onDelete}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '100px',
        height: '100px',
        backgroundColor: 'rgba(220, 38, 38, 0.9)', // 빨간색
        color: '#ffffff',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        zIndex: 1000,
        backdropFilter: 'blur(6px)',
        border: '2px solid rgba(239, 68, 68, 0.8)',
        boxShadow: '0 8px 20px rgba(220, 38, 38, 0.4)',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(185, 28, 28, 0.95)';
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(220, 38, 38, 0.6)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.9)';
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(220, 38, 38, 0.4)';
      }}
    >
      {/* 휴지통 아이콘 */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 6h18M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2m3 0v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V6h14z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 11v6M14 11v6"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span style={{ fontSize: '13px', fontWeight: '600' }}>삭제</span>
    </div>
  );
}
