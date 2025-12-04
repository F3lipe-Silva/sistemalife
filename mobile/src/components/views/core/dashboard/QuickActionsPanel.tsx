
import { View, Text, TouchableOpacity } from 'react-native';
import { Target, TrendingUp, Award, Sparkles } from 'lucide-react-native';

export const QuickActionsPanel = () => (
    <View className="rounded-2xl bg-card/40 border border-border/30 p-4 mb-6">
        <View className="flex-row items-center gap-3 mb-4">
            <View className="w-6 h-6 rounded-lg bg-accent/20 items-center justify-center">
                <Sparkles size={12} color="#fff" />
            </View>
            <Text className="text-lg text-white font-bold">Centro de Ações</Text>
        </View>

        <View className="gap-3">
            <TouchableOpacity className="w-full p-3 rounded-xl bg-primary/10 border border-primary/30 flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center">
                    <Target size={16} color="#fff" />
                </View>
                <View className="flex-1">
                    <Text className="font-semibold text-white">Nova Missão</Text>
                    <Text className="text-sm text-gray-400">Gere um desafio personalizado</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity className="w-full p-3 rounded-xl bg-accent/10 border border-accent/30 flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-accent/20 items-center justify-center">
                    <TrendingUp size={16} color="#fff" />
                </View>
                <View className="flex-1">
                    <Text className="font-semibold text-white">Análise de Progresso</Text>
                    <Text className="text-sm text-gray-400">Veja estatísticas detalhadas</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity className="w-full p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-purple-500/20 items-center justify-center">
                    <Award size={16} color="#a855f7" />
                </View>
                <View className="flex-1">
                    <Text className="font-semibold text-white">Loja de Recompensas</Text>
                    <Text className="text-sm text-gray-400">Troque seus fragmentos</Text>
                </View>
            </TouchableOpacity>
        </View>
    </View>
);
