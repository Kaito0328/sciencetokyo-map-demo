"use client";
import React, { useEffect } from 'react';
import { MapContainer, ImageOverlay, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import FitImageToBounds from '../utils/FitImageToBounds';
import { useAreaDataContext } from '../../../state/data/AreaDataContext';
import { useUiStateContext } from '../../../state/ui/UiStateContext';
import { useLectureMeta } from '../../../state/hooks/useLectureMeta';
import { useFilteredAreas } from '../../../state/hooks/useFilteredAreas';
import { useFilterMatchMap } from '../../../state/hooks/useFilterMatchMap';
import { Building } from '../../../domain/model/types';
import { LECTURE_SMOOTH_DEGREE } from '../config/parameters';
import '../../../design/styles.css';
import { MapStateProvider } from '../MapStateProvider';
import MarkersRenderer from './BuldingMarkersRenderer';
import AreaButtonsRenderer from './AreaMarkersRenderer';
import { toLeafletLatLng } from '../utils/CoordinateUtils';

import { useMediaQuery } from '../../../utils/useMediaQuery';

export interface LeafletStageProps {
	imageUrl: string;
	imageSize: { w: number; h: number };
	onClickBuilding?: (b: Building) => void;
	focusBuildingId?: number | null;
	highlightOnFocus?: boolean;
	highlightBuildingId?: number | null;
  searchSMap?: Map<number, number>;
  searchHighlightIds?: Set<number>;
  safePadding?: { top?: number; right?: number; bottom?: number; left?: number };
  hideZoomControl?: boolean;
  onMapBackgroundClick?: () => void;
	layoutKey?: string | number;
}

const LeafletStage: React.FC<LeafletStageProps> = ({ imageUrl, imageSize, onClickBuilding, focusBuildingId = null, highlightOnFocus = false, highlightBuildingId = null, searchSMap, searchHighlightIds, safePadding, hideZoomControl, onMapBackgroundClick, layoutKey }) => {
  const [imageReady, setImageReady] = React.useState(false);
  const { areas, buildings: allBuildings, rooms } = useAreaDataContext();
	const { selectedCampusId, filters, filterMode, filterDegree, lectureSmoothEnabled, setSelectedArea } = useUiStateContext();
  const { lectureBuildingIds, buildingMaxCapacity } = useLectureMeta(rooms);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const showZoomControl = false;

  const filterMatchMap = useFilterMatchMap(
    allBuildings as any,
    areas as any,
    selectedCampusId,
    filters,
    lectureBuildingIds,
    buildingMaxCapacity,
  );
	const filteredAreas = useFilteredAreas(areas, selectedCampusId, null);
	const areaIdsInCampus = React.useMemo(() => new Set(filteredAreas.map(a => a.id)), [filteredAreas]);
	const campusBuildings = React.useMemo(() => allBuildings.filter(b => areaIdsInCampus.has(b.areaId)), [allBuildings, areaIdsInCampus]);
	const filteredBuildings = (filterMode === 'strict'
		? campusBuildings.filter(b => filterMatchMap.get(b.id))
		: campusBuildings) as Building[];
  if (!imageSize || imageSize.w === 0 || imageSize.h === 0) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        マップデータを読み込み中...
      </div>
    );
  }

	const imageBounds = [[0, 0], [imageSize.h, imageSize.w]] as L.LatLngBoundsExpression;

	return (
		<MapContainer
			key={layoutKey}
			crs={L.CRS.Simple}
			center={[imageSize.h / 2, imageSize.w / 2]}
			zoomSnap={0.1}
			zoomDelta={0.1}
			minZoom={-5}
			maxBounds={imageBounds}
			maxBoundsViscosity={1.0}
			style={{ width: '100%', height: '100%' }}
			attributionControl={false}
			doubleClickZoom={true}
			zoomControl={showZoomControl}
		>
			<ImageOverlay url={imageUrl} bounds={imageBounds} eventHandlers={{ load: () => setImageReady(true) }} />
			<FitImageToBounds imageSize={imageSize} safePadding={safePadding} imageReady={imageReady} />
			<MapBackgroundClickHandler onBackgroundClick={onMapBackgroundClick} />
					<MapStateProvider>
				<FocusController imageSize={imageSize} focusBuildingId={focusBuildingId} allBuildings={allBuildings} shouldFly={highlightOnFocus} />
					<AreaButtonsRenderer imageSize={imageSize} areas={filteredAreas as any} onSelected={(id: number) => {
					  setSelectedArea(id);
					}} />
						<MarkersRenderer
					imageSize={imageSize}
					buildings={filteredBuildings as any}
					onClickBuilding={onClickBuilding}
					highlightBuildingId={highlightBuildingId}
					selectedBuildingId={focusBuildingId ?? null}
							extraBuildings={(() => { const b = allBuildings.find(x => x.id === focusBuildingId); return (b && areaIdsInCampus.has(b.areaId)) ? [b] : []; })()}
					filterMatchMap={filterMatchMap}
					filterMode={filterMode}
					filterDegree={filterDegree}
					lectureBuildingIds={lectureBuildingIds}
					lectureSmoothEnabled={lectureSmoothEnabled}
					lectureSmoothDegree={LECTURE_SMOOTH_DEGREE}
	            searchSMap={searchSMap}
	            searchHighlightIds={searchHighlightIds}
				/>
			</MapStateProvider>
		</MapContainer>
	);
};

