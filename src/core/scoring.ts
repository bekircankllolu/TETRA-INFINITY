import type { TSpin } from './types';

/** Satır temizleme taban puanları (×level uygulanmadan) */
const NORMAL_CLEAR: readonly number[] = [0, 100, 300, 500, 800];
const TSPIN_MINI_CLEAR: readonly number[] = [100, 200, 400];
const TSPIN_FULL_CLEAR: readonly number[] = [400, 800, 1200, 1600];

/** B2B zincirini sürdüren "zor" temizleme: tetris veya satırlı T-spin */
export function isDifficultClear(lines: number, tspin: TSpin): boolean {
  return lines === 4 || (tspin !== 'none' && lines > 0);
}

/**
 * Kilitlenme anındaki temizleme puanı.
 * b2bActive: bir önceki zor temizlemeden gelen zincir bu temizlemeye bonus verir mi.
 */
export function clearScore(lines: number, tspin: TSpin, level: number, b2bActive: boolean): number {
  let base: number;
  if (tspin === 'mini') {
    base = TSPIN_MINI_CLEAR[lines] ?? 0;
  } else if (tspin === 'full') {
    base = TSPIN_FULL_CLEAR[lines] ?? 0;
  } else {
    base = NORMAL_CLEAR[lines] ?? 0;
  }
  let points = base * level;
  if (b2bActive && isDifficultClear(lines, tspin)) {
    points = Math.floor(points * 1.5);
  }
  return points;
}

/** Combo bonusu: ardışık temizlemelerde +50 × combo × level (combo 1'den itibaren) */
export function comboScore(combo: number, level: number): number {
  return combo > 0 ? 50 * combo * level : 0;
}
