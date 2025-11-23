import { Room } from '../domain/model/types';

export function getRoomPdfUrl(room: Room, campusSlug: string = 'ookayama'): string | null {
  const raw = (room.roomCode || '').trim();
  if (!raw) return null;
  const codeLower = raw.toLowerCase();
  return `https://www.titech.ac.jp/student/pdf/facilities-rooms-${campusSlug}-${codeLower}.pdf`;
}
