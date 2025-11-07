"use client";

interface ObjectControllerProps {
  onAddBox: () => void;
  isPlacementMode: boolean;
  hasEditingObject: boolean;
}

export default function ObjectController({
  onAddBox,
  isPlacementMode,
  hasEditingObject
}: ObjectControllerProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        color: '#ffffff',
        padding: '16px 20px',
        borderRadius: '10px',
        zIndex: 1000,
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div style={{ fontWeight: '700', marginBottom: '12px', fontSize: '16px', letterSpacing: '0.3px' }}>
        오브젝트 컨트롤
      </div>
      {/* 직육면체 추가 버튼 - 배치 모드가 아닐 때만 표시 */}
      {!isPlacementMode && (
        <button
          onClick={onAddBox}
          style={{
            width: '100%',
            background: '#4A9EFF',
            color: 'white',
            border: 'none',
            padding: '10px 14px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#3a8aeF')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4A9EFF')}
        >
          직육면체 추가
        </button>
      )}

    </div>
  );
}