"use client";

import { useState, useRef, useEffect } from "react";

export default function DebugModal({
  showModal = false,
  onClose,
  compressionResults = [],
  ventilationResults = []
}) {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedAction, setSelectedAction] = useState(null);

  const modalRef = useRef(null);
  const headerRef = useRef(null);

  // 압박과 환기를 시간순으로 합친 액션 리스트 생성
  const actions = [
    ...compressionResults.map((c, idx) => ({
      type: 'compression',
      data: c,
      id: `c-${idx}`,
      timestamp: c.timestamp,
      index: idx + 1
    })),
    ...ventilationResults.map((v, idx) => ({
      type: 'ventilation',
      data: v,
      id: `v-${idx}`,
      timestamp: v.timestamp,
      index: idx + 1
    }))
  ].sort((a, b) => a.timestamp - b.timestamp);

  // 드래그 시작
  const handleMouseDown = (event) => {
    if (event.target.closest('button, input, textarea, select, a')) {
      return;
    }

    setIsDragging(true);
    const rect = headerRef.current.getBoundingClientRect();
    setDragOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });

    document.body.style.userSelect = 'none';
  };

  // 드래그 중
  const handleMouseMove = (event) => {
    if (!isDragging || !modalRef.current) return;

    const modalRect = modalRef.current.getBoundingClientRect();
    const newX = event.clientX - dragOffset.x;
    const newY = event.clientY - dragOffset.y;

    const maxX = window.innerWidth - modalRect.width;
    const maxY = window.innerHeight - modalRect.height;

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  // 드래그 종료
  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragOffset]);

  // 모달이 열릴 때마다 위치 초기화
  useEffect(() => {
    if (showModal) {
      setPosition({ x: 20, y: 20 });
      setSelectedAction(null);
    }
  }, [showModal]);

  // 액션 클릭 핸들러
  const handleActionClick = (action) => {
    setSelectedAction(action);
  };

  // 압박 상세 정보 렌더링
  const renderCompressionDetail = (data) => {
    const failures = [];
    if (!data.positionCorrect) failures.push('위치');
    if (!data.depthCorrect) failures.push('깊이');
    if (!data.rateCorrect && data.rate) failures.push('속도');

    const positionDistance = data.position
      ? Math.sqrt(Math.pow(data.position.x - 50, 2) + Math.pow(data.position.y - 40, 2))
      : null;

    return (
      <div className="space-y-4">
        {/* 판정 결과 */}
        <div className={`p-3 rounded-lg ${data.success ? 'bg-green-50 border border-green-300' : 'bg-red-50 border border-red-300'}`}>
          <div className="font-bold text-lg mb-2">
            {data.success ? '✓ 성공' : '✗ 실패'}
          </div>
          {!data.success && failures.length > 0 && (
            <div className="text-sm text-red-700">
              <strong>실패 원인:</strong> {failures.join(', ')}
            </div>
          )}
        </div>

        {/* 위치 정보 */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="font-bold text-blue-900 mb-2">📍 위치 (Position)</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>적정 범위:</span>
              <span className="font-mono">심장(50%, 50%)으로부터 25% 이내</span>
            </div>
            <div className="flex justify-between">
              <span>실제 위치:</span>
              <span className="font-mono">
                {data.position ? `(${data.position.x.toFixed(1)}%, ${data.position.y.toFixed(1)}%)` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>심장 거리:</span>
              <span className={`font-mono font-bold ${data.positionCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {positionDistance ? `${positionDistance.toFixed(2)}%` : 'N/A'}
                {data.positionCorrect ? ' ✓' : ' ✗'}
              </span>
            </div>
          </div>
        </div>

        {/* 깊이 정보 */}
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <div className="font-bold text-purple-900 mb-2">⬇️ 깊이 (Depth)</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>적정 범위:</span>
              <span className="font-mono">33% ~ 67%</span>
            </div>
            <div className="flex justify-between">
              <span>실제 깊이:</span>
              <span className={`font-mono font-bold ${data.depthCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {data.maxDepth?.toFixed(1) ?? 'N/A'}%
                {data.depthCorrect ? ' ✓' : ' ✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>지속 시간:</span>
              <span className="font-mono">{data.duration}ms</span>
            </div>
          </div>
        </div>

        {/* 속도 정보 */}
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          <div className="font-bold text-orange-900 mb-2">⏱️ 속도 (Rate)</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>적정 범위:</span>
              <span className="font-mono">0.4s ~ 0.8s (75-150 CPM)</span>
            </div>
            {data.rate ? (
              <>
                <div className="flex justify-between">
                  <span>실제 간격:</span>
                  <span className={`font-mono font-bold ${data.rateCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {data.rate.interval.toFixed(3)}s
                    {data.rateCorrect ? ' ✓' : ' ✗'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>상태:</span>
                  <span className={`font-bold ${
                    data.rate.status === 'optimal' ? 'text-green-600' :
                    data.rate.status === 'too_fast' ? 'text-red-600' : 'text-orange-600'
                  }`}>
                    {data.rate.status === 'optimal' ? '적정' :
                     data.rate.status === 'too_fast' ? '너무 빠름' : '너무 느림'}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-gray-500 text-xs">첫 번째 압박 (이전 압박 없음)</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 환기 상세 정보 렌더링
  const renderVentilationDetail = (data) => {
    return (
      <div className="space-y-4">
        {/* 판정 결과 */}
        <div className={`p-3 rounded-lg ${data.success ? 'bg-green-50 border border-green-300' : 'bg-red-50 border border-red-300'}`}>
          <div className="font-bold text-lg mb-2">
            {data.success ? '✓ 성공' : '✗ 실패'}
          </div>
          {!data.success && (
            <div className="text-sm text-red-700">
              <strong>실패 원인:</strong> 볼륨 부적절
            </div>
          )}
        </div>

        {/* 볼륨 정보 */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="font-bold text-blue-900 mb-2">💨 볼륨 (Volume)</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>적정 범위:</span>
              <span className="font-mono">33% ~ 67%</span>
            </div>
            <div className="flex justify-between">
              <span>실제 볼륨:</span>
              <span className={`font-mono font-bold ${data.volumeCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {data.volume?.toFixed(1) ?? 'N/A'}%
                {data.volumeCorrect ? ' ✓' : ' ✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>지속 시간:</span>
              <span className="font-mono">{data.duration}ms</span>
            </div>
            <div className="flex justify-between">
              <span>상태:</span>
              <span className={`font-bold ${
                data.volumeCorrect ? 'text-green-600' :
                (data.volume < 40 ? 'text-orange-600' : 'text-red-600')
              }`}>
                {data.volumeCorrect ? '적정' :
                 (data.volume < 40 ? '너무 약함 (Too little)' : '너무 강함 (Too much)')}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!showModal) return null;

  return (
    <div
      ref={modalRef}
      className={`fixed bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col transition-shadow duration-200 ${
        isDragging ? 'shadow-2xl' : ''
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '600px',
        maxHeight: '85vh',
        zIndex: 2000,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      {/* 드래그 가능한 헤더 */}
      <div
        ref={headerRef}
        className={`flex justify-between items-center p-3 border-b border-gray-200 rounded-t-xl cursor-grab active:cursor-grabbing select-none flex-shrink-0 ${
          isDragging ? 'bg-gray-100' : 'bg-gray-50'
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className="m-0 text-sm font-semibold text-gray-800 flex items-center gap-2">
          <span className="text-lg">🐛</span>
          CPR Debug Monitor
          <span className="text-xs text-gray-500 font-normal">
            ({actions.length} actions)
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl leading-none px-2"
        >
          ×
        </button>
      </div>

      {/* 모달 내용 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측: 액션 리스트 */}
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
          <div className="p-3 bg-gray-50 border-b border-gray-200 sticky top-0">
            <div className="text-sm font-semibold text-gray-700">Action List</div>
          </div>
          <div className="p-2 space-y-1">
            {actions.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">
                아직 액션이 없습니다
              </div>
            ) : (
              actions.map((action) => (
                <div
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    selectedAction?.id === action.id
                      ? 'bg-blue-100 border border-blue-300'
                      : action.data.success
                      ? 'bg-green-50 hover:bg-green-100 border border-green-200'
                      : 'bg-red-50 hover:bg-red-100 border border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {action.type === 'compression' ? '🫸' : '💨'}
                      </span>
                      <div>
                        <div className="text-sm font-semibold">
                          {action.type === 'compression' ? 'Compression' : 'Ventilation'} #{action.index}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(action.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${
                      action.data.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {action.data.success ? '✓' : '✗'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 우측: 상세 정보 */}
        <div className="w-1/2 overflow-y-auto">
          <div className="p-3 bg-gray-50 border-b border-gray-200 sticky top-0">
            <div className="text-sm font-semibold text-gray-700">Detail</div>
          </div>
          <div className="p-3">
            {!selectedAction ? (
              <div className="text-center text-gray-400 text-sm py-8">
                액션을 선택하세요
              </div>
            ) : (
              <div>
                <div className="mb-3 pb-2 border-b border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">
                      {selectedAction.type === 'compression' ? '🫸' : '💨'}
                    </span>
                    <div>
                      <div className="font-bold text-lg">
                        {selectedAction.type === 'compression' ? 'Compression' : 'Ventilation'} #{selectedAction.index}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(selectedAction.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
                {selectedAction.type === 'compression'
                  ? renderCompressionDetail(selectedAction.data)
                  : renderVentilationDetail(selectedAction.data)
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
