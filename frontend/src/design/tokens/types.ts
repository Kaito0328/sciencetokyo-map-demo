// Design tokens (simplified MVP version) with st- class namespace expectation
export enum CoreColorKey { Base='base', Primary='primary', Secondary='secondary', Danger='danger', Success='success' }
export enum ColorViewProperty { Bg='bg', Border='border' }
export enum ColorTextProperty { Text='text' }
export enum SurfaceKey { Surface='surface', OnSurface='onSurface', SurfaceAlt='surfaceAlt' }
export enum OnColorKey { OnBase='onBase', OnPrimary='onPrimary', OnSecondary='onSecondary', OnDanger='onDanger', OnSuccess='onSuccess' }
export type ColorKey = CoreColorKey | SurfaceKey | OnColorKey;
export enum SizeKey { SM='sm', MD='md', LG='lg', XL='xl' }
export enum SizeViewProperty { Padding='padding', PaddingHorizontal='paddingX', PaddingVertical='paddingY', Gap='gap' }
export enum SizeTextProperty { FontSize='fontSize' }
export enum RoundKey { None='none', Sm='sm', Md='md', Lg='lg', Full='full' }
export enum ShadowKey { None='none', Sm='sm', Md='md', Lg='lg' }
export enum VariantKey { Solid='solid', Outline='outline', Ghost='ghost' }
export enum FontWeightKey { Light='light', Normal='normal', Medium='medium', Bold='bold' }
export enum StyleState { Default='default', Hover='hover', Active='active', Disabled='disabled', Focus='focus' }
export type ColorViewApply = Partial<Record<StyleState, ColorViewProperty[]>>;
export type ColorTextApply = Partial<Record<StyleState, ColorTextProperty[]>>;
export type SizeViewApply = Partial<Record<StyleState, SizeViewProperty[]>>;
export type SizeTextApply = Partial<Record<StyleState, SizeTextProperty[]>>;
export type ColorViewStyleKit = { colorKey: ColorKey; apply: ColorViewApply };
export type ColorTextStyleKit = { colorKey: ColorKey; apply: ColorTextApply };
export type SizeViewKit = { sizeKey: SizeKey; apply: SizeViewApply };
export type SizeTextKit = { sizeKey: SizeKey; apply: SizeTextApply };
export type ViewStyleKit = { color: ColorViewStyleKit; size?: SizeViewKit; roundKey?: RoundKey; shadowKey?: ShadowKey; variant?: VariantKey };
export type TextStyleKit = { color: ColorTextStyleKit; size: SizeTextKit; fontWeightKey?: FontWeightKey; variant?: VariantKey };
