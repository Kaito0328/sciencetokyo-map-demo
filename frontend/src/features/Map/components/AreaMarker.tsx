"use client";
import React, { useCallback, useMemo } from 'react';
import { CircleMarker, Tooltip, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import { toLeafletLatLng } from '../utils/CoordinateUtils';
import styles from '../styles/MarkerStyles.module.css';
import { Area } from '../../../domain/model/types';

export type AreaButtonMarkerProps = {
  area: Area;
  imageSize: { w: number; h: number };
  radius: number;
  opacity: number;
  targetCoverage?: number; 
  onSelected?: (areaId: number) => void;
};

const AREA_ZOOM_OFFSET: Record<string, number> = {
  ishikawadai: 0.2,
  south: -0.2,
  east: -0.2,
  west: -0.2,
  north: -0.1,
  default: -0.1,
};

export const AreaMarker: React.FC<AreaButtonMarkerProps> = React.memo(({ area, imageSize, radius, opacity, targetCoverage = 0.9, onSelected, }) => {
  const map = useMap();
  const position = useMemo(() => toLeafletLatLng(imageSize, area.left, area.top), [imageSize, area.left, area.top]); 
  const clickAndView = useCallback(() => {
    let targetCenter = position;
    let targetZoom: number | undefined = undefined;
  const alias = (area.alias || '').toLowerCase();

    if (area.centerPct && Number.isFinite(area.centerPct.xPct) && Number.isFinite(area.centerPct.yPct)) {
      targetCenter = toLeafletLatLng(imageSize, area.centerPct.xPct, area.centerPct.yPct);
    } else {
      let rect  = area.rect;
      if (!rect && area.rectTL && area.rectBR) {
        const leftPct = Math.min(area.rectTL.xPct, area.rectBR.xPct);
        const topPct = Math.min(area.rectTL.yPct, area.rectBR.yPct);
        const widthPct = Math.abs(area.rectBR.xPct - area.rectTL.xPct);
        const heightPct = Math.abs(area.rectBR.yPct - area.rectTL.yPct);
        rect = { leftPct, topPct, widthPct, heightPct } as any;
      }
      if (rect) {
        const centerXpct = rect.leftPct + rect.widthPct / 2;
        const centerYpct = rect.topPct + rect.heightPct / 2;
        targetCenter = toLeafletLatLng(imageSize, centerXpct, centerYpct);
      }
    }

    const minZ = map.getMinZoom?.() ?? -Infinity;
    const maxZ = map.getMaxZoom?.() ?? Infinity;

    if (area.targetZoom != null && Number.isFinite(area.targetZoom)) {
      targetZoom = area.targetZoom;
    } else {
      let rect = area.rect;
      if (!rect && area.rectTL && area.rectBR) {
        const leftPct = Math.min(area.rectTL.xPct, area.rectBR.xPct);
        const topPct = Math.min(area.rectTL.yPct, area.rectBR.yPct);
        const widthPct = Math.abs(area.rectBR.xPct - area.rectTL.xPct);
        const heightPct = Math.abs(area.rectBR.yPct - area.rectTL.yPct);
        rect = { leftPct, topPct, widthPct, heightPct } as any;
      }
      if (rect) {
        const topLeft = toLeafletLatLng(imageSize, rect.leftPct, rect.topPct);
        const bottomRight = toLeafletLatLng(imageSize, rect.leftPct + rect.widthPct, rect.topPct + rect.heightPct);
        const areaBounds = L.latLngBounds(topLeft, bottomRight);
        try {
          const fitZoom = map.getBoundsZoom(areaBounds, false);
          if (Number.isFinite(fitZoom)) {
            const zoomAdjust = Math.log2(1 / Math.max(0.1, targetCoverage));
            targetZoom = fitZoom + zoomAdjust;
          }
        } catch (e) {
          console.error('Error calculating zoom from bounds:', e);
        }
      }
      if (targetZoom === undefined) {
        const offset = (area as any).zoomOffset ?? AREA_ZOOM_OFFSET[alias] ?? AREA_ZOOM_OFFSET.default;
        targetZoom = minZ + (Number(offset) || 0);
      }
    }

    const clampedZoom = Math.max(minZ, Math.min(maxZ, targetZoom ?? minZ));
    map.setView(targetCenter, clampedZoom, { animate: true });
    onSelected?.(area.id);
  }, [map, area, imageSize, position, targetCoverage, onSelected]);

  const pathOptions = {
    color: 'var(--color-secondary, #6b7280)',
    weight: 2,
    fillColor: 'var(--color-secondary-soft, #e5e7eb)',
    fillOpacity: Math.max(0, Math.min(1, opacity * 0.8)),
  };

  return (
    <CircleMarker
      center={position as L.LatLngExpression}
      radius={radius}
      pathOptions={pathOptions}
      opacity={opacity}
      eventHandlers={{ click: clickAndView }}
    >
      <Tooltip
        className={styles.customTooltip}
        permanent={true}
        direction="top"
        offset={[0, -radius - 2]}
      >
        {area.name}
      </Tooltip>
    </CircleMarker>
  );
});

AreaMarker.displayName = 'AreaButtonMarker';
export default AreaMarker;
