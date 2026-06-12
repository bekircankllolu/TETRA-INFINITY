/** Renk kimliği (board hücre değeri) → renk. 0 = boş. */
export const CELL_COLORS: readonly string[] = [
  'transparent',
  '#00E5FF', // I — cyan
  '#FFD500', // O — sarı
  '#C341F0', // T — mor
  '#00E676', // S — yeşil
  '#FF3D5A', // Z — kırmızı
  '#3D7BFF', // J — mavi
  '#FF9100', // L — turuncu
];

export const GHOST_OPACITY = 0.28;

export const COLORS = {
  background: '#0B0E13',
  boardBackground: '#11151C',
  gridLine: '#1C222C',
  panel: '#161B23',
  panelBorder: '#242C38',
  text: '#E8EDF4',
  textDim: '#8A94A3',
  accent: '#00E5FF',
  danger: '#FF3D5A',
  overlay: 'rgba(6, 8, 12, 0.92)',
} as const;
