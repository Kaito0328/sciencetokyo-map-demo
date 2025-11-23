"use client";
import React, { useMemo, useState } from 'react';
import { Room } from '../../domain/model/types';
import { BaseBox } from '../../design/base/BaseBox';
import { BaseText } from '../../design/base/BaseText';
import { BaseButton } from '../../design/base/BaseButton';
import { CoreColorKey, RoundKey, SizeKey, VariantKey } from '../../design/tokens';
import { getRoomPdfUrl } from '../../utils/roomPdf';

export type RoomListProps = {
  rooms: Room[];
  initialLimit?: number; 
};

const formatCapacity = (v: number | undefined) => (typeof v === 'number' ? `${v}` : '―');

export const RoomList: React.FC<RoomListProps> = ({ rooms, initialLimit = 5 }) => {
  const [showAll, setShowAll] = useState(false);

  const { items, hiddenCount } = useMemo(() => {
    const sorted = [...rooms].sort((a, b) => a.roomCode.localeCompare(b.roomCode, 'ja'));
    if (showAll) return { items: sorted, hiddenCount: 0 } as const;
    const slice = sorted.slice(0, Math.max(0, initialLimit));
    const rest = Math.max(0, sorted.length - slice.length);
    return { items: slice, hiddenCount: rest } as const;
  }, [rooms, showAll, initialLimit]);

  const onOpenPdf = (url: string | null | undefined) => {
    if (!url) return;
    try {
      window.open(url, '_blank', 'noopener');
    } catch {
      // no-op
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((r) => (
          <BaseBox key={r.id} color={CoreColorKey.Base} round={RoundKey.Sm} style={{ padding: 8, border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                {(() => {
                  const url = getRoomPdfUrl(r);
                  const clickable = !!url;
                  return (
                    <span
                      onClick={() => clickable && onOpenPdf(url)}
                      role={clickable ? 'button' : undefined}
                      tabIndex={clickable ? 0 : -1}
                      aria-label={clickable ? `${r.roomCode} の教室詳細PDFを開く` : undefined}
                      onKeyDown={e => { if (clickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onOpenPdf(url); } }}
                      style={{
                        cursor: clickable ? 'pointer' : 'default',
                        color: clickable ? 'var(--color-primary-text)' : 'inherit',
                        textDecoration: clickable ? 'underline' : 'none',
                        fontWeight: 500,
                      }}
                    >
                      {`${r.roomCode}${r.oldRoomCode ? `（旧: ${r.oldRoomCode}）` : ''}`}
                    </span>
                  );
                })()}
                <BaseText text={`席数: ${formatCapacity(r.capacity)} / 試験: ${formatCapacity(r.examCapacity ?? r.capacity)}`} color={CoreColorKey.Secondary} />
              </div>
            </div>
          </BaseBox>
        ))}
      </div>
      {hiddenCount > 0 && (
        <div style={{ marginTop: 8 }}>
          <BaseButton
            onClick={() => setShowAll(true)}
            color={CoreColorKey.Base}
            variant={VariantKey.Ghost}
            size={SizeKey.SM}
            round={RoundKey.Sm}
          >
            すべて表示（{hiddenCount}件）
          </BaseButton>
        </div>
      )}
      {hiddenCount === 0 && rooms.length > Math.max(0, initialLimit) && (
        <div style={{ marginTop: 8 }}>
          <BaseButton
            onClick={() => setShowAll(false)}
            color={CoreColorKey.Base}
            variant={VariantKey.Ghost}
            size={SizeKey.SM}
            round={RoundKey.Sm}
          >
            一部のみ表示
          </BaseButton>
        </div>
      )}
    </div>
  );
};

export default RoomList;
