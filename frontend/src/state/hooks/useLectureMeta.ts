"use client";
import { useMemo } from 'react';
import { Room } from '../../domain/model/types';
export function computeLectureMeta(rooms: Room[]): {
  lectureBuildingIds: Set<number>;
  buildingMaxCapacity: Map<number, number>;
} {
  const lectureIds = new Set<number>();
  const capacityMap = new Map<number, number>();
  for (const r of rooms) {
    if (r.buildingId == null) continue;
    lectureIds.add(r.buildingId);
    const cap = (r.capacity ?? r.examCapacity ?? 0) as number;
    const prev = capacityMap.get(r.buildingId) ?? 0;
    if (cap > prev) capacityMap.set(r.buildingId, cap);
  }
  return { lectureBuildingIds: lectureIds, buildingMaxCapacity: capacityMap };
}


export function useLectureMeta(rooms: Room[]) {
  const { lectureBuildingIds, buildingMaxCapacity } = useMemo(() => {
    return computeLectureMeta(rooms ?? []);
  }, [rooms]);

  return { lectureBuildingIds, buildingMaxCapacity } as const;
}
