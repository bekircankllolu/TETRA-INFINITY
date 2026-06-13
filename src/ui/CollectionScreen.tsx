import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buttonHaptic, playSfx } from '../audio/sound';
import { PIECE_COLOR_ID } from '../core/tetromino';
import { usePrefs } from '../state/prefs';
import { useGame } from '../state/store';
import { getSkinTextures, SKINS, type SkinMeta } from './assets';
import { BackButton, BottomNav, CurrencyBar, NeonButton, ScreenBackground, type NavKey } from './components';
import { COLORS, RARITY } from './theme';

export function CollectionScreen() {
  const insets = useSafeAreaInsets();
  const navigate = useGame((s) => s.navigate);
  const profile = usePrefs((s) => s.profile);
  const equipSkin = usePrefs((s) => s.equipSkin);
  const unlockSkin = usePrefs((s) => s.unlockSkin);

  const onNav = (key: NavKey) => {
    if (key === 'home') navigate('menu');
    else if (key === 'leaderboard') navigate('leaderboard');
    else if (key === 'settings') navigate('settings');
  };

  const handle = (skin: SkinMeta, unlocked: boolean, equipped: boolean) => {
    playSfx('click');
    buttonHaptic();
    if (equipped) return;
    if (unlocked) equipSkin(skin.id);
    else unlockSkin(skin.id, skin.cost);
  };

  return (
    <ScreenBackground>
      <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 6 }]}>
        <View style={styles.header}>
          <BackButton onPress={() => navigate('menu')} />
          <Text style={styles.title}>KOLEKSİYON</Text>
          <CurrencyBar gems={profile.gems} coins={profile.coins} />
        </View>

        <Text style={styles.subtitle}>BLOK SKİNLERİ</Text>

        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {SKINS.map((skin) => {
            const unlocked = profile.unlockedSkins.includes(skin.id);
            const equipped = profile.equippedSkin === skin.id;
            const tex = getSkinTextures(skin.id);
            const rarity = RARITY[skin.rarity] ?? COLORS.panelBorder;
            return (
              <View key={skin.id} style={[styles.card, { borderColor: rarity }]}>
                <View style={styles.preview}>
                  {(['s', 'i', 'l', 't'] as const).map((c, idx) => (
                    <Image
                      key={idx}
                      source={tex[PIECE_COLOR_ID[c.toUpperCase() as 'S' | 'I' | 'L' | 'T']]}
                      style={styles.previewCell}
                      fadeDuration={0}
                    />
                  ))}
                  {!unlocked && (
                    <View style={styles.lockOverlay}>
                      <MaterialCommunityIcons name="lock" size={22} color={COLORS.text} />
                    </View>
                  )}
                </View>
                <Text style={[styles.rarity, { color: rarity }]}>{skin.rarity.toUpperCase()}</Text>
                <Text style={styles.skinName}>{skin.name}</Text>
                {equipped ? (
                  <View style={styles.equipped}>
                    <MaterialCommunityIcons name="check" size={14} color={COLORS.accentCyan} />
                    <Text style={styles.equippedText}>TAKILI</Text>
                  </View>
                ) : unlocked ? (
                  <NeonButton label="KULLAN" onPress={() => handle(skin, true, false)} style={styles.cardBtn} />
                ) : (
                  <NeonButton
                    label={`${skin.cost}`}
                    icon="circle-multiple"
                    accent={profile.coins >= skin.cost ? COLORS.coin : COLORS.textDim}
                    onPress={() => handle(skin, false, false)}
                    style={styles.cardBtn}
                  />
                )}
              </View>
            );
          })}
        </ScrollView>

        <BottomNav active="collection" onNavigate={onNav} />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  subtitle: { color: COLORS.textDim, fontWeight: '800', fontSize: 12, letterSpacing: 2, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, paddingBottom: 12 },
  card: {
    width: '47%',
    backgroundColor: COLORS.panel,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  preview: {
    width: 88,
    height: 88,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  previewCell: { width: 44, height: 44 },
  lockOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(5,3,14,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  rarity: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  skinName: { color: COLORS.text, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  cardBtn: { paddingVertical: 8, paddingHorizontal: 16, width: '100%' },
  equipped: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8 },
  equippedText: { color: COLORS.accentCyan, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
});
