"use client";

import React, { memo, useState, useRef, useEffect } from 'react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { cn } from '@/lib/utils';
import { MessageSquare, Wand2, Cpu, Send, Bot, User, Sparkles, Search, Menu, ChevronLeft } from 'lucide-react';

import { generateSystemAdvice } from '@/lib/ai-client';
import { useToast } from '@/hooks/use-toast';

const AIChatMobileComponent = () => {
    const { profile, metas, routine, missions } = usePlayerDataContext();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<any[]>([
        { role: 'ai', text: 'Greeting, Hunter. I am the Architect. I monitor your progress and calculate optimal growth paths. How can I assist your evolution today?' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            const patterns = { light: 50, medium: 100, heavy: 200 };
            navigator.vibrate(patterns[type]);
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isTyping) return;
        
        const userText = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setIsTyping(true);
        triggerHapticFeedback('medium');

        try {
            const result = await generateSystemAdvice({
                userName: profile.nome_utilizador,
                profile: JSON.stringify(profile),
                metas: JSON.stringify(metas),
                routine: JSON.stringify(routine),
                missions: JSON.stringify(missions.filter((m: any) => !m.concluido)),
                query: userText,
                personality: profile.user_settings?.ai_personality || 'balanced',
            });
            
            setMessages(prev => [...prev, { role: 'ai', text: result.response }]);
            triggerHapticFeedback('success' as any);
        } catch (err) {
            toast({ variant: 'destructive', title: "Erro de Conexão", description: "O Arquiteto está offline no momento." });
        } finally {
            setIsTyping(false);
        }
    };

    if (!profile) return null;

    return (
        <div className="h-screen bg-black overflow-hidden flex flex-col max-w-full relative font-mono">
            <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-[0.03] pointer-events-none z-50" />
            
            <header className="bg-black/90 backdrop-blur-2xl border-b border-blue-500/20 flex-shrink-0 z-40" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
                <div className="flex items-center justify-between bg-blue-950/40 border-b border-blue-900/30 py-2.5 px-4">
                    <div className="flex items-center gap-3">
                        <Cpu className="h-4 w-4 text-blue-400 animate-pulse" />
                        <span className="font-mono text-[10px] text-blue-300 uppercase tracking-[0.2em] font-bold">
                            NEURAL_LINK: <span className="text-white">{isTyping ? 'PROCESSING...' : 'ESTABLISHED'}</span>
                        </span>
                    </div>
                </div>

                <div className="px-4 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600 border-2 border-blue-400 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                            <Wand2 className={cn("h-8 w-8 text-white", isTyping ? "animate-spin-slow" : "animate-pulse-slow")} />
                        </div>
                        <div>
                            <h1 className="font-cinzel text-white tracking-widest text-xl font-bold uppercase">
                                THE <span className="text-blue-400">ARCHITECT</span>
                            </h1>
                            <p className="text-blue-300/60 text-[10px] tracking-[0.15em] mt-1 font-bold uppercase">
                                SYSTEM_ORACLE_AI_V2
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 bg-black relative flex flex-col gap-6 scrollbar-hide">
                {messages.map((msg, i) => (
                    <div key={i} className={cn("flex gap-4 max-w-[90%]", msg.role === 'user' ? "self-end flex-row-reverse" : "")}>
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border-2 shadow-lg",
                            msg.role === 'ai' ? "bg-blue-600 border-blue-400" : "bg-black border-blue-500/40"
                        )}>
                            {msg.role === 'ai' ? <Bot className="h-6 w-6 text-white" /> : <User className="h-6 w-6 text-blue-400" />}
                        </div>
                        <div className={cn(
                            "border-2 p-5 shadow-xl",
                            msg.role === 'ai' 
                                ? "bg-blue-950/20 border-blue-900/40 rounded-[2rem] rounded-tl-none" 
                                : "bg-blue-600/10 border-blue-500/30 rounded-[2rem] rounded-tr-none"
                        )}>
                            <p className="text-xs text-blue-50 leading-relaxed uppercase tracking-tight font-mono">
                                {msg.text}
                            </p>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex gap-4 max-w-[90%] animate-pulse">
                        <div className="w-10 h-10 rounded-xl bg-blue-950/40 border-2 border-blue-900/40 flex items-center justify-center">
                            <Bot className="h-6 w-6 text-blue-500/40" />
                        </div>
                        <div className="bg-blue-950/10 border border-blue-900/20 rounded-[2rem] rounded-tl-none p-4">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="p-4 bg-black/90 backdrop-blur-2xl border-t border-blue-500/20 pb-safe">
                <div className="flex gap-3 items-center">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type command..."
                            className="w-full h-14 bg-blue-950/20 border-2 border-blue-500/30 rounded-3xl pl-6 pr-12 text-sm text-white focus:outline-none focus:border-blue-400 transition-all font-mono placeholder:text-blue-500/20 uppercase"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 p-2">
                            <Sparkles className="h-5 w-5" />
                        </button>
                    </div>
                    <button 
                        className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg border-2 border-blue-400 active:scale-90 transition-all disabled:opacity-50"
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isTyping}
                    >
                        <Send className="h-6 w-6" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export const AIChatMobile = memo(AIChatMobileComponent);
