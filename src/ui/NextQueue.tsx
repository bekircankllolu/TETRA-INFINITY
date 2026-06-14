import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { usePrefs } from '../state/prefs';
import { useGame } from '../state/store';
import { PanelChip } from './components';
import { PiecePreview } from './PiecePreview';
import { COLORS, GRADIENTS } from './theme';

/** Sıradaki parçalar (ayardan 3-5 adet önizleme) */
export function NextQueue() {
  const queue = useGame((s) => s.game.queue);
  const nextCount = usePrefs((s) => s.settings.nextCount);
  return (
    <View style={styles.box}>
      <LinearGradient colors={GRADIENTS.panel} style={StyleSheet.absoluteFill} />
      <PanelChip label="NEXT" />
      {queue.slice(0, nextCount).map((type, i) => (
        <PiecePreview key={`${i}-${type}`} type={type} cellSize={i === 0 ? 9 : 7} />
      ))}
    </View>
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
    gap: 8,
    overflow: 'hidden',
  },
});
