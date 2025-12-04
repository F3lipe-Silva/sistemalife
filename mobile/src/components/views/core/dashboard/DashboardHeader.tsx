
import { View, Text } from 'react-native';
import { Activity, Zap } from 'lucide-react-native';

export const DashboardHeader = ({ profile }: { profile: any }) => (
    <View className="space-y-3 mb-6">
        {/* Status Bar Superior */}
        <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
                <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                    <Activity size={12} color="#fff" />
                    <Text className="text-[10px] uppercase tracking-[0.3em] text-primary font-medium">Sistema</Text>
                </View>
            </View>

            <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/30">
                <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <Text className="text-[10px] text-muted-foreground text-white">Online</Text>
            </View>
        </View>

        {/* Título e Métricas */}
        <View className="gap-4">
            <View className="space-y-1">
                <Text className="font-bold text-2xl tracking-[0.15em] text-white">
                    Centro de Comando
                </Text>
                <Text className="text-sm text-muted-foreground/70 text-gray-400">
                    Monitore sua jornada RPG
                </Text>
            </View>

            {/* Métricas Principais */}
            <View className="flex-row justify-between gap-2">
                <View className="flex-1 px-3 py-2 rounded-lg bg-card/40 border border-border/30 items-center">
                    <Text className="text-xs text-muted-foreground uppercase tracking-wide text-gray-500">Nv</Text>
                    <Text className="text-sm font-bold text-primary">{profile?.nivel || 1}</Text>
                </View>
                <View className="flex-1 px-3 py-2 rounded-lg bg-card/40 border border-border/30 items-center">
                    <Text className="text-xs text-muted-foreground uppercase tracking-wide text-gray-500">XP</Text>
                    <Text className="text-sm font-bold text-green-400">{profile?.xp?.toLocaleString() || 0}</Text>
                </View>
                <View className="flex-1 px-3 py-2 rounded-lg bg-card/40 border border-border/30 items-center">
                    <Text className="text-xs text-muted-foreground uppercase tracking-wide text-gray-500">HP</Text>
                    <Text className="text-sm font-bold text-red-400">{profile?.hp_atual || 100}</Text>
                </View>
                <View className="flex-1 px-3 py-2 rounded-lg bg-card/40 border border-border/30 items-center">
                    <Text className="text-xs text-muted-foreground uppercase tracking-wide text-gray-500">Stk</Text>
                    <Text className="text-sm font-bold text-blue-400">{profile?.streak_atual || 0}</Text>
                </View>
            </View>
        </View>
    </View>
);
