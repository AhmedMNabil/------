import type { DensityPreference, RadiusPreference } from './types';

export type { DensityPreference, RadiusPreference };

export const DEFAULT_SIDEBAR_COLOR = '#0C1211';
export const DEFAULT_ACCENT_COLOR = '#0D7A6E';

export type AppearanceFields = {
  accentColor: string;
  sidebarColor: string;
  canvasColor: string;
  bubbleColor: string;
  radius: RadiusPreference;
  density: DensityPreference;
  ambient: boolean;
};

export const DEFAULT_APPEARANCE: AppearanceFields = {
  accentColor: DEFAULT_ACCENT_COLOR,
  sidebarColor: DEFAULT_SIDEBAR_COLOR,
  canvasColor: '',
  bubbleColor: '',
  radius: 'lg',
  density: 'comfortable',
  ambient: true,
};

export const APPEARANCE_PRESETS = [
  {
    id: 'forest',
    label: 'غابة',
    accent: '#0D7A6E',
    sidebar: '#0C1211',
    canvas: '',
    bubble: '',
  },
  {
    id: 'ocean',
    label: 'محيط',
    accent: '#2563EB',
    sidebar: '#0B1220',
    canvas: '',
    bubble: '',
  },
  {
    id: 'violet',
    label: 'بنفسجي',
    accent: '#7C3AED',
    sidebar: '#16101F',
    canvas: '',
    bubble: '',
  },
  {
    id: 'rose',
    label: 'ورد',
    accent: '#E11D48',
    sidebar: '#1A1014',
    canvas: '',
    bubble: '',
  },
  {
    id: 'sunset',
    label: 'غروب',
    accent: '#EA580C',
    sidebar: '#1A120C',
    canvas: '',
    bubble: '',
  },
  {
    id: 'sand',
    label: 'رمل',
    accent: '#B45309',
    sidebar: '#1C1812',
    canvas: '',
    bubble: '',
  },
  {
    id: 'midnight',
    label: 'منتصف الليل',
    accent: '#38BDF8',
    sidebar: '#020617',
    canvas: '#070B14',
    bubble: '#121A28',
  },
  {
    id: 'paper',
    label: 'ورق',
    accent: '#0F766E',
    sidebar: '#EEEAE4',
    canvas: '#FBF7F0',
    bubble: '#EFE4D4',
  },
] as const;

export const ACCENT_SWATCHES = [
  { hex: '#0D7A6E', label: 'تركواز' },
  { hex: '#2563EB', label: 'أزرق' },
  { hex: '#7C3AED', label: 'بنفسجي' },
  { hex: '#E11D48', label: 'وردي' },
  { hex: '#EA580C', label: 'برتقالي' },
  { hex: '#059669', label: 'أخضر' },
  { hex: '#CA8A04', label: 'ذهبي' },
  { hex: '#64748B', label: 'رمادي' },
] as const;

export const SIDEBAR_PRESETS = [
  { id: 'forest', hex: '#0C1211', label: 'غابة' },
  { id: 'navy', hex: '#0F172A', label: 'كحلي' },
  { id: 'slate', hex: '#18181B', label: 'فحمي' },
  { id: 'teal', hex: '#134E4A', label: 'تركواز' },
  { id: 'wine', hex: '#4A1C2F', label: 'خمري' },
  { id: 'violet', hex: '#16101F', label: 'بنفسجي' },
  { id: 'light', hex: '#EEEEEC', label: 'فاتح' },
] as const;

export const CANVAS_SWATCHES = [
  { hex: '#F7F8F6', label: 'نعناعي' },
  { hex: '#FBF7F0', label: 'ورق' },
  { hex: '#F4F6FB', label: 'بارد' },
  { hex: '#FAFAF9', label: 'حجر' },
  { hex: '#0C1211', label: 'زيتوني' },
  { hex: '#0B1220', label: 'كحلي' },
  { hex: '#070B14', label: 'ليلي' },
  { hex: '#111111', label: 'أسود' },
] as const;

export const BUBBLE_SWATCHES = [
  { hex: '#E4EAE7', label: 'نعناعي' },
  { hex: '#EFE4D4', label: 'رملي' },
  { hex: '#DBEAFE', label: 'سماوي' },
  { hex: '#EDE9FE', label: 'بنفسجي' },
  { hex: '#1E293B', label: 'كحلي' },
  { hex: '#0D7A6E', label: 'علامة' },
] as const;

