export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

/** 0 = spawn, 1 = saat yönü (R), 2 = 180, 3 = saat yönü tersi (L) */
export type Rotation = 0 | 1 | 2 | 3;

export type RotateDir = 'cw' | 'ccw';

export interface ActivePiece {
  readonly type: PieceType;
  readonly rotation: Rotation;
  /** Sınırlayıcı kutunun sol üst köşesinin board kolonu */
  readonly x: number;
  /** Sınırlayıcı kutunun sol üst köşesinin board satırı (+y aşağı) */
  readonly y: number;
}

export type TSpin = 'none' | 'mini' | 'full';

export interface ClearInfo {
  readonly lines: number;
  readonly tspin: TSpin;
  /** Bu temizlemede B2B bonusu uygulandı mı */
  readonly b2b: boolean;
  readonly combo: number;
  readonly points: number;
}

export interface LockState {
  readonly grounded: boolean;
  /** Yerde geçen süre (ms); LOCK_DELAY_MS'e ulaşınca kilitlenir */
  readonly elapsed: number;
  /** Hareketle sıfırlama sayısı; MAX_LOCK_RESETS'te tükenir */
  readonly resets: number;
  /** Parçanın ulaştığı en derin satır; daha derine düşüş reset hakkını tazeler */
  readonly lowestY: number;
}

export type Phase = 'falling' | 'gameOver';

export interface GameState {
  // Oyun alanı
  readonly board: Uint8Array; // sadece kilitlenmiş hücreler, satır-major 24x10
  readonly active: ActivePiece | null;
  readonly ghostY: number;
  readonly hold: PieceType | null;
  readonly canHold: boolean;
  readonly queue: readonly PieceType[]; // her zaman >= QUEUE_SIZE
  readonly bag: readonly PieceType[]; // mevcut 7-bag'in kalanı
  readonly rng: number; // mulberry32 PRNG durumu

  // Zamanlama (yalnızca TICK ilerletir)
  readonly gravityAccum: number;
  readonly softDrop: boolean;
  readonly lock: LockState;

  // İlerleme ve puan
  readonly score: number;
  readonly lines: number;
  readonly level: number;
  readonly combo: number; // -1 = combo yok
  readonly b2b: boolean;
  readonly lastClear: ClearInfo | null;

  // T-spin tespiti için
  readonly lastMoveWasRotation: boolean;
  readonly lastKickIndex: number; // son başarılı rotasyonun SRS kick indeksi, yoksa -1

  readonly phase: Phase;
}

export type GameAction =
  | { type: 'TICK'; dt: number }
  | { type: 'MOVE'; dir: -1 | 1 }
  | { type: 'ROTATE'; dir: RotateDir }
  | { type: 'SOFT_DROP'; on: boolean }
  | { type: 'HARD_DROP' }
  | { type: 'HOLD' }
  | { type: 'NEW_GAME'; seed?: number };
