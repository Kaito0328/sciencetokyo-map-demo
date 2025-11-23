"use client";
import React from 'react';
import { useMapState } from '../MapStateProvider';
import AreaMarker from './AreaMarker';
import { clamp01, toLeafletLatLng } from '../utils/CoordinateUtils';
import { Area } from '../../../domain/model/types';
import {calculateMarkerStyle } from '../utils/calculateMarkerStyle';
import { AREA_INTEREST_SCORE_PARAMS, AREA_RADIUS_PARAMS_MOBILE, AREA_RADIUS_PARAMS_DESKTOP, DEFAULT_OPACITY_THRESHOLD } from '../config/parameters';
import { useMediaQuery } from '../../../utils/useMediaQuery';

export type AreaButtonsRendererProps = {
  imageSize: { w: number; h: number };
  areas: Area[];
  onSelected?: (areaId: number) => void;
};

export const AreaButtonsRenderer: React.FC<AreaButtonsRendererProps> = ({ imageSize, areas, onSelected }) => {
  const { ready, zoom, minZoom, center, bounds } = useMapState();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const radiusParams = isMobile ? AREA_RADIUS_PARAMS_MOBILE : AREA_RADIUS_PARAMS_DESKTOP;

  if (!ready) return null;

  return (
    <>
      {areas.map((a) => {
        const position = toLeafletLatLng(imageSize, a.left, a.top);
        const markerStyle = calculateMarkerStyle({ position, mapState: { ready, zoom, minZoom, center, bounds }, filter: 0, interest_params: AREA_INTEREST_SCORE_PARAMS, radius_params: radiusParams, opacity_threshold: DEFAULT_OPACITY_THRESHOLD });
        if (!markerStyle) return null;
        const { radius, opacity } = markerStyle;
        return (
          <AreaMarker
            key={a.id}
            area={a}
            imageSize={imageSize}
            radius={radius}
            opacity={opacity}
            onSelected={onSelected}
          />
        );
      })}
    </>
  );
};

export default AreaButtonsRenderer;
