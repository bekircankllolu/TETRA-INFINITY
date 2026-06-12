import { describe, expect, test } from '@jest/globals';
import { drawPiece, ensureQueue } from './bag';
import { PIECE_TYPES } from './tetromino';
import type { PieceType } from './types';

function drawMany(count: number, seed: number): PieceType[] {
  const out: PieceType[] = [];
  let bag: readonly PieceType[] = [];
  let rng = seed;
  for (let i = 0; i < count; i++) {
    const d = drawPiece(bag, rng);
    out.push(d.piece);
    bag = d.bag;
    rng = d.rng;
  }
  return out;
}

describe('7-bag rastgeleleştirici', () => {
  test('her 7 çekiliş, 7 parçanın her birini tam 1 kez içerir', () => {
    const pieces = drawMany(7 * 20, 12345);
    for (let i = 0; i < 20; i++) {
      const batch = pieces.slice(i * 7, (i + 1) * 7);
      expect(new Set(batch).size).toBe(7);
    }
  });

  test('700 çekilişte her parçadan tam 100 adet çıkar', () => {
    const pieces = drawMany(700, 999);
    const counts = new Map<PieceType, number>();
    for (const p of pieces) counts.set(p, (counts.get(p) ?? 0) + 1);
    for (const type of PIECE_TYPES) {
      expect(counts.get(type)).toBe(100);
    }
  });

  test('aynı seed aynı diziyi üretir (determinizm)', () => {
    expect(drawMany(50, 42)).toEqual(drawMany(50, 42));
  });

  test('farklı seed farklı dizi üretir', () => {
    expect(drawMany(50, 1)).not.toEqual(drawMany(50, 2));
  });

  test('ensureQueue kuyruğu en az istenen boyuta tamamlar', () => {
    const { queue, bag, rng } = ensureQueue([], [], 7, 5);
    expect(queue.length).toBeGreaterThanOrEqual(5);
    expect(typeof rng).toBe('number');
    // Kuyruk + kalan torba birlikte 7-bag kuralını korur
    const drawnFromFirstBag = [...queue.slice(0, 7 - bag.length)];
    expect(new Set([...drawnFromFirstBag, ...bag]).size).toBe(7);
  });

  test('ensureQueue yeterince doluysa hiçbir şeyi değiştirmez', () => {
    const queue: readonly PieceType[] = ['I', 'O', 'T', 'S', 'Z'];
    const result = ensureQueue(queue, ['J'], 5, 5);
    expect(result.queue).toBe(queue);
    expect(result.rng).toBe(5);
  });
});
