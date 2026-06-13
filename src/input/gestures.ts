import { useMemo, useRef } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { playSfx } from '../audio/sound';
import type { GameAction } from '../core/types';
import { getSettings } from '../state/prefs';
import { gameStore } from '../state/store';

/** Tüm dokunmatik eşikler — cihazda ayar için tek yer */
export const TOUCH = {
  /** Yatay hamle başına gereken sürükleme (hücre genişliği çarpanı) */
  H_CELL_FACTOR: 0.9,
  /** Dikeyin baskın sayılması için |dy| > |dx| × bu çarpan */
  V_DOMINANCE: 1.5,
  /** Soft drop'u başlatan dikey sürükleme (hücre çarpanı) */
  SOFT_START_CELLS: 1.0,
  /** Hard drop flick eşikleri: hız + mesafe + süre ÜÇÜ BİRDEN gerekir */
  HARD_MIN_VELOCITY: 1200,
  HARD_MIN_CELLS: 2,
  HARD_MAX_DURATION_MS: 250,
  /** Hold: yukarı flick */
  HOLD_MIN_VELOCITY: 1000,
  HOLD_MIN_CELLS: 1.5,
  /** Tap (döndürme) sınırları */
  TAP_MAX_DURATION_MS: 200,
  TAP_MAX_DISTANCE: 8,
} as const;

/**
 * Board üzerine bağlanacak birleşik jest:
 * - sürükle-kolona-taşı yatay hareket (DAS/ARR'ın dokunmatik karşılığı)
 * - dikey sürükleme = soft drop, hızlı flick = hard drop, yukarı flick = hold
 * - tap = saat yönü, board'un sol üçte birine tap = tersi
 */
export function useBoardGesture(cellSize: number, boardWidth: number) {
  const anchorX = useRef(0);
  const softActive = useRef(false);
  const startTime = useRef(0);

  return useMemo(() => {
    const dispatch = (action: GameAction) => gameStore.getState().dispatch(action);

    const pan = Gesture.Pan()
      .minDistance(8)
      .maxPointers(1)
      .runOnJS(true)
      .onStart(() => {
        anchorX.current = 0;
        softActive.current = false;
        startTime.current = Date.now();
      })
      .onUpdate((e) => {
        // Yatay: anchor'dan her (hücre × faktör) aşımında bir hamle
        const step = cellSize * TOUCH.H_CELL_FACTOR;
        let diff = e.translationX - anchorX.current;
        while (Math.abs(diff) >= step) {
          const dir = diff > 0 ? 1 : -1;
          dispatch({ type: 'MOVE', dir });
          anchorX.current += dir * step;
          diff = e.translationX - anchorX.current;
        }

        // Dikey baskınsa soft drop aç/kapat
        const vertical =
          Math.abs(e.translationY) > Math.abs(e.translationX) * TOUCH.V_DOMINANCE &&
          e.translationY > cellSize * TOUCH.SOFT_START_CELLS;
        if (vertical && !softActive.current) {
          softActive.current = true;
          playSfx('softdrop');
          dispatch({ type: 'SOFT_DROP', on: true });
        } else if (!vertical && softActive.current) {
          softActive.current = false;
          dispatch({ type: 'SOFT_DROP', on: false });
        }
      })
      .onEnd((e) => {
        const duration = Date.now() - startTime.current;
        if (softActive.current) {
          softActive.current = false;
          dispatch({ type: 'SOFT_DROP', on: false });
        }
        // Hard drop: hızlı + yeterince uzun + kısa süreli aşağı flick
        if (
          e.velocityY > TOUCH.HARD_MIN_VELOCITY &&
          e.translationY > cellSize * TOUCH.HARD_MIN_CELLS &&
          duration < TOUCH.HARD_MAX_DURATION_MS
        ) {
          dispatch({ type: 'HARD_DROP' });
          return;
        }
        // Hold: yukarı flick
        if (
          e.velocityY < -TOUCH.HOLD_MIN_VELOCITY &&
          e.translationY < -cellSize * TOUCH.HOLD_MIN_CELLS
        ) {
          playSfx('hold');
          dispatch({ type: 'HOLD' });
        }
      })
      .onFinalize(() => {
        if (softActive.current) {
          softActive.current = false;
          dispatch({ type: 'SOFT_DROP', on: false });
        }
      });

    const tap = Gesture.Tap()
      .maxDuration(TOUCH.TAP_MAX_DURATION_MS)
      .maxDistance(TOUCH.TAP_MAX_DISTANCE)
      .runOnJS(true)
      .onEnd((e) => {
        // Sağ elde sol üçte bir = ccw; solak modunda sağ üçte bir = ccw
        const leftHanded = getSettings().leftHanded;
        const ccwZone = leftHanded ? e.x > (boardWidth * 2) / 3 : e.x < boardWidth / 3;
        playSfx('rotate');
        dispatch({ type: 'ROTATE', dir: ccwZone ? 'ccw' : 'cw' });
      });

    // Race: hareket başlarsa pan kazanır, kısa dokunuşta tap ateşler
    return Gesture.Race(pan, tap);
  }, [cellSize, boardWidth]);
}
