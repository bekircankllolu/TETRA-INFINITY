import { collides } from './board';
import type { ActivePiece, RotateDir, Rotation } from './types';

/**
 * SRS duvar tekmesi tabloları.
 * Kaynak tablolar guideline konvansiyonunda (+y yukarı) yazılmıştır;
 * board koordinatlarımız +y aşağı olduğundan uygulama sırasında dy negatiflenir.
 */
type Kick = readonly [number, number];
type KickTable = Record<string, readonly Kick[]>;

const JLSTZ_KICKS: KickTable = {
  '0>1': [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  '1>0': [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  '1>2': [
    [0, 0],
    [1, 0],
    [1, -1],
    [0, 2],
    [1, 2],
  ],
  '2>1': [
    [0, 0],
    [-1, 0],
    [-1, 1],
    [0, -2],
    [-1, -2],
  ],
  '2>3': [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
  '3>2': [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  '3>0': [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, 2],
    [-1, 2],
  ],
  '0>3': [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, -2],
    [1, -2],
  ],
};

const I_KICKS: KickTable = {
  '0>1': [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ],
  '1>0': [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ],
  '1>2': [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ],
  '2>1': [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ],
  '2>3': [
    [0, 0],
    [2, 0],
    [-1, 0],
    [2, 1],
    [-1, -2],
  ],
  '3>2': [
    [0, 0],
    [-2, 0],
    [1, 0],
    [-2, -1],
    [1, 2],
  ],
  '3>0': [
    [0, 0],
    [1, 0],
    [-2, 0],
    [1, -2],
    [-2, 1],
  ],
  '0>3': [
    [0, 0],
    [-1, 0],
    [2, 0],
    [-1, 2],
    [2, -1],
  ],
};

export interface RotateResult {
  readonly piece: ActivePiece;
  /** Kullanılan kick'in indeksi (0 = kick'siz). T-spin tespitinde 4. indeks mini'yi full'e yükseltir. */
  readonly kickIndex: number;
}

export function rotated(rotation: Rotation, dir: RotateDir): Rotation {
  return ((rotation + (dir === 'cw' ? 1 : 3)) % 4) as Rotation;
}

/**
 * SRS'e göre döndürmeyi dener: sırasıyla kick ofsetlerini uygular,
 * ilk çarpışmayan konumu döndürür. Hiçbiri sığmazsa null.
 */
export function tryRotate(board: Uint8Array, piece: ActivePiece, dir: RotateDir): RotateResult | null {
  if (piece.type === 'O') {
    // O dönüşten etkilenmez ama "başarılı rotasyon" sayılır
    return { piece, kickIndex: 0 };
  }
  const to = rotated(piece.rotation, dir);
  const table = piece.type === 'I' ? I_KICKS : JLSTZ_KICKS;
  const kicks = table[`${piece.rotation}>${to}`]!;
  for (let i = 0; i < kicks.length; i++) {
    const [kx, ky] = kicks[i]!;
    // Guideline +y yukarı → board +y aşağı: dy = -ky
    const candidate: ActivePiece = { ...piece, rotation: to, x: piece.x + kx, y: piece.y - ky };
    if (!collides(board, candidate)) {
      return { piece: candidate, kickIndex: i };
    }
  }
  return null;
}
