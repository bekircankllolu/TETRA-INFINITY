import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameAction } from '../core/types';
import { createRepeater } from '../input/das';
import { gameStore } from '../state/store';
import { COLORS } from './theme';

const dispatch = (action: GameAction) => gameStore.getState().dispatch(action);

interface ButtonProps {
  label: string;
  onPressIn: () => void;
  onPressOut?: () => void;
  wide?: boolean;
}

function ControlButton({ label, onPressIn, onPressOut, wide }: ButtonProps) {
  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={({ pressed }) => [styles.button, wide && styles.wide, pressed && styles.pressed]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

/** Dokunmatik jestlere ek opsiyonel buton pedi. ◀▶ basılı tutmada DAS/ARR. */
export function ControlButtons() {
  const left = useMemo(() => createRepeater(() => dispatch({ type: 'MOVE', dir: -1 })), []);
  const right = useMemo(() => createRepeater(() => dispatch({ type: 'MOVE', dir: 1 })), []);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ControlButton label="◀" onPressIn={() => left.start()} onPressOut={() => left.stop()} />
        <ControlButton
          label="▼"
          onPressIn={() => dispatch({ type: 'SOFT_DROP', on: true })}
          onPressOut={() => dispatch({ type: 'SOFT_DROP', on: false })}
        />
        <ControlButton label="▶" onPressIn={() => right.start()} onPressOut={() => right.stop()} />
        <View style={styles.spacer} />
        <ControlButton label="⟲" onPressIn={() => dispatch({ type: 'ROTATE', dir: 'ccw' })} />
        <ControlButton label="⟳" onPressIn={() => dispatch({ type: 'ROTATE', dir: 'cw' })} />
      </View>
      <View style={styles.row}>
        <ControlButton label="HOLD" wide onPressIn={() => dispatch({ type: 'HOLD' })} />
        <ControlButton label="⤓ BIRAK" wide onPressIn={() => dispatch({ type: 'HARD_DROP' })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  spacer: {
    width: 24,
  },
  button: {
    minWidth: 56,
    height: 52,
    borderRadius: 10,
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  wide: {
    flex: 1,
    maxWidth: 160,
  },
  pressed: {
    backgroundColor: COLORS.panelBorder,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
});
