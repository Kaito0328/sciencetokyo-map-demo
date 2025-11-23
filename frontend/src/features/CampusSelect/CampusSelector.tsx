"use client";
import React from 'react';
import { useAreaDataContext } from '../../state/data/AreaDataContext';
import { useUiStateContext } from '../../state/ui/UiStateContext';
import { BaseText } from '../../design/base/BaseText';
import { BaseButton } from '../../design/base/BaseButton';
import { CoreColorKey, SizeKey, RoundKey, VariantKey, FontWeightKey } from '../../design/tokens';

export const CampusSelector: React.FC = () => {
  const { campuses } = useAreaDataContext();
  const { selectedCampusId, setSelectedCampus } = useUiStateContext();
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <BaseText text="キャンパス" weight={FontWeightKey.Medium} />
      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
        {campuses.map(c => (
          <BaseButton
            key={c.id}
            color={c.id === selectedCampusId ? CoreColorKey.Primary : CoreColorKey.Base}
            size={SizeKey.SM}
            round={RoundKey.Sm}
            variant={VariantKey.Solid}
            style={{ padding: '6px 10px' }}
            onClick={() => setSelectedCampus(c.id)}
          >
            {c.name}
          </BaseButton>
        ))}
      </div>
    </div>
  );
};
