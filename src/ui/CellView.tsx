import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { COLORS } from './theme';

interface Props {
  size: number;
  color: number; // 0 = boş
  texture?: ImageSourcePropType;
}

/** Tek board hücresi. Memoize: yalnızca boyut/renk/doku değişirse yeniden çizilir. */
export const CellView = React.memo(function CellView({ size, color, texture }: Props) {
  if (color === 0 || !texture) {
    return <View style={[styles.empty, { width: size, height: size }]} />;
  }
  return <Image source={texture} style={{ width: size, height: size }} fadeDuration={0} />;
});

const styles = StyleSheet.create({
  empty: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.gridLine,
  },
});
