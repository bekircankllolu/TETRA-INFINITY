import { SOFT_DROP_FACTOR } from './constants';

/** Guideline yerçekimi eğrisi: satır başına düşüş süresi (ms) */
export function gravityMs(level: number): number {
  const seconds = Math.pow(0.8 - (level - 1) * 0.007, level - 1);
  return seconds * 1000;
}

/** Soft drop aktifken satır başına süre (ms) */
export function softDropMs(level: number): number {
  return gravityMs(level) / SOFT_DROP_FACTOR;
}
