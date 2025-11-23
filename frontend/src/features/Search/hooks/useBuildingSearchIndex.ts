"use client";
import { useMemo } from 'react';
import Fuse from 'fuse.js';
import type { Building } from '../../../domain/model/types';
import { normalizeCode, normalizeJa } from '../../../utils/normalize';
import { FUSE_BUILDING_THRESHOLD, FUSE_IGNORE_LOCATION, FUSE_MIN_MATCH_CHAR_LENGTH, FUSE_BUILDING_KEYS } from '../../Search/config/parameters';

export function useBuildingSearchIndex(buildings: Building[]) {
  return useMemo(() => {
    const items = buildings.map((b) => ({
      building: b,
      codeN: normalizeCode(b.code),
      nameN: normalizeJa(b.name),
    }));
    return new Fuse(items, {
      includeScore: true,
      includeMatches: true,
      threshold: FUSE_BUILDING_THRESHOLD,
      ignoreLocation: FUSE_IGNORE_LOCATION,
      minMatchCharLength: FUSE_MIN_MATCH_CHAR_LENGTH,
      keys: FUSE_BUILDING_KEYS as any,
    });
  }, [buildings]);
}
