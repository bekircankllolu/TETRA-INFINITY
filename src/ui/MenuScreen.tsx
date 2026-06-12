import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../state/store';
import { COLORS } from './theme';

export function MenuScreen() {
  const startGame = useGame((s) => s.startGame);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TETRA</Text>
      <Text style={styles.subtitle}>∞ INFINITY</Text>
      <Pressable onPress={startGame} style={({ pressed }) => [styles.play, pressed && styles.playPressed]}>
        <Text style={styles.playText}>OYNA</Text>
      </Pressable>
      <Text style={styles.hint}>
        Sürükle: taşı · Dokun: döndür{'\n'}
        Aşağı çek: yumuşak düşüş · Flick: bırak{'\n'}
        Yukarı kaydır: sakla
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    color: COLORS.text,
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: 10,
  },
  subtitle: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 6,
    marginBottom: 36,
  },
  play: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 56,
    paddingVertical: 16,
    borderRadius: 12,
  },
  playPressed: {
    opacity: 0.8,
  },
  playText: {
    color: COLORS.background,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 3,
  },
  hint: {
    color: COLORS.textDim,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 32,
  },
});
