"use client";

import React, { memo, useRef, useMemo } from 'react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { cn } from '@/lib/utils';
import { Shield, Swords, Zap, Star, Trophy, StarHalf, Sparkles, Menu, ChevronRight, Briefcase, Brain, Paintbrush, Handshake, Heart, ShieldCheck, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ClassDataItem {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
    categories: string[];
    bonus: string;
    title: string;
}

const classData: Record<string, ClassDataItem> = {
    'Guerreiro': {
        title: 'WARRIOR',
        icon: Swords,
        color: 'text-red-500',
        bgColor: 'bg-red-950/20',
        borderColor: 'border-red-500/50',
        description: 'Focuses on overcoming physical challenges and strengthening the body.',
        categories: ['Saúde & Fitness'],
        bonus: '+5% XP in Health & Fitness quests.'
    },
    'Mago': {
        title: 'MAGE',
        icon: Brain,
        color: 'text-blue-500',
        bgColor: 'bg-blue-950/20',
        borderColor: 'border-blue-500/50',
        description: 'Dedicated to expanding knowledge and mastering new competencies.',
        categories: ['Desenvolvimento de Carreira', 'Finanças', 'Cultura & Conhecimento'],
        bonus: 'Requires 10% less XP to evolve Intelligence skills.'
    },
    'Artesão': {
        title: 'ARTISAN',
        icon: Paintbrush,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-950/20',
        borderColor: 'border-yellow-500/50',
        description: 'A master of creation and expression. Transforms ideas into reality.',
        categories: ['Hobbies & Criatividade'],
        bonus: '+10% "critical hit" chance in creative tasks.'
    },
    'Diplomata': {
        title: 'DIPLOMAT',
        icon: Handshake,
        color: 'text-green-500',
        bgColor: 'bg-green-950/20',
        borderColor: 'border-green-500/50',
        description: 'Expert in building bridges and strengthening bonds.',
        categories: ['Relacionamentos'],
        bonus: '+10% XP in Relationship quests.'
    },
    'Sábio': {
        title: 'SAGE',
        icon: Heart,
        color: 'text-purple-500',
        bgColor: 'bg-purple-950/20',
        borderColor: 'border-purple-500/50',
        description: 'Focused on self-knowledge and inner balance.',
        categories: ['Crescimento Pessoal'],
        bonus: 'Reduces XP loss from skill corruption by 25%.'
    },
    'Explorador': {
        title: 'RANGER',
        icon: ShieldCheck,
        color: 'text-orange-500',
        bgColor: 'bg-orange-950/20',
        borderColor: 'border-orange-500/50',
        description: 'An adventurer who braves the world and new experiences.',
        categories: ['Viagens & Aventura'],
        bonus: 'Increases chance of finding "rare quests" by 10%.'
    },
    'Neófito': {
        title: 'NOVICE',
        icon: User,
        color: 'text-gray-400',
        bgColor: 'bg-gray-950/20',
        borderColor: 'border-gray-500/50',
        description: 'A hunter at the beginning of their journey.',
        categories: [],
        bonus: '+5% XP in all activities until Level 5.'
    }
};

const ClassMobileComponent = () => {
    const { profile, metas } = usePlayerDataContext();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const userClass = useMemo(() => {
        if (!metas || metas.length === 0) return classData['Neófito'];

        const activeGoals = metas.filter((m: any) => !m.concluida);
        if (activeGoals.length === 0) return classData['Neófito'];
        
        const categoryCounts: Record<string, number> = activeGoals.reduce((acc: Record<string, number>, meta: any) => {
            const category = meta.categoria || "Crescimento Pessoal";
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});

        const primaryCategory = Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b);
        
        for (const className in classData) {
            if (classData[className].categories.includes(primaryCategory)) {
                return classData[className];
            }
        }
        
        return classData['Neófito'];

    }, [metas]);

    const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            const patterns = { light: 50, medium: 100, heavy: 200 };
            navigator.vibrate(patterns[type]);
        }
    };

    if (!profile) return null;
    
    const Icon = userClass.icon;

    return (
        <div className="h-screen bg-black overflow-hidden flex flex-col max-w-full relative font-mono">
            <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-[0.03] pointer-events-none z-50" />
            
            <header className="bg-black/90 backdrop-blur-2xl border-b border-blue-500/20 flex-shrink-0 z-40" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
                <div className="flex items-center justify-between bg-blue-950/40 border-b border-blue-900/30 py-2.5 px-4">
                    <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-blue-400 animate-pulse" />
                        <span className="font-mono text-[10px] text-blue-300 uppercase tracking-[0.2em] font-bold">
                            IDENTITY_PROTOCOL: <span className="text-white">VERIFIED</span>
                        </span>
                    </div>
                </div>

                <div className="px-4 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="font-cinzel text-white tracking-widest text-2xl font-bold drop-shadow-[0_0_12px_rgba(59,130,246,0.6)] uppercase">
                            PLAYER <span className="text-blue-400">CLASS</span>
                        </h1>
                        <p className="text-blue-300/60 text-[10px] tracking-[0.15em] mt-1 font-bold uppercase">
                            GENETIC_SPECIALIZATION_DATA
                        </p>
                    </div>
                    <button className="text-blue-400 p-3 rounded-2xl border-2 border-blue-500/20 bg-blue-500/5 transition-all shadow-lg" onClick={() => triggerHapticFeedback('medium')}>
                        <Briefcase className="h-7 w-7" />
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-6 pb-32 bg-black relative">
                <div className="flex flex-col gap-6 animate-fade-in">
                    
                    {/* Active Class Card */}
                    <div className={cn(
                        "relative border-2 rounded-[2.5rem] bg-gradient-to-br from-blue-950/20 to-black p-8 text-center shadow-2xl overflow-hidden",
                        userClass.borderColor
                    )}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                        <div className={cn("absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20", userClass.bgColor.replace('/20', ''))} />
                        
                        <div className={cn(
                            "w-24 h-24 rounded-[2rem] border-2 flex items-center justify-center mx-auto mb-6 shadow-inner relative",
                            userClass.bgColor, userClass.borderColor
                        )}>
                            <div className="absolute inset-0 bg-blue-400/5 animate-pulse rounded-[2rem]" />
                            <Icon className={cn("h-12 w-12 drop-shadow-[0_0_10px_currentColor]", userClass.color)} />
                        </div>

                        <h2 className={cn("font-cinzel text-3xl font-bold tracking-widest mb-2 drop-shadow-[0_0_5px_currentColor]", userClass.color)}>
                            {userClass.title}
                        </h2>
                        <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6">
                            TIER_1_HUNTER
                        </Badge>

                        <p className="text-sm text-blue-100/60 leading-relaxed italic uppercase tracking-tight">
                            "{userClass.description}"
                        </p>
                    </div>

                    {/* Class Perks HUD */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-blue-950/10 border-2 border-blue-900/30 rounded-3xl p-5 flex items-center gap-4 active:bg-blue-950/30 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-center">
                                <Zap className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">PASSIVE BONUS</span>
                                    <span className="text-xs font-bold text-white bg-blue-500/20 px-2 py-0.5 rounded-lg border border-blue-500/20">ACTIVE</span>
                                </div>
                                <p className="text-[10px] text-blue-100/40 uppercase tracking-tight">{userClass.bonus}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export const ClassMobile = memo(ClassMobileComponent);
