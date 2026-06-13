import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { buttonHaptic, playSfx } from '../audio/sound';
import { IMAGES } from './assets';
import { COLORS } from './theme';

/** Arkaplan + okunabilirlik perdesi (tüm ekranlarda ortak) */
export function ScreenBackground({ children }: { children: React.ReactNode }) {
  return (
    <ImageBackground source={IMAGES.background} style={styles.bg} resizeMode="cover">
      <View style={styles.scrim} />
      {children}
    </ImageBackground>
  );
}

export function NeonPanel({
  children,
  style,
  accent,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  accent?: string;
}) {
  return (
    <View style={[styles.panel, accent ? { borderColor: accent } : null, style]}>{children}</View>
  );
}

interface NeonButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  icon?: string;
  accent?: string;
  style?: ViewStyle;
  disabled?: boolean;
}

/** Sesli/titreşimli ana buton */
export function NeonButton({
  label,
  onPress,
  variant = 'ghost',
  icon,
  accent = COLORS.accent,
  style,
  disabled,
}: NeonButtonProps) {
  const primary = variant === 'primary';
  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        playSfx('click');
        buttonHaptic();
        onPress();
      }}
      style={({ pressed }) => [
        styles.btn,
        primary
          ? { backgroundColor: accent, borderColor: accent, shadowColor: accent }
          : { borderColor: accent, shadowColor: accent },
        primary ? styles.btnGlowStrong : styles.btnGlow,
        disabled && styles.btnDisabled,
        pressed && styles.btnPressed,
        style,
      ]}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon as never}
          size={20}
          color={primary ? COLORS.background : accent}
        />
      )}
      <Text style={[styles.btnText, { color: primary ? COLORS.background : COLORS.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Geri butonu (sol üst köşe) */
export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        playSfx('click');
        buttonHaptic();
        onPress();
      }}
      hitSlop={10}
      style={({ pressed }) => [styles.back, pressed && styles.btnPressed]}
    >
      <Ionicons name="chevron-back" size={24} color={COLORS.text} />
    </Pressable>
  );
}

/** Üst bilgi: gem + coin göstergeleri */
export function CurrencyBar({ gems, coins }: { gems: number; coins: number }) {
  return (
    <View style={styles.currency}>
      <View style={styles.pill}>
        <MaterialCommunityIcons name="diamond-stone" size={16} color={COLORS.gem} />
        <Text style={styles.pillText}>{gems.toLocaleString('en-US')}</Text>
      </View>
      <View style={styles.pill}>
        <MaterialCommunityIcons name="circle-multiple" size={16} color={COLORS.coin} />
        <Text style={styles.pillText}>{coins.toLocaleString('en-US')}</Text>
      </View>
    </View>
  );
}

export type NavKey = 'collection' | 'home' | 'leaderboard' | 'settings';

const NAV: { key: NavKey; icon: string; label: string }[] = [
  { key: 'collection', icon: 'view-grid', label: 'Koleksiyon' },
  { key: 'home', icon: 'home', label: 'Ana Sayfa' },
  { key: 'leaderboard', icon: 'trophy', label: 'Sıralama' },
  { key: 'settings', icon: 'cog', label: 'Ayarlar' },
];

