import { describe, expect, test } from '@jest/globals';
import { ghostY } from './board';
import { COLS, SPRINT_GOAL_LINES, TOTAL_ROWS } from './constants';
import { createInitialState, update } from './engine';
import type { ActivePiece, GameState } from './types';

function withSetup(state: GameState, piece: ActivePiece, board: Uint8Array): GameState {
  return { ...state, board, active: piece, ghostY: ghostY(board, piece) };
}

/** Alt görünür satırı, O'nun (x=0'da kolon 1,2) kapatacağı boşluk hariç doldurur */
function almostFullBottom(): Uint8Array {
  const b = new Uint8Array(TOTAL_ROWS * COLS);
  const y = TOTAL_ROWS - 1;
  for (let x = 0; x < COLS; x++) {
    if (x !== 1 && x !== 2) b[y * COLS + x] = 1;
  }
  return b;
}

const O_TOP: ActivePiece = { type: 'O', rotation: 0, x: 0, y: 2 };

describe('oyun modları', () => {
  test('mod state içinde saklanır', () => {
    expect(createInitialState(1).mode).toBe('marathon');
    expect(createInitialState(1, 'sprint').mode).toBe('sprint');
    expect(createInitialState(1, 'zen').mode).toBe('zen');
    expect(createInitialState(1).elapsedMs).toBe(0);
  });

  test('NEW_GAME modu uygular', () => {
    const s = update(createInitialState(1), { type: 'NEW_GAME', seed: 5, mode: 'zen' });
    expect(s.mode).toBe('zen');
  });

  test('Sprint: hedef satıra ulaşınca kazanılır', () => {
    let s = createInitialState(1, 'sprint');
    s = { ...s, lines: SPRINT_GOAL_LINES - 1 };
    s = withSetup(s, O_TOP, almostFullBottom());
    s = update(s, { type: 'HARD_DROP' });
    expect(s.lines).toBe(SPRINT_GOAL_LINES);
    expect(s.phase).toBe('win');
    expect(s.active).toBeNull();
  });

  test('Zen: hedef satırda kazanma yok, oyun sürer', () => {
    let s = createInitialState(1, 'zen');
    s = { ...s, lines: SPRINT_GOAL_LINES - 1 };
    s = withSetup(s, O_TOP, almostFullBottom());
    s = update(s, { type: 'HARD_DROP' });
    expect(s.lines).toBe(SPRINT_GOAL_LINES);
    expect(s.phase).not.toBe('win');
    expect(s.active).not.toBeNull(); // yeni parça doğdu
  });

  test('Zen: yüksek seviyede bile yerçekimi sabit (seviye 1 hızı)', () => {
    let s = createInitialState(1, 'zen');
    s = { ...s, level: 15 }; // marathon olsa çok hızlı düşerdi
    const y0 = s.active!.y;
    s = update(s, { type: 'TICK', dt: 999 });
    expect(s.active!.y).toBe(y0); // 1000ms dolmadan düşmez
    s = update(s, { type: 'TICK', dt: 1 });
    expect(s.active!.y).toBe(y0 + 1);
  });

  test('Marathon: yüksek seviyede yerçekimi hızlıdır', () => {
    let s = createInitialState(1, 'marathon');
    s = { ...s, level: 15 };
    const y0 = s.active!.y;
    s = update(s, { type: 'TICK', dt: 50 }); // ~7ms/satır → birden çok satır
    expect(s.active!.y).toBeGreaterThan(y0);
  });
});
