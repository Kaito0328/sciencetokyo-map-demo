"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Area, Building, Campus, Room } from '../../domain/model/types';
import { AreaRepository } from '../../domain/ports/Repository';
import { JsonAreaRepository } from '../../domain/infra/JsonAreaRepository';

export interface AreaDataContextValue {
  campuses: Campus[];
  areas: Area[];
  buildings: Building[];
  rooms: Room[];
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
}

const DataCtx = createContext<AreaDataContextValue | undefined>(undefined);

export const AreaDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const repo: AreaRepository = new JsonAreaRepository();
      const [cs, as, bsWithRooms] = await Promise.all([
        repo.getCampuses(),
        repo.composeAreasWithBuildings(),
        repo.composeBuildingsWithRooms(),
      ]);
      setCampuses(cs);
      setAreas(as);
      setBuildings(bsWithRooms);
      setRooms(bsWithRooms.flatMap(b => b.rooms ?? []));
    } catch (e: any) {
      setError(e?.message || 'failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const value = useMemo<AreaDataContextValue>(() => ({
    campuses,
    areas,
    buildings,
    rooms,
    loading,
    error,
    refresh: load,
  }), [campuses, areas, buildings, rooms, loading, error]);

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
};

export function useAreaDataContext(): AreaDataContextValue {
  const ctx = useContext(DataCtx);
  if (!ctx) throw new Error('useAreaDataContext must be used within AreaDataProvider');
  return ctx;
}
