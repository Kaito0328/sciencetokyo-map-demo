"use client";
import React from 'react';
import { BOTTOM_MIN_RATIO, BOTTOM_NORMAL_RATIO, BOTTOM_FULL_RATIO, DEFAULT_BOTTOM_HEIGHT_RATIO, MOBILE_BREAKPOINT_PX } from './config/parameters';

export type ModalDrawerProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  desktopSide?: 'right' | 'left';
  mobilePlacement?: 'bottom' | 'side';
  width?: number;
  heightRatio?: number;
  breakpointPx?: number;
  zIndex?: number;
  mode?: 'min' | 'normal' | 'full';
  onModeChange?: (mode: 'min' | 'normal' | 'full') => void;
  minRatio?: number;
  normalRatio?: number;
  fullRatio?: number;
  dragOffsetY?: number;
  dragging?: boolean;
  header?: React.ReactNode;
};

export const ModalDrawer: React.FC<ModalDrawerProps> = ({
  open,
  onClose,
  children,
  desktopSide = 'right',
  mobilePlacement = 'bottom',
  width = 360,
  heightRatio = DEFAULT_BOTTOM_HEIGHT_RATIO,
  breakpointPx = MOBILE_BREAKPOINT_PX,
  zIndex = 200,
  mode,
  onModeChange,
  minRatio = BOTTOM_MIN_RATIO,
  normalRatio = BOTTOM_NORMAL_RATIO,
  fullRatio = BOTTOM_FULL_RATIO,
  dragOffsetY = 0,
  dragging = false,
  header,
}) => {
  const [isMobile, setIsMobile] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [breakpointPx]);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const isBottom = isMobile && mobilePlacement === 'bottom';
  const effectiveRatio = (() => {
    if (!isBottom) return undefined;
    if (mode === 'min') return minRatio;
    if (mode === 'normal') return normalRatio;
    if (mode === 'full') return fullRatio;
    return heightRatio;
  })();

  const panelStyle: React.CSSProperties = isBottom
    ? {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: `calc(${((effectiveRatio ?? heightRatio) * 100)}svh + ${(dragOffsetY || 0)}px)`,
        background: 'var(--color-surface)',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        boxShadow: '0 -4px 16px rgba(0,0,0,0.2)',
        transform: open ? 'translateY(0%)' : 'translateY(100%)',
        transition: dragging ? 'none' : 'height 180ms ease, transform 180ms ease',
        display: 'flex',
        flexDirection: 'column',
      overflow: 'hidden',
        overscrollBehaviorY: 'contain',
      padding: 0,
        pointerEvents: 'auto',
      }
    : {
        position: 'absolute',
        top: 0,
        bottom: 0,
        [desktopSide]: 0,
        width,
        background: 'var(--color-surface)',
        borderTopLeftRadius: desktopSide === 'right' ? 12 : 0,
        borderBottomLeftRadius: desktopSide === 'right' ? 12 : 0,
        borderTopRightRadius: desktopSide === 'left' ? 12 : 0,
        borderBottomRightRadius: desktopSide === 'left' ? 12 : 0,
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        transform: open
          ? 'translateX(0)'
          : desktopSide === 'right'
            ? 'translateX(100%)'
            : 'translateX(-100%)',
        transition: 'transform 180ms ease',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: 0,
        pointerEvents: 'auto',
      } as React.CSSProperties;

  return (
    <div className="st-fixed st-inset-0" style={{ zIndex, pointerEvents: 'none' }}>
      <div style={panelStyle} onClick={e => e.stopPropagation()}>
        {header && (
          <div style={{ boxSizing: 'border-box', padding: 12, background: 'var(--color-surface)', borderTopLeftRadius: isBottom ? 12 : undefined, borderTopRightRadius: isBottom ? 12 : undefined }}>
              {header}
            </div>
        )}
        <div style={{ flex: 1, overflow: 'auto', padding: 12, boxSizing: 'border-box' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalDrawer;
