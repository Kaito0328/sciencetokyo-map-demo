export interface Building { 
  id: number; 
  name: string; 
  areaId: number; 
  top?: number; 
  left?: number; 
  xPct: number;
  yPct: number;
  code: string;
  aliases?: string[];
  rooms?: Room[];
  floors?: string[];
  importanceBase?: number;
}

export interface Area { 
  id: number; 
  name: string; 
  top: number; 
  left: number; 
  alias: string; 
  buildings: Building[];
  campusId?: number;
  rect?: { leftPct: number; topPct: number; widthPct: number; heightPct: number };
  rectTL?: { xPct: number; yPct: number };
  rectBR?: { xPct: number; yPct: number };
  centerPct?: { xPct: number; yPct: number };
  zoomOffset?: number;
  targetZoom?: number;
}

export interface Campus {
  id: number;
  name: string;
  alias: string;
}

export interface Room {
  id: number;
  buildingId: number | null;
  floorKey: string;
  roomCode: string;
  oldRoomCode?: string;
  areaSqm?: number;
  capacity?: number;
  examCapacity?: number;
  pdfUrl?: string;
}

export type Lecture = {
  id: number;
  name: string;
  title: string;
  courseCode: string;
  roomCode: string;
  room: Room;
  instructor?: string;
  department?: string;
  classFormat: string;
  mediaEnhancedCourses?: string;
  dayOfWeek?: string[];
  period?: string[];
  class?: string;
  numberOfCredits: string;
  courseOffered: number;
  offeredQuarter: string;
  updatedAt: string;
  language: string;
};
