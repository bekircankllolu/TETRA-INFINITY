import { useEffect, useState } from 'react';
import { gameStore } from '../state/store';

/** Geçen süreyi düşük frekansta (varsayılan 100ms) örnekler — 60fps React
 *  render'ı tetiklemeden canlı kronometre göstermek için. */
export function useSampledElapsed(active: boolean, intervalMs = 100): number {
  const [ms, setMs] = useState(() => gameStore.getState().game.elapsedMs);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setMs(gameStore.getState().game.elapsedMs), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
  return ms;
}
