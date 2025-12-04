
import { Slot } from 'expo-router';
import { AuthProvider } from '@/hooks/use-auth';
import { PlayerDataProvider } from '@/hooks/use-player-data';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PlayerDataProvider>
            <Slot />
            <StatusBar style="light" />
        </PlayerDataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
