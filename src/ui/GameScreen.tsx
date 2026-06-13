import React, { useEffect, useRef } from 'react';
import { Animated, AppState, StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBoardMetrics } from '../hooks/useBoardMetrics';
import { useGameAudio } from '../hooks/useGameAudio';
import { useGameLoop } from '../hooks/useGameLoop';
import { useBoardGesture } from '../input/gestures';
import { onGameEvent } from '../state/events';
import { gameStore, useGame } from '../state/store';
import { BoardView } from './BoardView';
import { ControlButtons } from './ControlButtons';
import { GameOverOverlay } from './GameOverOverlay';
import { HoldBox } from './HoldBox';
import { Hud } from './Hud';
import { NextQueue } from './NextQueue';
import { PauseOverlay } from './PauseOverlay';
import { ScreenBackground } from './components';

export function GameScreen() {
  const status = useGame((s) => s.status);
  const pause = useGame((s) => s.pause);
  const insets = useSafeAreaInsets();
  const { cellSize, boardWidth } = useBoardMetrics();
  const boardGesture = useBoardGesture(cellSize, boardWidth);
  const shake = useRef(new Animated.Value(0)).current;

  useGameLoop();
  useGameAudio();

  // Hard drop sarsıntısı
  useEffect(() => {
    return onGameEvent('harddrop', () => {
      shake.setValue(0);
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 40, useNativeDriver: true }),
        Animated.spring(shake, { toValue: 0, friction: 4, tension: 220, useNativeDriver: true }),
      ]).start();
    });
  }, [shake]);

  // Uygulama arka plana geçince otomatik duraklat
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') gameStore.getState().pause();
    });
    return () => sub.remove();
  }, []);

  const translateY = shake.interpolate({ inputRange: [0, 1], outputRange: [0, 7] });

  return (
    <ScreenBackground>
      <View
        style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}
      >
        <Hud onPause={pause} />
        <Animated.View style={[styles.middle, { transform: [{ translateY }] }]}>
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
        </Animated.View>
        <ControlButtons />
      </View>
      {status === 'paused' && <PauseOverlay />}
      {(status === 'gameover' || status === 'win') && <GameOverOverlay win={status === 'win'} />}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  middle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
  },
  sidePanel: { width: 64 },
});
