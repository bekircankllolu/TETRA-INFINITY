import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { BLOCK_TEXTURES } from './assets';
import { COLORS } from './theme';

interface Props {
  size: number;
  color: number; // 0 = boş
}

/** Tek board hücresi. Memoize: yalnızca rengi değişirse yeniden çizilir. */
export const CellView = React.memo(function CellView({ size, color }: Props) {
  if (color === 0) {
    return <View style={[styles.empty, { width: size, height: size }]} />;
  }
  return (
    <Image
      source={BLOCK_TEXTURES[color]}
      style={{ width: size, height: size }}
      fadeDuration={0}
    />
  );
});

const styles = StyleSheet.create({
  empty: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.gridLine,
  },
});
