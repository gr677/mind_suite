/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppTheme } from '../types/diagram';

export interface ThemeDefinition {
  id: AppTheme;
  name: string;
  badge: string;
  description: string;
  preview: {
    canvasBg: string;
    sidebarBg: string;
    accent: string;
    text: string;
  };
  canvasBg: string;
  canvasDotColor: string;
  canvasLineColor: string;
  headerClass: string;
  sidebarClass: string;
  panelClass: string;
  textPrimaryClass: string;
  textMutedClass: string;
  borderClass: string;
  accentClass: string;
  accentColorHex: string;
  isDark: boolean;
}

export const THEMES: Record<AppTheme, ThemeDefinition> = {
  dark: {
    id: 'dark',
    name: 'Midnight Blueprint',
    badge: 'Default Dark',
    description: 'Deep navy & charcoal engineering theme with crisp blue and cyan accents.',
    preview: {
      canvasBg: '#020617',
      sidebarBg: '#0f172a',
      accent: '#3b82f6',
      text: '#f8fafc',
    },
    canvasBg: '#020617',
    canvasDotColor: '#334155',
    canvasLineColor: '#1e293b',
    headerClass: 'bg-slate-950 border-slate-800 text-slate-100',
    sidebarClass: 'bg-slate-900 border-slate-800 text-slate-200',
    panelClass: 'bg-slate-900 border-slate-800 text-slate-100',
    textPrimaryClass: 'text-slate-100',
    textMutedClass: 'text-slate-400',
    borderClass: 'border-slate-800',
    accentClass: 'bg-blue-600 hover:bg-blue-500 text-white',
    accentColorHex: '#3b82f6',
    isDark: true,
  },
  light: {
    id: 'light',
    name: 'Clean Architect',
    badge: 'Light Paper',
    description: 'Bright drafting paper background with dark slate high-contrast lines and clean borders.',
    preview: {
      canvasBg: '#f8fafc',
      sidebarBg: '#ffffff',
      accent: '#2563eb',
      text: '#0f172a',
    },
    canvasBg: '#f8fafc',
    canvasDotColor: '#cbd5e1',
    canvasLineColor: '#e2e8f0',
    headerClass: 'bg-white border-slate-200 text-slate-800 shadow-xs',
    sidebarClass: 'bg-white border-slate-200 text-slate-800',
    panelClass: 'bg-white border-slate-200 text-slate-800',
    textPrimaryClass: 'text-slate-900',
    textMutedClass: 'text-slate-500',
    borderClass: 'border-slate-200',
    accentClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    accentColorHex: '#2563eb',
    isDark: false,
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyber Neon',
    badge: 'Synthwave',
    description: 'Electric midnight violet canvas with vibrant magenta, cyan, and amber neon glow.',
    preview: {
      canvasBg: '#0c051f',
      sidebarBg: '#170b3b',
      accent: '#06b6d4',
      text: '#fdf4ff',
    },
    canvasBg: '#0c051f',
    canvasDotColor: '#6b21a8',
    canvasLineColor: '#3b0764',
    headerClass: 'bg-[#12072e] border-fuchsia-900/60 text-fuchsia-100',
    sidebarClass: 'bg-[#170b3b] border-fuchsia-900/60 text-fuchsia-100',
    panelClass: 'bg-[#170b3b] border-fuchsia-900/60 text-fuchsia-100',
    textPrimaryClass: 'text-fuchsia-100',
    textMutedClass: 'text-fuchsia-300/70',
    borderClass: 'border-fuchsia-900/50',
    accentClass: 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/25',
    accentColorHex: '#d946ef',
    isDark: true,
  },
  parchment: {
    id: 'parchment',
    name: 'Drafting Parchment',
    badge: 'Sepia Drafting',
    description: 'Warm architectural drafting desk paper with rich sepia lines and golden bronze tones.',
    preview: {
      canvasBg: '#fcf8ee',
      sidebarBg: '#f4ede0',
      accent: '#b45309',
      text: '#451a03',
    },
    canvasBg: '#fbf5e6',
    canvasDotColor: '#d6c6ac',
    canvasLineColor: '#e8dbca',
    headerClass: 'bg-[#f4ede0] border-[#decbb4] text-[#451a03] shadow-xs',
    sidebarClass: 'bg-[#f4ede0] border-[#decbb4] text-[#451a03]',
    panelClass: 'bg-[#f8f2e7] border-[#decbb4] text-[#451a03]',
    textPrimaryClass: 'text-[#451a03]',
    textMutedClass: 'text-[#854d0e]',
    borderClass: 'border-[#decbb4]',
    accentClass: 'bg-amber-700 hover:bg-amber-800 text-amber-50',
    accentColorHex: '#b45309',
    isDark: false,
  },
  nord: {
    id: 'nord',
    name: 'Nordic Frost',
    badge: 'Oceanic Fjord',
    description: 'Polar arctic deep slate palette inspired by northern aurora ice and calm fjords.',
    preview: {
      canvasBg: '#1e222a',
      sidebarBg: '#252b37',
      accent: '#38bdf8',
      text: '#e2e8f0',
    },
    canvasBg: '#1e222a',
    canvasDotColor: '#475569',
    canvasLineColor: '#334155',
    headerClass: 'bg-[#191d24] border-[#333c4d] text-slate-100',
    sidebarClass: 'bg-[#252b37] border-[#333c4d] text-slate-100',
    panelClass: 'bg-[#252b37] border-[#333c4d] text-slate-100',
    textPrimaryClass: 'text-slate-100',
    textMutedClass: 'text-slate-400',
    borderClass: 'border-[#333c4d]',
    accentClass: 'bg-sky-600 hover:bg-sky-500 text-white',
    accentColorHex: '#38bdf8',
    isDark: true,
  },
  monochrome: {
    id: 'monochrome',
    name: 'Monochrome CAD',
    badge: 'High-Contrast CAD',
    description: 'Stark vector aesthetic with pure black canvas, razor-sharp white lines, and neutral gray accents.',
    preview: {
      canvasBg: '#000000',
      sidebarBg: '#111111',
      accent: '#ffffff',
      text: '#ffffff',
    },
    canvasBg: '#000000',
    canvasDotColor: '#525252',
    canvasLineColor: '#262626',
    headerClass: 'bg-black border-neutral-800 text-neutral-100',
    sidebarClass: 'bg-[#0f0f0f] border-neutral-800 text-neutral-100',
    panelClass: 'bg-[#0f0f0f] border-neutral-800 text-neutral-100',
    textPrimaryClass: 'text-white',
    textMutedClass: 'text-neutral-400',
    borderClass: 'border-neutral-800',
    accentClass: 'bg-neutral-100 hover:bg-white text-black font-semibold',
    accentColorHex: '#ffffff',
    isDark: true,
  },
};
