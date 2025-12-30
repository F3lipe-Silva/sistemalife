
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LoaderCircle, Terminal, Sparkles, Shield, Zap, Lock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { user, authState } = useAuth();
    const [typedTitle, setTypedTitle] = useState('');
    const titleText = "SYSTEM INITIALIZATION";
    const authLoading = authState === 'loading';

    useEffect(() => {
        if (!authLoading && user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        setTypedTitle('');
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex <= titleText.length) {
                setTypedTitle(titleText.substring(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("ACCESS GRANTED", {
                description: "Welcome back, Player."
            });
            router.push('/');
        } catch (err: any) {
            let friendlyMessage = "Authentication failed.";
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                friendlyMessage = "INVALID CREDENTIALS";
            } else if (err.code === 'auth/invalid-email') {
                friendlyMessage = "INVALID EMAIL FORMAT";
            }
            setError(friendlyMessage);
            toast.error(friendlyMessage);
            setLoading(false);
        }
    };
    
    if (authLoading || (!authLoading && user)) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 text-blue-500 font-mono">
                <div className="relative">
                    <div className="absolute inset-0 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                    <LoaderCircle className="animate-spin h-16 w-16 text-blue-400" />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xl tracking-[0.2em] animate-pulse">ESTABLISHING CONNECTION</span>
                    <span className="text-xs text-blue-500/50">VERIFYING PLAYER ID...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black" />
            
            {/* Ambient Particles */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-500 rounded-full animate-ping duration-1000" />
            <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-ping delay-500 duration-1000" />

            <div className="relative w-full max-w-md">
                {/* Tech Window Frame */}
                <div className="absolute -inset-1 border border-blue-500/30 bg-blue-900/5 backdrop-blur-sm pointer-events-none" />
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500" />

                <div className="relative bg-black/80 border border-blue-900/50 p-8 shadow-[0_0_50px_rgba(37,99,235,0.15)]">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-blue-950/30 border-2 border-blue-500/50 flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                <Shield className="h-10 w-10 text-blue-400" />
                            </div>
                        </div>
                        <h1 className="font-cinzel text-3xl md:text-4xl font-black text-white tracking-[0.1em] min-h-[48px] drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                            {typedTitle}
                            <span className="animate-pulse text-blue-500">_</span>
                        </h1>
                        <p className="text-blue-400/60 font-mono text-xs tracking-widest mt-2 uppercase">
                            Secure Access Terminal // V.2.0
                        </p>
                    </div>
                    
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-mono text-blue-400 uppercase tracking-widest">
                                Player Identity
                            </Label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-blue-500/50 group-focus-within:text-blue-400 transition-colors" />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="ENTER_EMAIL_ID"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-blue-950/10 border-blue-900/50 text-blue-100 font-mono pl-10 h-12 rounded-none focus-visible:ring-blue-500/50 focus-visible:border-blue-500 transition-all placeholder:text-blue-900/50"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-xs font-mono text-blue-400 uppercase tracking-widest">
                                    Access Code
                                </Label>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-blue-500/50 group-focus-within:text-blue-400 transition-colors" />
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-blue-950/10 border-blue-900/50 text-blue-100 font-mono pl-10 h-12 rounded-none focus-visible:ring-blue-500/50 focus-visible:border-blue-500 transition-all placeholder:text-blue-900/50"
                                />
                            </div>
                        </div>
                        
                        {error && (
                            <div className="p-3 bg-red-950/20 border border-red-500/30 flex items-center justify-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                <p className="text-xs font-mono text-red-400 uppercase tracking-wide">{error}</p>
                            </div>
                        )}
                        
                        <Button 
                            type="submit" 
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono uppercase tracking-[0.2em] h-12 rounded-none shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-300 relative overflow-hidden group" 
                            disabled={loading}
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <LoaderCircle className="animate-spin h-4 w-4" />
                                    AUTHENTICATING...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Zap className="h-4 w-4" />
                                    INITIATE LINK
                                </span>
                            )}
                        </Button>
                    </form>
                    
                    <div className="mt-8 text-center border-t border-blue-900/30 pt-4">
                        <p className="text-xs font-mono text-blue-500/50 uppercase">
                            NEW PLAYER DETECTED?{' '}
                            <a href="/register" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors ml-1">
                                REGISTER ID
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
