export interface RngResult {
  readonly value: number; // [0, 1)
  readonly state: number;
}

/** mulberry32 — seed'lenebilir, deterministik, saf PRNG. Durum dışarıda taşınır. */
export function nextRandom(state: number): RngResult {
  const s = (state + 0x6d2b79f5) | 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, state: s };
}
