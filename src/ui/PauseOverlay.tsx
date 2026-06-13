import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../state/store';
import { IMAGES } from './assets';
import { NeonButton } from './components';
import { modeMeta } from './modeMeta';
import { COLORS } from './theme';

/** Board arkada görünürken üstte beliren duraklatma katmanı (mockup'a göre) */
export function PauseOverlay() {
  const mode = useGame((s) => s.game.mode);
  const resume = useGame((s) => s.resume);
  const startGame = useGame((s) => s.startGame);
  const quitToMenu = useGame((s) => s.quitToMenu);
  const meta = modeMeta(mode);

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
        <Image source={IMAGES.emblem} style={styles.emblem} resizeMode="contain" />
        <Text style={styles.title}>DURAKLATILDI</Text>
        <View style={styles.buttons}>
          <NeonButton label="DEVAM ET" icon="play" variant="primary" accent={meta.accent} onPress={resume} style={styles.btn} />
          <NeonButton label="YENİDEN BAŞLAT" icon="restart" onPress={() => startGame(mode)} style={styles.btn} />
          <NeonButton label="MENÜYE DÖN" icon="home" onPress={quitToMenu} style={styles.btn} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(5,3,14,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { alignItems: 'center', gap: 6, width: '78%' },
  emblem: {
    width: 84,
    height: 84,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.9,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 18,
    textShadowColor: COLORS.accent,
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 0 },
  },
  buttons: { gap: 12, width: '100%' },
  btn: { width: '100%' },
});
