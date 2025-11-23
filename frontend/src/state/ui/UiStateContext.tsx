"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { BuildingFilterCondition, BuildingFilterKind, BuildingFilterState } from './filters';
import { clearCondition, defaultFilters, setCondition, FilterKind } from './filters';

export interface UiStateContextValue {
  selectedCampusId: number | null;
  setSelectedCampus: (id: number | null) => void;
  selectedAreaId: number | null;
  setSelectedArea: (id: number | null) => void;
  selectedBuildingId: number | null;
  setSelectedBuilding: (id: number | null) => void;
  searchedBuildingId: number | null;
  setSearchedBuildingId: (id: number | null) => void;
  searchedRoomId: number | null;
  setSearchedRoomId: (id: number | null) => void;
  suggestionBuildingIds: number[];
  setSuggestionBuildingIds: (ids: number[]) => void;
  filters: BuildingFilterState;
  filterMode: 'smooth' | 'strict';
  setFilterMode: (mode: 'smooth' | 'strict') => void;
  filterDegree: number;
  setFilterDegree: (v: number) => void;
  setFilter: (condition: BuildingFilterCondition) => void;
  clearFilter: (kind: BuildingFilterKind) => void;
  resetFilters: () => void;
  lectureSmoothEnabled: boolean;
  setLectureSmoothEnabled: (v: boolean) => void;
}

const UiCtx = createContext<UiStateContextValue | undefined>(undefined);

export const UiStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCampusId, setSelectedCampusId] = useState<number | null>(1);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [searchedBuildingId, setSearchedBuildingId] = useState<number | null>(null);
  const [searchedRoomId, setSearchedRoomId] = useState<number | null>(null);
  const [suggestionBuildingIds, setSuggestionBuildingIds] = useState<number[]>([]);
  const [filters, setFilters] = useState<BuildingFilterState>(defaultFilters());
  const [filterMode, setFilterMode] = useState<'smooth' | 'strict'>('smooth');
  const [filterDegree, setFilterDegree] = useState<number>(0.6);
  const [lectureSmoothEnabled, setLectureSmoothEnabled] = useState<boolean>(true);

  const setSelectedCampus = (id: number | null) => {
    setSelectedCampusId(id);
    setSelectedBuildingId(null);
    setSelectedAreaId(null);
  };

  const setSelectedArea = (id: number | null) => {
    setSelectedAreaId(id);
    setSelectedBuildingId(null);
  };

  const value = useMemo<UiStateContextValue>(() => ({
    selectedCampusId,
    selectedAreaId,
    selectedBuildingId,
    searchedBuildingId,
    searchedRoomId,
    suggestionBuildingIds,
    filters,
    filterMode,
    filterDegree,
    lectureSmoothEnabled,
    setSelectedCampus,
    setSelectedArea,
    setSelectedBuilding: setSelectedBuildingId,
    setSearchedBuildingId,
    setSearchedRoomId,
    setSuggestionBuildingIds: (ids) => setSuggestionBuildingIds((prev) => {
      const next = Array.from(new Set(ids));
      if (prev.length === next.length && prev.every((v, i) => v === next[i])) {
        return prev;
      }
      return next;
    }),
    setFilter: (condition) => setFilters((s) => setCondition(s, condition)),
    clearFilter: (kind) => setFilters((s) => clearCondition(s, kind)),
    resetFilters: () => setFilters(defaultFilters()),
    setFilterMode,
    setFilterDegree: (v) => setFilterDegree(Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0))),
    setLectureSmoothEnabled: (v) => setLectureSmoothEnabled(!!v),
  }), [selectedCampusId, selectedAreaId, selectedBuildingId, searchedBuildingId, searchedRoomId, suggestionBuildingIds, filters, filterMode, filterDegree, lectureSmoothEnabled]);

  useEffect(() => {
    setFilters((s) => {
      const hasLecture = !!(s as any)[FilterKind.LectureOnly];
      if (lectureSmoothEnabled && !hasLecture) {
        return setCondition(s, { kind: FilterKind.LectureOnly } as any);
      }
      if (!lectureSmoothEnabled && hasLecture) {
        return clearCondition(s, FilterKind.LectureOnly as any);
      }
      return s;
    });
  }, [lectureSmoothEnabled]);

  return <UiCtx.Provider value={value}>{children}</UiCtx.Provider>;
};

export function useUiStateContext(): UiStateContextValue {
  const ctx = useContext(UiCtx);
  if (!ctx) throw new Error('useUiStateContext must be used within UiStateProvider');
  return ctx;
}
