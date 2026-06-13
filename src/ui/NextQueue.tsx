import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { usePrefs } from '../state/prefs';
import { useGame } from '../state/store';
import { PiecePreview } from './PiecePreview';
import { COLORS } from './theme';

/** Sıradaki parçalar (ayardan 3-5 adet önizleme) */
export function NextQueue() {
  const queue = useGame((s) => s.game.queue);
  const nextCount = usePrefs((s) => s.settings.nextCount);
  return (
    <View style={styles.box}>
      <Text style={styles.label}>NEXT</Text>
      {queue.slice(0, nextCount).map((type, i) => (
        <PiecePreview key={`${i}-${type}`} type={type} cellSize={i === 0 ? 9 : 7} />
      ))}
    </View>
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
    gap: 8,
  },
  label: {
    color: COLORS.textDim,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
