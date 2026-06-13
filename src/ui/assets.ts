/** Dilimlenmiş oyun görselleri (kaynak: asset/, üretici: scripts/slice_assets.py)
 *  ve prosedürel skinler (üretici: scripts/gen_skins.py) */

import type { ImageSourcePropType } from 'react-native';
import { PIECE_COLOR_ID } from '../core/tetromino';

export type ColorTextureMap = Record<number, ImageSourcePropType>;

const crystal: ColorTextureMap = {
  [PIECE_COLOR_ID.I]: require('../../assets/game/blocks/i.png'),
  [PIECE_COLOR_ID.O]: require('../../assets/game/blocks/o.png'),
  [PIECE_COLOR_ID.T]: require('../../assets/game/blocks/t.png'),
  [PIECE_COLOR_ID.S]: require('../../assets/game/blocks/s.png'),
  [PIECE_COLOR_ID.Z]: require('../../assets/game/blocks/z.png'),
  [PIECE_COLOR_ID.J]: require('../../assets/game/blocks/j.png'),
  [PIECE_COLOR_ID.L]: require('../../assets/game/blocks/l.png'),
};

const neon: ColorTextureMap = {
  [PIECE_COLOR_ID.I]: require('../../assets/game/skins/neon/i.png'),
  [PIECE_COLOR_ID.O]: require('../../assets/game/skins/neon/o.png'),
  [PIECE_COLOR_ID.T]: require('../../assets/game/skins/neon/t.png'),
  [PIECE_COLOR_ID.S]: require('../../assets/game/skins/neon/s.png'),
  [PIECE_COLOR_ID.Z]: require('../../assets/game/skins/neon/z.png'),
  [PIECE_COLOR_ID.J]: require('../../assets/game/skins/neon/j.png'),
  [PIECE_COLOR_ID.L]: require('../../assets/game/skins/neon/l.png'),
};

const retro: ColorTextureMap = {
  [PIECE_COLOR_ID.I]: require('../../assets/game/skins/retro/i.png'),
  [PIECE_COLOR_ID.O]: require('../../assets/game/skins/retro/o.png'),
  [PIECE_COLOR_ID.T]: require('../../assets/game/skins/retro/t.png'),
  [PIECE_COLOR_ID.S]: require('../../assets/game/skins/retro/s.png'),
  [PIECE_COLOR_ID.Z]: require('../../assets/game/skins/retro/z.png'),
  [PIECE_COLOR_ID.J]: require('../../assets/game/skins/retro/j.png'),
  [PIECE_COLOR_ID.L]: require('../../assets/game/skins/retro/l.png'),
};

export const SKIN_TEXTURES: Record<string, ColorTextureMap> = { crystal, neon, retro };

export type Rarity = 'common' | 'epic' | 'legendary';

export interface SkinMeta {
  id: string;
  name: string;
  rarity: Rarity;
  cost: number; // coin (0 = başlangıçta açık)
}

/** Koleksiyon ekranı için skin kataloğu */
export const SKINS: readonly SkinMeta[] = [
  { id: 'crystal', name: 'Prism Crystal', rarity: 'legendary', cost: 0 },
  { id: 'neon', name: 'Neon Grid', rarity: 'epic', cost: 500 },
  { id: 'retro', name: 'Retro Blocks', rarity: 'common', cost: 200 },
];

export function getSkinTextures(id: string): ColorTextureMap {
  return SKIN_TEXTURES[id] ?? crystal;
}

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
