import type { ActivePiece, PieceType, Rotation } from './types';

export const PIECE_TYPES: readonly PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

/** Board hücrelerinde saklanan renk kimliği (0 = boş) */
export const PIECE_COLOR_ID: Record<PieceType, number> = {
  I: 1,
  O: 2,
  T: 3,
  S: 4,
  Z: 5,
  J: 6,
  L: 7,
};

export type Cell = readonly [number, number]; // [x, y], kutu içi ofset

/** SRS spawn şekilleri. I 4x4, diğerleri 3x3 kutu içinde tanımlı. */
const SPAWN_SHAPES: Record<PieceType, readonly Cell[]> = {
  I: [
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
  ],
  O: [
    [1, 0],
    [2, 0],
    [1, 1],
    [2, 1],
  ],
  T: [
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  S: [
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
  ],
  Z: [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
  ],
  J: [
    [0, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  L: [
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
};

export function boxSize(type: PieceType): number {
  return type === 'I' ? 4 : 3;
}

/** Kutu içinde saat yönünde döndürme: (x, y) -> (N-1-y, x) */
function rotateCellsCw(cells: readonly Cell[], n: number): Cell[] {
  return cells.map(([x, y]) => [n - 1 - y, x] as const);
}

function sortCells(cells: readonly Cell[]): Cell[] {
  return [...cells].sort(([ax, ay], [bx, by]) => ay - by || ax - bx);
}

/** Önceden hesaplanmış: SHAPES[type][rotation] = hücre ofsetleri */
const SHAPES: Record<PieceType, readonly (readonly Cell[])[]> = (() => {
  const out = {} as Record<PieceType, readonly (readonly Cell[])[]>;
  for (const type of PIECE_TYPES) {
    const rotations: (readonly Cell[])[] = [sortCells(SPAWN_SHAPES[type])];
    for (let r = 1; r < 4; r++) {
      // O parçası dönerken değişmez
      const prev = rotations[r - 1]!;
      rotations.push(type === 'O' ? prev : sortCells(rotateCellsCw(prev, boxSize(type))));
    }
    out[type] = rotations;
  }
  return out;
})();

export function cellsOf(type: PieceType, rotation: Rotation): readonly Cell[] {
  return SHAPES[type][rotation]!;
}

/** Parçanın board üzerindeki mutlak hücre koordinatları */
export function pieceCells(piece: ActivePiece): Cell[] {
  return cellsOf(piece.type, piece.rotation).map(([cx, cy]) => [piece.x + cx, piece.y + cy] as const);
}

/**
 * Spawn konumu: kutu x=3'te ortalanır; parça gizli satırların en altında
 * (satır 2-3), görünür alanın hemen üzerinde doğar.
 */
export function spawnPiece(type: PieceType): ActivePiece {
  return { type, rotation: 0, x: 3, y: 2 };
}
