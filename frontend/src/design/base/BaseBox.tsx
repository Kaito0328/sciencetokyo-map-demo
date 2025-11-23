"use client";
import React from 'react';
import { View as FoundationView } from '../../baseComponents/foundation/View';
import { ColorKey, SizeKey, RoundKey, ShadowKey, VariantKey, CoreColorKey } from '../tokens';

type Intent = 'base' | 'primary' | 'secondary' | 'danger' | 'success' | 'neutral';
export type BaseBoxProps = React.HTMLAttributes<HTMLElement> & {
	intent?: Intent;
	color?: ColorKey;
	size?: SizeKey;
	round?: RoundKey;
	shadow?: ShadowKey;
	variant?: VariantKey | 'plain';
	plain?: boolean;
	styleKit?: any;
	as?: 'div'|'section'|'article'|'header'|'footer'|'main'|'nav'|'aside'|'ul'|'li'|'button'|'span'|'label';
	disabled?: boolean;
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

export const BaseBox = React.forwardRef<HTMLElement, BaseBoxProps>(({ intent, color, variant, plain, ...rest }, ref) => {
	const resolvedColor = (color ?? mapIntentToColor(intent)) as any;
	const resolvedVariant: VariantKey = (plain || variant === 'plain') ? VariantKey.Ghost : (variant ?? (resolvedColor ? VariantKey.Solid : VariantKey.Ghost));
	return (
		<FoundationView ref={ref as any} color={resolvedColor} variant={resolvedVariant} {...(rest as any)} />
	);
});
BaseBox.displayName = 'BaseBox';
