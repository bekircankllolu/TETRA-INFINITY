import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initAudio } from './src/audio/sound';
import { useGame } from './src/state/store';
import { CollectionScreen } from './src/ui/CollectionScreen';
import { GameScreen } from './src/ui/GameScreen';
import { LeaderboardScreen } from './src/ui/LeaderboardScreen';
import { MenuScreen } from './src/ui/MenuScreen';
import { ModeSelectScreen } from './src/ui/ModeSelectScreen';
import { SettingsScreen } from './src/ui/SettingsScreen';

export default function App() {
  const status = useGame((s) => s.status);

  useEffect(() => {
    initAudio();
  }, []);

  let screen: React.ReactNode;
  switch (status) {
    case 'menu':
      screen = <MenuScreen />;
      break;
    case 'modeSelect':
      screen = <ModeSelectScreen />;
      break;
    case 'settings':
      screen = <SettingsScreen />;
      break;
    case 'collection':
      screen = <CollectionScreen />;
      break;
    case 'leaderboard':
      screen = <LeaderboardScreen />;
      break;
    default:
      // playing / paused / gameover / win
      screen = <GameScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {screen}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
