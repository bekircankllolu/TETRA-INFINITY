import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { GameMode } from '../core/types';

export type NextCount = 3 | 4 | 5;
export type GraphicsQuality = 'low' | 'medium' | 'high' | 'ultra';

export interface Settings {
  musicVolume: number; // 0..1 (müzik henüz parçasız; değer saklanır)
  sfxVolume: number; // 0..1
  hapticsOn: boolean; // oyun olayları için titreşim
  vibration: boolean; // buton basışı titreşimi
  ghostPiece: boolean;
  nextCount: NextCount;
  showHints: boolean;
  leftHanded: boolean;
  graphics: GraphicsQuality;
}

export interface ModeRecord {
  bestScore: number;
  bestLines: number;
  bestTimeMs: number | null; // Sprint için en iyi süre
  played: number;
}

export interface Profile {
  coins: number;
  gems: number;
  xp: number;
  equippedSkin: string;
  unlockedSkins: string[];
}

interface PrefsState {
  settings: Settings;
  profile: Profile;
  records: Record<GameMode, ModeRecord>;
  hydrated: boolean;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  equipSkin: (id: string) => void;
  unlockSkin: (id: string, cost: number) => boolean;
  /** Oyun sonunda çağrılır: rekorları ve para/XP'yi günceller */
  recordGame: (mode: GameMode, result: { score: number; lines: number; timeMs: number }) => void;
}

const DEFAULT_SETTINGS: Settings = {
  musicVolume: 0.6,
  sfxVolume: 0.8,
  hapticsOn: true,
  vibration: true,
  ghostPiece: true,
  nextCount: 5,
  showHints: true,
  leftHanded: false,
  graphics: 'high',
};

const DEFAULT_PROFILE: Profile = {
  coins: 0,
  gems: 0,
  xp: 0,
  equippedSkin: 'crystal',
  unlockedSkins: ['crystal'],
};

const emptyRecord = (): ModeRecord => ({ bestScore: 0, bestLines: 0, bestTimeMs: null, played: 0 });

const DEFAULT_RECORDS: Record<GameMode, ModeRecord> = {
  marathon: emptyRecord(),
  sprint: emptyRecord(),
  zen: emptyRecord(),
};

/** Seviye, toplam XP'den türetilir (her seviye 5000 XP) */
export const XP_PER_LEVEL = 5000;
export const levelFromXp = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
export const xpIntoLevel = (xp: number) => xp % XP_PER_LEVEL;

export const usePrefs = create<PrefsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      profile: DEFAULT_PROFILE,
      records: DEFAULT_RECORDS,
      hydrated: false,

      setSetting: (key, value) =>
        set((s) => ({ settings: { ...s.settings, [key]: value } })),

      equipSkin: (id) =>
        set((s) =>
          s.profile.unlockedSkins.includes(id)
            ? { profile: { ...s.profile, equippedSkin: id } }
            : s
        ),

      unlockSkin: (id, cost) => {
        const { profile } = get();
        if (profile.unlockedSkins.includes(id)) return true;
        if (profile.coins < cost) return false;
        set({
          profile: {
            ...profile,
            coins: profile.coins - cost,
            unlockedSkins: [...profile.unlockedSkins, id],
            equippedSkin: id,
          },
        });
        return true;
      },

      recordGame: (mode, result) =>
        set((s) => {
          const prev = s.records[mode];
          const better = (a: number, b: number) => Math.max(a, b);
          const bestTime =
            mode === 'sprint' && result.lines >= 40
              ? prev.bestTimeMs === null
                ? result.timeMs
                : Math.min(prev.bestTimeMs, result.timeMs)
              : prev.bestTimeMs;
          // Para ödülü: skor ve satıra göre
          const coins = Math.floor(result.score / 1000) + result.lines * 2;
          const gems = result.lines >= 40 && mode === 'sprint' ? 5 : 0;
          return {
            records: {
              ...s.records,
              [mode]: {
                bestScore: better(prev.bestScore, result.score),
                bestLines: better(prev.bestLines, result.lines),
                bestTimeMs: bestTime,
                played: prev.played + 1,
              },
            },
            profile: {
              ...s.profile,
              coins: s.profile.coins + coins,
              gems: s.profile.gems + gems,
              xp: s.profile.xp + result.score,
            },
          };
        }),
    }),
    {
      name: 'tetra-prefs-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ settings: s.settings, profile: s.profile, records: s.records }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);

/** React dışından senkron okuma (ses/render katmanı için) */
export const getSettings = () => usePrefs.getState().settings;
