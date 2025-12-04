
import { useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardView } from '@/components/views/core/DashboardView';

export default function App() {
  const { authState } = useAuth();
  const { isDataLoaded, profile } = usePlayerDataContext();
  const router = useRouter();

  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.replace('/login');
    }
  }, [authState]);

  if (authState === 'loading' || !isDataLoaded) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Carregando...</Text>
      </View>
    );
  }

  if (authState === 'unauthenticated') {
      return null; // Will redirect
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1 p-4">
        <DashboardView />
      </ScrollView>
    </SafeAreaView>
  );
}
