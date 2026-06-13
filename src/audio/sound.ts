import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { getSettings } from '../state/prefs';

export type SfxName =
  | 'move'
  | 'rotate'
  | 'softdrop'
  | 'harddrop'
  | 'hold'
  | 'lock'
  | 'clear'
  | 'tetris'
  | 'tspin'
  | 'levelup'
  | 'gameover'
  | 'click'
  | 'start';

const SOURCES: Record<SfxName, number> = {
  move: require('../../assets/game/sfx/move.wav'),
  rotate: require('../../assets/game/sfx/rotate.wav'),
  softdrop: require('../../assets/game/sfx/softdrop.wav'),
  harddrop: require('../../assets/game/sfx/harddrop.wav'),
  hold: require('../../assets/game/sfx/hold.wav'),
  lock: require('../../assets/game/sfx/lock.wav'),
  clear: require('../../assets/game/sfx/clear.wav'),
  tetris: require('../../assets/game/sfx/tetris.wav'),
  tspin: require('../../assets/game/sfx/tspin.wav'),
  levelup: require('../../assets/game/sfx/levelup.wav'),
  gameover: require('../../assets/game/sfx/gameover.wav'),
  click: require('../../assets/game/sfx/click.wav'),
  start: require('../../assets/game/sfx/start.wav'),
};

const players: Partial<Record<SfxName, AudioPlayer>> = {};
let initialized = false;

export async function initAudio(): Promise<void> {
  if (initialized) return;
  initialized = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false });
  } catch {
    // Ses başlatılamazsa sessizce devam et
  }
}

/** Bir SFX çalar (sfxVolume'a saygı duyar). Çakışan tetiklemede baştan başlatır. */
export function playSfx(name: SfxName): void {
  const { sfxVolume } = getSettings();
  if (sfxVolume <= 0) return;
  try {
    let p = players[name];
    if (!p) {
      p = createAudioPlayer(SOURCES[name]);
      players[name] = p;
    }
    p.volume = sfxVolume;
    p.seekTo(0);
    p.play();
  } catch {
    // Oynatma hatasında sessizce geç
  }
}

type HapticKind = 'light' | 'medium' | 'heavy' | 'success' | 'warning';

/** Oyun olayı titreşimi (hapticsOn'a saygı duyar) */
export function triggerHaptic(kind: HapticKind): void {
  if (!getSettings().hapticsOn) return;
  try {
    switch (kind) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
    }
  } catch {
    // Cihaz desteklemiyorsa sessizce geç
  }
}

/** Buton basışı titreşimi (vibration ayarına saygı duyar) */
export function buttonHaptic(): void {
  if (!getSettings().vibration) return;
  try {
    Haptics.selectionAsync();
  } catch {
    // yok say
  }
}
