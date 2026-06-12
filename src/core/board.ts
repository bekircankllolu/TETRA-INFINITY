import { COLS, TOTAL_ROWS } from './constants';
import { PIECE_COLOR_ID, pieceCells } from './tetromino';
import type { ActivePiece } from './types';

export function createBoard(): Uint8Array {
  return new Uint8Array(TOTAL_ROWS * COLS);
}

export function cellAt(board: Uint8Array, x: number, y: number): number {
  return board[y * COLS + x] ?? 0;
}

/**
 * Parça (px, py ofsetiyle kaydırılmış halde) çarpışıyor mu?
 * Yanlar ve taban duvar; tavanın üstü (y < 0) boş kabul edilir.
 */
export function collides(board: Uint8Array, piece: ActivePiece, dx = 0, dy = 0): boolean {
  for (const [cx, cy] of pieceCells(piece)) {
    const x = cx + dx;
    const y = cy + dy;
    if (x < 0 || x >= COLS || y >= TOTAL_ROWS) return true;
    if (y >= 0 && cellAt(board, x, y) !== 0) return true;
  }
  return false;
}

/** Parçayı board'a işler; yeni bir kopya döner */
export function mergePiece(board: Uint8Array, piece: ActivePiece): Uint8Array {
  const next = board.slice();
  const color = PIECE_COLOR_ID[piece.type];
  for (const [x, y] of pieceCells(piece)) {
    if (y >= 0 && y < TOTAL_ROWS && x >= 0 && x < COLS) {
      next[y * COLS + x] = color;
    }
  }
  return next;
}

export function findFullRows(board: Uint8Array): number[] {
  const rows: number[] = [];
  for (let y = 0; y < TOTAL_ROWS; y++) {
    let full = true;
    for (let x = 0; x < COLS; x++) {
      if (cellAt(board, x, y) === 0) {
        full = false;
        break;
      }
    }
    if (full) rows.push(y);
  }
  return rows;
}

/** Verilen satırları siler, üsttekileri aşağı kaydırır; yeni kopya döner */
export function clearRows(board: Uint8Array, rows: readonly number[]): Uint8Array {
  if (rows.length === 0) return board;
  const cleared = new Set(rows);
  const next = createBoard();
  let writeY = TOTAL_ROWS - 1;
  for (let y = TOTAL_ROWS - 1; y >= 0; y--) {
    if (cleared.has(y)) continue;
    next.set(board.subarray(y * COLS, (y + 1) * COLS), writeY * COLS);
    writeY--;
  }
  return next;
}

/** Parçanın hard drop ile oturacağı y (kutu köşesi cinsinden) */
export function ghostY(board: Uint8Array, piece: ActivePiece): number {
  let dy = 0;
  while (!collides(board, piece, 0, dy + 1)) dy++;
  return piece.y + dy;
}
