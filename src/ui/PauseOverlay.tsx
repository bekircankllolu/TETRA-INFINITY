import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGame } from '../state/store';
import { NeonButton } from './components';
import { modeMeta } from './modeMeta';
import { COLORS } from './theme';

/** Board içeriğini gizleyen duraklatma perdesi */
export function PauseOverlay() {
  const mode = useGame((s) => s.game.mode);
  const resume = useGame((s) => s.resume);
  const startGame = useGame((s) => s.startGame);
  const quitToMenu = useGame((s) => s.quitToMenu);
  const meta = modeMeta(mode);

  return (
    <View style={styles.overlay}>
      <MaterialCommunityIcons name="pause-circle" size={52} color={meta.accent} />
      <Text style={styles.title}>DURAKLATILDI</Text>
      <View style={styles.buttons}>
        <NeonButton label="DEVAM ET" icon="play" variant="primary" accent={meta.accent} onPress={resume} style={styles.btn} />
        <NeonButton label="YENİDEN BAŞLAT" icon="restart" onPress={() => startGame(mode)} style={styles.btn} />
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
    gap: 10,
  },
  title: { color: COLORS.text, fontSize: 26, fontWeight: '900', letterSpacing: 4, marginBottom: 16 },
  buttons: { gap: 12, width: 240 },
  btn: { width: '100%' },
});
