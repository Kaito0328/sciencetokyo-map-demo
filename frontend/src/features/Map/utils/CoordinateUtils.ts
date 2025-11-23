import * as L from 'leaflet';

export function toPx(imageSize: { w: number; h: number }, topPct: number, leftPct: number) {
  const x = imageSize.w * (leftPct / 100);
  const y = imageSize.h * (topPct / 100);
  return { x, y };
}

export function toLeafletLatLng(imageSize: { w: number; h: number }, gx = 0, gy = 0): L.LatLng {
  const { x, y } = toPx(imageSize, gy, gx);
  return L.latLng(y, x);
}

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));