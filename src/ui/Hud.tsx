import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../state/store';
import { COLORS } from './theme';

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

/** Skor / seviye / satır + duraklat düğmesi + temizleme bildirimi */
export function Hud({ onPause }: { onPause: () => void }) {
  const score = useGame((s) => s.game.score);
  const level = useGame((s) => s.game.level);
  const lines = useGame((s) => s.game.lines);
  const lastClear = useGame((s) => s.game.lastClear);

  let toast: string | null = null;
  if (lastClear !== null) {
    const names = ['', 'SINGLE', 'DOUBLE', 'TRIPLE', 'TETRIS'];
    const parts: string[] = [];
    if (lastClear.tspin !== 'none') parts.push(lastClear.tspin === 'mini' ? 'T-SPIN MINI' : 'T-SPIN');
    if (lastClear.lines > 0) parts.push(names[lastClear.lines] ?? '');
    if (lastClear.b2b) parts.push('B2B');
    if (lastClear.combo > 0) parts.push(`COMBO ×${lastClear.combo}`);
    toast = parts.join(' ');
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Stat label="SKOR" value={score} />
        <Stat label="SEVİYE" value={level} />
        <Stat label="SATIR" value={lines} />
        <Pressable onPress={onPause} style={styles.pauseButton} hitSlop={8}>
          <Text style={styles.pauseText}>II</Text>
        </Pressable>
      </View>
      <Text style={styles.toast} numberOfLines={1}>
        {toast ?? ' '}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    color: COLORS.textDim,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  pauseButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  toast: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    minHeight: 18,
  },
});
