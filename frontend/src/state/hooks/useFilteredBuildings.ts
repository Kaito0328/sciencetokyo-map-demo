"use client";
import { useMemo } from 'react';
import { Area, Building } from '../../domain/model/types';
import { FilterKind } from '../ui/filters';
import type { BuildingFilterState } from '../ui/filters';

export function useFilteredBuildings(
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
    let list = buildings.filter(b => areaIdsInCampus.has(b.areaId));
    const lectureOnly = filters[FilterKind.LectureOnly];
    if (lectureOnly) {
      list = list.filter(b => (b.rooms && b.rooms.length > 0) || lectureBuildingIds.has(b.id));
    }
    const capacity = filters[FilterKind.CapacityGte];
    if (capacity && (capacity as any).value > 0) {
      const min = (capacity as any).value as number;
      list = list.filter(b => (buildingMaxCapacity.get(b.id) ?? 0) >= min);
    }
    return list;
  }, [buildings, areas, selectedCampusId, filtersKey, lectureBuildingIds, buildingMaxCapacity]);
}
