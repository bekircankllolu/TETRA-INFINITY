import React from 'react';
import { Image, View } from 'react-native';
import { boxSize, cellsOf, PIECE_COLOR_ID } from '../core/tetromino';
import type { PieceType } from '../core/types';
import { useBlockTextures } from '../hooks/useBlockTextures';

interface Props {
  type: PieceType | null;
  cellSize?: number;
}

/** Hold/Next kutuları için 4x4'lük mini parça görseli */
export const PiecePreview = React.memo(function PiecePreview({ type, cellSize = 9 }: Props) {
  const textures = useBlockTextures();
  const box = 4 * cellSize;
  if (type === null) {
    return <View style={{ width: box, height: box }} />;
  }
  const cells = cellsOf(type, 0);
  const n = boxSize(type);
  const texture = textures[PIECE_COLOR_ID[type]];
  // Parçayı kutu içinde ortala
  const minY = Math.min(...cells.map(([, y]) => y));
  const maxY = Math.max(...cells.map(([, y]) => y));
  const offsetX = ((4 - n) * cellSize) / 2;
  const offsetY = ((4 - (maxY - minY + 1)) * cellSize) / 2 - minY * cellSize;
  return (
    <View style={{ width: box, height: box }}>
      {cells.map(([x, y], i) => (
        <Image
          key={i}
          source={texture}
          fadeDuration={0}
          style={{
            position: 'absolute',
            left: offsetX + x * cellSize,
            top: offsetY + y * cellSize,
            width: cellSize,
            height: cellSize,
          }}
        />
      ))}
    </View>
  );
});
