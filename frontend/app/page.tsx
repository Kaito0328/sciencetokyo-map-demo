"use client";
import React, { useMemo } from 'react';
import { CampusMap } from '../src/features/Map/CampusMap';
import { SearchBox } from '../src/features/Search/SearchBox';
import { CampusSelector } from '../src/features/CampusSelect/CampusSelector';
import FilterModal from '../src/features/Filter/FilterModal';
import BuildingInfoModal from '../src/features/BuildingInfo/BuildingInfoModal';
import LecturePriorityToggle from '../src/features/Filter/LecturePriorityToggle';
import { useAreaDataContext } from '../src/state/data/AreaDataContext';
import { useUiStateContext } from '../src/state/ui/UiStateContext';
import { FilterKind } from '../src/state/ui/filters';
import FilterButton from '../src/features/Filter/FilterButton';

export default function HomePage() {
  const [filterOpen, setFilterOpen] = React.useState(false);
  const { buildings } = useAreaDataContext();
  const { selectedBuildingId, setSelectedBuilding } = useUiStateContext();
  const [highlightBuildingId, setHighlightBuildingId] = React.useState<number | null>(null);
  const [autoOpenFloorKey, setAutoOpenFloorKey] = React.useState<string | null>(null);
  const [openInfo, setOpenInfo] = React.useState(false);
  const [infoMode, setInfoMode] = React.useState<'min'|'normal'|'full'>('normal');
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  const [overlayHeight, setOverlayHeight] = React.useState(0);

  const activeBuilding = useMemo(() => buildings.find(b => b.id === (selectedBuildingId ?? -1)) || null, [buildings, selectedBuildingId]);

  const prevFloorKeyRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (autoOpenFloorKey && autoOpenFloorKey !== prevFloorKeyRef.current) {
      setOpenInfo(true);
      prevFloorKeyRef.current = autoOpenFloorKey;
    }
  }, [autoOpenFloorKey]);

  React.useEffect(() => {
    const handler = () => setFilterOpen(true);
    window.addEventListener('open-filter-modal', handler as any);
    return () => window.removeEventListener('open-filter-modal', handler as any);
  }, []);

  return (
    <main style={{ width: '100vw', height: '100svh', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position:'absolute', left: 0, right: 0, bottom: 0, top: Math.max(0, overlayHeight + 8) }}>
        <CampusMap
          overlayUI
          topSafeAreaPx={overlayHeight + 8}
          selectedBuildingId={selectedBuildingId}
          onBuildingSelect={(b: any) => { 
            setSelectedBuilding(b.id); 
            setHighlightBuildingId(null);
            setOpenInfo(true); 
          }}
          initialOpenFloorKey={autoOpenFloorKey}
          highlightBuildingId={highlightBuildingId}
        />
      </div>

      <div ref={overlayRef} style={{ position:'absolute', left: 12, right: 12, top: 32, zIndex: 1200 }}>
          <SearchBox hideLabel onSelect={(b: any, opts?: { openFloorKey?: string }) => {
            setHighlightBuildingId(b.id);
            setSelectedBuilding(b.id);
            setAutoOpenFloorKey(opts?.openFloorKey ?? null);
            setInfoMode('min');
            setOpenInfo(true);
          }} />
        <div style={{ position:'absolute', right: 12, top: 'calc(100% + 8px)', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <FilterButton />
          <LecturePriorityToggle />
        </div>
      </div>

      <FilterModal open={filterOpen} onClose={() => setFilterOpen(false)} />

      <BuildingInfoModal
        open={openInfo && !!activeBuilding}
        building={activeBuilding}
        onClose={() => {
          setOpenInfo(false);
          try {
            window.dispatchEvent(new CustomEvent('building-modal-closed', { detail: { buildingId: activeBuilding?.id ?? null } }));
          } catch (e) {}
        }}
        initialOpenFloorKey={autoOpenFloorKey}
        desktopSide="right"
        mobilePlacement="bottom"
        width={360}
        zIndex={1300}
        mode={infoMode}
        onModeChange={setInfoMode}
      />

      <footer style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '4px 8px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        fontSize: '10px',
        textAlign: 'center',
        zIndex: 1100,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <span>データ出典: <a href="https://admissions.titech.ac.jp/0/access/ookayama" target="_blank" rel="noopener noreferrer">東京科学大学</a></span>
          <span style={{ margin: '0 4px' }}>|</span>
          <span>使用技術: <a href="https://leafletjs.com/" target="_blank" rel="noopener noreferrer">Leaflet</a>, <a href="https://www.fusejs.io/" target="_blank" rel="noopener noreferrer">Fuse.js</a></span>
          <span style={{ margin: '0 4px' }}>|</span>
          <span>非公式プロジェクト</span>
        </div>
        <div className="st-hidden-mobile" style={{ marginTop: 2, opacity: 0.7 }}>
          本アプリは学生による研究プロジェクトであり, 大学公式によるものではありません. 掲載されている情報は最新ではない可能性があります. 本アプリの利用によって生じた不利益について, 開発者および大学は一切の責任を負いません.
        </div>
      </footer>
    </main>
  );
}
