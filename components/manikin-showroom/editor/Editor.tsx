"use client";

import EditorButton from "./EditorButton";
import BoxIcon from "./BoxIcon";
import ManikinIcon from "./ManikinIcon";
import CoordinateIcon from "./CoordinateIcon";

interface EditorProps {
  onOpenModelSelector: () => void;
  onOpenManikinSelector: () => void;
  isPlacementMode: boolean;
  hasEditingObject: boolean;
  showCoordinates: boolean;
  onToggleCoordinates: () => void;
}

export default function Editor({
  onOpenModelSelector,
  onOpenManikinSelector,
  isPlacementMode,
  hasEditingObject,
  showCoordinates,
  onToggleCoordinates
}: EditorProps) {
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
      {/* 모델 추가 버튼 - 배치 모드가 아닐 때만 표시 */}
      {!isPlacementMode && (
        <>
          <EditorButton onClick={onOpenModelSelector}>
            <BoxIcon size={48} color="#ffffff" />
          </EditorButton>
          <EditorButton onClick={onOpenManikinSelector}>
            <ManikinIcon size={48} color="#ffffff" />
          </EditorButton>
          {/* 좌표계 토글 버튼 */}
          <EditorButton
            onClick={onToggleCoordinates}
            style={{
              backgroundColor: showCoordinates ? 'rgba(68, 255, 68, 0.2)' : undefined,
              border: showCoordinates ? '2px solid rgba(68, 255, 68, 0.5)' : undefined,
            }}
          >
            <CoordinateIcon size={48} color="#ffffff" />
          </EditorButton>
        </>
      )}

    </div>
  );
}