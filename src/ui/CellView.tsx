import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CELL_COLORS, COLORS } from './theme';

interface Props {
  size: number;
  color: number; // 0 = boş
}

/** Tek board hücresi. Memoize: yalnızca rengi değişirse yeniden çizilir. */
export const CellView = React.memo(function CellView({ size, color }: Props) {
  return (
    <View
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          backgroundColor: color === 0 ? 'transparent' : CELL_COLORS[color],
        },
      ]}
    />
  );
});

const styles = StyleSheet.create({
  cell: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.gridLine,
  },
});
