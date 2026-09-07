import type { CSSProperties } from 'react';

export interface ModuleStyle {
  fontSize: number;
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  borderRadius: number;
  padding: number;
  opacity: number;
  backdropBlur: number;
  borderWidth?: number;
  borderColor?: string;
  shadowSize?: number;
}

export interface PluginComponentProps {
  config: Record<string, unknown>;
  style: ModuleStyle;
  timezone?: string;
}

declare global {
  interface Window {
    __HS_SDK__?: {
      pluginFetch?: (pluginId: string, options: {
        url: string;
        method?: string;
        cacheTtlMs?: number;
      }) => Promise<Response>;
      displayCache?: {
        get?: (key: string) => unknown;
        set?: (key: string, value: unknown) => void;
      };
    };
  }
}

export type StyleObject = CSSProperties;
