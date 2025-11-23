
"use client";
import React from 'react';


export const HeaderWithHandle: React.FC<{
  title: string;
  onClose: () => void;
  mode?: 'min'|'normal'|'full';
  onModeChange?: (m: 'min'|'normal'|'full') => void;
  onDragOffsetChange: (offset: number) => void;
  onDraggingChange: (dragging: boolean) => void;
  effectiveRatio: number;
}> = ({ title, onClose, mode = 'normal', onModeChange, onDragOffsetChange, onDraggingChange, effectiveRatio }) => {
  const startYRef = React.useRef<number | null>(null);
  const lastYRef = React.useRef<number | null>(null);
  const movedRef = React.useRef(false);
  const deltaRef = React.useRef<number>(0);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    startYRef.current = t.clientY;
    lastYRef.current = t.clientY;
    movedRef.current = false;
    deltaRef.current = 0;
    onDraggingChange(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startYRef.current == null) return;
    const t = e.touches[0];
    if (!t) return;
    const dy = t.clientY - startYRef.current;
    deltaRef.current = dy;
    lastYRef.current = t.clientY;
    if (Math.abs(dy) > 4) movedRef.current = true;
    if (movedRef.current) {
      e.preventDefault();
    }
    const vh = window.innerHeight || 0;
    const MIN_RATIO = 0.12;
    const FULL_RATIO = 0.95;
    const baseHeight = vh * effectiveRatio;
    const minH = vh * MIN_RATIO;
    const maxH = vh * FULL_RATIO;
    const desired = baseHeight + (-dy);
    const clamped = Math.max(minH, Math.min(maxH, desired));
    const deltaPx = clamped - baseHeight;
    onDragOffsetChange(deltaPx);
  };
  const commitModeChange = (direction: 'up'|'down') => {
    const order: Array<'min'|'normal'|'full'> = ['min','normal','full'];
    const idx = order.indexOf(mode);
    if (direction === 'up') {
      const next = order[Math.min(order.length - 1, idx + 1)];
      if (next !== mode) onModeChange?.(next);
    } else {
      const next = order[Math.max(0, idx - 1)];
      if (next !== mode) onModeChange?.(next);
    }
  };
  const onTouchEnd = () => {
    if (!movedRef.current) {
      if (mode === 'min') onModeChange?.('normal');
      else if (mode === 'full') onModeChange?.('normal');
      else onModeChange?.('min');
    } else {
      const dy = deltaRef.current;
      const TH = 40;
      if (Math.abs(dy) >= TH) {
        commitModeChange(dy < 0 ? 'up' : 'down');
      }
    }
    onDragOffsetChange(0);
    onDraggingChange(false);
    startYRef.current = null;
    lastYRef.current = null;
    movedRef.current = false;
    deltaRef.current = 0;
  };

  return (
    <div style={{
      position:'relative',
      background:'var(--color-surface)',
      paddingBottom: mode === 'min' ? 0 : 8,
    }}>
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          display:'flex',
          flexDirection:'column',
          alignItems:'center',
          justifyContent:'center',
          gap:4,
          userSelect:'none',
          touchAction: 'none',
        }}
      >
        <div className="st-handle-bar" style={{ width:40, height:5, borderRadius:3, background:'rgba(0,0,0,0.25)' }} />
        <div style={{ display:'flex', width:'100%', justifyContent:'space-between', alignItems:'center' }}>
          <strong style={{ fontSize:14 }}>{title}</strong>
          <button
            aria-label="閉じる"
            onClick={onClose}
            style={{ background:'transparent', border:'none', padding:'4px 8px', borderRadius:8, cursor:'pointer', fontSize:16 }}
          >×</button>
        </div>
      </div>
    </div>
  );
};
