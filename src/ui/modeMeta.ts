import type { GameMode } from '../core/types';

export interface ModeMeta {
  id: GameMode;
  name: string;
  tagline: string;
  icon: string; // MaterialCommunityIcons adı
  accent: string;
}

export const MODES: readonly ModeMeta[] = [
  {
    id: 'marathon',
    name: 'MARATHON',
    tagline: 'Olabildiğince uzun dayan.',
    icon: 'infinity',
    accent: '#8B5CF6',
  },
  {
    id: 'sprint',
    name: 'SPRINT',
    tagline: 'Hızlı. Sert. Yüksek skor.',
    icon: 'speedometer',
    accent: '#22D3EE',
  },
  {
    id: 'zen',
    name: 'ZEN',
    tagline: 'Baskı yok. Sadece akış.',
    icon: 'leaf',
    accent: '#3DDC68',
  },
];

export const modeMeta = (id: GameMode): ModeMeta => MODES.find((m) => m.id === id) ?? MODES[0]!;
