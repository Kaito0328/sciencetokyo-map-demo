"use client";
import { useEffect, useRef, useState } from 'react';

interface ViewportStableState {
  stable: boolean;
  currentInnerHeight: number;
  currentVVHeight: number;
  timeline: Array<{ t: number; inner: number; vv: number }>;
}

const STABLE_WINDOW_MS = 150;
const MAX_WAIT_MS = 1200;
const DELTA_THRESHOLD_PX = 4;

export function useViewportStable(): ViewportStableState {
  const [stable, setStable] = useState(false);
  const [innerH, setInnerH] = useState<number>(typeof window !== 'undefined' ? window.innerHeight : 0);
  const [vvH, setVvH] = useState<number>(typeof window !== 'undefined' ? (window.visualViewport?.height ?? window.innerHeight) : 0);
  const timelineRef = useRef<Array<{ t: number; inner: number; vv: number }>>([]);
  const lastChangeRef = useRef<number>(performance.now());
  const lastHeightsRef = useRef<{ inner: number; vv: number }>({ inner: innerH, vv: vvH });
  const startRef = useRef<number>(performance.now());
  const announcedRef = useRef(false);

  useEffect(() => {
    if (stable) return;
    const update = (src: string) => {
      const curInner = window.innerHeight;
      const curVv = window.visualViewport?.height ?? curInner;
      const now = performance.now();
      timelineRef.current.push({ t: now, inner: curInner, vv: curVv });
      if (Math.abs(curInner - lastHeightsRef.current.inner) >= DELTA_THRESHOLD_PX || Math.abs(curVv - lastHeightsRef.current.vv) >= DELTA_THRESHOLD_PX) {
        lastChangeRef.current = now;
        lastHeightsRef.current = { inner: curInner, vv: curVv };
      }
      setInnerH(curInner);
      setVvH(curVv);
      const quiet = now - lastChangeRef.current;
      const total = now - startRef.current;
      if (!stable && timelineRef.current.length >= 2 && (quiet >= STABLE_WINDOW_MS || total >= MAX_WAIT_MS)) {
        setStable(true);
      }
    };
    let raf: number;
    const loop = () => { update('frame'); if (!stable) raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    const onResize = () => update('resize');
    window.addEventListener('resize', onResize);
    const vv = window.visualViewport;
    const onVv = () => update('vv-resize');
    vv?.addEventListener('resize', onVv);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      vv?.removeEventListener('resize', onVv);
    };
  }, [stable]);

  useEffect(() => {
    if (!stable || announcedRef.current) return;
    announcedRef.current = true;
    try {
      const finalInner = window.innerHeight;
      const finalVv = window.visualViewport?.height ?? finalInner;
      const unitPx = finalInner * 0.01;
      document.documentElement.style.setProperty('--app-stable-vh', `${unitPx}px`);
      window.dispatchEvent(new CustomEvent('app-viewport-stable', { detail: { finalInner, finalVv, timeline: timelineRef.current.slice() } }));
      console.info('[viewportStable] stable', { finalInner, finalVv, unitPx, timeline: timelineRef.current });
    } catch (e) {
      console.warn('[viewportStable] announce failed', e);
    }
  }, [stable]);

  return { stable, currentInnerHeight: innerH, currentVVHeight: vvH, timeline: timelineRef.current };
}

export default useViewportStable;
