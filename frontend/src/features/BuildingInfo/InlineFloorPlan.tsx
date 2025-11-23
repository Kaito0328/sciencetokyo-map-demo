"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { BaseBox } from '../../design/base/BaseBox';
import { BaseText } from '../../design/base/BaseText';
import { CoreColorKey, RoundKey, ShadowKey, SizeKey, VariantKey } from '../../design/tokens';
import { FLOORPLAN_MAX_IMG_HEIGHT } from './config/parameters';
import { getFloorplanSources } from './utils/floorplan';

type Props = {
  buildingCode: string;
  floorKey: string;
};

export const InlineFloorPlan: React.FC<Props> = ({ buildingCode, floorKey }) => {
  const [activeSrc, setActiveSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const sources = useMemo(() => {
    if (!floorKey) return [] as string[];
    return getFloorplanSources(buildingCode, floorKey);
  }, [buildingCode, floorKey]);

  useEffect(() => {
    setError(false);
    setActiveSrc(null);
    console.log('Trying floorplan sources:', sources);
    if (!floorKey) { setError(true); return; }
    let cancelled = false;
    (async () => {
      console.log('Trying floorplan sources:', sources);
      if (sources.length > 0) setActiveSrc(sources[0]);
      for (const src of sources) {
        const ok = await new Promise<boolean>(resolve => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = src;
        });
        if (cancelled) return;
        if (ok) { setActiveSrc(src); return; }
      }
      setError(true);
    })();
    return () => { cancelled = true; };
  }, [floorKey, sources]);

  return (
    <div style={{ padding: 8, maxWidth: 560 }}>
      {!error && !activeSrc && (<BaseText text="読み込み中..." color={CoreColorKey.Secondary} />)}
      {error && (
        <>
          <BaseText text="このフロアの画像は未準備です" color={CoreColorKey.Secondary} />
          {sources.length > 0 && (
            <BaseText text={`試行: ${sources[0]}`} color={CoreColorKey.Secondary} />
          )}
        </>
      )}
      {!!activeSrc && (
        <img src={activeSrc} alt={`floor ${floorKey}`} style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block', maxHeight: FLOORPLAN_MAX_IMG_HEIGHT }} />
      )}
        </div>
      );
};
