import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { createInitialState, update } from '../core/engine';
import type { GameAction, GameMode, GameState } from '../core/types';
import { emitGameEvent } from './events';
import { usePrefs } from './prefs';

/** Menü düzeyi ekranlar + oyun içi durumlar tek enum'da */
export type AppStatus =
  | 'menu'
  | 'modeSelect'
  | 'settings'
  | 'collection'
  | 'leaderboard'
  | 'playing'
  | 'paused'
  | 'gameover'
  | 'win';

export interface AppStore {
  status: AppStatus;
  mode: GameMode;
  game: GameState;
  /** Oyun aksiyonları motora buradan akar; oyun döngüsü React'a girmeden çağırır */
  dispatch: (action: GameAction) => void;
  navigate: (s: AppStatus) => void;
  setMode: (m: GameMode) => void;
  startGame: (mode?: GameMode) => void;
  pause: () => void;
  resume: () => void;
  quitToMenu: () => void;
}

let recorded = false; // aynı oyun sonucunu iki kez kaydetmemek için

export const gameStore = createStore<AppStore>()((set, get) => ({
  status: 'menu',
  mode: 'marathon',
  game: createInitialState(0),

  dispatch: (action) => {
    const { game, status } = get();
    if (status !== 'playing') return;
    const next = update(game, action);
    if (next === game) return;

    // Motor kaynaklı olaylar: board değişimi = kilit; hard drop ayrıca sarsıntı
    if (action.type === 'HARD_DROP') emitGameEvent('harddrop');
    if (next.board !== game.board) emitGameEvent('lock');

    let newStatus: AppStatus = status;
    if (next.phase === 'gameOver') newStatus = 'gameover';
    else if (next.phase === 'win') newStatus = 'win';

    if (newStatus !== status && !recorded) {
      recorded = true;
      usePrefs.getState().recordGame(next.mode, {
        score: next.score,
        lines: next.lines,
        timeMs: next.elapsedMs,
      });
    }
    set({ game: next, status: newStatus });
  },

  navigate: (s) => set({ status: s }),
  setMode: (m) => set({ mode: m }),

  startGame: (mode) => {
    const m = mode ?? get().mode;
    const seed = (Date.now() ^ (Math.random() * 0xffffffff)) | 0;
    recorded = false;
    set({ mode: m, game: createInitialState(seed, m), status: 'playing' });
  },

  pause: () => {
    if (get().status === 'playing') set({ status: 'paused' });
  },

  resume: () => {
    if (get().status === 'paused') set({ status: 'playing' });
  },

  quitToMenu: () => set({ status: 'menu' }),
}));

/** Dar selector'larla abone ol: yalnızca seçilen dilim değişince render olur */
export function useGame<T>(selector: (s: AppStore) => T): T {
  return useStore(gameStore, selector);
}

// Web önizleme/ekran görüntüsü araçları için store'u erişilebilir kıl (zararsız)
if (typeof window !== 'undefined') {
  (globalThis as { __gameStore?: typeof gameStore }).__gameStore = gameStore;
}
