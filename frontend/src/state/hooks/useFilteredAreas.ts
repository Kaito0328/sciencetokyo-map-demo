"use client";
import { useMemo } from 'react';
import { Area } from '../../domain/model/types';

export function useFilteredAreas(areas: Area[], selectedCampusId: number | null, selectedAreaId: number | null) {
  return useMemo(() => {
    let list = areas;
    if (selectedCampusId != null) {
      list = list.filter(a => (a as any).campusId === selectedCampusId);
    }
    if (selectedAreaId != null) {
      list = list.filter(a => a.id === selectedAreaId);
    }
    return list;
  }, [areas, selectedCampusId, selectedAreaId]);
}
