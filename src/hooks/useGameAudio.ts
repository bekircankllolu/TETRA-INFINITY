import { useEffect, useRef } from 'react';
import { playSfx, triggerHaptic } from '../audio/sound';
import type { ClearInfo, Phase } from '../core/types';
import { onGameEvent } from '../state/events';
import { useGame } from '../state/store';

/** Oyun durumundaki değişimleri izleyip uygun ses + titreşimi tetikler.
 *  (move/rotate/hold/harddrop gibi anlık aksiyonlar girdi katmanında çalınır.) */
export function useGameAudio() {
  const lastClear = useGame((s) => s.game.lastClear);
  const level = useGame((s) => s.game.level);
  const phase = useGame((s) => s.game.phase);

  const seenClear = useRef<ClearInfo | null>(lastClear);
  const prevLevel = useRef(level);
  const prevPhase = useRef<Phase>(phase);

  // Kilit ve hard drop sesleri/titreşimi (motor olaylarından)
  useEffect(() => {
    const offLock = onGameEvent('lock', () => {
      playSfx('lock');
      triggerHaptic('light');
    });
    const offHard = onGameEvent('harddrop', () => {
      playSfx('harddrop');
      triggerHaptic('medium');
    });
    return () => {
      offLock();
      offHard();
    };
  }, []);

  useEffect(() => {
    if (lastClear && lastClear !== seenClear.current) {
      seenClear.current = lastClear;
      if (lastClear.tspin !== 'none') {
        playSfx('tspin');
        triggerHaptic('medium');
      } else if (lastClear.lines >= 4) {
        playSfx('tetris');
        triggerHaptic('success');
      } else if (lastClear.lines > 0) {
        playSfx('clear');
        triggerHaptic('light');
      }
    }
  }, [lastClear]);

  useEffect(() => {
    if (level > prevLevel.current) {
      prevLevel.current = level;
      playSfx('levelup');
      triggerHaptic('success');
    } else {
      prevLevel.current = level;
    }
  }, [level]);

  useEffect(() => {
    if (phase !== prevPhase.current) {
      prevPhase.current = phase;
      if (phase === 'gameOver') {
        playSfx('gameover');
        triggerHaptic('warning');
      } else if (phase === 'win') {
        playSfx('levelup');
        triggerHaptic('success');
      }
    }
  }, [phase]);
}
