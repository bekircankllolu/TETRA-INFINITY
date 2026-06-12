/** Dilimlenmiş oyun görselleri (kaynak: asset/, üretici: scripts/slice_assets.py) */

import { PIECE_COLOR_ID } from '../core/tetromino';

/** Renk kimliği (board hücre değeri) → blok dokusu */
export const BLOCK_TEXTURES: Record<number, number> = {
  [PIECE_COLOR_ID.I]: require('../../assets/game/blocks/i.png'),
  [PIECE_COLOR_ID.O]: require('../../assets/game/blocks/o.png'),
  [PIECE_COLOR_ID.T]: require('../../assets/game/blocks/t.png'),
  [PIECE_COLOR_ID.S]: require('../../assets/game/blocks/s.png'),
  [PIECE_COLOR_ID.Z]: require('../../assets/game/blocks/z.png'),
  [PIECE_COLOR_ID.J]: require('../../assets/game/blocks/j.png'),
  [PIECE_COLOR_ID.L]: require('../../assets/game/blocks/l.png'),
};

export const IMAGES = {
  background: require('../../assets/game/bg.jpg'),
  logo: require('../../assets/game/logo.png'),
  emblem: require('../../assets/game/emblem.png'),
  btnLeft: require('../../assets/game/buttons/left.png'),
  btnRight: require('../../assets/game/buttons/right.png'),
  btnRotate: require('../../assets/game/buttons/rotate.png'),
  btnSoft: require('../../assets/game/buttons/soft.png'),
  btnHard: require('../../assets/game/buttons/hard.png'),
} as const;
