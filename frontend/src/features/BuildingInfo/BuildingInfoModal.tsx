"use client";
import React from 'react';
import ModalDrawer from './ModalDrawer';
import DetailPanelContent from './DetailPanelContent';
import { BOTTOM_MIN_RATIO, BOTTOM_NORMAL_RATIO, BOTTOM_FULL_RATIO, PANEL_WIDTH_PX } from './config/parameters';
import type { Building } from '../../domain/model/types';
import { HeaderWithHandle } from './HeaderWithHandle';

export type BuildingInfoModalProps = {
  open: boolean;
  building: Building | null;
  onClose: () => void;
  initialOpenFloorKey?: string | null;
  desktopSide?: 'right' | 'left';
  mobilePlacement?: 'bottom' | 'side';
  width?: number;
  zIndex?: number;
  mode?: 'min' | 'normal' | 'full';
  onModeChange?: (mode: 'min' | 'normal' | 'full') => void;
};

export default function BuildingInfoModal({
  open,
  building,
  onClose,
  initialOpenFloorKey,
  desktopSide = 'right',
  mobilePlacement = 'bottom',
  width = 360,
  zIndex = 1000,
  mode = 'normal',
  onModeChange,
}: BuildingInfoModalProps) {
  const [dragOffset, setDragOffset] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const MIN_RATIO = BOTTOM_MIN_RATIO;
  const NORMAL_RATIO = BOTTOM_NORMAL_RATIO;
  const FULL_RATIO = BOTTOM_FULL_RATIO;
  const effectiveRatio = mode === 'min' ? MIN_RATIO : mode === 'full' ? FULL_RATIO : NORMAL_RATIO;
  if (!open || !building) return null;
  return (
    <ModalDrawer
      open={open}
      onClose={onClose}
      desktopSide={desktopSide}
      mobilePlacement={mobilePlacement}
      width={width}
      zIndex={zIndex}
      mode={mode}
      onModeChange={onModeChange}
      dragOffsetY={dragOffset}
      dragging={dragging}
      header={<HeaderWithHandle
        title={building.name}
        onClose={onClose}
        mode={mode}
        onModeChange={onModeChange}
        onDragOffsetChange={setDragOffset}
        onDraggingChange={setDragging}
        effectiveRatio={effectiveRatio}
      />}
    >
      {(mode !== 'min' || !!initialOpenFloorKey) && (
        <DetailPanelContent building={building} onClose={onClose} initialOpenFloorKey={initialOpenFloorKey || undefined} />
      )}
    </ModalDrawer>
  );
}