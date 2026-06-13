import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { levelFromXp, usePrefs } from '../state/prefs';
import { useGame } from '../state/store';
import { BackButton, BottomNav, NeonPanel, ScreenBackground, type NavKey } from './components';
import { formatNumber, formatTime } from './format';
import { MODES } from './modeMeta';
import { COLORS } from './theme';

export function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const navigate = useGame((s) => s.navigate);
  const profile = usePrefs((s) => s.profile);
  const records = usePrefs((s) => s.records);
  const level = levelFromXp(profile.xp);

  const onNav = (key: NavKey) => {
    if (key === 'home') navigate('menu');
    else if (key === 'collection') navigate('collection');
    else if (key === 'settings') navigate('settings');
  };

  return (
    <ScreenBackground>
      <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 6 }]}>
        <View style={styles.header}>
          <BackButton onPress={() => navigate('menu')} />
          <Text style={styles.title}>SIRALAMA</Text>
          <View style={{ width: 42 }} />
        </View>

        <ScrollView contentContainerStyle={{ gap: 14 }} showsVerticalScrollIndicator={false}>
          <NeonPanel style={styles.rankCard}>
            <MaterialCommunityIcons name="shield-star" size={40} color={COLORS.coin} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rankName}>PLAYER</Text>
              <Text style={styles.rankLevel}>Seviye {level}</Text>
            </View>
            <View style={styles.xpBox}>
              <Text style={styles.xpValue}>{formatNumber(profile.xp)}</Text>
              <Text style={styles.xpLabel}>TOPLAM XP</Text>
            </View>
          </NeonPanel>

          <Text style={styles.sectionTitle}>KİŞİSEL REKORLAR</Text>
          {MODES.map((m) => {
            const rec = records[m.id];
            return (
              <NeonPanel key={m.id} style={styles.modeCard} accent={m.accent}>
                <MaterialCommunityIcons name={m.icon as never} size={26} color={m.accent} />
                <Text style={styles.modeName}>{m.name}</Text>
                <View style={styles.modeStats}>
                  {m.id === 'sprint' ? (
                    <Text style={styles.modeValue}>{formatTime(rec.bestTimeMs)}</Text>
                  ) : (
                    <Text style={styles.modeValue}>{formatNumber(rec.bestScore)}</Text>
                  )}
                  <Text style={styles.modeSub}>
                    {m.id === 'sprint' ? 'en iyi süre' : `${rec.bestLines} satır · ${rec.played} oyun`}
                  </Text>
                </View>
              </NeonPanel>
            );
          })}

          <View style={styles.soon}>
            <MaterialCommunityIcons name="earth" size={16} color={COLORS.textDim} />
            <Text style={styles.soonText}>Küresel sıralama yakında (çevrimiçi hesap gerekir)</Text>
          </View>
        </ScrollView>

        <BottomNav active="leaderboard" onNavigate={onNav} />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  title: { color: COLORS.text, fontSize: 22, fontWeight: '900', letterSpacing: 3 },
  rankCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rankName: { color: COLORS.text, fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  rankLevel: { color: COLORS.accent, fontSize: 13, fontWeight: '700', marginTop: 2 },
  xpBox: { alignItems: 'flex-end' },
  xpValue: { color: COLORS.coin, fontSize: 18, fontWeight: '900', fontVariant: ['tabular-nums'] },
  xpLabel: { color: COLORS.textDim, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  sectionTitle: { color: COLORS.textDim, fontWeight: '800', fontSize: 12, letterSpacing: 2 },
  modeCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modeName: { color: COLORS.text, fontSize: 15, fontWeight: '800', letterSpacing: 1, flex: 1 },
  modeStats: { alignItems: 'flex-end' },
  modeValue: { color: COLORS.text, fontSize: 17, fontWeight: '900', fontVariant: ['tabular-nums'] },
  modeSub: { color: COLORS.textDim, fontSize: 11, marginTop: 2 },
  soon: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  soonText: { color: COLORS.textDim, fontSize: 12 },
});
