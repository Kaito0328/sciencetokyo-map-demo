"use client";
import React from 'react';
import { useUiStateContext } from '../../state/ui/UiStateContext';
import { BaseBox } from '../../design/base/BaseBox';
import { BaseText } from '../../design/base/BaseText';
import { useTheme } from '../../design/ThemeProvider';
import { BaseButton } from '../../design/base/BaseButton';
import { CoreColorKey, SizeKey, RoundKey, VariantKey, FontWeightKey } from '../../design/tokens';
import { FilterKind } from '../../state/ui/filters';

export const HeaderBar: React.FC = () => {
  const { filters, setFilter, clearFilter } = useUiStateContext();
  const showLectureOnly = !!filters[FilterKind.LectureOnly];
  const { theme, toggle } = useTheme();

  return (
    <BaseBox as="header" color={CoreColorKey.Primary} className="st-sticky st-top-0" style={{ zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '8px 12px' }}>
        <div />
        <div style={{ textAlign: 'center' }}>
          <BaseText text="Science Tokyo Map" className="st-fs-xl st-text-on-primary" weight={FontWeightKey.Bold} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
          <BaseButton onClick={toggle} color={CoreColorKey.Base} size={SizeKey.SM} round={RoundKey.Sm} variant={VariantKey.Solid}>
            {theme === 'light' ? '🌙' : '☀️'}
          </BaseButton>
        </div>
      </div>
    </BaseBox>
  );
};
