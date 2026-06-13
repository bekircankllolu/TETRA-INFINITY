import React, { useMemo } from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { buttonHaptic, playSfx } from '../audio/sound';
import type { GameAction } from '../core/types';
import { createRepeater } from '../input/das';
import { usePrefs } from '../state/prefs';
import { gameStore } from '../state/store';
import { IMAGES } from './assets';
import { COLORS } from './theme';

const dispatch = (action: GameAction) => gameStore.getState().dispatch(action);

interface ImageButtonProps {
  source: ImageSourcePropType;
  onPressIn: () => void;
  onPressOut?: () => void;
  mirrored?: boolean;
  size?: number;
}

function ImageButton({ source, onPressIn, onPressOut, mirrored, size = 58 }: ImageButtonProps) {
  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={6}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Image
        source={source}
        fadeDuration={0}
        style={[{ width: size, height: size }, mirrored && styles.mirrored]}
      />
    </Pressable>
  );
}

/** Dokunmatik jestlere ek buton pedi: neon sprite butonlar, ◀▶'de DAS/ARR */
export function ControlButtons() {
  const leftHanded = usePrefs((s) => s.settings.leftHanded);
  const left = useMemo(() => createRepeater(() => dispatch({ type: 'MOVE', dir: -1 })), []);
  const right = useMemo(() => createRepeater(() => dispatch({ type: 'MOVE', dir: 1 })), []);

  const moveCluster = (
    <View style={styles.cluster} key="move">
      <ImageButton
        source={IMAGES.btnLeft}
        onPressIn={() => {
          playSfx('move');
          buttonHaptic();
          left.start();
        }}
        onPressOut={() => left.stop()}
      />
      <ImageButton
        source={IMAGES.btnSoft}
        onPressIn={() => {
          playSfx('softdrop');
          dispatch({ type: 'SOFT_DROP', on: true });
        }}
        onPressOut={() => dispatch({ type: 'SOFT_DROP', on: false })}
      />
      <ImageButton
        source={IMAGES.btnRight}
        onPressIn={() => {
          playSfx('move');
          buttonHaptic();
          right.start();
        }}
        onPressOut={() => right.stop()}
      />
    </View>
  );

  const rotateCluster = (
    <View style={styles.cluster} key="rotate">
      <ImageButton
        mirrored
        source={IMAGES.btnRotate}
        onPressIn={() => {
          playSfx('rotate');
          buttonHaptic();
          dispatch({ type: 'ROTATE', dir: 'ccw' });
        }}
      />
      <ImageButton
        source={IMAGES.btnRotate}
        onPressIn={() => {
          playSfx('rotate');
          buttonHaptic();
          dispatch({ type: 'ROTATE', dir: 'cw' });
        }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {leftHanded ? [rotateCluster, moveCluster] : [moveCluster, rotateCluster]}
      </View>
      <View style={styles.row}>
        <Pressable
          onPressIn={() => {
            playSfx('hold');
            buttonHaptic();
            dispatch({ type: 'HOLD' });
          }}
          style={({ pressed }) => [styles.holdButton, pressed && styles.pressed]}
        >
          <Text style={styles.holdText}>HOLD</Text>
        </Pressable>
        <ImageButton
          source={IMAGES.btnHard}
          size={64}
          onPressIn={() => {
            buttonHaptic();
            dispatch({ type: 'HARD_DROP' });
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: 16, gap: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
  },
  cluster: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mirrored: { transform: [{ scaleX: -1 }] },
  pressed: { opacity: 0.6, transform: [{ scale: 0.94 }] },
  holdButton: {
    minWidth: 120,
    height: 46,
    borderRadius: 10,
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdText: { color: COLORS.accentCyan, fontSize: 15, fontWeight: '800', letterSpacing: 3 },
});
