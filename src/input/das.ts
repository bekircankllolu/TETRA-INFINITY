export const DAS_MS = 167; // ilk tekrar gecikmesi
export const ARR_MS = 33; // tekrar aralığı

export interface Repeater {
  start: () => void;
  stop: () => void;
}

/**
 * Buton basılı tutma için DAS/ARR tekrarlayıcısı: basışta bir kez ateşler,
 * DAS sonrası ARR aralığıyla tekrarlar. Giriş katmanı timer kullanabilir;
 * motor saati yalnızca rAF'tan TICK alır.
 */
export function createRepeater(onFire: () => void, dasMs = DAS_MS, arrMs = ARR_MS): Repeater {
  let dasTimer: ReturnType<typeof setTimeout> | null = null;
  let arrTimer: ReturnType<typeof setInterval> | null = null;

  return {
    start() {
      this.stop();
      onFire();
      dasTimer = setTimeout(() => {
        arrTimer = setInterval(onFire, arrMs);
      }, dasMs);
    },
    stop() {
      if (dasTimer !== null) clearTimeout(dasTimer);
      if (arrTimer !== null) clearInterval(arrTimer);
      dasTimer = null;
      arrTimer = null;
    },
  };
}
