import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
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
  const accent = win ? COLORS.coin : COLORS.danger;

  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }).start();
  }, [anim]);

  return (
    <View style={styles.scrim}>
      <Animated.View
        style={[
          styles.content,
          { opacity: anim, transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] },
        ]}
      >
        <MaterialCommunityIcons name={win ? 'trophy' : 'flag-checkered'} size={56} color={accent} />
        <Text style={[styles.title, { color: accent, textShadowColor: accent }]}>
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
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(5,3,14,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { alignItems: 'center', gap: 12, width: '80%' },
  title: { fontSize: 26, fontWeight: '900', letterSpacing: 4, textShadowRadius: 18, textShadowOffset: { width: 0, height: 0 } },
  panel: { alignItems: 'center', width: '100%', gap: 4 },
  big: { color: COLORS.text, fontSize: 44, fontWeight: '900', fontVariant: ['tabular-nums'] },
  detail: { color: COLORS.textDim, fontSize: 14, fontWeight: '600' },
  best: { color: COLORS.accent, fontSize: 13, fontWeight: '700', marginTop: 4 },
  buttons: { gap: 12, width: '100%', marginTop: 4 },
  btn: { width: '100%' },
});
