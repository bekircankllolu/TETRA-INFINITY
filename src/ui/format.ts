/** 12345 → "12,345" */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/** ms → "m:ss.cs" (Sprint süreleri için) */
export function formatTime(ms: number | null): string {
  if (ms === null) return '--:--';
  const total = Math.floor(ms);
  const m = Math.floor(total / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const cs = Math.floor((total % 1000) / 10);
  return `${m}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
}
