import { CoreColorKey, SurfaceKey, OnColorKey, ColorViewProperty, ColorTextProperty, SizeKey, SizeViewProperty, SizeTextProperty, RoundKey, ShadowKey, FontWeightKey, StyleState } from '../tokens';
import { TextStyleMaps, ViewStyleMaps } from '../core/types';

export const baseBoxMaps: ViewStyleMaps = {
  color: {
    [SurfaceKey.Surface]: { [StyleState.Default]: { [ColorViewProperty.Bg]: 'st-bg-surface', [ColorViewProperty.Border]: 'st-border-surface' } },
  [SurfaceKey.SurfaceAlt]: { [StyleState.Default]: { [ColorViewProperty.Bg]: 'st-bg-surface-alt', [ColorViewProperty.Border]: 'st-border-surface-alt' } },
    [CoreColorKey.Base]: { [StyleState.Default]: { [ColorViewProperty.Bg]: 'st-bg-base', [ColorViewProperty.Border]: 'st-border-base' } },
    [CoreColorKey.Primary]: { [StyleState.Default]: { [ColorViewProperty.Bg]: 'st-bg-primary', [ColorViewProperty.Border]: 'st-border-primary' }, [StyleState.Hover]: { [ColorViewProperty.Bg]: 'st-bg-primary' } },
    [CoreColorKey.Secondary]: { [StyleState.Default]: { [ColorViewProperty.Bg]: 'st-bg-secondary', [ColorViewProperty.Border]: 'st-border-secondary' } },
    [CoreColorKey.Danger]: { [StyleState.Default]: { [ColorViewProperty.Bg]: 'st-bg-danger', [ColorViewProperty.Border]: 'st-border-danger' } },
    [CoreColorKey.Success]: { [StyleState.Default]: { [ColorViewProperty.Bg]: 'st-bg-success', [ColorViewProperty.Border]: 'st-border-success' } },
  },
  size: {
    [SizeKey.SM]: { [StyleState.Default]: { [SizeViewProperty.Padding]: 'st-pad-sm', [SizeViewProperty.Gap]: 'st-gap-sm' } },
    [SizeKey.MD]: { [StyleState.Default]: { [SizeViewProperty.Padding]: 'st-pad-md', [SizeViewProperty.Gap]: 'st-gap-md' } },
    [SizeKey.LG]: { [StyleState.Default]: { [SizeViewProperty.Padding]: 'st-pad-lg', [SizeViewProperty.Gap]: 'st-gap-lg' } },
    [SizeKey.XL]: { [StyleState.Default]: { [SizeViewProperty.Padding]: 'st-pad-xl', [SizeViewProperty.Gap]: 'st-gap-xl' } },
  },
  round: {
    [RoundKey.None]: 'st-round-none',
    [RoundKey.Sm]: 'st-round-sm',
    [RoundKey.Md]: 'st-round-md',
    [RoundKey.Lg]: 'st-round-lg',
    [RoundKey.Full]: 'st-round-full',
  },
  shadow: {
    [ShadowKey.None]: 'st-shadow-none',
    [ShadowKey.Sm]: 'st-shadow-sm',
    [ShadowKey.Md]: 'st-shadow-md',
    [ShadowKey.Lg]: 'st-shadow-lg',
  },
};

export const baseTextMaps: TextStyleMaps = {
  color: {
    [SurfaceKey.OnSurface]: { [StyleState.Default]: { [ColorTextProperty.Text]: 'st-text-on-surface' } },
    [OnColorKey.OnPrimary]: { [StyleState.Default]: { [ColorTextProperty.Text]: 'st-text-on-primary' } },
    [OnColorKey.OnSecondary]: { [StyleState.Default]: { [ColorTextProperty.Text]: 'st-text-on-secondary' } },
    [OnColorKey.OnDanger]: { [StyleState.Default]: { [ColorTextProperty.Text]: 'st-text-on-danger' } },
    [OnColorKey.OnSuccess]: { [StyleState.Default]: { [ColorTextProperty.Text]: 'st-text-on-success' } },
    [CoreColorKey.Base]: { [StyleState.Default]: { [ColorTextProperty.Text]: 'st-text-base' }, [StyleState.Disabled]: { [ColorTextProperty.Text]: 'st-text-disabled' } },
    [CoreColorKey.Primary]: { [StyleState.Default]: { [ColorTextProperty.Text]: 'st-text-primary' } },
    [CoreColorKey.Secondary]: { [StyleState.Default]: { [ColorTextProperty.Text]: 'st-text-secondary' } },
    [CoreColorKey.Danger]: { [StyleState.Default]: { [ColorTextProperty.Text]: 'st-text-danger' } },
    [CoreColorKey.Success]: { [StyleState.Default]: { [ColorTextProperty.Text]: 'st-text-success' } },
  },
  size: {
    [SizeKey.SM]: { [StyleState.Default]: { [SizeTextProperty.FontSize]: 'st-fs-sm' } },
    [SizeKey.MD]: { [StyleState.Default]: { [SizeTextProperty.FontSize]: 'st-fs-md' } },
    [SizeKey.LG]: { [StyleState.Default]: { [SizeTextProperty.FontSize]: 'st-fs-lg' } },
    [SizeKey.XL]: { [StyleState.Default]: { [SizeTextProperty.FontSize]: 'st-fs-xl' } },
  },
  fontWeight: {
    [FontWeightKey.Light]: 'st-fw-light',
    [FontWeightKey.Normal]: 'st-fw-normal',
    [FontWeightKey.Medium]: 'st-fw-medium',
    [FontWeightKey.Bold]: 'st-fw-bold',
  },
};
