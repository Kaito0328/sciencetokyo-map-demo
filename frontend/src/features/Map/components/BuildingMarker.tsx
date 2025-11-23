"use client";
import React from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';
import * as L from 'leaflet';
import { Building } from '../../../domain/model/types';
import styles from '../styles/MarkerStyles.module.css';

export type BuildingMarkerProps = {
  building: Building;
  position: L.LatLng;
  opacity: number;
  isEmphasized: boolean;
  radius: number;
  onClick?: (b: Building) => void;
  highlighted?: boolean;
  searchHighlighted?: boolean;
  selected?: boolean;
  colorVariant?: 'normal' | 'filtered' | 'highlight' | 'muted';
};

export const BuildingMarker: React.FC<BuildingMarkerProps> = React.memo(
  ({ building, position, opacity, isEmphasized, radius, onClick, highlighted = false, searchHighlighted = false, selected = false, colorVariant }) => {
    
    const { pathOptions, markerClassNames } = React.useMemo(() => {
      const classes = [styles.circleMarkerBase];
      const variant: 'normal' | 'filtered' | 'highlight' | 'muted' = (highlighted || searchHighlighted || selected) ? 'highlight' : (colorVariant || 'normal');
      
      let fillColor = 'var(--color-base, #eaf4ff)';
      let color = 'var(--color-primary, #2563eb)';
      let weight = 2;
      let fillOpacity = 0.9;

      switch (variant) {
        case 'highlight':
          classes.push(styles.circleMarkerHighlight);
          fillColor = '#4ade80';
          color = '#15803d';
          weight = 3;
          break;
        case 'filtered':
          classes.push(styles.circleMarkerFiltered);
          fillColor = 'var(--color-warning-soft, #fde68a)';
          color = 'var(--color-warning, #f59e0b)';
          break;
        case 'muted':
          classes.push(styles.circleMarkerMuted);
          fillColor = 'var(--color-muted-soft, #e5e7eb)';
          color = 'var(--color-muted, #9ca3af)';
          weight = 1;
          fillOpacity = 0.6;
          break;
        default:
          classes.push(styles.circleMarkerNormal);
      }

      if (isEmphasized && variant !== 'highlight') {
        classes.push(styles.circleMarkerEmphasized);
        weight += 1;
      }

      return {
        markerClassNames: classes.join(' '),
        pathOptions: {
          fillColor,
          color,
          weight,
          fillOpacity,
          className: classes.join(' '),
          bubblingMouseEvents: false,
        }
      };
    }, [highlighted, searchHighlighted, selected, colorVariant, isEmphasized]);

    const markerRef = React.useRef<any>(null);

    React.useEffect(() => {
      const m = markerRef.current as any;
      if (!m) return;
      try {
        if (isEmphasized || highlighted || selected) {
          m.openTooltip();
        } else {
          m.closeTooltip();
        }
        if (m.setStyle) {
           m.setStyle(pathOptions);
        }
      } catch (e) {
      }
    }, [isEmphasized, highlighted, selected, pathOptions]);

    React.useEffect(() => {
      const handler = (ev: any) => {
        try {
          const bid = ev?.detail?.buildingId;
          if (bid === building.id) {
            const m = markerRef.current as any;
            if (m && typeof m.openTooltip === 'function') {
              setTimeout(() => {
                try { m.openTooltip(); } catch (_) {}
              }, 50);
            }
          }
        } catch (e) {}
      };
      window.addEventListener('building-modal-closed', handler as any);
      return () => window.removeEventListener('building-modal-closed', handler as any);
    }, [building.id]);

    return (
      <CircleMarker
        ref={markerRef as any}
        center={position}
        radius={radius}
        pathOptions={pathOptions}
        eventHandlers={{
          click: (e) => {
            L.DomEvent.stopPropagation(e);
            onClick && onClick(building);
          },
        }}
      >
        <Tooltip
          key={`${building.id}-tooltip-${(isEmphasized || highlighted || selected) ? 'perm' : 'hover'}`}
          className={styles.customTooltip}
          permanent={isEmphasized || highlighted || selected}
          direction="top"
          offset={[0, -radius]}
        >
          {building.code}
        </Tooltip>
      </CircleMarker>
    );
  }
);

BuildingMarker.displayName = 'BuildingMarker';
export default BuildingMarker;
