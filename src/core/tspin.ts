import { cellAt } from './board';
import { COLS, TOTAL_ROWS } from './constants';
import type { ActivePiece, TSpin } from './types';

/** Köşe dolu mu? Board dışı da dolu sayılır. */
function occupied(board: Uint8Array, x: number, y: number): boolean {
  if (x < 0 || x >= COLS || y >= TOTAL_ROWS) return true;
  if (y < 0) return false; // tavanın üstü boş
  return cellAt(board, x, y) !== 0;
}

/**
 * 3 köşe kuralı: T parçası kilitlenirken son hareket rotasyonsa,
 * T merkezinin 4 çapraz köşesinden >= 3'ü doluysa T-spin'dir.
 * İki "ön" köşe (T'nin baktığı yön) doluysa full, değilse mini.
 * SRS kick indeksi 4 (TST kick'i) mini'yi full'e yükseltir.
 */
export function detectTSpin(
  board: Uint8Array,
  piece: ActivePiece,
  lastMoveWasRotation: boolean,
  lastKickIndex: number
): TSpin {
  if (piece.type !== 'T' || !lastMoveWasRotation) return 'none';

  // T merkezi 3x3 kutunun ortası
  const cx = piece.x + 1;
  const cy = piece.y + 1;

  const tl = occupied(board, cx - 1, cy - 1);
  const tr = occupied(board, cx + 1, cy - 1);
  const bl = occupied(board, cx - 1, cy + 1);
  const br = occupied(board, cx + 1, cy + 1);
  const count = (tl ? 1 : 0) + (tr ? 1 : 0) + (bl ? 1 : 0) + (br ? 1 : 0);
  if (count < 3) return 'none';

  // Ön köşeler: rotasyona göre T'nin sivri ucunun baktığı taraf
  let frontA: boolean;
  let frontB: boolean;
  switch (piece.rotation) {
    case 0: // yukarı bakar
      frontA = tl;
      frontB = tr;
      break;
    case 1: // sağa bakar
      frontA = tr;
      frontB = br;
      break;
    case 2: // aşağı bakar
      frontA = bl;
      frontB = br;
      break;
    default: // 3, sola bakar
      frontA = tl;
      frontB = bl;
      break;
  }

  if (frontA && frontB) return 'full';
  return lastKickIndex === 4 ? 'full' : 'mini';
}
