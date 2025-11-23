import { AreaRepository } from '../ports/Repository';
import { Area, Building, Campus, Room } from '../model/types';
import { normalizeFloorKey } from '../../utils/floor';

export class JsonAreaRepository implements AreaRepository {
  async getCampuses(): Promise<Campus[]> {
    const res = await fetch('/data/campus.json');
    if (!res.ok) return [];
    return res.json();
  }

  async getAreas(): Promise<Area[]> {
    const res = await fetch('/data/areas.json');
    if (!res.ok) return [];
    const areas: Area[] = await res.json();
    return areas;
  }

  private async getFloorplansManifest(): Promise<Record<string, string[]>> {
    try {
      const res = await fetch('/data/floorplans-manifest.json');
      if (!res.ok) return {};
      const m = await res.json();
      if (m && typeof m === 'object') return m as Record<string, string[]>;
      return {};
    } catch {
      return {};
    }
  }

  async getBuildings(): Promise<Building[]> {
    const [res, manifest] = await Promise.all([
      fetch('/data/buildings.json'),
      this.getFloorplansManifest(),
    ]);
    if (!res.ok) return [];
    const raw: Building[] = await res.json();
    const normalizedManifest: Record<string, string[]> = {};
    for (const [code, arr] of Object.entries(manifest)) {
      if (!Array.isArray(arr)) continue;
      const list = Array.from(new Set(arr.filter(Boolean).map((k) => normalizeFloorKey(k))));
      normalizedManifest[code] = list;
    }
    const buildings: Building[] = raw.map((b: any) => {
      const fromManifest = normalizedManifest[b?.code] ?? [];
      const existing = Array.isArray(b?.floors) ? (b.floors as string[]) : [];
      const floors = fromManifest.length > 0 ? fromManifest : existing;
      return { ...b, floors: floors ?? [] } as Building;
    });
    return buildings;
  }

  async getRooms(): Promise<Room[]> {
    try {
      const res = await fetch('/data/rooms.json');
      if (!res.ok) return [];
      const rooms: Room[] = await res.json();
      return rooms;
    } catch {
      return [];
    }
  }

  async composeAreasWithBuildings(): Promise<Area[]> {
    const [areas, buildings] = await Promise.all([this.getAreas(), this.getBuildings()]);
    return areas.map((a) => ({
      ...a,
      buildings: buildings.filter((b) => b.areaId === a.id),
    }));
  }

  async composeBuildingsWithRooms(): Promise<Building[]> {
    const [buildings, rooms] = await Promise.all([this.getBuildings(), this.getRooms()]);
    return buildings.map((building) => ({
      ...building,
      rooms: rooms.filter((room) => room.buildingId === building.id),
    }));
  }

  async composeFullData(): Promise<{
    campuses: Campus[];
    areas: Area[];
    buildings: Building[];
    rooms: Room[];
  }> {
    const [campuses, areas, buildings, rooms] = await Promise.all([
      this.getCampuses(),
      this.getAreas(),
      this.getBuildings(),
      this.getRooms(),
    ]);
    return { campuses, areas, buildings, rooms };
  }
}
