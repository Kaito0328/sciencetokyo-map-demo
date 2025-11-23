"use client";
import React from 'react';
import { SizeKey, RoundKey, VariantKey, SurfaceKey } from '../tokens';
import { View } from '../../baseComponents/foundation/View';

export type BaseInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  size?: SizeKey;
  round?: RoundKey;
};

export const BaseInput: React.FC<BaseInputProps> = ({ className, size = SizeKey.MD, round = RoundKey.Sm, ...rest }) => (
  <View
    as="input"
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
    {...rest}
  />
);
