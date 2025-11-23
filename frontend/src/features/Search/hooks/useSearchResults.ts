"use client";
import { useMemo } from 'react';
import type { Building, Room } from '../../../domain/model/types';
import type { BuildingHit, RoomHit, MatchLike } from '../types';
import { normalizeJa, normalizeCode } from '../../../utils/normalize';
import { MAX_BUILDING_RESULTS, MAX_ROOM_RESULTS } from '../../Search/config/parameters';

export function useSearchResults(
  query: string,
  focused: boolean,
  buildingIndex: any,
  roomIndex: any,
  buildings: Building[],
) {
  return useMemo(() => {
    const qRaw = (query || '').trim();
    const qN = normalizeJa(qRaw);
    const qCode = normalizeCode(qRaw);
    if (!qN) {
      return {
        buildingHits: focused ? buildings.map(b => ({ building: b } as BuildingHit)) : [],
        roomHits: [] as RoomHit[],
      };
    }

    const containsJapanese = /[\u3040-\u30FF\u4E00-\u9FFF]/.test(qRaw);
    const searchQuery = containsJapanese ? qN : (qCode.length > 1 ? qCode : qN);

  const bres = buildingIndex.search(searchQuery).slice(0, MAX_BUILDING_RESULTS) as any[];
    const buildingHits: BuildingHit[] = bres.map((r: any) => ({ building: r.item.building as Building, matches: r.matches as ReadonlyArray<MatchLike> | undefined }));

  const rres = roomIndex.search(qCode).slice(0, MAX_ROOM_RESULTS) as any[];
    const idToBuilding = new Map<number, Building>(buildings.map(b => [b.id, b]));
    const roomHits: RoomHit[] = [];
    for (const r of rres) {
      const room = (r.item as any).room as Room;
      const bId = (r.item as any).buildingId as number | undefined;
      if (!bId) continue;
      const b = idToBuilding.get(bId);
      if (!b) continue;
      const fk = room.floorKey;
      roomHits.push({ room, building: b, floorKey: fk, matches: r.matches as ReadonlyArray<MatchLike> | undefined });
    }
    return { buildingHits, roomHits };
  }, [query, focused, buildingIndex, roomIndex, buildings]);
}
