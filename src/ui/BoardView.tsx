import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { COLS, HIDDEN_ROWS, VISIBLE_ROWS } from '../core/constants';
import { PIECE_COLOR_ID, pieceCells } from '../core/tetromino';
import type { ActivePiece } from '../core/types';
import { useGame } from '../state/store';
import { BLOCK_TEXTURES } from './assets';
import { CellView } from './CellView';
import { ClearEffects } from './ClearEffects';
import { COLORS, GHOST_OPACITY } from './theme';

interface Props {
  cellSize: number;
}

/** Kilitlenmiş hücreler: yalnızca board referansı değişince (kilitte) render olur */
const SettledGrid = React.memo(function SettledGrid({ cellSize }: { cellSize: number }) {
  const board = useGame((s) => s.game.board);
  const cells: React.ReactElement[] = [];
  for (let y = HIDDEN_ROWS; y < HIDDEN_ROWS + VISIBLE_ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      cells.push(<CellView key={y * COLS + x} size={cellSize} color={board[y * COLS + x] ?? 0} />);
    }
  }
  return <View style={[styles.grid, { width: cellSize * COLS }]}>{cells}</View>;
});

/** Aktif parça + ghost: hareketlerde yalnızca bu 8 küçük view güncellenir */
function PieceOverlay({ cellSize }: { cellSize: number }) {
  const active = useGame((s) => s.game.active);
  const ghostYPos = useGame((s) => s.game.ghostY);
  if (active === null) return null;

  const texture = BLOCK_TEXTURES[PIECE_COLOR_ID[active.type]];
  const ghost: ActivePiece = { ...active, y: ghostYPos };

  const render = (piece: ActivePiece, opacity: number, keyPrefix: string) =>
    pieceCells(piece)
      .filter(([, y]) => y >= HIDDEN_ROWS)
      .map(([x, y], i) => (
        <Image
          key={`${keyPrefix}${i}`}
          source={texture}
          fadeDuration={0}
          style={{
            position: 'absolute',
            left: x * cellSize,
            top: (y - HIDDEN_ROWS) * cellSize,
            width: cellSize,
            height: cellSize,
            opacity,
          }}
        />
      ));

  return (
    <>
      {ghostYPos !== active.y && render(ghost, GHOST_OPACITY, 'g')}
      {render(active, 1, 'a')}
    </>
  );
}

export function BoardView({ cellSize }: Props) {
  return (
    <View
      style={[
        styles.board,
        { width: cellSize * COLS, height: cellSize * VISIBLE_ROWS },
      ]}
    >
      <SettledGrid cellSize={cellSize} />
      <PieceOverlay cellSize={cellSize} />
      <ClearEffects cellSize={cellSize} />
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: COLORS.boardBackground,
    borderWidth: 2,
    borderColor: COLORS.panelBorder,
    borderRadius: 4,
    overflow: 'hidden',
    shadowColor: COLORS.accent,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