/** Alt navigasyon çubuğu (menü düzeyi ekranlarda ortak) */
export function BottomNav({
  active,
  onNavigate,
}: {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
}) {
  return (
    <View style={styles.nav}>
      {NAV.map((item) => {
        const on = item.key === active;
        return (
          <Pressable
            key={item.key}
            style={styles.navItem}
            onPress={() => {
              playSfx('click');
              buttonHaptic();
              onNavigate(item.key);
            }}
          >
            <MaterialCommunityIcons
              name={item.icon as never}
              size={24}
              color={on ? COLORS.accent : COLORS.textDim}
            />
            <Text style={[styles.navLabel, { color: on ? COLORS.accent : COLORS.textDim }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Açma/kapama anahtarı */
export function Toggle({ value, onToggle }: { value: boolean; onToggle: (v: boolean) => void }) {
  return (
    <Pressable
      onPress={() => {
        buttonHaptic();
        onToggle(!value);
      }}
      style={[styles.toggle, value ? styles.toggleOn : styles.toggleOff]}
    >
      <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
    </Pressable>
  );
}

/** Segmentli seçici (örn. grafik kalitesi, next sayısı) */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  labels,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labels?: Record<string, string>;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((opt) => {
        const on = opt === value;
        return (
          <Pressable
            key={String(opt)}
            onPress={() => {
              buttonHaptic();
              onChange(opt);
            }}
            style={[styles.segment, on && styles.segmentOn]}
          >
            <Text style={[styles.segmentText, on && styles.segmentTextOn]}>
              {labels?.[String(opt)] ?? String(opt)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Neon dokunmatik kaydırıcı (0..1) — gesture-handler ile, ekstra bağımlılık yok */
export function NeonSlider({
  value,
  onChange,
  accent = COLORS.accent,
}: {
  value: number;
  onChange: (v: number) => void;
  accent?: string;
}) {
  const [width, setWidth] = useState(1);
  const apply = (x: number) => onChange(Math.max(0, Math.min(1, x / width)));

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onBegin((e) => apply(e.x))
    .onUpdate((e) => apply(e.x));
  const tap = Gesture.Tap()
    .runOnJS(true)
    .onEnd((e) => apply(e.x));

  return (
    <GestureDetector gesture={Gesture.Race(pan, tap)}>
      <View style={styles.sliderTrack} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <View style={[styles.sliderFill, { width: `${value * 100}%`, backgroundColor: accent }]} />
        <View style={[styles.sliderKnob, { left: `${value * 100}%`, borderColor: accent }]} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: COLORS.background },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: COLORS.scrim },
  panel: {
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    borderRadius: 14,
    padding: 14,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: 'rgba(16,12,38,0.6)',
  },
  btnPressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
  btnGlow: { shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
  btnGlowStrong: { shadowOpacity: 0.9, shadowRadius: 16, shadowOffset: { width: 0, height: 0 }, elevation: 10 },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontSize: 15, fontWeight: '800', letterSpacing: 2 },
  back: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    backgroundColor: COLORS.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currency: { flexDirection: 'row', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
  },
  pillText: { color: COLORS.text, fontWeight: '800', fontSize: 13, fontVariant: ['tabular-nums'] },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.panelBorder,
  },
  navItem: { alignItems: 'center', gap: 3, flex: 1 },
  navLabel: { fontSize: 10, fontWeight: '700' },
  toggle: { width: 50, height: 28, borderRadius: 14, padding: 3, justifyContent: 'center' },
  toggleOn: { backgroundColor: COLORS.accent },
  toggleOff: { backgroundColor: 'rgba(120,120,150,0.4)' },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
  knobOn: { alignSelf: 'flex-end' },
  knobOff: { alignSelf: 'flex-start' },
  segmented: {
    flexDirection: 'row',
    backgroundColor: 'rgba(8,6,22,0.6)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    overflow: 'hidden',
  },
  segment: { paddingVertical: 8, paddingHorizontal: 12, flex: 1, alignItems: 'center' },
  segmentOn: { backgroundColor: COLORS.accent },
  segmentText: { color: COLORS.textDim, fontWeight: '700', fontSize: 12 },
  segmentTextOn: { color: COLORS.background },
  sliderTrack: {
    height: 28,
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(8,6,22,0.7)',
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    paddingHorizontal: 2,
  },
  sliderFill: { position: 'absolute', left: 2, height: 8, borderRadius: 4 },
  sliderKnob: {
    position: 'absolute',
    width: 20,
    height: 20,
    marginLeft: -10,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 3,
  },
});
