"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { Building, Room } from '../../domain/model/types';
import { BaseBox } from '../../design/base/BaseBox';
import { BaseText } from '../../design/base/BaseText';
import { BaseButton } from '../../design/base/BaseButton';
import { CoreColorKey, SizeKey, RoundKey, VariantKey, FontWeightKey } from '../../design/tokens';
import { InlineFloorPlan } from './InlineFloorPlan';
import { floorKeyFromNumber } from '../../utils/floor';
import { RoomList } from './RoomList';

export const DetailPanelContent: React.FC<{ building: Building; onClose: () => void; initialOpenFloorKey?: string }>
  = ({ building, onClose, initialOpenFloorKey }) => {
  const rooms = useMemo(() => building.rooms ?? [], [building.rooms]);
  const [inlineOpenByFloorKey, setInlineOpenByFloorKey] = useState<Record<string, boolean>>({});
  const domainFloors = useMemo(() => (Array.isArray(building.floors) ? (building.floors.filter(Boolean) as string[]) : []), [building.floors]);
  const hasMapByFloor = useMemo(() => {
    const m: Record<string, boolean> = {};
    domainFloors.forEach((fk) => { m[fk] = true; });
    return m;
  }, [domainFloors]);
  const [isMobile, setIsMobile] = useState(false);
  const [showRoomInfo, setShowRoomInfo] = useState<boolean>(true);

  const [envReady, setEnvReady] = useState(false);
  useEffect(() => {
    const mqWidth = window.matchMedia('(max-width: 768px)');
    const mqTouch = window.matchMedia('(pointer: coarse)');
    const update = () => setIsMobile(mqWidth.matches || mqTouch.matches);
    update();
    mqWidth.addEventListener('change', update);
    mqTouch.addEventListener('change', update);
    setEnvReady(true);
    return () => {
      mqWidth.removeEventListener('change', update);
      mqTouch.removeEventListener('change', update);
    };
  }, []);

  const [showRoomInfoByFloor, setShowRoomInfoByFloor] = useState<Record<string, boolean>>({});

  const groups = useMemo(() => {
    const map = new Map<number, Room[]>();
    rooms.forEach(r => {
      const fk = r.floorKey;
      const f = fk === 'B1' ? 0 : (parseInt(fk, 10) || 0);
      if (!map.has(f)) map.set(f, []);
      map.get(f)!.push(r);
    });
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [rooms]);

  const roomsByFloorKey = useMemo(() => {
    const m = new Map<string, Room[]>();
    groups.forEach(([floorNum, rs]) => {
      const fk = floorKeyFromNumber(floorNum);
      m.set(fk, rs);
    });
    return m;
  }, [groups]);

  const displayFloorKeys = useMemo(() => {
    const s = new Set<string>();
    domainFloors.forEach((fk) => s.add(fk));
    rooms.forEach((r) => s.add(r.floorKey));
    return Array.from(s).sort((a, b) => {
      const an = a === 'B1' ? 0 : (parseInt(a, 10) || 0);
      const bn = b === 'B1' ? 0 : (parseInt(b, 10) || 0);
      return bn - an;
    });
  }, [domainFloors, rooms]);

  useEffect(() => {
    if (!initialOpenFloorKey) return;
    if (hasMapByFloor[initialOpenFloorKey]) {
      setInlineOpenByFloorKey(s => ({ ...s, [initialOpenFloorKey]: true }));
    }
  }, [initialOpenFloorKey, hasMapByFloor]);

  useEffect(() => {
    if (!envReady || isMobile) return;
    const keys = Object.keys(hasMapByFloor).filter(k => hasMapByFloor[k]);
    if (keys.length === 0) return;
    const openCount = Object.values(inlineOpenByFloorKey).filter(Boolean).length;
    if (openCount > 0) return;
    setInlineOpenByFloorKey(prev => {
      const next = { ...prev } as Record<string, boolean>;
      keys.forEach(k => { next[k] = true; });
      return next;
    });
  }, [envReady, isMobile, hasMapByFloor, inlineOpenByFloorKey]);
  useEffect(() => {
    setShowRoomInfo(!isMobile);
  }, [isMobile]);

  return (
    <div>

  <BaseText text={`(${building.code})`} color={CoreColorKey.Secondary} />

      {displayFloorKeys.length === 0 ? (
        <BaseText color={CoreColorKey.Secondary} text="部屋情報がありません" />
      ) : (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {displayFloorKeys.map((fk) => {
            const mapOpen = !!inlineOpenByFloorKey[fk];
            const rs = roomsByFloorKey.get(fk) ?? [];
            const roomCount = rs.length;
            const maxCap = rs.reduce((mx, r) => Math.max(mx, r.capacity ?? 0), 0);
            const maxExam = rs.reduce((mx, r) => Math.max(mx, (r.examCapacity ?? r.capacity ?? 0)), 0);
            const floorNum = fk === 'B1' ? 0 : (parseInt(fk, 10) || 0);
            const label = fk === 'B1' ? '地階' : `${floorNum}階`;
            return (
              <BaseBox key={fk} style={{ overflow: 'hidden' }}>
                <BaseButton
                  onClick={() => setInlineOpenByFloorKey(s => ({ ...s, [fk]: !s[fk] }))}
                  variant={VariantKey.Ghost}
                  size={SizeKey.SM}
                  round={RoundKey.None}
                  plain
                  style={{ width: '100%', textAlign: 'left' }}
                  aria-expanded={mapOpen}
                >
                  {mapOpen
                    ? (roomCount > 0 ? `▲ ${label} ・ 部屋 ${roomCount} / 最大 ${maxCap} / 試験 ${maxExam}` : `▲ ${label}`)
                    : (roomCount > 0 ? `▼ ${label} ・ 部屋 ${roomCount} / 最大 ${maxCap} / 試験 ${maxExam}` : `▼ ${label}`)}
                </BaseButton>
                {mapOpen && (
                  <>
                    {hasMapByFloor[fk] && (
                      <div style={{ marginTop: 8 }}>
                        <InlineFloorPlan buildingCode={building.code} floorKey={fk} />
                      </div>
                    )}
                    {roomCount > 0 && (
                      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                        <BaseButton
                          onClick={() => setShowRoomInfoByFloor(s => ({ ...s, [fk]: !(s[fk] ?? showRoomInfo) }))}
                          variant={VariantKey.Ghost}
                          size={SizeKey.SM}
                          round={RoundKey.None}
                          plain
                        >
                          <BaseText color={CoreColorKey.Primary} text={(showRoomInfoByFloor[fk] ?? showRoomInfo) ? '- 部屋情報を非表示' : '+ 部屋情報を表示'} />
                        </BaseButton>
                      </div>
                    )}
                    {roomCount > 0 && (showRoomInfoByFloor[fk] ?? showRoomInfo) && (
                      <BaseBox style={{ marginTop: 8 }}>
                        <RoomList rooms={rs} initialLimit={5} />
                      </BaseBox>
                    )}
                  </>
                )}
              </BaseBox>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DetailPanelContent;
