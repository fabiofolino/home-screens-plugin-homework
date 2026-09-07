import type { CSSProperties } from 'react';
import type { ModuleStyle } from './hs-plugin';

const FONT_STACKS: Record<string, string> = {
  inter: 'var(--font-inter), system-ui, sans-serif',
  roboto: 'var(--font-roboto), system-ui, sans-serif',
  poppins: 'var(--font-poppins), system-ui, sans-serif',
  'system-ui': 'system-ui, -apple-system, "Segoe UI", sans-serif',
  playfair: 'var(--font-playfair), Georgia, serif',
  lora: 'var(--font-lora), Georgia, serif',
  'dm-serif': 'var(--font-dm-serif), Georgia, serif',
  georgia: 'Georgia, "Times New Roman", serif',
  jetbrains: 'var(--font-jetbrains), ui-monospace, monospace',
  mono: 'ui-monospace, "SF Mono", Menlo, monospace',
  bebas: 'var(--font-bebas), Impact, sans-serif',
  caveat: 'var(--font-caveat), cursive',
  pacifico: 'var(--font-pacifico), cursive',
};

function withAlpha(color: string, opacity: number): string {
  if (!Number.isFinite(opacity) || opacity >= 1) return color;
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color || '');
  if (hex) {
    const r = parseInt(hex[1], 16), g = parseInt(hex[2], 16), b = parseInt(hex[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, opacity)})`;
  }
  const rgba = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)$/i.exec(color || '');
  if (rgba) {
    const base = rgba[4] == null ? 1 : Number(rgba[4]);
    return `rgba(${rgba[1]}, ${rgba[2]}, ${rgba[3]}, ${Math.max(0, Math.min(1, base * opacity))})`;
  }
  return color;
}

export function hostFrameStyle(style: ModuleStyle): CSSProperties {
  const fontSize = Number.isFinite(style?.fontSize) ? style.fontSize : 16;
  const padding = Number.isFinite(style?.padding) ? style.padding : 0;
  const borderRadius = Number.isFinite(style?.borderRadius) ? style.borderRadius : 0;
  const blur = Number.isFinite(style?.backdropBlur) ? style.backdropBlur : 0;
  const opacity = Number.isFinite(style?.opacity) ? style.opacity : 1;
  const borderWidth = Number.isFinite(style?.borderWidth) ? style.borderWidth! : 0;
  const shadow = Number.isFinite(style?.shadowSize) && style.shadowSize! > 0
    ? `0 ${Math.max(1, Math.round(style.shadowSize! / 2))}px ${style.shadowSize}px rgba(0,0,0,.55)`
    : undefined;
  const background = style?.backgroundColor || 'transparent';

  return {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    fontSize,
    fontFamily: FONT_STACKS[style?.fontFamily] || style?.fontFamily || 'system-ui, sans-serif',
    color: style?.textColor || '#fff',
    background: blur > 0 ? withAlpha(background, opacity) : background,
    opacity: blur > 0 ? 1 : opacity,
    borderRadius,
    padding,
    border: borderWidth > 0 ? `${borderWidth}px solid ${style?.borderColor || 'rgba(255,255,255,.15)'}` : undefined,
    boxShadow: shadow,
    backdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
    WebkitBackdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
    ['--u' as any]: String(fontSize / 16),
  };
}
