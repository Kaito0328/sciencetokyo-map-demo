"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { Building } from '../../domain/model/types';
import { useAreaDataContext } from '../../state/data/AreaDataContext';
import { useUiStateContext } from '../../state/ui/UiStateContext';
import { BaseBox } from '../../design/base/BaseBox';
import { BaseText } from '../../design/base/BaseText';
import { BaseInput } from '../../design/base/BaseInput';
import FilterButton from '../Filter/FilterButton';
import { CoreColorKey, SurfaceKey, SizeKey, RoundKey, ShadowKey, VariantKey, FontWeightKey } from '../../design/tokens';
import { FilterKind } from '../../state/ui/filters';
import { logEvent } from '../../utils/eventLogger';
import { resolveMapImage } from './utils/mapImageResolver';
import { SEARCH_RESULT_S, SEARCH_SUGGESTION_S } from './config/parameters';
import dynamic from 'next/dynamic';
import useViewportStable from './hooks/useViewportStable';
import { useMediaQuery } from '../../utils/useMediaQuery';
const LeafletStage = dynamic(() => import('./components/LeafletStage'), { ssr: false });

export interface CampusMapProps {
  selectedBuildingId?: number | null;
  onBuildingSelect?: (building: Building) => void;
  initialOpenFloorKey?: string | null;
  highlightBuildingId?: number | null;
  overlayUI?: boolean;
  topSafeAreaPx?: number;
  hideZoomControl?: boolean;
  onMapBackgroundClick?: () => void;
  layoutKey?: string | number;
}

