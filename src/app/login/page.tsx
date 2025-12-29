
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { LoaderCircle, Terminal, Sparkles, Shield, Zap } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { user, authState } = useAuth();
    const [typedTitle, setTypedTitle] = useState('');
    const titleText = "SISTEMA";
    const authLoading = authState === 'loading';

    useEffect(() => {
        if (!authLoading && user) {
            router.push('/');
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

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Login bem-sucedido!", {
                description: "A redirecionar para o dashboard..."
            });
            router.push('/');
        } catch (err: any) {
            let friendlyMessage = "Ocorreu um erro ao fazer login. Verifique as suas credenciais.";
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                friendlyMessage = "Email ou senha inválidos. Por favor, tente novamente.";
            } else if (err.code === 'auth/invalid-email') {
                friendlyMessage = "O formato do email é inválido.";
            }
            setError(friendlyMessage);
            toast.error(friendlyMessage);
            setLoading(false);
        }
    };
    
    if (authLoading || (!authLoading && user)) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-primary">
                <div className="relative">
                    <LoaderCircle className="animate-spin h-12 w-12" />
                    <div className="absolute inset-0 animate-ping">
                        <LoaderCircle className="h-12 w-12 opacity-30" />
                    </div>
                </div>
                <span className="text-xl font-cinzel tracking-widest animate-pulse">A CARREGAR...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-cyan-400/10 [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-pulse delay-1000" />
            
            {/* Floating Icons */}
            <div className="absolute top-20 left-20 animate-float opacity-20">
                <Shield className="h-16 w-16 text-primary" />
            </div>
            <div className="absolute bottom-32 right-20 animate-float delay-500 opacity-20">
                <Zap className="h-12 w-12 text-accent" />
            </div>
            <div className="absolute top-1/3 right-32 animate-float delay-1000 opacity-20">
                <Sparkles className="h-10 w-10 text-primary" />
            </div>
            
            <Card className="relative w-full max-w-md bg-card/60 backdrop-blur-2xl border-primary/20 text-card-foreground shadow-2xl shadow-primary/10 animate-scale-in overflow-hidden">
                {/* Card Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                <div className="absolute -inset-px bg-gradient-to-br from-primary/20 via-transparent to-accent/20 rounded-xl opacity-50 blur-sm pointer-events-none" />
                
                <CardHeader className="relative text-center pb-2">
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/20">
                                <Sparkles className="h-8 w-8 text-primary" />
                            </div>
                            <div className="absolute -inset-1 bg-primary/20 rounded-2xl blur-xl animate-pulse" />
                        </div>
                    </div>
                    <CardTitle className="font-cinzel text-4xl md:text-5xl font-bold text-gradient tracking-[0.3em] min-h-[60px]">
                        {typedTitle}
                        <span className="animate-pulse text-primary">_</span>
                    </CardTitle>
                    <CardDescription className="text-muted-foreground/80 text-base mt-2">
                        A sua vida, gamificada. Inicie a sessão para continuar.
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="relative pt-4">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-foreground/80">
                                Email do Utilizador
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="utilizador@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-secondary/50 border-border/50 focus:border-primary/50 h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
                                Palavra-passe
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-secondary/50 border-border/50 focus:border-primary/50 h-12"
                            />
                        </div>
                        
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-sm text-red-400 text-center">{error}</p>
                            </div>
                        )}
                        
                        <Button 
                            type="submit" 
                            variant="glow"
                            size="lg"
                            className="w-full font-bold tracking-wider text-base h-12" 
                            disabled={loading}
                        >
                            {loading ? (
                                <LoaderCircle className="animate-spin h-5 w-5" />
                            ) : (
                                <>
                                    <Zap className="h-4 w-4 mr-2" />
                                    INICIAR SESSÃO
                                </>
                            )}
                        </Button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground/60">
                            Não tem uma conta?{' '}
                            <a href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                                Criar conta
                            </a>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
