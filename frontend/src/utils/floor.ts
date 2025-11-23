export function floorNumberFromLabel(label: string): number | null {
  const t = (label || '').trim();
  if (!t) return null;
  if (t.includes('地階') || t.includes('地下')) return 0; // B1相当
  const m = t.match(/[０-９0-9]+(?=\s*階)/);
  if (m) {
    const d = m[0]
      .replace(/０/g, '0')
      .replace(/１/g, '1')
      .replace(/２/g, '2')
      .replace(/３/g, '3')
      .replace(/４/g, '4')
      .replace(/５/g, '5')
      .replace(/６/g, '6')
      .replace(/７/g, '7')
      .replace(/８/g, '8')
      .replace(/９/g, '9');
    const n = parseInt(d, 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function floorKeyFromNumber(n: number | null | undefined): string {
  if (n == null) return '';
  if (n <= 0) return 'B1';
  return String(n);
}

// 汎用に使うフロア候補（fallback用途など）
export const FLOOR_KEYS_GENERIC = ['1','2','3','4','5','6','7','8'] as const;

// 'b1' や 0 / '0' を 'B1' に、数字文字列は整数化して返す
export function normalizeFloorKey(key: string | number | null | undefined): string {
  if (key == null) return '';
  if (typeof key === 'number') return key <= 0 ? 'B1' : String(key);
  const t = String(key).trim();
  if (!t) return '';
  const up = t.toUpperCase();
  if (up === 'B' || up === 'B1' || up === 'B01') return 'B1';
  // 全角→半角
  const ascii = up
    .replace(/０/g, '0')
    .replace(/１/g, '1')
    .replace(/２/g, '2')
    .replace(/３/g, '3')
    .replace(/４/g, '4')
    .replace(/５/g, '5')
    .replace(/６/g, '6')
    .replace(/７/g, '7')
    .replace(/８/g, '8')
    .replace(/９/g, '9');
  if (/^0+$/.test(ascii)) return 'B1';
  const m = ascii.match(/^\d+$/);
  if (m) return String(parseInt(m[0], 10));
  return up; // 既に 'B1' 等の規格 or 想定外はそのまま大文字で返す
}

export function inferFloorFromRoomName(roomName: string): number | null {
  // 101, 201, 401 など先頭桁
  const m = roomName.match(/\b([1-9])\d{2}\b/);
  if (m) return parseInt(m[1], 10);
  // M-B101 など B階
  if (/\bB\d*/i.test(roomName)) return 0;
  return null;
}
