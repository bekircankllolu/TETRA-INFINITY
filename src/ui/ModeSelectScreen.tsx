import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buttonHaptic, playSfx } from '../audio/sound';
import { SPRINT_GOAL_LINES } from '../core/constants';
import { usePrefs } from '../state/prefs';
import { useGame } from '../state/store';
import { BackButton, NeonButton, ScreenBackground } from './components';
import { formatNumber, formatTime } from './format';
import { MODES } from './modeMeta';
import { COLORS } from './theme';

export function ModeSelectScreen() {
  const insets = useSafeAreaInsets();
  const selected = useGame((s) => s.mode);
  const setMode = useGame((s) => s.setMode);
  const startGame = useGame((s) => s.startGame);
  const navigate = useGame((s) => s.navigate);
  const records = usePrefs((s) => s.records);

  return (
    <ScreenBackground>
      <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.header}>
          <BackButton onPress={() => navigate('menu')} />
          <Text style={styles.title}>MOD SEÇ</Text>
          <View style={{ width: 42 }} />
        </View>

        <View style={styles.list}>
          {MODES.map((m) => {
            const on = m.id === selected;
            const rec = records[m.id];
            return (
              <Pressable
                key={m.id}
                onPress={() => {
                  playSfx('click');
                  buttonHaptic();
                  setMode(m.id);
                }}
                style={[styles.card, { borderColor: on ? m.accent : COLORS.panelBorder }, on && styles.cardOn]}
              >
                <View style={styles.cardHead}>
                  <MaterialCommunityIcons name={m.icon as never} size={30} color={m.accent} />
                  <View style={styles.cardText}>
                    <Text style={styles.cardName}>{m.name}</Text>
                    <Text style={styles.cardTag}>{m.tagline}</Text>
                  </View>
                  {on && <MaterialCommunityIcons name="check-circle" size={22} color={m.accent} />}
                </View>
                <View style={styles.statsRow}>
                  <Stat label="EN İYİ SKOR" value={formatNumber(rec.bestScore)} />
                  {m.id === 'sprint' ? (
                    <Stat label={`${SPRINT_GOAL_LINES} SATIR`} value={formatTime(rec.bestTimeMs)} />
                  ) : (
                    <Stat label="EN İYİ SATIR" value={String(rec.bestLines)} />
                  )}
                  <Stat label="OYNANMA" value={String(rec.played)} />
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />
        <NeonButton
          label="BAŞLAT"
          icon="play"
          variant="primary"
          accent={MODES.find((m) => m.id === selected)?.accent}
          onPress={() => startGame(selected)}
          style={styles.start}
        />
      </View>
    </ScreenBackground>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { color: COLORS.text, fontSize: 22, fontWeight: '900', letterSpacing: 3 },
  list: { gap: 12 },
  card: {
    backgroundColor: COLORS.panel,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  cardOn: { backgroundColor: 'rgba(30,22,60,0.85)' },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardText: { flex: 1 },
  cardName: { color: COLORS.text, fontSize: 17, fontWeight: '800', letterSpacing: 1 },
  cardTag: { color: COLORS.textDim, fontSize: 12, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.panelBorder,
    paddingTop: 10,
  },
  stat: { alignItems: 'center', flex: 1 },
  statLabel: { color: COLORS.textDim, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  statValue: { color: COLORS.text, fontSize: 15, fontWeight: '800', marginTop: 3, fontVariant: ['tabular-nums'] },
  start: { width: '100%', paddingVertical: 18 },
});
