import type { FloorplanRepository } from '../ports/Repository';

export class JsonFloorplanRepository implements FloorplanRepository {
  async getManifest(): Promise<Record<string, string[]>> {
    try {
      const res = await fetch('/data/floorplans-manifest.json');
      if (!res.ok) return {};
      return (await res.json()) as Record<string, string[]>;
    } catch {
      return {};
    }
  }
}
