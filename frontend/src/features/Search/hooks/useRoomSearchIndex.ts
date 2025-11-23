"use client";
import { useMemo } from 'react';
import Fuse from 'fuse.js';
import type { Room, Building } from '../../../domain/model/types';
import { normalizeCode, normalizeJa } from '../../../utils/normalize';
import { FUSE_ROOM_THRESHOLD, FUSE_IGNORE_LOCATION, FUSE_MIN_MATCH_CHAR_LENGTH, FUSE_ROOM_KEYS } from '../../Search/config/parameters';

export function useRoomSearchIndex(rooms: Room[], buildings: Building[]) {
  return useMemo(() => {
    const idToBuilding = new Map<number, Building>(buildings.map(b => [b.id, b]));
    const items = rooms.filter(r => r.buildingId != null).map(r => {
      const b = idToBuilding.get(r.buildingId!);
      return {
        room: r,
        roomCodeN: normalizeCode(r.roomCode),
        buildingNameN: normalizeJa(b?.name ?? ''),
        buildingId: b?.id,
      };
    });
    return new Fuse(items, {
      includeScore: true,
      includeMatches: true,
      threshold: FUSE_ROOM_THRESHOLD,
      ignoreLocation: FUSE_IGNORE_LOCATION,
      minMatchCharLength: FUSE_MIN_MATCH_CHAR_LENGTH,
      keys: FUSE_ROOM_KEYS as any,
    });
  }, [rooms, buildings]);
}
