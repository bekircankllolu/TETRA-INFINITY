import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SPRINT_GOAL_LINES } from '../core/constants';
import { useSampledElapsed } from '../hooks/useSampledElapsed';
import { useGame } from '../state/store';
import { StatPill } from './components';
import { formatNumber, formatTime } from './format';
import { modeMeta } from './modeMeta';
import { COLORS } from './theme';

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
      <View style={styles.topRow}>
        <View style={styles.modeRow}>
          <MaterialCommunityIcons name={meta.icon as never} size={14} color={meta.accent} />
          <Text style={[styles.modeLabel, { color: meta.accent }]}>{meta.name}</Text>
        </View>
        <Pressable onPress={onPause} style={styles.pauseButton} hitSlop={8}>
          <MaterialCommunityIcons name="pause" size={20} color={COLORS.text} />
        </Pressable>
      </View>
      <View style={styles.row}>
        {mode === 'sprint' ? (
          <>
            <StatPill label="SÜRE" value={formatTime(elapsed)} accent={meta.accent} />
            <StatPill label="SATIR" value={`${lines}/${SPRINT_GOAL_LINES}`} accent={COLORS.accentCyan} />
            <StatPill label="SKOR" value={formatNumber(score)} accent={COLORS.coin} />
          </>
        ) : (
          <>
            <StatPill label="SKOR" value={formatNumber(score)} accent={meta.accent} />
            <StatPill label="SEVİYE" value={String(level)} accent={COLORS.accentCyan} />
            <StatPill label="SATIR" value={String(lines)} accent={COLORS.coin} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: 13, gap: 6 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 3 },
  modeRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  modeLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  row: { flexDirection: 'row', alignItems: 'stretch' },
  pauseButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
