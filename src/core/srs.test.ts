import { describe, expect, test } from '@jest/globals';
import { createBoard } from './board';
import { COLS } from './constants';
import { rotated, tryRotate } from './srs';
import { pieceCells } from './tetromino';
import type { ActivePiece } from './types';

function fill(board: Uint8Array, coords: ReadonlyArray<readonly [number, number]>): void {
  for (const [x, y] of coords) board[y * COLS + x] = 1;
}

describe('rotated', () => {
  test('cw ve ccw yön aritmetiği', () => {
    expect(rotated(0, 'cw')).toBe(1);
    expect(rotated(3, 'cw')).toBe(0);
    expect(rotated(0, 'ccw')).toBe(3);
    expect(rotated(1, 'ccw')).toBe(0);
  });
});

describe('SRS — temel döndürme', () => {
  test('O parçası dönüşü kimliktir (kickIndex 0, konum aynı)', () => {
    const b = createBoard();
    const o: ActivePiece = { type: 'O', rotation: 0, x: 3, y: 10 };
    const r = tryRotate(b, o, 'cw');
    expect(r).not.toBeNull();
    expect(r!.kickIndex).toBe(0);
    expect(r!.piece).toEqual(o);
  });

  test('boş alanda dönüş kick gerektirmez (kickIndex 0)', () => {
    const b = createBoard();
    const t: ActivePiece = { type: 'T', rotation: 0, x: 4, y: 10 };
    const r = tryRotate(b, t, 'cw');
    expect(r).not.toBeNull();
    expect(r!.kickIndex).toBe(0);
    expect(r!.piece.rotation).toBe(1);
  });

  test('başarısız dönüş null döner ve parçayı değiştirmez', () => {
    const b = createBoard();
    // T'yi tamamen kuşat: dönüşün hiçbir kick'i sığamasın
    const t: ActivePiece = { type: 'T', rotation: 0, x: 4, y: 21 };
    // Alt iki satır ve çevresini doldur
    for (let y = 19; y <= 23; y++) {
      for (let x = 0; x < COLS; x++) {
        const isPiece = pieceCells(t).some(([px, py]) => px === x && py === y);
        if (!isPiece) b[y * COLS + x] = 1;
      }
    }
    const before = { ...t };
    expect(tryRotate(b, t, 'cw')).toBeNull();
    expect(t).toEqual(before);
  });
});

describe('SRS — JLSTZ duvar tekmeleri', () => {
  test('sol duvara dayalı T, 1>2 dönüşünde sağa teper (kick 1: +1,0)', () => {
    const b = createBoard();
    // rotation 1'deki T (sağa bakan): hücreler kutu x=1,2 kolonlarında.
    // Kutu x=-1'de → parça kolon 0-1'de, duvara dayalı.
    const t: ActivePiece = { type: 'T', rotation: 1, x: -1, y: 10 };
    const r = tryRotate(b, t, 'cw'); // 1>2
    expect(r).not.toBeNull();
    expect(r!.piece.rotation).toBe(2);
    // (0,0) kick'i denenir: rotation 2'de hücreler kutu x=0..2 → kolon -1 → çarpışır.
    // Kick 1 (+1, 0) uygulanır.
    expect(r!.kickIndex).toBe(1);
    expect(r!.piece.x).toBe(0);
  });

  test('T-spin tipi kick: son kick (indeks 4) kullanılır', () => {
    const b = createBoard();
    // T rotation 0, kutu (3,10); 0>1 dönüşünde rotation 1 hücreleri kutu içi
    // (1,0),(1,1),(2,1),(1,2). Kick adayları (board koordinatında, dy=-ky):
    //   kick 0 (0,0):   (4,10),(4,11),(5,11),(4,12)
    //   kick 1 (-1,0):  (3,10),(3,11),(4,11),(3,12)
    //   kick 2 (-1,-1): (3,9),(3,10),(4,10),(3,11)
    //   kick 3 (0,+2):  (4,12),(4,13),(5,13),(4,14)
    //   kick 4 (-1,+2): (3,12),(3,13),(4,13),(3,14)
    // (4,12) doldurulursa kick 0 ve 3, (3,10) doldurulursa kick 1 ve 2 engellenir;
    // kick 4 hücreleri boş kalır.
    fill(b, [
      [4, 12],
      [3, 10],
    ]);
    const t: ActivePiece = { type: 'T', rotation: 0, x: 3, y: 10 };
    const r = tryRotate(b, t, 'cw');
    expect(r).not.toBeNull();
    expect(r!.kickIndex).toBe(4);
    // Kick 4: (-1,-2) guideline → board'da x-1, y+2
    expect(r!.piece.x).toBe(2);
    expect(r!.piece.y).toBe(12);
  });
});

describe('SRS — I parçası kick tablosu (ayrı tablo)', () => {
  test('dikey I sol duvarda 1>2 dönüşünde kendi tablosuyla teper', () => {
    const b = createBoard();
    // I rotation 1: hücreler kutu x=2 kolonunda (dikey).
    // Kutu x=-2 → parça kolon 0'da, sol duvara dayalı.
    const i: ActivePiece = { type: 'I', rotation: 1, x: -2, y: 10 };
    const r = tryRotate(b, i, 'cw'); // 1>2: (0,0),(-1,0),(2,0),(-1,2),(2,-1)
    expect(r).not.toBeNull();
    // (0,0): rotation 2'de hücreler kutu satır 2, x=0..3 → kolon -2 → çarpışır.
    // kick 1 (-1,0) → daha sola, çarpışır. kick 2 (+2,0) → x=0, kolon 0..3 → sığar.
    expect(r!.kickIndex).toBe(2);
    expect(r!.piece.x).toBe(0);
    expect(r!.piece.rotation).toBe(2);
  });

  test('1 genişliğinde kuyuda dikey I dönemez (JLSTZ tablosu olsaydı yanlış geçerdi)', () => {
    const b = createBoard();
    // Kolon 4 hariç alt 6 satırı doldur → 1 genişlik kuyu
    for (let y = 18; y <= 23; y++) {
      for (let x = 0; x < COLS; x++) {
        if (x !== 4) b[y * COLS + x] = 1;
      }
    }
    // Dikey I kuyunun içinde: rotation 1, hücreler kutu x=2 → kutu x=2 → kolon 4
    const i: ActivePiece = { type: 'I', rotation: 1, x: 2, y: 19 };
    expect(tryRotate(b, i, 'cw')).toBeNull();
    expect(tryRotate(b, i, 'ccw')).toBeNull();
  });

  test('yatay I tabanda 0>1 dönüşü kick ile başarılır', () => {
    const b = createBoard();
    // I rotation 0 tabanda: kutu satır 1'de hücreler → kutu y=22 → hücreler satır 23
    const i: ActivePiece = { type: 'I', rotation: 0, x: 3, y: 22 };
    const r = tryRotate(b, i, 'cw'); // 0>1 kicks: (0,0),(-2,0),(1,0),(-2,-1),(1,2)
    expect(r).not.toBeNull();
    // (0,0): rotation 1 hücreleri kutu x=2, satır 0..3 → satır 22..25 → taban dışı, çarpışır
    // (-2,0) ve (1,0) aynı şekilde dikey sığmaz; (-2,-1) → board'da y+1 → daha derin, çarpışır
    // (1,2) → board'da y-2=20 → hücreler satır 20..23 → sığar (kickIndex 4)
    expect(r!.kickIndex).toBe(4);
    expect(r!.piece.x).toBe(4);
    expect(r!.piece.y).toBe(20);
  });
});
