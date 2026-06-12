import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { gameStore, useGame } from '../state/store';
import { PiecePreview } from './PiecePreview';
import { COLORS } from './theme';

/** Saklanan parça. Kutuya dokunmak da HOLD yapar. */
export function HoldBox() {
  const hold = useGame((s) => s.game.hold);
  const canHold = useGame((s) => s.game.canHold);
  return (
    <Pressable
      onPress={() => gameStore.getState().dispatch({ type: 'HOLD' })}
      style={[styles.box, !canHold && styles.disabled]}
    >
      <Text style={styles.label}>HOLD</Text>
      <PiecePreview type={hold} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    gap: 6,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: COLORS.textDim,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
