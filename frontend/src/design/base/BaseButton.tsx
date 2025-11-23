"use client";
import React from 'react';
import { View as FoundationView } from '../../baseComponents/foundation/View';
import { CoreColorKey, SizeKey, RoundKey, ShadowKey, VariantKey } from '../tokens';

type Intent = 'base' | 'primary' | 'secondary' | 'danger' | 'success' | 'neutral';
export type BaseButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  intent?: Intent;
  color?: CoreColorKey; 
  size?: SizeKey;
  round?: RoundKey;
  shadow?: ShadowKey;
  variant?: VariantKey | 'plain';
  plain?: boolean;
  className?: string;
  children?: React.ReactNode;
};

const mapIntentToColor = (intent?: Intent): CoreColorKey | undefined => {
  switch (intent) {
    case 'primary': return CoreColorKey.Primary;
    case 'secondary': return CoreColorKey.Secondary;
    case 'danger': return CoreColorKey.Danger;
    case 'success': return CoreColorKey.Success;
    case 'base':
    case 'neutral': return CoreColorKey.Base;
    default: return undefined;
  }
};

export const BaseButton: React.FC<BaseButtonProps> = ({ children, className, intent, color, variant, plain, style, ...rest }) => {
  const resolvedColor = color ?? mapIntentToColor(intent);
  const resolvedVariant: VariantKey = (plain || variant === 'plain') ? VariantKey.Ghost : (variant ?? VariantKey.Solid);
  return (
    <FoundationView
      as="button"
      color={resolvedColor}
      variant={resolvedVariant}
      className={["st-cursor-pointer st-transition-all", className].filter(Boolean).join(' ')}
      style={{
        border: resolvedVariant === VariantKey.Outline ? undefined : 'none',
        outline: 'none',
        WebkitAppearance: 'none',
        appearance: 'none',
        background: resolvedVariant === VariantKey.Ghost ? 'transparent' : undefined,
        ...(style || {}),
      }}
      {...rest}
    >
      {children}
    </FoundationView>
  );
};
