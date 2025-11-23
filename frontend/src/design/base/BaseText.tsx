"use client";
import React from 'react';
import { Text as FoundationText } from '../../baseComponents/foundation/Text';
import { CoreColorKey, SizeKey, FontWeightKey } from '../tokens';

type Intent = 'base' | 'primary' | 'secondary' | 'danger' | 'success' | 'neutral';
export type BaseTextProps = { text: string; intent?: Intent; color?: CoreColorKey; size?: SizeKey; weight?: FontWeightKey; as?: 'span'|'p'|'label'|'strong'|'em'|'small'|'mark'; disabled?: boolean; className?: string };

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

export const BaseText: React.FC<BaseTextProps> = ({ text, intent, color, ...style }) => (
	<FoundationText color={color ?? mapIntentToColor(intent)} {...style}>{text}</FoundationText>
);
