"use client";
import { useMemo } from 'react';
import type { Building, Area } from '../../domain/model/types';
import { FilterKind, type BuildingFilterState } from '../ui/filters';

export function useFilterMatchMap(
  buildings: Building[],
  areas: Area[],
  selectedCampusId: number | null,
  filters: BuildingFilterState,
  lectureBuildingIds: Set<number>,
  buildingMaxCapacity: Map<number, number>,
) {
  const filtersKey = JSON.stringify(filters);
  return useMemo(() => {
    const areaIdsInCampus = new Set(
      areas
        .filter(a => selectedCampusId == null || (a as any).campusId === selectedCampusId)
        .map(a => a.id)
    );
    const inScope = buildings.filter(b => areaIdsInCampus.has(b.areaId));

    const lectureOnly = filters[FilterKind.LectureOnly];
    const minCapCond = filters[FilterKind.CapacityGte];
    const minCap = (minCapCond as any)?.value as number | undefined;

    const map = new Map<number, boolean>();
    for (const b of inScope) {
      let match = true;
      if (lectureOnly) {
        const hasLecture = (b.rooms && b.rooms.length > 0) || lectureBuildingIds.has(b.id);
        match = match && !!hasLecture;
      }
      if (minCap && minCap > 0) {
        const cap = buildingMaxCapacity.get(b.id) ?? 0;
        match = match && cap >= minCap;
      }
      map.set(b.id, match);
    }
    return map;
  }, [buildings, areas, selectedCampusId, filtersKey, lectureBuildingIds, buildingMaxCapacity]);
}
