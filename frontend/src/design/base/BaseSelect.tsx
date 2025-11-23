"use client";
import React from 'react';
import { SizeKey, RoundKey, VariantKey, SurfaceKey } from '../tokens';
import { View } from '../../baseComponents/foundation/View';

export type SelectOption = { label: string; value: string };
export type BaseSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  size?: SizeKey;
  round?: RoundKey;
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
};

export const BaseSelect: React.FC<BaseSelectProps> = ({ value, onChange, options, className, size = SizeKey.MD, round = RoundKey.Sm, ...rest }) => {
  return (
    <View
      as="select"
      color={SurfaceKey.Surface as any}
      size={size}
      round={round}
      variant={VariantKey.Outline}
      className={[
        'st-text-on-surface',
        'st-border-width-sm',
        'st-transition-all',
        className,
      ].filter(Boolean).join(' ')}
      value={value as any}
      onChange={(e: any) => onChange(e.target.value)}
      {...rest as any}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </View>
  );
};
