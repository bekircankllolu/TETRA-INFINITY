import React from 'react';
import { View } from 'react-native';
import { boxSize, cellsOf, PIECE_COLOR_ID } from '../core/tetromino';
import type { PieceType } from '../core/types';
import { CELL_COLORS } from './theme';

interface Props {
  type: PieceType | null;
  cellSize?: number;
}

/** Hold/Next kutuları için 4x4'lük mini parça görseli */
export const PiecePreview = React.memo(function PiecePreview({ type, cellSize = 9 }: Props) {
  const box = 4 * cellSize;
  if (type === null) {
    return <View style={{ width: box, height: box }} />;
  }
  const cells = cellsOf(type, 0);
  const n = boxSize(type);
  // Parçayı kutu içinde ortala
  const minY = Math.min(...cells.map(([, y]) => y));
  const maxY = Math.max(...cells.map(([, y]) => y));
  const offsetX = ((4 - n) * cellSize) / 2;
  const offsetY = ((4 - (maxY - minY + 1)) * cellSize) / 2 - minY * cellSize;
  return (
    <View style={{ width: box, height: box }}>
      {cells.map(([x, y], i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: offsetX + x * cellSize,
            top: offsetY + y * cellSize,
            width: cellSize - 1,
            height: cellSize - 1,
            borderRadius: 1,
            backgroundColor: CELL_COLORS[PIECE_COLOR_ID[type]],
          }}
        />
      ))}
    </View>
  );
});
