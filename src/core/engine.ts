import { ensureQueue } from './bag';
import { clearRows, collides, createBoard, findFullRows, ghostY, mergePiece } from './board';
import {
  HARD_DROP_POINTS_PER_ROW,
  HIDDEN_ROWS,
  LINES_PER_LEVEL,
  LOCK_DELAY_MS,
  MAX_LOCK_RESETS,
  QUEUE_SIZE,
  SOFT_DROP_POINTS_PER_ROW,
  SPRINT_GOAL_LINES,
  ZEN_GRAVITY_LEVEL,
} from './constants';
import { gravityMs, softDropMs } from './gravity';
import { clearScore, comboScore, isDifficultClear } from './scoring';
import { tryRotate } from './srs';
import { pieceCells, spawnPiece } from './tetromino';
import { detectTSpin } from './tspin';
import type { ActivePiece, GameAction, GameMode, GameState, LockState } from './types';

const INITIAL_LOCK: LockState = { grounded: false, elapsed: 0, resets: 0, lowestY: -1 };

/** Moda göre yerçekimi seviyesi: Zen sabit kalır, diğerleri seviyeyle hızlanır */
function effectiveLevel(mode: GameMode, level: number): number {
  return mode === 'zen' ? ZEN_GRAVITY_LEVEL : level;
}

export function createInitialState(seed: number, mode: GameMode = 'marathon'): GameState {
  const base: GameState = {
    mode,
    elapsedMs: 0,
    board: createBoard(),
    active: null,
    ghostY: 0,
    hold: null,
    canHold: true,
    queue: [],
    bag: [],
    rng: seed | 0,
    gravityAccum: 0,
    softDrop: false,
    lock: INITIAL_LOCK,
    score: 0,
    lines: 0,
    level: 1,
    combo: -1,
    b2b: false,
    lastClear: null,
    lastMoveWasRotation: false,
    lastKickIndex: -1,
    phase: 'falling',
  };
  return spawnNext(base);
}

function isGrounded(board: Uint8Array, piece: ActivePiece): boolean {
  return collides(board, piece, 0, 1);
}

/** Kuyruktan sıradaki parçayı doğurur; spawn engelliyse oyun biter (block-out) */
function spawnNext(state: GameState, forced?: ActivePiece['type']): GameState {
  let { queue, bag, rng } = state;
  let type = forced;
  if (type === undefined) {
    ({ queue, bag, rng } = ensureQueue(queue, bag, rng, QUEUE_SIZE + 1));
    type = queue[0]!;
    queue = queue.slice(1);
  }
  ({ queue, bag, rng } = ensureQueue(queue, bag, rng, QUEUE_SIZE));

  const piece = spawnPiece(type);
  if (collides(state.board, piece)) {
    return { ...state, queue, bag, rng, active: null, phase: 'gameOver' };
  }
  return {
    ...state,
    queue,
    bag,
    rng,
    active: piece,
    ghostY: ghostY(state.board, piece),
    gravityAccum: 0,
    lock: { ...INITIAL_LOCK, lowestY: piece.y },
    lastMoveWasRotation: false,
    lastKickIndex: -1,
  };
}

/** Aktif parçayı kilitler: birleştir, T-spin/temizleme/puan, yeni parça doğur */
function lockPiece(state: GameState): GameState {
  const piece = state.active!;

  // Lock-out: parça tamamen gizli satırlarda kilitlendiyse oyun biter
  const lockOut = pieceCells(piece).every(([, y]) => y < HIDDEN_ROWS);

  const tspin = detectTSpin(state.board, piece, state.lastMoveWasRotation, state.lastKickIndex);
  let board = mergePiece(state.board, piece);
  const fullRows = findFullRows(board);
  const lines = fullRows.length;
  board = clearRows(board, fullRows);

  let { score, combo, b2b, level } = state;
  let lastClear = state.lastClear;

  if (lines > 0 || tspin !== 'none') {
    const difficult = isDifficultClear(lines, tspin);
    // B2B bonusu: önceki zincir aktifken yeni bir zor temizleme gelirse
    const b2bApplied = lines > 0 && difficult && b2b;
    const newCombo = lines > 0 ? combo + 1 : combo;
    const points =
      clearScore(lines, tspin, level, b2b) + (lines > 0 ? comboScore(newCombo, level) : 0);
    score += points;
    combo = lines > 0 ? newCombo : combo;
    // Satırsız T-spin B2B zincirini bozmaz; satırlı temizlemede zorluk belirler
    if (lines > 0) b2b = difficult;
    lastClear = { lines, tspin, b2b: b2bApplied, combo, points, clearedRows: fullRows };
  }
  if (lines === 0) {
    combo = -1;
  }

  const totalLines = state.lines + lines;
  level = Math.floor(totalLines / LINES_PER_LEVEL) + 1;

  const next: GameState = {
    ...state,
    board,
    active: null,
    score,
    lines: totalLines,
    level,
    combo,
    b2b,
    lastClear,
    canHold: true,
    softDrop: state.softDrop,
  };

  // Sprint: hedef satıra ulaşınca oyun kazanılır
  if (state.mode === 'sprint' && totalLines >= SPRINT_GOAL_LINES) {
    return { ...next, phase: 'win', active: null };
  }
  if (lockOut) {
    return { ...next, phase: 'gameOver' };
  }
  return spawnNext(next);
}

