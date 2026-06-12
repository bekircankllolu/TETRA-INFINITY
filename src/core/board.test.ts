import { describe, expect, test } from '@jest/globals';
import { cellAt, clearRows, collides, createBoard, findFullRows, ghostY, mergePiece } from './board';
import { COLS, TOTAL_ROWS } from './constants';
import type { ActivePiece } from './types';

/** Test yardımcısı: verilen satırı tek delikli/deliksiz doldurur */
function fillRow(board: Uint8Array, y: number, holeX: number | null = null): void {
  for (let x = 0; x < COLS; x++) {
    if (x !== holeX) board[y * COLS + x] = 1;
  }
}

const T_PIECE: ActivePiece = { type: 'T', rotation: 0, x: 3, y: 2 };

describe('board', () => {
  test('yeni board tamamen boş', () => {
    const b = createBoard();
    expect(b.length).toBe(TOTAL_ROWS * COLS);
    expect(b.every((c) => c === 0)).toBe(true);
  });

  test('duvar çarpışmaları: sol, sağ, taban', () => {
    const b = createBoard();
    // T kutusu x=3..5 kolonlarını kullanır
    expect(collides(b, { ...T_PIECE, x: -1 })).toBe(true); // sol duvar
    expect(collides(b, { ...T_PIECE, x: COLS - 3 })).toBe(false); // sağa dayalı, sığar
    expect(collides(b, { ...T_PIECE, x: COLS - 2 })).toBe(true); // sağ duvar
    expect(collides(b, { ...T_PIECE, y: TOTAL_ROWS - 2 })).toBe(false); // tabana oturmuş
    expect(collides(b, { ...T_PIECE, y: TOTAL_ROWS - 1 })).toBe(true); // taban altı
  });

  test('tavanın üstü (y < 0) çarpışma sayılmaz', () => {
    const b = createBoard();
    expect(collides(b, { ...T_PIECE, y: -1 })).toBe(false);
  });

  test('dolu hücreyle çarpışma', () => {
    const b = createBoard();
    b[10 * COLS + 4] = 3; // (4, 10) dolu — T'nin üst çıkıntısının geleceği yer
    expect(collides(b, { ...T_PIECE, y: 9 })).toBe(true);
    expect(collides(b, { ...T_PIECE, y: 7 })).toBe(false);
  });

  test('mergePiece parçayı renk kimliğiyle işler, orijinali değiştirmez', () => {
    const b = createBoard();
    const merged = mergePiece(b, T_PIECE);
    expect(b.every((c) => c === 0)).toBe(true);
    expect(cellAt(merged, 4, 2)).toBe(3); // T rengi = 3
    expect(cellAt(merged, 3, 3)).toBe(3);
    expect(cellAt(merged, 4, 3)).toBe(3);
    expect(cellAt(merged, 5, 3)).toBe(3);
  });

  test('tam satır tespiti delikli satırı atlar', () => {
    const b = createBoard();
    fillRow(b, 23);
    fillRow(b, 22, 4); // delikli
    fillRow(b, 21);
    expect(findFullRows(b)).toEqual([21, 23]);
  });

  test('bitişik olmayan satırların temizlenmesi üsttekileri doğru kaydırır', () => {
    const b = createBoard();
    fillRow(b, 23);
    fillRow(b, 22, 0); // kalacak
    fillRow(b, 21);
    b[20 * COLS + 7] = 5; // (7, 20) işaretli hücre
    const next = clearRows(b, [21, 23]);
    // 22. satır (delikli) en alta iner, 20'deki işaret 22'ye iner
    expect(cellAt(next, 0, 23)).toBe(0);
    expect(cellAt(next, 1, 23)).toBe(1);
    expect(cellAt(next, 7, 22)).toBe(5);
    expect(findFullRows(next)).toEqual([]);
  });

  test('ghostY boş boardda parçayı tabana indirir', () => {
    const b = createBoard();
    // T kutusunun alt satırı kutu y+1'de → taban için kutu y = TOTAL_ROWS - 2
    expect(ghostY(b, T_PIECE)).toBe(TOTAL_ROWS - 2);
  });

  test('ghostY yığının üstünde durur', () => {
    const b = createBoard();
    fillRow(b, 23);
    fillRow(b, 22);
    expect(ghostY(b, T_PIECE)).toBe(TOTAL_ROWS - 4); // 2 satırlık yığının üstü
  });
});
