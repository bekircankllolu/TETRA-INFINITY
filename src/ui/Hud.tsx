import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SPRINT_GOAL_LINES } from '../core/constants';
import { useSampledElapsed } from '../hooks/useSampledElapsed';
import { useGame } from '../state/store';
import { formatNumber, formatTime } from './format';
import { modeMeta } from './modeMeta';
import { COLORS } from './theme';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

/** Skor / seviye / satır (veya Sprint için süre + hedef) + duraklat düğmesi */
export function Hud({ onPause }: { onPause: () => void }) {
  const mode = useGame((s) => s.game.mode);
  const score = useGame((s) => s.game.score);
  const level = useGame((s) => s.game.level);
  const lines = useGame((s) => s.game.lines);
  const status = useGame((s) => s.status);
  const meta = modeMeta(mode);
  const elapsed = useSampledElapsed(mode === 'sprint' && status === 'playing');

  return (
    <View style={styles.container}>
      <View style={styles.modeRow}>
        <MaterialCommunityIcons name={meta.icon as never} size={14} color={meta.accent} />
        <Text style={[styles.modeLabel, { color: meta.accent }]}>{meta.name}</Text>
      </View>
      <View style={styles.row}>
        {mode === 'sprint' ? (
          <>
            <Stat label="SÜRE" value={formatTime(elapsed)} />
            <Stat label="SATIR" value={`${lines}/${SPRINT_GOAL_LINES}`} />
            <Stat label="SKOR" value={formatNumber(score)} />
          </>
        ) : (
          <>
            <Stat label="SKOR" value={formatNumber(score)} />
            <Stat label="SEVİYE" value={String(level)} />
            <Stat label="SATIR" value={String(lines)} />
          </>
        )}
        <Pressable onPress={onPause} style={styles.pauseButton} hitSlop={8}>
          <MaterialCommunityIcons name="pause" size={20} color={COLORS.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: 16, gap: 4 },
  modeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  modeLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stat: { alignItems: 'center' },
  statLabel: { color: COLORS.textDim, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  statValue: { color: COLORS.text, fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
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
});
