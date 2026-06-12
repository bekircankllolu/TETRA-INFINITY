import { useEffect } from 'react';
import { gameStore, useGame } from '../state/store';

/**
 * Oyun saati: requestAnimationFrame ile delta-time biriktirip motora TICK atar.
 * Store'a getState() üzerinden ulaşır; 60fps tick React render'ı tetiklemez
 * (yalnızca görünür state değişimleri seçicilere yansır).
 */
export function useGameLoop(): void {
  const running = useGame((s) => s.status === 'playing');

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    let id: number;
    const frame = (now: number) => {
      const dt = Math.min(now - last, 100); // arka plan dönüşü/spike koruması
      last = now;
      gameStore.getState().dispatch({ type: 'TICK', dt });
      id = requestAnimationFrame(frame);
    };
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [running]);
}
