export const COLS = 10;
export const VISIBLE_ROWS = 20;
export const HIDDEN_ROWS = 4; // görünür alanın üzerindeki tampon satırlar (satır 0-3)
export const TOTAL_ROWS = VISIBLE_ROWS + HIDDEN_ROWS;

export const LOCK_DELAY_MS = 500;
export const MAX_LOCK_RESETS = 15;
export const QUEUE_SIZE = 5;

/** Soft drop, yerçekimini bu katsayıyla hızlandırır */
export const SOFT_DROP_FACTOR = 20;

export const SOFT_DROP_POINTS_PER_ROW = 1;
export const HARD_DROP_POINTS_PER_ROW = 2;

export const LINES_PER_LEVEL = 10;

/** Sprint modunda temizlenmesi gereken satır sayısı */
export const SPRINT_GOAL_LINES = 40;

/** Zen modunda yerçekimi bu sabit seviyede kalır (baskısız, hızlanmaz) */
export const ZEN_GRAVITY_LEVEL = 1;
