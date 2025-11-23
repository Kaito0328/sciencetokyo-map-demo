"use client";
import React from 'react';
import type { Lecture } from '../../domain/model/types';
import { useAreaDataContext } from '../data/AreaDataContext';
import { normalizeJa } from '../../utils/normalize';
import { JsonLectureRepository } from '../../domain/infra/JsonLectureRepository';

export type ResolvedLecture = Lecture & {
  buildingId?: number;
  buildingCode?: string;
  buildingName?: string;
  roomId?: number;
  floorKey?: string;
};

export function useLectures() {
  const [lectures, setLectures] = React.useState<Lecture[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { buildings, rooms } = useAreaDataContext();

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const repo = new JsonLectureRepository();
    repo.getLectures()
      .then((ls) => { if (!cancelled) setLectures(ls); })
      .catch((e) => { if (!cancelled) setError(String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const resolved = React.useMemo<ResolvedLecture[]>(() => {
    const byRoomCode = new Map(rooms.map(r => [r.roomCode, r]));
    const byBuildingId = new Map(buildings.map(b => [b.id as number, b]));
    return lectures.map(l => {
      const rm = byRoomCode.get(l.roomCode);
      if (!rm) return l as ResolvedLecture;
      const b = byBuildingId.get(rm.buildingId as number);
      return {
        ...l,
        roomId: rm.id,
        floorKey: rm.floorKey,
        buildingId: rm.buildingId,
        buildingCode: b?.code,
        buildingName: b?.name,
      } as ResolvedLecture;
    });
  }, [lectures, buildings, rooms]);

  type SearchQuery = string | { instructor?: string; name?: string; code?: string };

  const search = React.useCallback((q: SearchQuery) => {
    if (typeof q === 'string') {
      const nq = normalizeJa(q.trim());
      if (!nq) return resolved;
      return resolved.filter(l => normalizeJa(l.title).includes(nq) || (l.courseCode && normalizeJa(l.courseCode).includes(nq)));
    }

    const instr = q.instructor ? normalizeJa(q.instructor.trim()) : '';
    const name = q.name ? normalizeJa(q.name.trim()) : '';
    const code = q.code ? normalizeJa(q.code.trim()) : '';

    if (!instr && !name && !code) return resolved;

    return resolved.filter(l => {
      if (instr) {
        const li = l.instructor ? normalizeJa(l.instructor) : '';
        if (!li.includes(instr)) return false;
      }
      if (name) {
        const ln = l.title ? normalizeJa(l.title) : '';
        if (!ln.includes(name)) return false;
      }
      if (code) {
        const lc = l.courseCode ? normalizeJa(l.courseCode) : '';
        if (!lc.includes(code)) return false;
      }
      return true;
    });
  }, [resolved]);

  return { lectures: resolved, search, loading, error };
}
