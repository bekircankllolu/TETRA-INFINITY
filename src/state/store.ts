import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { createInitialState, update } from '../core/engine';
import type { GameAction, GameState } from '../core/types';

export type AppStatus = 'menu' | 'playing' | 'paused' | 'gameover';

export interface AppStore {
  status: AppStatus;
  game: GameState;
  /** Oyun aksiyonları motora buradan akar; oyun döngüsü React'a girmeden çağırır */
  dispatch: (action: GameAction) => void;
  startGame: () => void;
  pause: () => void;
  resume: () => void;
  quitToMenu: () => void;
}

export const gameStore = createStore<AppStore>()((set, get) => ({
  status: 'menu',
  game: createInitialState(0),

  dispatch: (action) => {
    const { game, status } = get();
    if (status !== 'playing') return;
    const next = update(game, action);
    if (next === game) return;
    set({ game: next, status: next.phase === 'gameOver' ? 'gameover' : status });
  },

  startGame: () => {
    const seed = (Date.now() ^ (Math.random() * 0xffffffff)) | 0;
    set({ game: createInitialState(seed), status: 'playing' });
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
