import { Area, Building, Campus, Room, Lecture } from '../model/types';

export interface AreaRepository {
  getCampuses(): Promise<Campus[]>;
  getAreas(): Promise<Area[]>;
  getBuildings(): Promise<Building[]>;
  getRooms(): Promise<Room[]>;

  // 合成ヘルパ（利用側の利便性のための拡張契約）
  composeAreasWithBuildings(): Promise<Area[]>;
  composeBuildingsWithRooms(): Promise<Building[]>;
  composeFullData(): Promise<{
    campuses: Campus[];
    areas: Area[];
    buildings: Building[];
    rooms: Room[];
  }>;
}

export interface FloorplanRepository {
  getManifest(): Promise<Record<string, string[]>>;
}

// 講義データ取得用の契約
export interface LectureRepository {
  getLectures(): Promise<Lecture[]>;
}
