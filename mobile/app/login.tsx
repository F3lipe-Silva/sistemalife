
import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Sparkles, Zap, Shield } from 'lucide-react-native';
import { useToast } from '@/hooks/use-toast';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { user, authState } = useAuth();
    const [typedTitle, setTypedTitle] = useState('');
    const titleText = "SISTEMA";
    const authLoading = authState === 'loading';
    const { toast } = useToast();

    useEffect(() => {
        if (!authLoading && user) {
            router.replace('/');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        setTypedTitle('');
        const interval = setInterval(() => {
            setTypedTitle(prev => {
                if (prev.length < titleText.length) {
                    return titleText.substring(0, prev.length + 1);
                }
                clearInterval(interval);
                return prev;
            });
        }, 150);
        return () => clearInterval(interval);
    }, []);

    const handleLogin = async () => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast({ title: "Login bem-sucedido!", description: "A redirecionar..." });
            router.replace('/');
        } catch (err: any) {
            let friendlyMessage = "Ocorreu um erro ao fazer login. Verifique as suas credenciais.";
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                friendlyMessage = "Email ou senha inválidos. Por favor, tente novamente.";
            } else if (err.code === 'auth/invalid-email') {
                friendlyMessage = "O formato do email é inválido.";
            }
            toast({ title: "Erro", description: friendlyMessage, variant: "destructive" });
            setLoading(false);
        }
    };

    if (authLoading || (!authLoading && user)) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="text-xl font-bold tracking-widest text-primary mt-4">A CARREGAR...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-1 items-center justify-center p-6">
                {/* Background Effects would be harder in RN without complex layout, simplifying */}

                <View className="w-full max-w-sm bg-card rounded-xl p-6 border border-primary/20 shadow-xl">
                    <View className="items-center mb-8">
                        <View className="w-16 h-16 rounded-2xl bg-primary/20 items-center justify-center border border-primary/30 mb-4">
                            <Sparkles size={32} color="#ffffff" />
                        </View>
                        <View className="flex-row">
                             <Text className="text-4xl font-bold text-white tracking-[0.3em]">
                                {typedTitle}
                            </Text>
                             <Text className="text-4xl font-bold text-primary animate-pulse">_</Text>
                        </View>

                        <Text className="text-muted-foreground text-base mt-2 text-center">
                            A sua vida, gamificada. Inicie a sessão para continuar.
                        </Text>
                    </View>

                    <View className="space-y-4 gap-4">
                        <View className="space-y-2 gap-2">
                            <Text className="text-sm font-medium text-foreground/80 text-white">
                                Email do Utilizador
                            </Text>
                            <TextInput
                                placeholder="utilizador@email.com"
                                placeholderTextColor="#6b7280"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                className="bg-secondary/50 border border-border/50 text-white rounded-md h-12 px-4"
                            />
                        </View>
                        <View className="space-y-2 gap-2">
                            <Text className="text-sm font-medium text-foreground/80 text-white">
                                Palavra-passe
                            </Text>
                             <TextInput
                                placeholder="••••••••"
                                placeholderTextColor="#6b7280"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                className="bg-secondary/50 border border-border/50 text-white rounded-md h-12 px-4"
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            className="w-full bg-primary h-12 rounded-md items-center justify-center flex-row mt-4"
                        >
                            {loading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <>
                                    <Zap size={16} color="#000" className="mr-2" />
                                    <Text className="font-bold tracking-wider text-base text-primary-foreground ml-2">INICIAR SESSÃO</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
