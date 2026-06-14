import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { buttonHaptic, playSfx } from '../audio/sound';
import { gameStore, useGame } from '../state/store';
import { PanelChip } from './components';
import { PiecePreview } from './PiecePreview';
import { COLORS, GRADIENTS } from './theme';

/** Saklanan parça. Kutuya dokunmak da HOLD yapar. */
export function HoldBox() {
  const hold = useGame((s) => s.game.hold);
  const canHold = useGame((s) => s.game.canHold);
  return (
    <Pressable
      onPress={() => {
        playSfx('hold');
        buttonHaptic();
        gameStore.getState().dispatch({ type: 'HOLD' });
      }}
      style={[styles.box, !canHold && styles.disabled]}
    >
      <LinearGradient colors={GRADIENTS.panel} style={StyleSheet.absoluteFill} />
      <PanelChip label="HOLD" />
      <View style={styles.preview}>
        <PiecePreview type={hold} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  disabled: { opacity: 0.4 },
  preview: { alignItems: 'center', justifyContent: 'center' },
});
