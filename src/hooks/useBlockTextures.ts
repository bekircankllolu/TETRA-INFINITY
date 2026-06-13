import { getSkinTextures, type ColorTextureMap } from '../ui/assets';
import { usePrefs } from '../state/prefs';

/** Takılı skinin renk→doku haritası. Skin değişince yeni referans döner. */
export function useBlockTextures(): ColorTextureMap {
  const skin = usePrefs((s) => s.profile.equippedSkin);
  return getSkinTextures(skin);
}
