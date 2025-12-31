"use client";

import React, { memo, useRef } from 'react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { cn } from '@/lib/utils';
import { Sword, Zap, Star, Trophy, Skull, Search, Menu, ChevronRight, DoorOpen, Shield, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { generateSkillDungeonChallenge } from '@/lib/ai-client';
import { useToast } from '@/hooks/use-toast';
import SkillDungeonView from './SkillDungeonView';

const DungeonMobileComponent = () => {
    const { profile, skills, persistData, clearDungeonSession } = usePlayerDataContext();
    const { toast } = useToast();
    
    const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            const patterns = { light: 50, medium: 100, heavy: 200 };
            navigator.vibrate(patterns[type]);
        }
    };

    const handleStartDungeon = async (type: string) => {
        triggerHapticFeedback('heavy');
        toast({ title: "Iniciando Instância", description: "Sincronizando ambiente neural..." });
        
        try {
            const randomSkill = skills[Math.floor(Math.random() * skills.length)];
            
            if (type === 'random') {
                const challenge = await generateSkillDungeonChallenge({
                    skillName: randomSkill.nome,
                    skillDescription: randomSkill.descricao,
                    skillLevel: randomSkill.nivel_atual,
                    dungeonRoomLevel: 1
                });
                
                await persistData('profile', {
                    ...profile,
                    dungeon_session: {
                        skillId: randomSkill.id,
                        roomLevel: 1,
                        highestRoom: 1,
                        challenge: challenge,
                        completed_challenges: []
                    }
                });
            } else {
                // Instância fixa
                await persistData('profile', {
                    ...profile,
                    dungeon_session: {
                        skillId: randomSkill.id,
                        roomLevel: 1,
                        highestRoom: 1,
                        challenge: null, // Será gerado ao entrar
                        completed_challenges: []
                    }
                });
            }
        } catch (err) {
            console.error("Erro ao iniciar masmorra:", err);
            toast({ variant: 'destructive', title: "Erro de Sistema", description: "Falha ao abrir o portão." });
        }
    };

    if (!profile) return null;

    if (profile.dungeon_session) {
        return (
            <div className="h-screen bg-black overflow-hidden flex flex-col max-w-full relative">
                <SkillDungeonView onExit={() => clearDungeonSession(true)} />
            </div>
        );
    }

    return (
        <div className="h-screen bg-black overflow-hidden flex flex-col max-w-full relative">
            <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-[0.03] pointer-events-none z-50" />
            
            <header className="bg-black/90 backdrop-blur-2xl border-b border-purple-500/20 flex-shrink-0 z-40" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
                <div className="flex items-center justify-between bg-purple-950/40 border-b border-purple-900/30 py-2.5 px-4">
                    <div className="flex items-center gap-3">
                        <Skull className="h-4 w-4 text-purple-400 animate-pulse" />
                        <span className="font-mono text-[10px] text-purple-300 uppercase tracking-[0.2em] font-bold">
                            GATEWAY_LINK: <span className="text-white">UNSTABLE</span>
                        </span>
                    </div>
                </div>

                <div className="px-4 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="font-cinzel text-white tracking-widest text-2xl font-bold drop-shadow-[0_0_12px_rgba(168,85,247,0.6)] uppercase">
                            INSTANCE <span className="text-purple-500">GATE</span>
                        </h1>
                        <p className="text-purple-300/60 font-mono text-[10px] tracking-[0.15em] mt-1 font-bold uppercase">
                            TEMPORAL_DUNGEON_ACCESS
                        </p>
                    </div>
                    <button className="text-purple-400 p-3 rounded-2xl border-2 border-purple-500/20 bg-purple-500/5 transition-all shadow-lg" onClick={() => triggerHapticFeedback('medium')}>
                        <DoorOpen className="h-7 w-7" />
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-6 pb-32 bg-black relative">
                <div className="flex flex-col gap-6 animate-fade-in">
                    
                    {/* Active Dungeon Session or Lobby */}
                    <div className="relative border-2 border-purple-500/40 rounded-[2.5rem] bg-gradient-to-br from-purple-950/20 to-black p-8 text-center shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
                        
                        <div className="w-20 h-20 rounded-[2rem] bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center mx-auto mb-6 relative">
                            <Skull className="h-10 w-10 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                        </div>

                        <h2 className="font-cinzel text-2xl text-white font-bold tracking-widest mb-4">
                            DAILY_INSTANCES
                        </h2>
                        
                        <div className="space-y-4">
                            {['Shadow Library', 'Neural Forge', 'Void Training'].map((dungeon, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => handleStartDungeon(dungeon)}
                                    className="w-full bg-black/40 border-2 border-purple-900/30 rounded-3xl p-4 flex items-center justify-between active:border-purple-500 transition-all shadow-lg group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-center">
                                            <Sword className="h-5 w-5 text-purple-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-bold text-white uppercase tracking-wider">{dungeon}</p>
                                            <p className="text-[8px] font-mono text-purple-300/40 uppercase">Rank E - Min Lv.1</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-purple-500/20 group-active:text-purple-400" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-purple-950/10 border-2 border-purple-900/30 rounded-3xl p-6 text-center">
                        <Sparkles className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                        <h3 className="font-mono font-bold text-xs text-purple-200 uppercase tracking-widest">Random Dungeon Protocol</h3>
                        <p className="text-[10px] text-purple-100/40 font-mono mt-2 uppercase">System generates unpredictable challenges for massive experience gains.</p>
                        <button 
                            onClick={() => handleStartDungeon('random')}
                            className="mt-6 w-full py-4 bg-purple-600 text-white font-mono font-bold rounded-2xl shadow-lg border-2 border-purple-400 active:scale-95 transition-all"
                        >
                            GENERATE_INSTANCE
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
};

export const DungeonMobile = memo(DungeonMobileComponent);
