import { describe, expect, test } from '@jest/globals';
import { clearScore, comboScore, isDifficultClear } from './scoring';

describe('puan tablosu', () => {
  test('normal temizlemeler ×level', () => {
    expect(clearScore(1, 'none', 1, false)).toBe(100);
    expect(clearScore(2, 'none', 1, false)).toBe(300);
    expect(clearScore(3, 'none', 1, false)).toBe(500);
    expect(clearScore(4, 'none', 1, false)).toBe(800);
    expect(clearScore(2, 'none', 3, false)).toBe(900); // 300 × 3
    expect(clearScore(0, 'none', 5, false)).toBe(0);
  });

  test('T-spin puanları', () => {
    expect(clearScore(0, 'full', 1, false)).toBe(400);
    expect(clearScore(1, 'full', 1, false)).toBe(800);
    expect(clearScore(2, 'full', 1, false)).toBe(1200);
    expect(clearScore(3, 'full', 1, false)).toBe(1600);
    expect(clearScore(0, 'mini', 1, false)).toBe(100);
    expect(clearScore(1, 'mini', 1, false)).toBe(200);
    expect(clearScore(2, 'mini', 1, false)).toBe(400);
    expect(clearScore(1, 'full', 2, false)).toBe(1600); // ×level
  });

  test('B2B bonusu sadece zor temizlemelere ×1.5 uygular', () => {
    expect(clearScore(4, 'none', 1, true)).toBe(1200); // tetris B2B
    expect(clearScore(2, 'full', 1, true)).toBe(1800); // TSD B2B
    expect(clearScore(1, 'none', 1, true)).toBe(100); // single'a bonus yok
    expect(clearScore(0, 'full', 1, true)).toBe(400); // satırsız T-spin'e bonus yok
  });

  test('zor temizleme tanımı', () => {
    expect(isDifficultClear(4, 'none')).toBe(true);
    expect(isDifficultClear(1, 'full')).toBe(true);
    expect(isDifficultClear(1, 'mini')).toBe(true);
    expect(isDifficultClear(3, 'none')).toBe(false);
    expect(isDifficultClear(0, 'full')).toBe(false); // satırsız: zinciri sürdürmez ama bozmaz
  });

  test('combo bonusu', () => {
    expect(comboScore(-1, 1)).toBe(0);
    expect(comboScore(0, 1)).toBe(0); // ilk temizleme bonussuz
    expect(comboScore(1, 1)).toBe(50);
    expect(comboScore(3, 2)).toBe(300); // 50 × 3 × 2
  });
});
