export const FUSE_BUILDING_THRESHOLD = 0.35;
export const FUSE_ROOM_THRESHOLD = 0.35;

export const FUSE_MIN_MATCH_CHAR_LENGTH = 1;
export const FUSE_IGNORE_LOCATION = true;

export const MAX_BUILDING_RESULTS = 30;
export const MAX_ROOM_RESULTS = 30;

export const SEARCH_SUGGEST_TOP_N = 10;

export const FUSE_BUILDING_KEYS: Array<{ name: string; weight: number }> = [
  { name: 'codeN', weight: 0.7 },
  { name: 'nameN', weight: 0.4 },
];

export const FUSE_ROOM_KEYS: Array<{ name: string; weight: number }> = [
  { name: 'roomCodeN', weight: 0.7 },
  { name: 'buildingNameN', weight: 0.3 },
];
