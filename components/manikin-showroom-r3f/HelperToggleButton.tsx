"use client";

import CoordinateIcon from "./CoordinateIcon";

interface HelperToggleButtonProps {
  showHelpers: boolean;
  onToggle: () => void;
}

export default function HelperToggleButton({ showHelpers, onToggle }: HelperToggleButtonProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: '#ffffff',
        padding: '12px',
        borderRadius: '12px',
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        gap: '8px',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          background: showHelpers ? 'rgba(68, 255, 68, 0.2)' : 'transparent',
          border: showHelpers ? '2px solid rgba(68, 255, 68, 0.5)' : 'none',
          padding: '8px',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseOver={(e) => {
          if (!showHelpers) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseOut={(e) => {
          if (!showHelpers) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <CoordinateIcon size={48} color="#ffffff" />
      </button>
    </div>
  );
}
