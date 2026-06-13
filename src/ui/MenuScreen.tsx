import React from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useGame } from '../state/store';
import { IMAGES } from './assets';
import { COLORS } from './theme';

// logo.png 724x256 — genişlik/yükseklik oranı
const LOGO_ASPECT = 724 / 256;

export function MenuScreen() {
  const startGame = useGame((s) => s.startGame);
  const { width } = useWindowDimensions();
  // Net piksel genişliği: ekranın %84'ü ama en fazla 380 — taşmayı kesin önler
  const logoWidth = Math.min(width * 0.84, 380);

  return (
    <ImageBackground source={IMAGES.background} style={styles.background} resizeMode="cover">
      <View style={styles.scrim} />
      <View style={styles.container}>
        <Image
          source={IMAGES.logo}
          style={[styles.logo, { width: logoWidth, height: logoWidth / LOGO_ASPECT }]}
          resizeMode="contain"
        />
        <Pressable
          onPress={startGame}
          style={({ pressed }) => [styles.play, pressed && styles.playPressed]}
        >
          <Text style={styles.playText}>OYNA</Text>
        </Pressable>
        <Text style={styles.hint}>
          Sürükle: taşı · Dokun: döndür{'\n'}
          Aşağı çek: yumuşak düşüş · Flick: bırak{'\n'}
          Yukarı kaydır: sakla
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrim: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: COLORS.scrim,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  logo: {
    marginBottom: 40,
  },
  play: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 64,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.8,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  playPressed: {
    opacity: 0.8,
  },
  playText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 4,
  },
  hint: {
    color: COLORS.textDim,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 28,
  },
});
