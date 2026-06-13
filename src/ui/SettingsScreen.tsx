import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { GraphicsQuality, NextCount } from '../state/prefs';
import { usePrefs } from '../state/prefs';
import { useGame } from '../state/store';
import { BackButton, NeonPanel, NeonSlider, ScreenBackground, Segmented, Toggle } from './components';
import { COLORS } from './theme';

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <NeonPanel style={styles.section}>
      <View style={styles.sectionHead}>
        <MaterialCommunityIcons name={icon as never} size={18} color={COLORS.accent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </NeonPanel>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowControl}>{children}</View>
    </View>
  );
}

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigate = useGame((s) => s.navigate);
  const settings = usePrefs((s) => s.settings);
  const set = usePrefs((s) => s.setSetting);

  return (
    <ScreenBackground>
      <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
        <View style={styles.header}>
          <BackButton onPress={() => navigate('menu')} />
          <Text style={styles.title}>AYARLAR</Text>
          <View style={{ width: 42 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ gap: 14, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          <Section icon="volume-high" title="SES">
            <Row label="Müzik">
              <NeonSlider value={settings.musicVolume} onChange={(v) => set('musicVolume', v)} />
            </Row>
            <Row label="Efektler">
              <NeonSlider value={settings.sfxVolume} onChange={(v) => set('sfxVolume', v)} />
            </Row>
            <Row label="Titreşim (Haptik)">
              <Toggle value={settings.hapticsOn} onToggle={(v) => set('hapticsOn', v)} />
            </Row>
          </Section>

          <Section icon="cellphone-cog" title="KONTROLLER">
            <Row label="Solak Modu">
              <Toggle value={settings.leftHanded} onToggle={(v) => set('leftHanded', v)} />
            </Row>
            <Row label="Buton Titreşimi">
              <Toggle value={settings.vibration} onToggle={(v) => set('vibration', v)} />
            </Row>
          </Section>

          <Section icon="gamepad-variant" title="OYNANIŞ">
            <Row label="Hayalet Parça">
              <Toggle value={settings.ghostPiece} onToggle={(v) => set('ghostPiece', v)} />
            </Row>
            <Row label="İpuçları">
              <Toggle value={settings.showHints} onToggle={(v) => set('showHints', v)} />
            </Row>
            <Row label="Sıradaki Sayısı">
              <Segmented<NextCount>
                options={[3, 4, 5]}
                value={settings.nextCount}
                onChange={(v) => set('nextCount', v)}
              />
            </Row>
          </Section>

          <Section icon="tune" title="GRAFİK">
            <Row label="Efekt Kalitesi">
              <Segmented<GraphicsQuality>
                options={['low', 'medium', 'high', 'ultra']}
                value={settings.graphics}
                onChange={(v) => set('graphics', v)}
                labels={{ low: 'Düşük', medium: 'Orta', high: 'Yüksek', ultra: 'Ultra' }}
              />
            </Row>
          </Section>
        </ScrollView>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { color: COLORS.text, fontSize: 22, fontWeight: '900', letterSpacing: 3 },
  section: { gap: 12 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  sectionTitle: { color: COLORS.accent, fontWeight: '800', fontSize: 13, letterSpacing: 2 },
  row: { gap: 8 },
  rowLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  rowControl: {},
});
