import { QUEUE_SIZE } from './constants';
import { nextRandom } from './rng';
import { PIECE_TYPES } from './tetromino';
import type { PieceType } from './types';

export interface DrawResult {
  readonly piece: PieceType;
  readonly bag: readonly PieceType[];
  readonly rng: number;
}

/** 7-bag: torba boşalınca 7 parçayla yeniden dolar; her çekiliş torbadan rastgele. */
export function drawPiece(bag: readonly PieceType[], rng: number): DrawResult {
  const source = bag.length === 0 ? PIECE_TYPES : bag;
  const { value, state } = nextRandom(rng);
  const index = Math.floor(value * source.length);
  const piece = source[index]!;
  const rest = source.filter((_, i) => i !== index);
  return { piece, bag: rest, rng: state };
}

export interface QueueState {
  readonly queue: readonly PieceType[];
  readonly bag: readonly PieceType[];
  readonly rng: number;
}

/** Kuyruğu en az `size` parçaya tamamlar */
export function ensureQueue(
  queue: readonly PieceType[],
  bag: readonly PieceType[],
  rng: number,
  size: number = QUEUE_SIZE
): QueueState {
  let q = queue;
  let b = bag;
  let r = rng;
  while (q.length < size) {
    const drawn = drawPiece(b, r);
    q = [...q, drawn.piece];
    b = drawn.bag;
    r = drawn.rng;
  }
  return { queue: q, bag: b, rng: r };
}