export default LeafletStage;

const MapBackgroundClickHandler: React.FC<{ onBackgroundClick?: () => void }> = ({ onBackgroundClick }) => {
	const map = useMap();
	useEffect(() => {
		if (!map) return;
		const handler = (e: any) => {
			const tgt = e.originalEvent?.target as HTMLElement | null;
			if (tgt && tgt.classList && tgt.classList.contains('leaflet-interactive')) return;
			try { map.invalidateSize(); } catch (e) {}
			setTimeout(() => { try { map.invalidateSize(); } catch (e) {} }, 150);
			setTimeout(() => { try { map.invalidateSize(); } catch (e) {} }, 400);
			onBackgroundClick && onBackgroundClick();
		};
		map.on('click', handler);
		return () => { map.off('click', handler); };
	}, [map, onBackgroundClick]);
	return null;
};

const BUILDING_SEARCH_ZOOM = 0.3; 
const ROOM_SEARCH_ZOOM = 0.6; 
const BUILDING_ANCHOR_Y = 0.5;
const ROOM_ANCHOR_Y = 0.5;
const FocusController: React.FC<{ imageSize: { w:number; h:number }; focusBuildingId: number | null | undefined; allBuildings: Building[]; shouldFly?: boolean }>
	= ({ imageSize, focusBuildingId, allBuildings, shouldFly = false }) => {
	const map = useMap();
	const { searchedBuildingId, searchedRoomId } = useUiStateContext();
	const { rooms } = useAreaDataContext();
	useEffect(() => {
		if (!map) return;
		if (focusBuildingId == null) return;
		if (!shouldFly) return; 

		const b = allBuildings.find(x => x.id === focusBuildingId);
		if (!b) return;
		
		const isSearchInitiated = (() => {
			if (searchedBuildingId != null && searchedBuildingId === focusBuildingId) return true;
			if (searchedRoomId != null) {
				const room = rooms.find(r => r.id === searchedRoomId);
				if (room && room.buildingId === focusBuildingId) return true;
			}
			return false;
		})();

		if (!isSearchInitiated) return;

		const latlng = toLeafletLatLng(imageSize, b.xPct, b.yPct);
		const minZ = (map as any).getMinZoom?.() ?? -Infinity;
		const maxZ = (map as any).getMaxZoom?.() ?? Infinity;
		const isRoomSearch = searchedRoomId != null && (() => { const room = rooms.find(r => r.id === searchedRoomId); return !!room && room.buildingId === focusBuildingId; })();
		
		const targetZoomBase = isRoomSearch ? ROOM_SEARCH_ZOOM : BUILDING_SEARCH_ZOOM;
		const targetZoom = Math.max(minZ, Math.min(maxZ, targetZoomBase));

		try {
			const mapAny = map as any;
			const viewSize = mapAny.getSize();
			const northWest = L.latLng(imageSize.h, 0);
			const southEast = L.latLng(0, imageSize.w);
			
			const pNW = mapAny.project(northWest, targetZoom);
			const pSE = mapAny.project(southEast, targetZoom);
			const pTarget = mapAny.project(latlng, targetZoom);

			let newX = pTarget.x;
			let newY = pTarget.y;

			const halfWidth = viewSize.x / 2;
			const minX = pNW.x + halfWidth;
			const maxX = pSE.x - halfWidth;
			if (minX > maxX) {
				newX = (pNW.x + pSE.x) / 2;
			} else {
				newX = Math.max(minX, Math.min(maxX, newX));
			}

			const halfHeight = viewSize.y / 2;
			const minY = pNW.y + halfHeight;
			const maxY = pSE.y - halfHeight;
			if (minY > maxY) {
				newY = (pNW.y + pSE.y) / 2;
			} else {
				newY = Math.max(minY, Math.min(maxY, newY));
			}

			const newCenter = mapAny.unproject(L.point(newX, newY), targetZoom);
			mapAny.flyTo(newCenter, targetZoom, { animate: true, duration: 0.7 });
		} catch (e) {
			(map as any).setView(latlng, targetZoom, { animate: true });
		}
	}, [map, focusBuildingId, allBuildings, imageSize, searchedBuildingId, searchedRoomId, rooms, shouldFly]);
	return null;
};
