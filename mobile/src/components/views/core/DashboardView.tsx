
import { memo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { QuickActionsPanel } from './dashboard/QuickActionsPanel';
import { Sparkles } from 'lucide-react-native';

const DashboardViewComponent = () => {
    const { profile, isDataLoaded } = usePlayerDataContext();

    if (!isDataLoaded || !profile) {
        return (
            <View className="flex-1 items-center justify-center p-8 gap-6">
                <View className="w-20 h-20 rounded-3xl bg-primary/20 items-center justify-center">
                    <Sparkles size={40} color="#fff" />
                </View>
                <View className="items-center space-y-2">
                    <Text className="text-lg tracking-[0.3em] text-gray-400 font-medium">INICIALIZANDO SISTEMA</Text>
                    <Text className="text-sm text-gray-500">Carregando dados do jogador...</Text>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 flex-col gap-6 pb-32">
            <DashboardHeader profile={profile} />
            <QuickActionsPanel />
            {/* Additional sections like ProfileStats can be added here */}
            <View className="p-4 bg-card/20 rounded-xl border border-white/10">
                <Text className="text-white text-center">Mais funcionalidades em breve...</Text>
            </View>
        </View>
    );
};

export const DashboardView = memo(DashboardViewComponent);
