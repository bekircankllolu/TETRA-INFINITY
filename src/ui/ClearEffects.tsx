import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { COLS, HIDDEN_ROWS } from '../core/constants';
import type { ClearInfo } from '../core/types';
import { useGame } from '../state/store';
import { COLORS } from './theme';

interface Props {
  cellSize: number;
}

interface RowFlash {
  key: number;
  rows: number[]; // görünür satır indeksleri
  anim: Animated.Value;
}

interface Toast {
  key: number;
  label: string;
  sub: string | null;
  anim: Animated.Value;
}

/** Temizlenen satırlarda parlama + ortada metin (TETRIS!, T-SPIN!, COMBO) */
export function ClearEffects({ cellSize }: Props) {
  const lastClear = useGame((s) => s.game.lastClear);
  const seen = useRef<ClearInfo | null>(null);
  const counter = useRef(0);
  const [flashes, setFlashes] = useState<RowFlash[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // lastClear referansı yalnızca yeni temizlemede değişir
    if (lastClear === null || lastClear === seen.current) return;
    seen.current = lastClear;
    const id = counter.current++;

    // Satır parlaması
    if (lastClear.clearedRows.length > 0) {
      const rows = lastClear.clearedRows.map((r) => r - HIDDEN_ROWS).filter((r) => r >= 0);
      const anim = new Animated.Value(0);
      setFlashes((prev) => [...prev, { key: id, rows, anim }]);
      Animated.timing(anim, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => setFlashes((prev) => prev.filter((f) => f.key !== id)));
    }

    // Metin toast'ı
    const label = toastLabel(lastClear);
    if (label) {
      const anim = new Animated.Value(0);
      setToasts((prev) => [...prev, { key: id, label, sub: toastSub(lastClear), anim }]);
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
        Animated.delay(700),
        Animated.timing(anim, {
          toValue: 2,
          duration: 260,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => setToasts((prev) => prev.filter((t) => t.key !== id)));
    }
  }, [lastClear]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {flashes.map((f) =>
        f.rows.map((row, i) => (
          <Animated.View
            key={`${f.key}-${i}`}
            style={[
              styles.flashRow,
              {
                top: row * cellSize,
                width: COLS * cellSize,
                height: cellSize,
                opacity: f.anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 0] }),
                transform: [
                  {
                    scaleY: f.anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.flashCore} />
          </Animated.View>
        ))
      )}

      {toasts.map((t) => (
        <Animated.View
          key={t.key}
          style={[
            styles.toastWrap,
            {
              opacity: t.anim.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 1, 0] }),
              transform: [
                {
                  scale: t.anim.interpolate({ inputRange: [0, 1, 2], outputRange: [0.6, 1, 1.15] }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.toastLabel}>{t.label}</Text>
          {t.sub && <Text style={styles.toastSub}>{t.sub}</Text>}
        </Animated.View>
      ))}
    </View>
  );
}

function toastLabel(c: ClearInfo): string | null {
  if (c.tspin === 'full' || c.tspin === 'mini') {
    return c.tspin === 'mini' ? 'T-SPIN MINI' : 'T-SPIN';
  }
  switch (c.lines) {
    case 4:
      return 'TETRIS';
    case 3:
      return 'TRIPLE';
    case 2:
      return 'DOUBLE';
    default:
      return null; // tekli temizlemede toast yok (gürültü olmasın)
  }
}

function toastSub(c: ClearInfo): string | null {
  const parts: string[] = [];
  if (c.b2b) parts.push('BACK-TO-BACK');
  if (c.combo >= 1) parts.push(`COMBO ×${c.combo}`);
  return parts.length ? parts.join('  ·  ') : null;
}

const styles = StyleSheet.create({
  flashRow: {
    position: 'absolute',
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 2,
  },
  flashCore: {
    width: '100%',
    height: '36%',
    backgroundColor: '#FFFFFF',
    shadowColor: COLORS.accentCyan,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  toastWrap: {
    position: 'absolute',
    top: '38%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  toastLabel: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: COLORS.accent,
    textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 },
  },
  toastSub: {
    color: COLORS.accentCyan,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 4,
    textShadowColor: COLORS.accentCyan,
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  },
});
