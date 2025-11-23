export const FilterKind = {
  LectureOnly: 'LectureOnly',
  CapacityGte: 'CapacityGte',
} as const;

export type BuildingFilterKind = typeof FilterKind[keyof typeof FilterKind];

export type BuildingFilterCondition =
  | { kind: typeof FilterKind.LectureOnly }
  | { kind: typeof FilterKind.CapacityGte; value: number };

export type BuildingFilterState = Partial<Record<BuildingFilterKind, BuildingFilterCondition>>;

export const setCondition = (
  state: BuildingFilterState,
  condition: BuildingFilterCondition,
): BuildingFilterState => ({ ...state, [condition.kind]: condition });

export const clearCondition = (
  state: BuildingFilterState,
  kind: BuildingFilterKind,
): BuildingFilterState => {
  const next = { ...state };
  delete next[kind];
  return next;
};

export const defaultFilters = (): BuildingFilterState => ({});
