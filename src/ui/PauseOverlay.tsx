import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../state/store';
import { COLORS } from './theme';

/** Board içeriğini gizleyen duraklatma perdesi */
export function PauseOverlay() {
  const resume = useGame((s) => s.resume);
  const startGame = useGame((s) => s.startGame);
  const quitToMenu = useGame((s) => s.quitToMenu);

  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>DURAKLATILDI</Text>
      <Pressable onPress={resume} style={[styles.button, styles.primary]}>
        <Text style={styles.primaryText}>DEVAM ET</Text>
      </Pressable>
      <Pressable onPress={startGame} style={styles.button}>
        <Text style={styles.buttonText}>YENİDEN BAŞLAT</Text>
      </Pressable>
      <Pressable onPress={quitToMenu} style={styles.button}>
        <Text style={styles.buttonText}>MENÜYE DÖN</Text>
      </Pressable>
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
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 20,
  },
  button: {
    minWidth: 220,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  primaryText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
