import { describe, expect, test } from '@jest/globals';
import { ghostY } from './board';
import { COLS, TOTAL_ROWS } from './constants';
import { createInitialState, update } from './engine';
import { gravityMs } from './gravity';
import type { ActivePiece, GameAction, GameState } from './types';

function dispatch(state: GameState, ...actions: GameAction[]): GameState {
  return actions.reduce(update, state);
}

/** Test yardımcısı: board ve aktif parçayı elle kurar, ghostY'yi tutarlı tutar */
function withSetup(state: GameState, piece: ActivePiece, board?: Uint8Array): GameState {
  const b = board ?? state.board;
  return { ...state, board: b, active: piece, ghostY: ghostY(b, piece) };
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

const O_SPAWN: ActivePiece = { type: 'O', rotation: 0, x: 3, y: 2 };

describe('yerçekimi eğrisi', () => {
  test('guideline değerleriyle uyuşur (el hesabı)', () => {
    expect(gravityMs(1)).toBeCloseTo(1000, 5);
    expect(gravityMs(5)).toBeCloseTo(Math.pow(0.772, 4) * 1000, 5); // ~355.2 ms
    expect(gravityMs(5)).toBeGreaterThan(355);
    expect(gravityMs(5)).toBeLessThan(356);
    expect(gravityMs(15)).toBeGreaterThan(7.0); // (0.702)^14 ≈ 7.06 ms
    expect(gravityMs(15)).toBeLessThan(7.1);
  });
});

describe('motor — yerçekimi ve TICK', () => {
  test('seviye 1: parça tam 1000ms sonra bir satır düşer', () => {
    let s = createInitialState(1);
    const y0 = s.active!.y;
    s = dispatch(s, { type: 'TICK', dt: 999 });
    expect(s.active!.y).toBe(y0);
    s = dispatch(s, { type: 'TICK', dt: 1 });
    expect(s.active!.y).toBe(y0 + 1);
  });

  test('büyük dt tek TICKte birden çok satır düşürür ama parçayı kilitlemez', () => {
    let s = createInitialState(1);
    s = dispatch(s, { type: 'TICK', dt: 30000 });
    expect(s.active).not.toBeNull();
    expect(s.active!.y).toBe(s.ghostY); // tabana indi, henüz kilitlenmedi
    expect(s.board.every((c) => c === 0)).toBe(true);
  });

  test('soft drop hızlandırır ve satır başına 1 puan verir', () => {
    let s = createInitialState(1);
    const y0 = s.active!.y;
    s = dispatch(s, { type: 'SOFT_DROP', on: true }, { type: 'TICK', dt: 1 });
    expect(s.active!.y).toBe(y0 + 1);
    expect(s.score).toBe(1);
  });
});

describe('motor — lock delay FSM', () => {
  function landedState(): GameState {
    let s = createInitialState(1);
    return dispatch(s, { type: 'TICK', dt: 30000 });
  }

  test('yerde 500ms dolunca kilitlenir', () => {
    let s = landedState();
    s = dispatch(s, { type: 'TICK', dt: 499 });
    expect(s.board.every((c) => c === 0)).toBe(true); // henüz kilit yok
    s = dispatch(s, { type: 'TICK', dt: 1 });
    expect(s.board.some((c) => c !== 0)).toBe(true); // kilitlendi
    expect(s.active!.y).toBe(2); // yeni parça doğdu
  });

  test('499ms\'de yapılan hamle sayacı sıfırlar', () => {
    let s = landedState();
    s = dispatch(s, { type: 'TICK', dt: 499 }, { type: 'MOVE', dir: 1 });
    s = dispatch(s, { type: 'TICK', dt: 499 });
    expect(s.board.every((c) => c === 0)).toBe(true); // hâlâ kilitlenmedi
    s = dispatch(s, { type: 'TICK', dt: 1 });
    expect(s.board.some((c) => c !== 0)).toBe(true);
  });

  test('16. sıfırlama çalışmaz (MAX_LOCK_RESETS = 15)', () => {
    let s = landedState();
    // 15 başarılı sıfırlama
    for (let i = 0; i < 15; i++) {
      s = dispatch(s, { type: 'TICK', dt: 400 }, { type: 'MOVE', dir: i % 2 === 0 ? 1 : -1 });
      expect(s.board.every((c) => c === 0)).toBe(true);
    }
    // 16. hamle sayacı sıfırlayamaz: 400 + 100 >= 500 → kilit
    s = dispatch(s, { type: 'TICK', dt: 400 }, { type: 'MOVE', dir: 1 }, { type: 'TICK', dt: 100 });
    expect(s.board.some((c) => c !== 0)).toBe(true);
  });
});

describe('motor — hard drop ve hold', () => {
  test('hard drop anında kilitler ve satır başına 2 puan verir', () => {
    let s = createInitialState(1);
    const rows = s.ghostY - s.active!.y;
    s = dispatch(s, { type: 'HARD_DROP' });
    expect(s.score).toBe(rows * 2);
    expect(s.board.some((c) => c !== 0)).toBe(true);
    expect(s.active).not.toBeNull(); // yeni parça
  });

  test('hold: takas, kilitlenmeden ikinci hold yasak, kilit sonrası serbest', () => {
    let s = createInitialState(1);
    const first = s.active!.type;
    const next = s.queue[0]!;
    s = dispatch(s, { type: 'HOLD' });
    expect(s.hold).toBe(first);
    expect(s.active!.type).toBe(next);
    expect(s.canHold).toBe(false);

    const afterHold = s;
    s = dispatch(s, { type: 'HOLD' }); // no-op
    expect(s).toBe(afterHold);

    s = dispatch(s, { type: 'HARD_DROP' });
    expect(s.canHold).toBe(true);
    const current = s.active!.type;
    s = dispatch(s, { type: 'HOLD' });
    expect(s.active!.type).toBe(first); // saklanan geri geldi
    expect(s.hold).toBe(current);
  });
});

describe('motor — satır temizleme ve seviye', () => {
  test('single temizleme: 100 puan, satır sayısı ve seviye atlaması', () => {
    let s = createInitialState(1);
    // 23. satır 4-5 hariç dolu; O parçası (4,5) kolonlarına düşüp single yapar
    const board = makeBoard((x, y) => y === 23 && x !== 4 && x !== 5);
    s = withSetup({ ...s, lines: 9, score: 0 }, O_SPAWN, board);
    s = dispatch(s, { type: 'HARD_DROP' });
    expect(s.lines).toBe(10);
    expect(s.level).toBe(2); // 10 satırda seviye 2
    // O hücreleri: 2 satır; alta oturur → row 23 full, row 22'de 2 hücre kalır
    expect(s.lastClear).not.toBeNull();
    expect(s.lastClear!.lines).toBe(1);
    expect(s.lastClear!.points).toBe(100); // seviye 1 üzerinden puanlandı
  });

  test('combo: ardışık temizlemede +50 bonus', () => {
    let s = createInitialState(1);
    const board1 = makeBoard((x, y) => y === 23 && x !== 4 && x !== 5);
    s = withSetup(s, O_SPAWN, board1);
    s = dispatch(s, { type: 'HARD_DROP' });
    expect(s.combo).toBe(0); // ilk temizleme: combo 0, bonus yok
    const score1 = s.score;

    const board2 = makeBoard((x, y) => y === 23 && x !== 4 && x !== 5);
    s = withSetup(s, O_SPAWN, board2);
    s = dispatch(s, { type: 'HARD_DROP' });
    expect(s.combo).toBe(1);
    // 100 (single) + 50 (combo 1) + 40 (hard drop 20 satır x2)
    expect(s.score - score1).toBe(190);
  });

  test('temizlemesiz kilit comboyu bozar', () => {
    let s = createInitialState(1);
    const board = makeBoard((x, y) => y === 23 && x !== 4 && x !== 5);
    s = withSetup(s, O_SPAWN, board);
    s = dispatch(s, { type: 'HARD_DROP' });
    expect(s.combo).toBe(0);
    s = dispatch(s, { type: 'HARD_DROP' }); // bir sonraki parça temizlemeden kilitlenir
    expect(s.combo).toBe(-1);
  });

  test('tetris: 800 puan ve B2B zinciri', () => {
    let s = createInitialState(1);
    // 20-23 satırları kolon 0 hariç dolu; dikey I kolon 0'a → tetris
    const board = makeBoard((x, y) => y >= 20 && x !== 0);
    const vertI: ActivePiece = { type: 'I', rotation: 1, x: -2, y: 2 }; // hücreler kolon 0
    s = withSetup(s, vertI, board);
    s = dispatch(s, { type: 'HARD_DROP' });
    expect(s.lastClear!.lines).toBe(4);
    expect(s.lastClear!.points).toBeGreaterThanOrEqual(800);
    expect(s.b2b).toBe(true);

    // İkinci tetris: B2B ×1.5 → 1200 (seviye 1)
    const board2 = makeBoard((x, y) => y >= 20 && x !== 0);
    s = withSetup({ ...s, level: 1, lines: 0 }, vertI, board2);
    const before = s.score;
    s = dispatch(s, { type: 'HARD_DROP' });
    expect(s.lastClear!.b2b).toBe(true);
    // 800 × 1.5 = 1200, + combo + hard drop puanları hariç tutmak için lastClear.points'e bak
    expect(s.lastClear!.points).toBe(1200 + 50); // combo 1 bonusu dahil (50×1×1)
    expect(s.score).toBeGreaterThan(before);

    // Single B2B'yi bozar
    const board3 = makeBoard((x, y) => y === 23 && x !== 4 && x !== 5);
    s = withSetup(s, O_SPAWN, board3);
    s = dispatch(s, { type: 'HARD_DROP' });
    expect(s.b2b).toBe(false);
  });
});

describe('motor — oyun sonu', () => {
  test('üst üste hard drop sonunda top-out olur', () => {
    let s = createInitialState(3);
    for (let i = 0; i < 60 && s.phase !== 'gameOver'; i++) {
      s = dispatch(s, { type: 'HARD_DROP' });
    }
    expect(s.phase).toBe('gameOver');
  });

  test('oyun bittikten sonra aksiyonlar işlenmez, NEW_GAME sıfırlar', () => {
    let s = createInitialState(3);
    while (s.phase !== 'gameOver') s = dispatch(s, { type: 'HARD_DROP' });
    const over = s;
    s = dispatch(s, { type: 'MOVE', dir: 1 }, { type: 'TICK', dt: 1000 });
    expect(s).toBe(over);
    s = dispatch(s, { type: 'NEW_GAME', seed: 5 });
    expect(s.phase).toBe('falling');
    expect(s.score).toBe(0);
    expect(s.board.every((c) => c === 0)).toBe(true);
  });
});

describe('motor — deterministik regresyon', () => {
  test('sabit seed + senaryo her zaman aynı sonucu verir', () => {
    const script: GameAction[] = [];
    for (let i = 0; i < 25; i++) {
      script.push({ type: 'MOVE', dir: i % 3 === 0 ? -1 : 1 });
      if (i % 2 === 0) script.push({ type: 'ROTATE', dir: 'cw' });
      if (i % 5 === 0) script.push({ type: 'HOLD' });
      script.push({ type: 'HARD_DROP' });
    }
    const run = () => {
      const final = dispatch(createInitialState(42), ...script);
      return {
        score: final.score,
        lines: final.lines,
        level: final.level,
        phase: final.phase,
        boardSum: final.board.reduce((a, c) => a + c, 0),
      };
    };
    const a = run();
    expect(run()).toEqual(a); // determinizm
    expect(a).toMatchSnapshot(); // regresyon kaydı
  });
});
