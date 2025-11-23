"use client";
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';

type SafePadding = { top?: number; right?: number; bottom?: number; left?: number };
const FitBoundsOnLoad: React.FC<{ imageSize: { w: number; h: number }; safePadding?: SafePadding; imageReady?: boolean }> = ({ imageSize, safePadding, imageReady }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const w = imageSize?.w ?? 0;
    const h = imageSize?.h ?? 0;
    if (!isFinite(w) || !isFinite(h) || w <= 0 || h <= 0) return;

    const bounds = L.latLngBounds([0, 0], [h, w]);
    const top = Number.isFinite(safePadding?.top) ? (safePadding!.top as number) : 0;
    const right = Number.isFinite(safePadding?.right) ? (safePadding!.right as number) : 0;
    const bottom = Number.isFinite(safePadding?.bottom) ? (safePadding!.bottom as number) : 0;
    const left = Number.isFinite(safePadding?.left) ? (safePadding!.left as number) : 0;

    const attemptFit = (label: string) => {
      try {
        const size = map.getSize?.();
        if (!size || !isFinite(size.x) || !isFinite(size.y) || size.x <= 0 || size.y <= 0) {
          console.warn('FitImageToBounds: map container has zero size, skipping fit', { label, size, imageSize, safePadding });
          return false;
        }
        map.invalidateSize();
        const baseMinZoom = (map as any).options?.minZoom ?? -5;
        map.setMinZoom(baseMinZoom);
        if (![left, top, right, bottom].every(n => Number.isFinite(n))) {
          console.warn('FitImageToBounds: invalid padding, skipping fit', { label, left, top, right, bottom, imageSize, safePadding });
          return false;
        }
        map.fitBounds(bounds, {
          animate: false,
          paddingTopLeft: L.point(left, top),
          paddingBottomRight: L.point(right, bottom),
        });
        const minZoom = map.getZoom();
        map.setMinZoom(minZoom);
        return true;
      } catch (e) {
        console.warn('FitImageToBounds: fitBounds failed', e, { label, bounds, imageSize, left, top, right, bottom, mapSize: map.getSize?.() });
        return false;
      }
    };

    const scheduleDelays = () => {
      const id = window.setTimeout(() => attemptFit('timeout-120'), 120);
      timeoutIds.push(id);
    };

    const cleanup: Array<() => void> = [];
    const timeoutIds: number[] = [];

    const tryInitial = () => {
      const success = attemptFit('initial');
      if (success) {
        scheduleDelays();
      }
      return success;
    };

    let rafId = requestAnimationFrame(() => {
      if (!tryInitial()) {
        const container = map.getContainer();
        if (container && typeof ResizeObserver !== 'undefined') {
          const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
              if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                if (attemptFit('resize-observer')) {
                  scheduleDelays();
                }
              }
            }
          });
          ro.observe(container);
          cleanup.push(() => ro.disconnect());
        } else {
          scheduleDelays();
        }
      }
    });

    const onOrientation = () => {
      attemptFit('orientationchange');
    };
    try { window.addEventListener('orientationchange', onOrientation); cleanup.push(() => window.removeEventListener('orientationchange', onOrientation)); } catch (e) {}


    cleanup.push(() => cancelAnimationFrame(rafId));
    const onStable = () => { attemptFit('stable-final'); };
    window.addEventListener('app-viewport-stable', onStable as any);
    cleanup.push(() => window.removeEventListener('app-viewport-stable', onStable as any));
    cleanup.push(() => {
      for (const id of timeoutIds) clearTimeout(id);
    });

    return () => {
      cleanup.forEach((fn) => fn());
    };
  }, [map, imageSize, safePadding, safePadding?.top, safePadding?.right, safePadding?.bottom, safePadding?.left, imageReady]);

  return null;
};

export default FitBoundsOnLoad;
