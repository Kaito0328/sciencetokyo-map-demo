"use client";
import React from 'react';
import { useMap } from 'react-leaflet';
import { Building } from '../../../domain/model/types';
import BuildingMarker from './BuildingMarker';
import { useMapState } from '../MapStateProvider';
import { calculateMarkerStyle } from '../utils/calculateMarkerStyle';
import { toLeafletLatLng } from '../utils/CoordinateUtils';
import { BUILDING_INTEREST_SCORE_PARAMS_MOBILE, BUILDING_INTEREST_SCORE_PARAMS_DESKTOP, BUILDING_RADIUS_PARAMS_MOBILE, BUILDING_RADIUS_PARAMS_DESKTOP, DEFAULT_OPACITY_THRESHOLD, LABEL_PERMANENT_THRESHOLD } from '../config/parameters';
import { useMediaQuery } from '../../../utils/useMediaQuery';

export type MarkersRendererProps = {
  imageSize: { w: number; h: number };
  buildings: Building[];
  onClickBuilding?: (b: Building) => void;
  highlightBuildingId?: number | null;
  selectedBuildingId?: number | null;
  extraBuildings?: Building[];
  filterMatchMap: Map<number, boolean>;
  filterMode: 'smooth' | 'strict';
  filterDegree: number;
  lectureBuildingIds: Set<number>;
  lectureSmoothEnabled: boolean;
  lectureSmoothDegree: number;
  searchSMap?: Map<number, number>;
  searchHighlightIds?: Set<number>;
};

export const MarkersRenderer: React.FC<MarkersRendererProps> = ({ imageSize, buildings, onClickBuilding, highlightBuildingId = null, selectedBuildingId = null, extraBuildings = [], filterMatchMap, filterMode, filterDegree, lectureBuildingIds, lectureSmoothEnabled, lectureSmoothDegree, searchSMap, searchHighlightIds }) => {
  const map = useMap();
  const { ready, zoom, minZoom, center, bounds } = useMapState();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const interestParams = isMobile ? BUILDING_INTEREST_SCORE_PARAMS_MOBILE : BUILDING_INTEREST_SCORE_PARAMS_DESKTOP;
  const radiusParams = isMobile ? BUILDING_RADIUS_PARAMS_MOBILE : BUILDING_RADIUS_PARAMS_DESKTOP;

  const combined = React.useMemo(() => {
    if (!extraBuildings || extraBuildings.length === 0) return buildings;
    const existing = new Set(buildings.map(b => (b as any).id));
    const add = extraBuildings.filter(b => !existing.has((b as any).id));
    return [...buildings, ...add];
  }, [buildings, extraBuildings]);

  const anyFilterActive = React.useMemo(() => {
    try {
      for (const v of filterMatchMap.values()) { if (v === false) return true; }
      return false;
    } catch { return false; }
  }, [filterMatchMap]);

  if (!map || !ready) return null;

  return (
    <>
      {combined.map((b) => {
  const isUiHighlighted = (highlightBuildingId === (b as any).id);
  const isSearchHighlighted = (searchHighlightIds?.has(b.id) ?? false);
  const isHighlighted = isUiHighlighted || isSearchHighlighted;
        const isSelected = selectedBuildingId === (b as any).id;
        const position = toLeafletLatLng(imageSize, b.xPct, b.yPct);
        const matched = filterMatchMap.get(b.id) === true;
        if (filterMode === 'strict' && !matched) return null;
        const fFilter = filterMode === 'smooth' ? (matched ? 1 : -filterDegree) : 1;
        let fLecture = 0;
        if (lectureSmoothEnabled) {
          const isLecture = lectureBuildingIds.has(b.id);
            fLecture = isLecture ? 1 : -lectureSmoothDegree;
        }
        const f = Math.max(fFilter, fLecture);
  const s = searchSMap?.get(b.id) ?? (isHighlighted ? 1 : 0);
  const markerStyle = calculateMarkerStyle({ position, mapState: { ready, zoom, minZoom, center, bounds },  isSearched: isSearchHighlighted, searchWeight: s, filter: f, interest_params: interestParams, radius_params: radiusParams, opacity_threshold: DEFAULT_OPACITY_THRESHOLD });
        if (!markerStyle ) return null;
        const { radius, opacity, interestScore} = markerStyle;
        const colorVariant = (() => {
          if (isHighlighted) return 'highlight';
          if (anyFilterActive) {
            return matched ? 'filtered' : 'muted';
          }
          return 'normal';
        })();
        return (
          <BuildingMarker
            key={(b as any).id}
            building={b as Building}
            position={position}
            radius={radius}
            opacity={opacity}
            isEmphasized={interestScore >= LABEL_PERMANENT_THRESHOLD}
            highlighted={isUiHighlighted}
            searchHighlighted={isSearchHighlighted}
            selected={isSelected}
            colorVariant={colorVariant as any}
            onClick={() => onClickBuilding?.(b as Building)}
          />
        );
      })}
    </>
  );
};

export default MarkersRenderer;
