import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { COLS, HIDDEN_ROWS, VISIBLE_ROWS } from '../core/constants';
import { PIECE_COLOR_ID, pieceCells } from '../core/tetromino';
import type { ActivePiece } from '../core/types';
import { useBlockTextures } from '../hooks/useBlockTextures';
import { usePrefs } from '../state/prefs';
import { useGame } from '../state/store';
import type { ColorTextureMap } from './assets';
import { CellView } from './CellView';
import { ClearEffects } from './ClearEffects';
import { COLORS, GHOST_OPACITY, GRADIENTS } from './theme';

/** Board köşelerine neon L-aksanları */
function CornerAccents() {
  return (
    <>
      <View style={[styles.corner, styles.cTL]} />
      <View style={[styles.corner, styles.cTR]} />
      <View style={[styles.corner, styles.cBL]} />
      <View style={[styles.corner, styles.cBR]} />
    </>
  );
}

interface Props {
  cellSize: number;
}

/** Kilitlenmiş hücreler: yalnızca board veya skin değişince render olur */
const SettledGrid = React.memo(function SettledGrid({
  cellSize,
  textures,
}: {
  cellSize: number;
  textures: ColorTextureMap;
}) {
  const board = useGame((s) => s.game.board);
  const cells: React.ReactElement[] = [];
  for (let y = HIDDEN_ROWS; y < HIDDEN_ROWS + VISIBLE_ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const color = board[y * COLS + x] ?? 0;
      cells.push(
        <CellView key={y * COLS + x} size={cellSize} color={color} texture={textures[color]} />
      );
    }
  }
  return <View style={[styles.grid, { width: cellSize * COLS }]}>{cells}</View>;
});

/** Aktif parça + ghost. Aktif parça tek satır düşüşlerde yumuşakça kayar. */
function PieceOverlay({ cellSize, textures }: { cellSize: number; textures: ColorTextureMap }) {
  const active = useGame((s) => s.game.active);
  const ghostYPos = useGame((s) => s.game.ghostY);
  const showGhost = usePrefs((s) => s.settings.ghostPiece);

  const transY = useRef(new Animated.Value(0)).current;
  const prevY = useRef<number | null>(null);

  useEffect(() => {
    if (active === null) {
      prevY.current = null;
      transY.setValue(0);
      return;
    }
    const p = prevY.current;
    // Yalnızca tam bir satırlık düşüşte yumuşat; teleport/spawn/yatay snap
    if (p !== null && active.y - p === 1) {
      transY.setValue(-cellSize);
      Animated.timing(transY, {
        toValue: 0,
        duration: 55,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else {
      transY.setValue(0);
    }
    prevY.current = active.y;
  }, [active, cellSize, transY]);

  if (active === null) return null;

  const texture = textures[PIECE_COLOR_ID[active.type]];
  const ghost: ActivePiece = { ...active, y: ghostYPos };

  const renderCells = (piece: ActivePiece, opacity: number, keyPrefix: string) =>
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
      {showGhost && ghostYPos !== active.y && renderCells(ghost, GHOST_OPACITY, 'g')}
      <Animated.View
        style={[StyleSheet.absoluteFill, { transform: [{ translateY: transY }] }]}
        pointerEvents="none"
      >
        {renderCells(active, 1, 'a')}
      </Animated.View>
    </>
  );
}

export function BoardView({ cellSize }: Props) {
  const textures = useBlockTextures();
  return (
    <View
      style={[
        styles.board,
        { width: cellSize * COLS, height: cellSize * VISIBLE_ROWS },
      ]}
    >
      <LinearGradient colors={GRADIENTS.board} style={StyleSheet.absoluteFill} />
      <SettledGrid cellSize={cellSize} textures={textures} />
      <PieceOverlay cellSize={cellSize} textures={textures} />
      <ClearEffects cellSize={cellSize} />
      <CornerAccents />
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: COLORS.boardBackground,
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderRadius: 6,
    overflow: 'hidden',
    shadowColor: COLORS.accent,
    shadowOpacity: 0.85,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  corner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: COLORS.accentCyan,
  },
  cTL: { top: 3, left: 3, borderTopWidth: 2, borderLeftWidth: 2 },
  cTR: { top: 3, right: 3, borderTopWidth: 2, borderRightWidth: 2 },
  cBL: { bottom: 3, left: 3, borderBottomWidth: 2, borderLeftWidth: 2 },
  cBR: { bottom: 3, right: 3, borderBottomWidth: 2, borderRightWidth: 2 },
});
