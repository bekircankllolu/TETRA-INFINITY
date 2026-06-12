import { describe, expect, test } from '@jest/globals';
import { ghostY } from './board';
import { COLS, TOTAL_ROWS } from './constants';
import { createInitialState, update } from './engine';
import { detectTSpin } from './tspin';
import type { ActivePiece, GameState } from './types';

function boardWith(coords: ReadonlyArray<readonly [number, number]>): Uint8Array {
  const b = new Uint8Array(TOTAL_ROWS * COLS);
  for (const [x, y] of coords) b[y * COLS + x] = 1;
  return b;
}

function makeBoard(filler: (x: number, y: number) => boolean): Uint8Array {
  const b = new Uint8Array(TOTAL_ROWS * COLS);
  for (let y = 0; y < TOTAL_ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (filler(x, y)) b[y * COLS + x] = 1;
    }
  }
  return b;
}

describe('detectTSpin — 3 köşe kuralı', () => {
  // T kutusu (3,10): merkez (4,11); köşeler (3,10),(5,10),(3,12),(5,12)
  const T0: ActivePiece = { type: 'T', rotation: 0, x: 3, y: 10 };
  const T2: ActivePiece = { type: 'T', rotation: 2, x: 3, y: 10 };

  test('son hareket rotasyon değilse asla T-spin olmaz', () => {
    const b = boardWith([
      [3, 10],
      [5, 10],
      [3, 12],
      [5, 12],
    ]);
    expect(detectTSpin(b, T0, false, -1)).toBe('none');
  });

  test('T olmayan parça için none', () => {
    const b = boardWith([
      [3, 10],
      [5, 10],
      [3, 12],
    ]);
    const s: ActivePiece = { type: 'S', rotation: 0, x: 3, y: 10 };
    expect(detectTSpin(b, s, true, 0)).toBe('none');
  });

  test('2 köşe yetmez', () => {
    const b = boardWith([
      [3, 10],
      [5, 10],
    ]);
    expect(detectTSpin(b, T0, true, 0)).toBe('none');
  });

  test('3 köşe + iki ön köşe dolu = full (rotation 0, ön = üst)', () => {
    const b = boardWith([
      [3, 10],
      [5, 10],
      [3, 12],
    ]);
    expect(detectTSpin(b, T0, true, 0)).toBe('full');
  });

  test('3 köşe ama ön köşelerden biri boş = mini', () => {
    // rotation 0'da ön = üst köşeler; (5,10) boş bırak
    const b = boardWith([
      [3, 10],
      [3, 12],
      [5, 12],
    ]);
    expect(detectTSpin(b, T0, true, 0)).toBe('mini');
  });

  test('kick indeksi 4 mini\'yi full\'e yükseltir', () => {
    const b = boardWith([
      [3, 10],
      [3, 12],
      [5, 12],
    ]);
    expect(detectTSpin(b, T0, true, 4)).toBe('full');
  });

  test('rotation 2 için ön köşeler alttakilerdir', () => {
    const b = boardWith([
      [3, 12],
      [5, 12],
      [3, 10],
    ]);
    expect(detectTSpin(b, T2, true, 0)).toBe('full');
  });

  test('duvar/taban köşe olarak dolu sayılır', () => {
    // T kutusu (-1,21): merkez (0,22); sol köşeler duvar dışı, alt köşeler taban üstü satır 23
    const b = boardWith([[1, 23]]);
    const t: ActivePiece = { type: 'T', rotation: 1, x: -1, y: 21 };
    // Köşeler: (-1,21) duvar=dolu, (1,21) boş, (-1,23) duvar=dolu, (1,23) dolu → 3 köşe
    // rotation 1: ön = sağ köşeler (1,21),(1,23) → biri boş → mini
    expect(detectTSpin(b, t, true, 0)).toBe('mini');
  });
});

describe('motor entegrasyonu — T-spin double (TSD)', () => {
  function tsdSetup(): GameState {
    // Satır 22: kolon 3,4,5 hariç dolu; satır 23: kolon 4 hariç dolu.
    // (5,21) çıkıntı → merkez (4,22)'nin köşeleri: (3,21) boş, (5,21) dolu,
    // (3,23) dolu, (5,23) dolu → 3 köşe.
    const board = makeBoard(
      (x, y) =>
        (y === 22 && x !== 3 && x !== 4 && x !== 5) || (y === 23 && x !== 4) || (x === 5 && y === 21)
    );
    // T rotation 1 yuvada, kutu (3,21): hücreler (4,21),(4,22),(5,22),(4,23)
    const piece: ActivePiece = { type: 'T', rotation: 1, x: 3, y: 21 };
    const s = createInitialState(1);
    return { ...s, board, active: piece, ghostY: ghostY(board, piece) };
  }

  test('rotasyonla kilitlenen T, 2 satır temizler: full T-spin, 1200 puan', () => {
    let s = tsdSetup();
    s = update(s, { type: 'ROTATE', dir: 'cw' }); // 1>2: T yuvaya oturur
    expect(s.active!.rotation).toBe(2);
    s = update(s, { type: 'HARD_DROP' }); // yerinde kilit (0 satır düşüş, rotasyon korunur)
    expect(s.lastClear).not.toBeNull();
    expect(s.lastClear!.tspin).toBe('full');
    expect(s.lastClear!.lines).toBe(2);
    expect(s.lastClear!.points).toBe(1200); // seviye 1, ilk temizleme (B2B yok, combo 0)
    expect(s.b2b).toBe(true);
  });

  test('çıkıntısız yuvaya düşen T sıradan double yapar (T-spin değil)', () => {
    // Aynı yuva ama çıkıntı yok ve T yukarıdan düşüyor: hard drop satır
    // kaydettiği için son hareket rotasyon sayılmaz, köşeler de < 3.
    const board = makeBoard(
      (x, y) => (y === 22 && x !== 3 && x !== 4 && x !== 5) || (y === 23 && x !== 4)
    );
    const piece: ActivePiece = { type: 'T', rotation: 1, x: 3, y: 5 };
    let s = createInitialState(1);
    s = { ...s, board, active: piece, ghostY: ghostY(board, piece) };
    s = update(s, { type: 'ROTATE', dir: 'cw' }); // havada döndü (bayrak true)
    s = update(s, { type: 'HARD_DROP' }); // ama düşüş bayrağı temizler
    expect(s.lastClear!.tspin).toBe('none');
    expect(s.lastClear!.lines).toBe(2);
  });

  test('satırsız T-spin puan verir ve B2B zincirini korur', () => {
    // Yuva var ama temizlenecek tam satır yok: sadece 3 köşe dolu
    const board = makeBoard((x, y) => (y === 23 && (x === 3 || x === 5)) || (x === 5 && y === 21));
    // T rotation 1, kutu (3,21): hücreler (4,21),(4,22),(5,22),(4,23) — boş bölge
    const piece: ActivePiece = { type: 'T', rotation: 1, x: 3, y: 21 };
    let s = createInitialState(1);
    s = { ...s, board, active: piece, ghostY: ghostY(board, piece), b2b: true, score: 0 };
    s = update(s, { type: 'ROTATE', dir: 'cw' });
    s = update(s, { type: 'HARD_DROP' });
    expect(s.lastClear!.tspin).toBe('full');
    expect(s.lastClear!.lines).toBe(0);
    expect(s.b2b).toBe(true); // satırsız T-spin zinciri BOZMAZ
    expect(s.lastClear!.points).toBe(400); // T-spin sıfır satır
  });
});
