"use client";

import { CSSProperties, ReactNode } from "react";

interface EditorButtonProps {
  onClick: () => void;
  children: ReactNode;
  style?: CSSProperties;
}

export default function EditorButton({ onClick, children, style }: EditorButtonProps) {
  const baseStyle: CSSProperties = {
    background: 'transparent',
    border: 'none',
    padding: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style, // 커스텀 스타일 병합
  };

  return (
    <button
      onClick={onClick}
      style={baseStyle}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = style?.backgroundColor || 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = style?.backgroundColor || 'transparent';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {children}
    </button>
  );
}
