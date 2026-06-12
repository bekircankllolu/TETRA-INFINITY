import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useGame } from './src/state/store';
import { GameScreen } from './src/ui/GameScreen';
import { MenuScreen } from './src/ui/MenuScreen';

export default function App() {
  const inMenu = useGame((s) => s.status === 'menu');
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {inMenu ? <MenuScreen /> : <GameScreen />}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
