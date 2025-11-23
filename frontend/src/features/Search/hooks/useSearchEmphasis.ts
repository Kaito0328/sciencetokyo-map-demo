"use client";
import { useEffect, useMemo } from 'react';
import type { BuildingHit, RoomHit } from '../types';
import { SEARCH_SUGGEST_TOP_N } from '../../Search/config/parameters';
import { useUiStateContext } from '../../../state/ui/UiStateContext';

export function useSearchEmphasis(
  debouncedQuery: string,
  focused: boolean,
  buildingHits: BuildingHit[],
  roomHits: RoomHit[],
) {
  const { setSuggestionBuildingIds } = useUiStateContext();

  const candidateIds = useMemo(() => {
    const ordered: number[] = [];
    const seen = new Set<number>();

    for (const r of roomHits) {
      const id = r.building.id;
      if (!seen.has(id)) {
        ordered.push(id);
        seen.add(id);
      }
      if (ordered.length >= SEARCH_SUGGEST_TOP_N) break;
    }

    if (ordered.length < SEARCH_SUGGEST_TOP_N) {
      for (const r of buildingHits) {
        const id = r.building.id;
        if (!seen.has(id)) {
          ordered.push(id);
          seen.add(id);
        }
        if (ordered.length >= SEARCH_SUGGEST_TOP_N) break;
      }
    }

    return ordered;
  }, [roomHits, buildingHits]);

  useEffect(() => {
    const qRaw = debouncedQuery.trim();
    if (!qRaw || !focused) {
      setSuggestionBuildingIds([]);
      return;
    }
    setSuggestionBuildingIds(candidateIds);
  }, [debouncedQuery, focused, candidateIds, setSuggestionBuildingIds]);
}