/** Motor kaynaklı anlık olaylar için minik yayıcı (ses + sarsıntı tetikleme).
 *  Render döngüsüne girmeden, store içinden tetiklenir. */
export type GameEvent = 'lock' | 'harddrop';

const listeners: Record<GameEvent, Set<() => void>> = {
  lock: new Set(),
  harddrop: new Set(),
};

export function onGameEvent(ev: GameEvent, cb: () => void): () => void {
  listeners[ev].add(cb);
  return () => listeners[ev].delete(cb);
}

export function emitGameEvent(ev: GameEvent): void {
  listeners[ev].forEach((cb) => cb());
}
