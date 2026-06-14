/** Renk kimliği (board hücre değeri) → düz renk (önizleme/yedek). 0 = boş. */
export const CELL_COLORS: readonly string[] = [
  'transparent',
  '#22D3EE', // I — cyan
  '#FFC93D', // O — sarı
  '#B14CF0', // T — mor
  '#3DDC68', // S — yeşil
  '#FF3D5A', // Z — kırmızı
  '#3D7BFF', // J — mavi
  '#FF9100', // L — turuncu
];

export const GHOST_OPACITY = 0.3;

/** Mockup'taki neon mor/mavi kristal palet */
export const COLORS = {
  background: '#06040F',
  boardBackground: 'rgba(8, 6, 22, 0.82)',
  gridLine: 'rgba(94, 80, 190, 0.16)',
  panel: 'rgba(16, 12, 38, 0.78)',
  panelBorder: '#3D2F7A',
  text: '#EEF0FF',
  textDim: '#8E89B8',
  accent: '#8B5CF6',
  accentCyan: '#22D3EE',
  danger: '#FF3D5A',
  overlay: 'rgba(5, 3, 14, 0.93)',
  scrim: 'rgba(5, 3, 14, 0.5)',
  gem: '#A855F7',
  coin: '#FFB020',
} as const;

/** Koleksiyon nadirlik renkleri */
export const RARITY: Record<string, string> = {
  common: '#7C89B8',
  epic: '#A855F7',
  legendary: '#FFB020',
};

/** Gradyan tonları (expo-linear-gradient) */
export const GRADIENTS = {
  primary: ['#A855F7', '#6D28D9'] as const,
  panel: ['rgba(28,22,58,0.92)', 'rgba(12,9,30,0.92)'] as const,
  board: ['rgba(14,10,34,0.86)', 'rgba(6,4,16,0.9)'] as const,
  cyan: ['#22D3EE', '#0E7490'] as const,
};
