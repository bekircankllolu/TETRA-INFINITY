import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { usePrefs } from '../state/prefs';
import { useGame } from '../state/store';
import { NeonButton, NeonPanel } from './components';
import { formatNumber, formatTime } from './format';
import { modeMeta } from './modeMeta';
import { COLORS } from './theme';

export function GameOverOverlay({ win }: { win: boolean }) {
  const mode = useGame((s) => s.game.mode);
  const score = useGame((s) => s.game.score);
  const level = useGame((s) => s.game.level);
  const lines = useGame((s) => s.game.lines);
  const elapsed = useGame((s) => s.game.elapsedMs);
  const startGame = useGame((s) => s.startGame);
  const quitToMenu = useGame((s) => s.quitToMenu);
  const record = usePrefs((s) => s.records[mode]);
  const meta = modeMeta(mode);

  return (
    <View style={styles.overlay}>
      <MaterialCommunityIcons
        name={win ? 'trophy' : 'flag-checkered'}
        size={56}
        color={win ? COLORS.coin : COLORS.danger}
      />
      <Text style={[styles.title, { color: win ? COLORS.coin : COLORS.danger }]}>
        {win ? 'TAMAMLANDI' : 'OYUN BİTTİ'}
      </Text>

      <NeonPanel style={styles.panel} accent={meta.accent}>
        {mode === 'sprint' ? (
          <>
            <Text style={styles.big}>{formatTime(elapsed)}</Text>
            <Text style={styles.detail}>{lines} satır · {formatNumber(score)} skor</Text>
            <Text style={styles.best}>En iyi: {formatTime(record.bestTimeMs)}</Text>
          </>
        ) : (
          <>
            <Text style={styles.big}>{formatNumber(score)}</Text>
            <Text style={styles.detail}>Seviye {level} · {lines} satır</Text>
            <Text style={styles.best}>En iyi: {formatNumber(record.bestScore)}</Text>
          </>
        )}
      </NeonPanel>

      <View style={styles.buttons}>
        <NeonButton label="TEKRAR OYNA" icon="restart" variant="primary" accent={meta.accent} onPress={() => startGame(mode)} style={styles.btn} />
        <NeonButton label="MENÜYE DÖN" icon="home" onPress={quitToMenu} style={styles.btn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: { fontSize: 26, fontWeight: '900', letterSpacing: 4 },
  panel: { alignItems: 'center', width: 260, gap: 4 },
  big: { color: COLORS.text, fontSize: 44, fontWeight: '900', fontVariant: ['tabular-nums'] },
  detail: { color: COLORS.textDim, fontSize: 14, fontWeight: '600' },
  best: { color: COLORS.accent, fontSize: 13, fontWeight: '700', marginTop: 4 },
  buttons: { gap: 12, width: 240, marginTop: 4 },
  btn: { width: '100%' },
});
