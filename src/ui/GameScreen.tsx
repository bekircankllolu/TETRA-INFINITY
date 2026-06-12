import React, { useEffect } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBoardMetrics } from '../hooks/useBoardMetrics';
import { useGameLoop } from '../hooks/useGameLoop';
import { useBoardGesture } from '../input/gestures';
import { gameStore, useGame } from '../state/store';
import { BoardView } from './BoardView';
import { ControlButtons } from './ControlButtons';
import { GameOverOverlay } from './GameOverOverlay';
import { HoldBox } from './HoldBox';
import { Hud } from './Hud';
import { NextQueue } from './NextQueue';
import { PauseOverlay } from './PauseOverlay';
import { COLORS } from './theme';

export function GameScreen() {
  const status = useGame((s) => s.status);
  const pause = useGame((s) => s.pause);
  const insets = useSafeAreaInsets();
  const { cellSize, boardWidth } = useBoardMetrics();
  const boardGesture = useBoardGesture(cellSize, boardWidth);

  useGameLoop();

  // Uygulama arka plana geçince otomatik duraklat
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') gameStore.getState().pause();
    });
    return () => sub.remove();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}>
      <Hud onPause={pause} />
      <View style={styles.middle}>
        <View style={styles.sidePanel}>
          <HoldBox />
        </View>
        <GestureDetector gesture={boardGesture}>
          <View collapsable={false}>
            <BoardView cellSize={cellSize} />
          </View>
        </GestureDetector>
        <View style={styles.sidePanel}>
          <NextQueue />
        </View>
      </View>
      <ControlButtons />
      {status === 'paused' && <PauseOverlay />}
      {status === 'gameover' && <GameOverOverlay />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  middle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
  },
  sidePanel: {
    width: 64,
  },
});
