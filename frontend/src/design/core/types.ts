import { FontWeightKey, RoundKey, ShadowKey, StyleState } from '../tokens';
export type ViewStyleMaps = { color: Record<string, Partial<Record<StyleState, Partial<Record<string,string>>>>>, size: Record<string, Partial<Record<StyleState, Partial<Record<string,string>>>>>, round?: Record<RoundKey,string>, shadow?: Record<ShadowKey,string> };
export type TextStyleMaps = { color: Record<string, Partial<Record<StyleState, Partial<Record<string,string>>>>>, size: Record<string, Partial<Record<StyleState, Partial<Record<string,string>>>>>, fontWeight?: Record<FontWeightKey,string> };