/** Parça konum/rotasyon değiştiğinde lock delay sıfırlama kuralı */
function withMovedPiece(
  state: GameState,
  piece: ActivePiece,
  wasRotation: boolean,
  kickIndex: number
): GameState {
  let lock = state.lock;
  if (lock.grounded && lock.resets < MAX_LOCK_RESETS) {
    lock = { ...lock, elapsed: 0, resets: lock.resets + 1 };
  }
  return {
    ...state,
    active: piece,
    ghostY: ghostY(state.board, piece),
    lock,
    lastMoveWasRotation: wasRotation,
    lastKickIndex: kickIndex,
  };
}

/** Bir satır aşağı düşür; daha derine inildiyse reset hakkını tazele */
function dropOneRow(state: GameState, viaSoftDrop: boolean): GameState {
  const piece = { ...state.active!, y: state.active!.y + 1 };
  let lock = state.lock;
  if (piece.y > lock.lowestY) {
    lock = { ...lock, resets: 0, lowestY: piece.y, elapsed: 0 };
  }
  return {
    ...state,
    active: piece,
    lock,
    score: state.score + (viaSoftDrop ? SOFT_DROP_POINTS_PER_ROW : 0),
    lastMoveWasRotation: false,
    lastKickIndex: -1,
  };
}

function tick(state: GameState, dt: number): GameState {
  if (state.active === null) return state;
  let s = { ...state, elapsedMs: state.elapsedMs + dt };

  const grounded = isGrounded(s.board, s.active!);
  if (grounded) {
    const elapsed = (s.lock.grounded ? s.lock.elapsed : 0) + dt;
    if (elapsed >= LOCK_DELAY_MS) {
      return lockPiece({ ...s, lock: { ...s.lock, grounded: true, elapsed } });
    }
    return { ...s, gravityAccum: 0, lock: { ...s.lock, grounded: true, elapsed } };
  }

  // Havada: yerçekimi biriktir, gerekirse birden çok satır düşür
  const lvl = effectiveLevel(s.mode, s.level);
  const interval = s.softDrop ? softDropMs(lvl) : gravityMs(lvl);
  let accum = s.gravityAccum + dt;
  let lock = s.lock.grounded ? { ...s.lock, grounded: false, elapsed: 0 } : s.lock;
  s = { ...s, lock };
  while (accum >= interval) {
    if (s.active === null || isGrounded(s.board, s.active)) break;
    accum -= interval;
    s = dropOneRow(s, s.softDrop);
  }
  return { ...s, gravityAccum: accum };
}

export function update(state: GameState, action: GameAction): GameState {
  if (action.type === 'NEW_GAME') {
    return createInitialState(action.seed ?? 0, action.mode ?? 'marathon');
  }
  if (state.phase === 'gameOver' || state.phase === 'win' || state.active === null) {
    return state;
  }

  switch (action.type) {
    case 'TICK':
      return tick(state, action.dt);

    case 'MOVE': {
      if (collides(state.board, state.active, action.dir, 0)) return state;
      const piece = { ...state.active, x: state.active.x + action.dir };
      return withMovedPiece(state, piece, false, -1);
    }

    case 'ROTATE': {
      const result = tryRotate(state.board, state.active, action.dir);
      if (result === null) return state;
      return withMovedPiece(state, result.piece, true, result.kickIndex);
    }

    case 'SOFT_DROP':
      if (state.softDrop === action.on) return state;
      // Açılırken birikmiş yerçekimini sıfırla ki ilk hızlı düşüş anında gelsin
      return {
        ...state,
        softDrop: action.on,
        gravityAccum: action.on ? softDropMs(effectiveLevel(state.mode, state.level)) : 0,
      };

    case 'HARD_DROP': {
      const targetY = state.ghostY;
      const rows = targetY - state.active.y;
      const piece = { ...state.active, y: targetY };
      return lockPiece({
        ...state,
        active: piece,
        score: state.score + rows * HARD_DROP_POINTS_PER_ROW,
        // Parça düştüyse son hareket artık rotasyon değildir
        lastMoveWasRotation: rows > 0 ? false : state.lastMoveWasRotation,
        lastKickIndex: rows > 0 ? -1 : state.lastKickIndex,
      });
    }

    case 'HOLD': {
      if (!state.canHold) return state;
      const held = state.active.type;
      const swapped = spawnNext({ ...state, hold: held, canHold: false }, state.hold ?? undefined);
      // spawnNext canHold'a dokunmaz; swap sonrası tekrar hold yasak
      return swapped.phase === 'gameOver' ? swapped : { ...swapped, canHold: false };
    }

    default:
      return state;
  }
}