export const CampusMap: React.FC<CampusMapProps> = ({ 
  selectedBuildingId = null,
  onBuildingSelect,
  initialOpenFloorKey = null,
  highlightBuildingId = null,
  overlayUI = false,
  topSafeAreaPx = 0,
  hideZoomControl,
  onMapBackgroundClick,
  layoutKey,
}) => {
  const { buildings: allBuildings, loading, error, campuses } = useAreaDataContext();
  const { selectedCampusId, filters, setFilter, clearFilter, lectureSmoothEnabled, setLectureSmoothEnabled, setFilterMode, setFilterDegree, searchedBuildingId: uiSearchedBuildingId, searchedRoomId, suggestionBuildingIds, setSearchedBuildingId, setSearchedRoomId, setSuggestionBuildingIds } = useUiStateContext();
  const { rooms } = useAreaDataContext();
  const [localActiveBuildingId, setLocalActiveBuildingId] = useState<number | null>(null);
  const activeId = selectedBuildingId ?? localActiveBuildingId;
  const [imageSize, setImageSize] = useState<{w:number; h:number}>({ w: 960, h: 600 });
  const isMobile = useMediaQuery('(max-width: 768px)');

  const lastInteractionRef = React.useRef<'search'|'click'|null>(null);
  const handleMarkerClick = useCallback((building: Building) => {
    logEvent('map.marker_click', { buildingId: building.id, buildingName: building.name, code: building.code });
    setLocalActiveBuildingId(building.id);
    
    setSearchedBuildingId(null);
    setSearchedRoomId(null);
    setSuggestionBuildingIds([]);

    onBuildingSelect?.(building);
    lastInteractionRef.current = 'click';
  }, [onBuildingSelect, setSearchedBuildingId, setSearchedRoomId, setSuggestionBuildingIds]);

  const selectedCampus = campuses.find(c => c.id === selectedCampusId) || null;
  const resolvedImage = selectedCampus ? resolveMapImage(selectedCampus) : undefined;

  useEffect(() => {
    if (!resolvedImage) return;
    const img = new Image();
    img.onload = () => setImageSize({ w: img.naturalWidth || 960, h: img.naturalHeight || 600 });
    img.onerror = () => setImageSize({ w: 960, h: 600 });
    img.src = resolvedImage;
  }, [resolvedImage]);

  const resultBuildingId = React.useMemo(() => {
    if (uiSearchedBuildingId != null) return uiSearchedBuildingId;
    if (searchedRoomId != null) {
      const r = rooms.find(rr => rr.id === searchedRoomId);
      return r?.buildingId ?? null;
    }
    return null;
  }, [uiSearchedBuildingId, searchedRoomId, rooms]);

  const searchSMap = React.useMemo(() => {
    const m = new Map<number, number>();
    if (resultBuildingId != null) m.set(resultBuildingId, SEARCH_RESULT_S);
    suggestionBuildingIds.forEach((id: number) => {
      if (id == null) return;
      if (m.has(id)) return;
      m.set(id, SEARCH_SUGGESTION_S);
    });
    return m;
  }, [resultBuildingId, suggestionBuildingIds]);

  useEffect(() => {
    if (resultBuildingId != null) {
      setLocalActiveBuildingId(resultBuildingId);
      lastInteractionRef.current = 'search';
    }
  }, [resultBuildingId]);

  const searchHighlightIds = React.useMemo(() => {
    const s = new Set<number>();
    suggestionBuildingIds.forEach(id => s.add(id));
    if (resultBuildingId != null) s.add(resultBuildingId);
    return s;
  }, [suggestionBuildingIds, resultBuildingId]);


  const overlayContainerStyle = overlayUI
    ? { padding: 0, height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' as React.CSSProperties['flexDirection'] }
    : undefined;

  const { stable: viewportStable } = useViewportStable();

  const safePadding = React.useMemo(() => (
    overlayUI ? { top: Math.max(0, topSafeAreaPx) } : undefined
  ), [overlayUI, topSafeAreaPx]);

  if (error) {
    return (
      <BaseBox as="section" color={SurfaceKey.Surface} size={SizeKey.MD}>
        <BaseText text="キャンパスマップ" />
        <BaseBox color={CoreColorKey.Danger} variant={VariantKey.Ghost}>
          <BaseText text={`エラー: ${error}`} color={CoreColorKey.Danger} />
        </BaseBox>
      </BaseBox>
    );
  }

  return (    
    <BaseBox as="section" size={overlayUI ? undefined : SizeKey.MD} style={overlayContainerStyle}>
      {!overlayUI && (
        <BaseBox as="div" className="st-flex st-items-center st-justify-between" style={{ gap: 12, flexWrap: 'wrap' }}>
          <BaseBox as="div" className="st-flex st-items-center" style={{ gap: 12, flexWrap:'wrap' }}>
            <BaseText text="キャンパスマップ" weight={FontWeightKey.Medium} />
            <BaseBox 
              as="label" 
              className="st-flex st-items-center st-cursor-pointer" 
              style={{ 
                gap:4, 
                padding: '6px 12px', 
                backgroundColor: 'var(--color-surface-alt)', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <BaseInput
                type="checkbox"
                checked={lectureSmoothEnabled}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const v = !!e.target.checked;
                  setLectureSmoothEnabled(v);
                  if (v) {
                    setFilter({ kind: FilterKind.LectureOnly } as any);
                    setFilterMode('smooth');
                    setFilterDegree(0.3);
                  } else {
                    clearFilter(FilterKind.LectureOnly);
                  }
                }}
              />
              <BaseText text="講義棟優先" className="st-fs-sm" />
            </BaseBox>
            <FilterButton />
          </BaseBox>
        </BaseBox>
      )}
      <div style={{ position:'relative', display: overlayUI ? 'flex' : 'grid', flexDirection: overlayUI ? 'column' : undefined, gridTemplateColumns: overlayUI ? undefined : '1fr', gap: overlayUI ? 0 : 12, alignItems: 'start', maxWidth: overlayUI ? '100%' : (isMobile ? '100%' : 960), width: '100%', marginTop: overlayUI ? 0 : (isMobile ? 0 : 12), flex: overlayUI ? 1 : undefined, minHeight: overlayUI ? 0 : undefined }}>
        <BaseBox
          round={RoundKey.Md}
          color={SurfaceKey.SurfaceAlt}
          variant={overlayUI ? VariantKey.Ghost : undefined}
          style={overlayUI ? { width: '100%', height: '100%', minHeight: 0, flex: 1, overflow: 'hidden', borderRadius: 0, padding: 0 } : (isMobile ? { width: '100%', height: 'calc(var(--app-vh, 1vh) * 100)', overflow: 'hidden', borderRadius: 0, padding: 0 } : { width: '100%', aspectRatio: '960 / 600', minHeight: 320, overflow: 'hidden', padding: 0 })}
        >
            {resolvedImage && viewportStable ? (
              <LeafletStage
                key={layoutKey}
                imageUrl={resolvedImage}
                imageSize={imageSize}
                onClickBuilding={handleMarkerClick}
                focusBuildingId={activeId ?? undefined}
                highlightOnFocus={lastInteractionRef.current === 'search'}
                highlightBuildingId={highlightBuildingId}
                searchSMap={searchSMap}
                searchHighlightIds={searchHighlightIds}
                safePadding={safePadding}
                hideZoomControl={hideZoomControl ?? isMobile}
                onMapBackgroundClick={onMapBackgroundClick}
              />
            ) : (
              <BaseBox className="st-flex st-items-center st-justify-center" style={{ width: '100%', height: '100%' }}>
                <BaseText color={CoreColorKey.Secondary} size={SizeKey.SM} text={resolvedImage ? (viewportStable ? 'マップを初期化中...' : '画面安定化中...') : 'マップ画像がありません'} />
              </BaseBox>
            )}
        </BaseBox>
      </div>

      {loading && (
        <BaseBox className="st-absolute st-top-xs st-left-xs" size={SizeKey.SM} round={RoundKey.Sm} shadow={ShadowKey.Sm} style={{ zIndex: 30 }}>
          <BaseText text="データ読み込み中..." />
        </BaseBox>
      )}
    </BaseBox>
  );
};
