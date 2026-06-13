import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buttonHaptic, playSfx } from '../audio/sound';
import { levelFromXp, usePrefs, XP_PER_LEVEL, xpIntoLevel } from '../state/prefs';
import { useGame } from '../state/store';
import { IMAGES } from './assets';
import { BottomNav, CurrencyBar, NeonButton, ScreenBackground, type NavKey } from './components';
import { MODES } from './modeMeta';
import { COLORS } from './theme';

const LOGO_ASPECT = 724 / 256;

export function MenuScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const startGame = useGame((s) => s.startGame);
  const navigate = useGame((s) => s.navigate);
  const profile = usePrefs((s) => s.profile);

  const level = levelFromXp(profile.xp);
  const xpPct = xpIntoLevel(profile.xp) / XP_PER_LEVEL;
  const logoWidth = Math.min(width * 0.74, 340);

  const onNav = (key: NavKey) => {
    if (key === 'collection') navigate('collection');
    else if (key === 'leaderboard') navigate('leaderboard');
    else if (key === 'settings') navigate('settings');
  };

  return (
    <ScreenBackground>
      <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 6 }]}>
        {/* Üst: profil + para */}
        <View style={styles.topBar}>
          <View style={styles.profile}>
            <Image source={IMAGES.emblem} style={styles.avatar} resizeMode="contain" />
            <View>
              <Text style={styles.profileName}>PLAYER</Text>
              <View style={styles.xpRow}>
                <Text style={styles.profileLevel}>Lv. {level}</Text>
                <View style={styles.xpBar}>
                  <View style={[styles.xpFill, { width: `${xpPct * 100}%` }]} />
                </View>
              </View>
            </View>
          </View>
          <CurrencyBar gems={profile.gems} coins={profile.coins} />
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={IMAGES.logo}
            style={{ width: logoWidth, height: logoWidth / LOGO_ASPECT, marginVertical: 12 }}
            resizeMode="contain"
          />

          <NeonButton
            label="OYNA"
            icon="play"
            variant="primary"
            onPress={() => startGame('marathon')}
            style={styles.playButton}
          />

          {MODES.map((m) => (
            <Pressable
              key={m.id}
              onPress={() => {
                playSfx('click');
                buttonHaptic();
                startGame(m.id);
              }}
              style={({ pressed }) => [
                styles.modeRow,
                { borderColor: m.accent },
                pressed && styles.pressed,
              ]}
            >
              <MaterialCommunityIcons name={m.icon as never} size={26} color={m.accent} />
              <View style={styles.modeText}>
                <Text style={styles.modeName}>{m.name}</Text>
                <Text style={styles.modeTag}>{m.tagline}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textDim} />
            </Pressable>
          ))}
        </ScrollView>

        <BottomNav active="home" onNavigate={onNav} />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 16 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 40, height: 40 },
  profileName: { color: COLORS.text, fontWeight: '800', fontSize: 14, letterSpacing: 1 },
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  profileLevel: { color: COLORS.accent, fontWeight: '700', fontSize: 11 },
  xpBar: {
    width: 80,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(120,120,150,0.3)',
    overflow: 'hidden',
  },
  xpFill: { height: 5, backgroundColor: COLORS.coin },
  body: { alignItems: 'center', paddingVertical: 8, gap: 10 },
  playButton: { width: '100%', paddingVertical: 18, marginBottom: 6 },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: COLORS.panel,
  },
  modeText: { flex: 1 },
  modeName: { color: COLORS.text, fontWeight: '800', fontSize: 15, letterSpacing: 1 },
  modeTag: { color: COLORS.textDim, fontSize: 12, marginTop: 2 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
});
