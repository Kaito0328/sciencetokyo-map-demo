"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Building, Room } from '../../domain/model/types';
import { useAreaDataContext } from '../../state/data/AreaDataContext';
import { useUiStateContext } from '../../state/ui/UiStateContext';
import { logEvent } from '../../utils/eventLogger';
import { BaseInput } from '../../design/base/BaseInput';
import { BaseBox } from '../../design/base/BaseBox';
import { BaseText } from '../../design/base/BaseText';
import { CoreColorKey, SurfaceKey, SizeKey, RoundKey, ShadowKey, FontWeightKey, VariantKey } from '../../design/tokens';
import type { MatchLike, RoomHit, BuildingHit } from './types';
import { useDebouncedValue } from '../../utils/useDebouncedValue';
import { useBuildingSearchIndex } from './hooks/useBuildingSearchIndex';
import { useRoomSearchIndex } from './hooks/useRoomSearchIndex';
import { useSearchResults } from './hooks/useSearchResults';
import { useLectures } from '../../state/lecture/useLectures';
import { useSearchEmphasis } from './hooks/useSearchEmphasis';


export const SearchBox: React.FC<{ onSelect?: (b: Building, opts?: { openFloorKey?: string }) => void; hideLabel?: boolean }>
  = ({ onSelect, hideLabel }) => {
  const [query, setQuery] = useState('');
  const { buildings: all, areas, campuses, rooms } = useAreaDataContext();
  const { setSelectedCampus, setSelectedArea } = useUiStateContext();
  const allRooms: Room[] = useMemo(() => rooms, [rooms]);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listItemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const debouncedQuery = useDebouncedValue(query, 200);

  const buildingIndex = useBuildingSearchIndex(all);
  const roomIndex = useRoomSearchIndex(allRooms, all);

  const { buildingHits: filtered, roomHits: roomResults } = useSearchResults(debouncedQuery, focused, buildingIndex, roomIndex, all);
  const { search: lectureSearch } = useLectures();
  useEffect(() => { setActiveIndex(-1); }, [debouncedQuery, focused]);

  useSearchEmphasis(debouncedQuery, focused, filtered, roomResults);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setFocused(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const rows = useMemo(() => {
    const lectureHits: Array<{ type: 'lectureRoom'; item: any }> = [];
    try {
      const q = (debouncedQuery || '').trim();
      if (q) {
        const lres = lectureSearch(q) as any[];
        const idToBuilding = new Map<number, any>(all.map(b => [b.id, b]));
        const idToRoom = new Map<number, any>(allRooms.map(r => [r.id, r]));
        const seen = new Set<number>();
        for (const l of lres) {
          if (!l.roomId || !l.buildingId) continue;
          if (seen.has(l.roomId)) continue;
          const room = idToRoom.get(l.roomId);
          const building = idToBuilding.get(l.buildingId);
          if (!room || !building) continue;
          seen.add(l.roomId);
          lectureHits.push({ type: 'lectureRoom', item: { lecture: l, room, building, floorKey: l.floorKey ?? room.floorKey } });
          if (lectureHits.length >= 30) break;
        }
      }
    } catch (e) {
    }

    return [
      ...lectureHits.map((x) => ({ type: 'lectureRoom' as const, item: x.item })),
      ...roomResults.map((x) => ({ type: 'room' as const, item: x })),
      ...filtered.map((x) => ({ type: 'building' as const, item: x })),
    ];
  }, [roomResults, filtered, debouncedQuery, lectureSearch, all, allRooms]);

  useEffect(() => {
    if (activeIndex < 0) return;
    listItemRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const { setSearchedBuildingId, setSearchedRoomId } = useUiStateContext();

  const selectBuilding = useCallback((b: Building) => {
    logEvent('search.select', { id: b.id });
    setQuery(b.name);
    setFocused(false);
    setActiveIndex(-1);
    setSearchedBuildingId(b.id);
    setSearchedRoomId(null);
    onSelect?.(b);
  }, [onSelect, setSearchedBuildingId, setSearchedRoomId]);

  const selectRoom = useCallback(({ room, building, floorKey, lecture }: RoomHit & { lecture?: any }) => {
    logEvent('search.select.room', { code: room.roomCode, buildingId: building.id, floorKey });
    const displayText = lecture ? `${lecture.name} (${room.roomCode})` : room.roomCode;
    setQuery(displayText);
    setFocused(false);
    setActiveIndex(-1);
    setSearchedBuildingId(building.id);
    setSearchedRoomId(room.id);
    onSelect?.(building, { openFloorKey: floorKey });
  }, [onSelect, setSearchedBuildingId, setSearchedRoomId]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!focused) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, rows.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < rows.length) {
        const row = rows[activeIndex];
        if (row.type === 'room') {
          const { room, building, floorKey } = row.item as RoomHit;
          selectRoom({ room, building, floorKey });
        } else if (row.type === 'lectureRoom') {
          const { room, building, floorKey, lecture } = row.item;
          selectRoom({ room, building, floorKey, lecture });
        } else {
          const { building } = row.item as BuildingHit;
          selectBuilding(building);
        }
      }
    } else if (e.key === 'Escape') {
      setFocused(false);
      setActiveIndex(-1);
    }
  }, [activeIndex, rows, focused, selectBuilding, selectRoom]);

  const renderHighlight = (text: string, matches: ReadonlyArray<MatchLike> | undefined, keyName: string) => {
    const m = (matches || []).find((mm) => mm.key === keyName);
    if (!m || !Array.isArray(m.indices) || m.indices.length === 0) {
      return <span>{text}</span>;
    }
  const parts: Array<{ s: number; e: number }> = (m.indices as Array<[number, number]>).map(([s, e]: [number, number]) => ({ s, e }));
    const out: React.ReactNode[] = [];
    let last = 0;
    for (const { s, e } of parts) {
      if (s > last) out.push(<span key={last + '-n'}>{text.slice(last, s)}</span>);
      out.push(<strong key={s + '-h'}>{text.slice(s, e + 1)}</strong>);
      last = e + 1;
    }
    if (last < text.length) out.push(<span key={last + '-t'}>{text.slice(last)}</span>);
    return <span>{out}</span>;
  };

  return (
    <BaseBox ref={containerRef as any} style={{ display: 'flex', flexDirection: 'column', gap: hideLabel ? 4 : 8, position: 'relative' }}>
      {!hideLabel && <BaseText text="検索" size={SizeKey.SM} color={CoreColorKey.Secondary} weight={FontWeightKey.Medium} />}
      <BaseInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onKeyDown={handleKeyDown}
        placeholder="建物名 / 部屋番号 / 講義名などを入力"
        className="st-text-on-primary st-search-input-pc"
        style={{ 
          border: '1px solid rgba(0,0,0,0.2)', 
          borderRadius: 8, 
          fontSize: 16, 
          background: 'var(--color-surface)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '12px 16px'
        }}
        size={SizeKey.LG}
      />
      {focused && (
        <BaseBox
          color={SurfaceKey.Surface}
          shadow={ShadowKey.Md}
          round={RoundKey.Md}
          style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, maxHeight: 240, overflowY: 'auto' }}
        >
          {rows.slice(0, 60).map((row, idx) => {
            const rowIndex = idx;
            listItemRefs.current[rowIndex] = listItemRefs.current[rowIndex] ?? null;
            if (row.type === 'lectureRoom') {
              const { lecture, room, building, floorKey } = row.item as any;
              return (
                <BaseBox
                  ref={(el) => (listItemRefs.current[rowIndex] = el as HTMLDivElement | null)}
                  key={`lecture-${lecture.id}-${room.roomCode}`}
                  size={SizeKey.SM}
                  className={['st-cursor-pointer', activeIndex === rowIndex ? 'st-bg-surface-alt' : ''].join(' ')}
                  onMouseEnter={() => setActiveIndex(rowIndex)}
                  onClick={() => selectRoom({ room, building, floorKey, lecture })}
                >
                  <div>
                    <span>[講義] </span>
                    <strong style={{ marginRight: 6 }}>{lecture.title}</strong>
                    <span style={{ opacity: 0.9 }}>{room.roomCode}</span>
                    <span> — </span>
                    <span>{building.name}</span>
                    <span>（{floorKey}階）</span>
                  </div>
                </BaseBox>
              );
            }
            if (row.type === 'room') {
              const { room, building, floorKey, matches } = row.item as RoomHit;
              return (
                <BaseBox
                  ref={(el) => (listItemRefs.current[rowIndex] = el as HTMLDivElement | null)}
                  key={`room-${idx}-${room.roomCode}`}
                  size={SizeKey.SM}
                  className={['st-cursor-pointer', activeIndex === rowIndex ? 'st-bg-surface-alt' : ''].join(' ')}
                  onMouseEnter={() => setActiveIndex(rowIndex)}
                  onClick={() => selectRoom({ room, building, floorKey })}
                >
                  <div>
                    <span>[講義室] </span>
                    {renderHighlight(room.roomCode, matches || [], 'roomCodeN')}
                    <span> — </span>
                    {renderHighlight(building.name, matches || [], 'buildingNameN')}
                    <span>（{floorKey}階）</span>
                  </div>
                </BaseBox>
              );
            }
            // building
            const { building: b, matches } = row.item as BuildingHit;
            return (
              <BaseBox
                ref={(el) => (listItemRefs.current[rowIndex] = el as HTMLDivElement | null)}
                key={b.id}
                size={SizeKey.SM}
                className={['st-cursor-pointer', activeIndex === rowIndex ? 'st-bg-surface-alt' : ''].join(' ')}
                onMouseEnter={() => setActiveIndex(rowIndex)}
                onClick={() => selectBuilding(b)}
              >
                <div>
                  {renderHighlight(b.code, matches || [], 'codeN')}
                  <span> — </span>
                  {renderHighlight(b.name, matches || [], 'nameN')}
                </div>
              </BaseBox>
            );
          })}

          {rows.length === 0 && (
            <BaseBox size={SizeKey.SM}>
              <BaseText text="一致なし" color={CoreColorKey.Secondary} />
            </BaseBox>
          )}
        </BaseBox>
      )}
    </BaseBox>
  );
};