type RGB = [number, number, number];

export function normalizeHex(input: string, fallback = DEFAULT_SIDEBAR_COLOR): string {
  let hex = (input || '').trim().replace('#', '').toLowerCase();
  if (/^[0-9a-f]{3}$/.test(hex)) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  if (!/^[0-9a-f]{6}$/.test(hex)) return fallback;
  return `#${hex}`;
}

function hexToRgb(hex: string, fallback = DEFAULT_SIDEBAR_COLOR): RGB {
  const h = normalizeHex(hex, fallback).slice(1);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const toLin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

function mix(from: RGB, to: RGB, t: number): RGB {
  return [
    Math.round(from[0] + (to[0] - from[0]) * t),
    Math.round(from[1] + (to[1] - from[1]) * t),
    Math.round(from[2] + (to[2] - from[2]) * t),
  ];
}

function rgbToken(rgb: RGB): string {
  return `${rgb[0]} ${rgb[1]} ${rgb[2]}`;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return [h * 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const hh = (((h % 360) + 360) % 360) / 360;
  let r: number;
  let g: number;
  let b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      let tt = t;
      if (tt < 0) tt += 1;
      if (tt > 1) tt -= 1;
      if (tt < 1 / 6) return p + (q - p) * 6 * tt;
      if (tt < 1 / 2) return q;
      if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, hh + 1 / 3);
    g = hue2rgb(p, q, hh);
    b = hue2rgb(p, q, hh - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export function isLightColor(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex);
  return relativeLuminance(r, g, b) > 0.45;
}

export const isLightSidebarColor = isLightColor;

function setToken(root: HTMLElement, name: string, rgb: RGB): void {
  root.style.setProperty(name, rgbToken(rgb));
}

function clearTokens(root: HTMLElement, names: string[]): void {
  names.forEach((name) => root.style.removeProperty(name));
}

/** Paints nav tokens on <html> so every `bg-nav` surface follows the chosen color. */
export function applySidebarColor(hex: string, root: HTMLElement = document.documentElement): void {
  const color = normalizeHex(hex, DEFAULT_SIDEBAR_COLOR);
  const rgb = hexToRgb(color);
  const light = relativeLuminance(...rgb) > 0.45;
  const ink: RGB = light ? [17, 24, 22] : [241, 245, 243];
  const muted: RGB = light ? [88, 98, 95] : [156, 168, 164];
  const faint: RGB = light ? [132, 142, 138] : [112, 124, 120];

  setToken(root, '--c-nav', rgb);
  setToken(root, '--c-nav-ink', ink);
  setToken(root, '--c-nav-muted', muted);
  setToken(root, '--c-nav-faint', faint);
  setToken(root, '--c-nav-line', mix(rgb, ink, light ? 0.14 : 0.18));
  root.dataset.sidebar = light ? 'light' : 'dark';
}

function applyAccentColor(hex: string, dark: boolean, root: HTMLElement): void {
  let rgb = hexToRgb(hex, DEFAULT_ACCENT_COLOR);
  const [h, s, l] = rgbToHsl(...rgb);
  if (dark && l < 0.5) {
    rgb = hslToRgb(h, Math.min(0.75, s + 0.04), 0.58);
  } else if (!dark && l > 0.72) {
    rgb = hslToRgb(h, s, 0.42);
  }

  const brandInk: RGB = relativeLuminance(...rgb) > 0.55 ? [8, 24, 22] : [255, 255, 255];
  const gold: RGB = dark ? [232, 179, 73] : [201, 148, 46];
  const accent = mix(rgb, gold, 0.68);

  setToken(root, '--c-brand', rgb);
  setToken(root, '--c-brand-ink', brandInk);
  setToken(root, '--c-accent', accent);
  root.style.setProperty('--shadow-brand', `0 8px 24px rgb(${rgbToken(rgb)} / 0.28)`);
}

function applyCanvasColor(hex: string, root: HTMLElement): RGB | null {
  const canvasKeys = ['--c-canvas', '--c-surface', '--c-elevated', '--c-line', '--c-ink', '--c-muted', '--c-faint'];
  if (!hex) {
    clearTokens(root, canvasKeys);
    return null;
  }

  const rgb = hexToRgb(hex, '#F7F8F6');
  const light = relativeLuminance(...rgb) > 0.45;
  const ink: RGB = light ? [17, 24, 22] : [236, 240, 238];
  const white: RGB = [255, 255, 255];
  const black: RGB = [8, 10, 10];

  setToken(root, '--c-canvas', rgb);
  setToken(root, '--c-surface', mix(rgb, light ? black : white, light ? 0.045 : 0.07));
  setToken(root, '--c-elevated', mix(rgb, white, light ? 0.78 : 0.09));
  setToken(root, '--c-line', mix(rgb, ink, light ? 0.12 : 0.18));
  setToken(root, '--c-ink', ink);
  setToken(root, '--c-muted', mix(ink, rgb, 0.42));
  setToken(root, '--c-faint', mix(ink, rgb, 0.62));
  return rgb;
}

function applyBubbleFrom(rgb: RGB, root: HTMLElement): void {
  const light = relativeLuminance(...rgb) > 0.45;
  const ink: RGB = light ? [17, 24, 22] : [241, 245, 243];
  setToken(root, '--c-bubble', rgb);
  setToken(root, '--c-bubble-ink', ink);
}

function applyBubbleColor(hex: string, canvasRgb: RGB | null, root: HTMLElement): void {
  if (hex) {
    applyBubbleFrom(hexToRgb(hex, '#E4EAE7'), root);
    return;
  }
  if (canvasRgb) {
    const light = relativeLuminance(...canvasRgb) > 0.45;
    const ink: RGB = light ? [17, 24, 22] : [236, 240, 238];
    applyBubbleFrom(mix(canvasRgb, ink, light ? 0.09 : 0.14), root);
    return;
  }
  clearTokens(root, ['--c-bubble', '--c-bubble-ink']);
}

export type AppearanceApplyInput = AppearanceFields & { dark: boolean };

export function applyAppearance(
  input: AppearanceApplyInput,
  root: HTMLElement = document.documentElement,
): void {
  applySidebarColor(input.sidebarColor || DEFAULT_SIDEBAR_COLOR, root);
  applyAccentColor(input.accentColor || DEFAULT_ACCENT_COLOR, input.dark, root);
  const canvasRgb = applyCanvasColor(input.canvasColor || '', root);
  applyBubbleColor(input.bubbleColor || '', canvasRgb, root);
  root.dataset.radius = input.radius || 'lg';
  root.dataset.density = input.density || 'comfortable';
  root.dataset.ambient = input.ambient === false ? 'off' : 'on';
}

export function matchingPresetId(hex: string): string | 'custom' {
  const color = normalizeHex(hex, DEFAULT_SIDEBAR_COLOR).toLowerCase();
  const found = SIDEBAR_PRESETS.find((p) => p.hex.toLowerCase() === color);
  return found?.id ?? 'custom';
}

export function matchingAppearancePreset(fields: Pick<AppearanceFields, 'accentColor' | 'sidebarColor' | 'canvasColor' | 'bubbleColor'>): string | 'custom' {
  const accent = normalizeHex(fields.accentColor || DEFAULT_ACCENT_COLOR, DEFAULT_ACCENT_COLOR).toLowerCase();
  const sidebar = normalizeHex(fields.sidebarColor || DEFAULT_SIDEBAR_COLOR, DEFAULT_SIDEBAR_COLOR).toLowerCase();
  const canvas = (fields.canvasColor || '').trim().toLowerCase();
  const bubble = (fields.bubbleColor || '').trim().toLowerCase();

  const found = APPEARANCE_PRESETS.find((p) => {
    const sameAccent = p.accent.toLowerCase() === accent;
    const sameSidebar = p.sidebar.toLowerCase() === sidebar;
    const sameCanvas = (p.canvas || '').toLowerCase() === canvas;
    const sameBubble = (p.bubble || '').toLowerCase() === bubble;
    return sameAccent && sameSidebar && sameCanvas && sameBubble;
  });
  return found?.id ?? 'custom';
}

export function appearanceFromPreset(id: string): Partial<AppearanceFields> | null {
  const preset = APPEARANCE_PRESETS.find((p) => p.id === id);
  if (!preset) return null;
  return {
    accentColor: preset.accent,
    sidebarColor: preset.sidebar,
    canvasColor: preset.canvas,
    bubbleColor: preset.bubble,
  };
}
