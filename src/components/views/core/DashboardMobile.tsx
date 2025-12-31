"use client";

import React, { memo, useMemo, useState, useRef } from 'react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Bell, Zap, Trophy, Coins, Gem, Heart, Shield, TrendingUp, Target, Sword, ChevronDown, ChevronUp, User, KeySquare, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { getProfileRank } from '@/lib/game-utils';

const DashboardMobileComponent = () => {
    const { profile, worldEvents } = usePlayerDataContext();
    const [expandedCards, setExpandedCards] = useState({
        stats: false,
        resources: false,
        event: false
    });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const startY = useRef<number>(0);
    const currentY = useRef<number>(0);

    // Native haptic feedback simulation
    const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            const patterns = { light: 50, medium: 100, heavy: 200 };
            navigator.vibrate(patterns[type]);
        }
    };

    const activeEvent = useMemo(() => {
        return (worldEvents || []).find((e: any) => e.isActive);
    }, [worldEvents]);

    const userContribution = useMemo(() => {
        if (!profile?.event_contribution || !activeEvent) return 0;
        return profile.event_contribution.eventId === activeEvent.id ? profile.event_contribution.contribution : 0;
    }, [profile, activeEvent]);

    const toggleCardExpansion = (card: keyof typeof expandedCards) => {
        triggerHapticFeedback('light');
        setExpandedCards(prev => ({
            ...prev,
            [card]: !prev[card]
        }));
    };

    // Swipe and Pull-to-refresh logic
    const handleTouchStart = (e: React.TouchEvent) => {
        startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        currentY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
        if (currentY.current - startY.current > 150 && scrollContainerRef.current?.scrollTop === 0) {
            setIsRefreshing(true);
            triggerHapticFeedback('medium');
            setTimeout(() => setIsRefreshing(false), 1500);
        }
    };

    if (!profile || !profile.estatisticas) {
        return (
             <div className="flex h-screen flex-col items-center justify-center p-8 gap-6 bg-black">
                <Skeleton className="w-24 h-24 rounded-[2rem] bg-blue-900/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]" />
                <div className="text-center space-y-4">
                    <Skeleton className="h-8 w-56 mx-auto bg-blue-900/20" />
                    <p className="text-blue-500/40 font-mono text-xs animate-pulse tracking-widest uppercase">Initializing_System...</p>
                </div>
            </div>
        );
    }

    const xpPercentage = (profile.xp / profile.xp_para_proximo_nivel) * 100;
    const maxHP = Math.floor(profile.estatisticas.constituicao / 5) * 100;
    const hpPercentage = ((profile.hp_atual || maxHP) / maxHP) * 100;
    const profileRank = getProfileRank(profile.nivel);

    return (
        <div className="h-screen bg-black overflow-hidden flex flex-col max-w-full relative">
            {/* Background System Effect */}
            <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-[0.03] pointer-events-none z-50" />
            
            <header className="bg-black/90 backdrop-blur-2xl border-b border-blue-500/20 flex-shrink-0 z-40" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                {/* System Alert Bar */}
                <div className="flex items-center justify-between bg-blue-950/40 border-b border-blue-900/30 py-2.5 px-4">
                    <div className="flex items-center gap-3">
                        <Bell className="h-4 w-4 text-blue-400 animate-pulse" />
                        <span className="font-mono text-[10px] text-blue-300 uppercase tracking-[0.2em] font-bold">
                            SYSTEM_STATUS: <span className="text-white">OPERATIONAL</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                        <span className="font-mono text-[10px] text-green-400 font-bold tracking-wider uppercase">Online</span>
                    </div>
                </div>

                <div className="flex items-center justify-between px-4 py-5 min-h-[80px]">
                    <div className="flex-1">
                        <h1 className="font-cinzel text-white tracking-widest text-2xl font-bold drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]">
                            HELLO, <span className="text-blue-400">{profile?.primeiro_nome?.toUpperCase() || 'HUNTER'}</span>
                        </h1>
                        <p className="text-blue-300/60 font-mono text-[10px] tracking-[0.15em] mt-1 font-bold uppercase">
                            CONTROL_PANEL_INITIALIZED
                        </p>
                    </div>

                    <button className="text-blue-400 p-3 rounded-2xl border-2 border-blue-500/20 bg-blue-500/5 active:bg-blue-500/20 transition-all shadow-lg" onClick={() => triggerHapticFeedback('medium')}>
                        <User className="h-7 w-7" />
                    </button>
                </div>
            </header>

            <main 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-4 py-4 pb-safe bg-black relative" 
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="flex flex-col gap-6 pb-24 animate-fade-in">
                    
                    {/* 1. Status Section - MD3 Large Container Style */}
                    <div className={cn(
                        "relative border-2 rounded-[2.5rem] transition-all duration-300 overflow-hidden shadow-2xl bg-gradient-to-br from-blue-950/20 to-black p-6",
                        expandedCards.stats ? "border-blue-400/60 shadow-blue-500/10" : "border-blue-900/40"
                    )} onClick={() => toggleCardExpansion('stats')}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-base font-cinzel text-white flex items-center gap-3 tracking-widest font-bold">
                                <Zap className="h-5 w-5 text-blue-400" />
                                SYSTEM_STATUS
                            </h2>
                            <button className="text-blue-400/50">
                                {expandedCards.stats ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                            </button>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="flex gap-6 items-center">
                                {/* Avatar MD3 Mega Highlight */}
                                <div className="relative group shrink-0">
                                    {/* Outer Glow Ring */}
                                    <div className="absolute -inset-2 bg-blue-500/20 rounded-[2.5rem] blur-xl animate-pulse-slow" />
                                    
                                    {/* System Frame */}
                                    <div className="relative w-[140px] h-[140px] bg-black rounded-[2.2rem] border-2 border-blue-500/40 p-1.5 shadow-[0_0_20px_rgba(59,130,246,0.2)] overflow-hidden">
                                        {/* Scanner Line Effect on Image */}
                                        <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(59,130,246,0.1)_50%,transparent_100%)] bg-[length:100%_4px] animate-scanline pointer-events-none z-10" />
                                        
                                        <Avatar className="w-full h-full rounded-[1.8rem] border-2 border-blue-400/30 shadow-inner overflow-hidden">
                                            <AvatarImage src={profile.avatar_url} className="object-cover scale-110 group-active:scale-125 transition-transform duration-700" />
                                            <AvatarFallback className="text-xl font-cinzel bg-blue-900/20 text-blue-400">
                                                {profile.primeiro_nome?.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        {/* Corner HUD Markers */}
                                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400" />
                                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400" />
                                    </div>

                                    {/* Level Badge Overlay */}
                                    <div className={cn(
                                        "absolute -bottom-2 -right-2 border-4 border-black text-white px-4 py-1 rounded-2xl shadow-2xl z-20 group-active:scale-110 transition-transform",
                                        profileRank.border,
                                        "bg-black"
                                    )}>
                                        <p className={cn("text-[10px] font-mono font-black uppercase tracking-tighter leading-none opacity-70 text-center", profileRank.color)}>RANK</p>
                                        <p className={cn("text-xl font-bold font-cinzel leading-none text-center mt-0.5", profileRank.color)}>{profileRank.rank}</p>
                                    </div>
                                </div>

                                {/* Info & Bars Side */}
                                <div className="flex-1 flex flex-col gap-4 justify-center">
                                    <div className="space-y-1">
                                        <h3 className="font-cinzel text-xl font-bold text-white tracking-widest leading-none truncate uppercase">
                                            {profile.primeiro_nome || 'HUNTER'}
                                        </h3>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline" className="px-3 py-0.5 bg-blue-500/10 border-blue-500/30 text-blue-400 text-[10px] font-mono font-bold rounded-full">
                                                {profile.classe || 'UNAWAKENED'}
                                            </Badge>
                                            <Badge variant="outline" className={cn("px-3 py-0.5 bg-black/40 text-[10px] font-mono font-bold rounded-full", profileRank.border, profileRank.color)}>
                                                {profileRank.title}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] uppercase font-bold text-red-400 tracking-widest">
                                                <span className="flex items-center gap-1.5"><Heart className="h-3 w-3" /> HP_STATUS</span>
                                                <span className="font-mono">{profile.hp_atual || maxHP}/{maxHP}</span>
                                            </div>
                                            <div className="h-2.5 bg-red-950/40 rounded-full overflow-hidden border border-red-500/20">
                                                <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-1000 shadow-[0_0_10px_#ef4444]" style={{ width: `${hpPercentage}%` }} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] uppercase font-bold text-blue-400 tracking-widest">
                                                <span className="flex items-center gap-1.5"><TrendingUp className="h-3 w-3" /> XP_PROGRESS</span>
                                                <span className="font-mono">{Math.floor(xpPercentage)}%</span>
                                            </div>
                                            <div className="h-2.5 bg-blue-950/40 rounded-full overflow-hidden border border-blue-500/20">
                                                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 shadow-[0_0_10px_#3b82f6]" style={{ width: `${xpPercentage}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {expandedCards.stats && (
                            <div className="mt-8 pt-6 border-t border-blue-500/10 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                {[
                                    { label: 'FORÇA', value: profile.estatisticas.forca, color: 'text-red-400', icon: Sword },
                                    { label: 'INTELIGÊNCIA', value: profile.estatisticas.inteligencia, color: 'text-purple-400', icon: Zap },
                                    { label: 'DESTREZA', value: profile.estatisticas.destreza, color: 'text-green-400', icon: Target },
                                    { label: 'CONSTITUIÇÃO', value: profile.estatisticas.constituicao, color: 'text-orange-400', icon: Shield },
                                    { label: 'SABEDORIA', value: profile.estatisticas.sabedoria, color: 'text-cyan-400', icon: Activity },
                                    { label: 'CARISMA', value: profile.estatisticas.carisma, color: 'text-pink-400', icon: Heart },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-black/40 rounded-3xl p-4 border-2 border-blue-500/5 shadow-lg">
                                        <div className="flex items-center gap-3 mb-2">
                                            <stat.icon className={cn("h-4 w-4", stat.color)} />
                                            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-200/40 font-bold">{stat.label}</span>
                                        </div>
                                        <p className={cn("text-xl font-bold font-cinzel leading-none", stat.color)}>{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 2. Resources Section - MD3 Style Grid */}
                    <div className={cn(
                        "relative border-2 rounded-[2.5rem] transition-all duration-300 overflow-hidden shadow-2xl bg-gradient-to-br from-yellow-950/10 to-black p-6",
                        expandedCards.resources ? "border-yellow-400/60 shadow-yellow-500/10" : "border-yellow-900/40"
                    )}>
                        <div className="flex items-center justify-between mb-6" onClick={() => toggleCardExpansion('resources')}>
                            <h2 className="text-base font-cinzel text-white flex items-center gap-3 tracking-widest font-bold">
                                <Coins className="h-5 w-5 text-yellow-400" />
                                DATA_RESOURCES
                            </h2>
                            <button className="text-yellow-400/50">
                                {expandedCards.resources ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: Coins, value: profile.moedas || 0, color: 'text-yellow-400', bg: 'bg-yellow-500/5', border: 'border-yellow-500/20', label: 'Gold' },
                                { icon: Gem, value: profile.fragmentos || 0, color: 'text-purple-400', bg: 'bg-purple-500/5', border: 'border-purple-500/20', label: 'Fragments' },
                                { icon: Zap, value: profile.energia || '100%', color: 'text-blue-400', bg: 'bg-blue-500/5', border: 'border-blue-500/20', label: 'Energy' },
                                { icon: Trophy, value: profile.missoes_concluidas_total || 0, color: 'text-orange-400', bg: 'bg-orange-500/5', border: 'border-orange-500/20', label: 'Missions' },
                                { icon: KeySquare, value: profile.dungeon_crystals || 0, color: 'text-cyan-400', bg: 'bg-cyan-500/5', border: 'border-cyan-500/20', label: 'Keys' },
                                { icon: Flame, value: `${profile.streak_atual || 0}D`, color: 'text-red-400', bg: 'bg-red-500/5', border: 'border-red-500/20', label: 'Streak' }
                            ].map((res, i) => (
                                <div key={i} className={cn("h-[90px] rounded-[2rem] border-2 flex flex-col items-center justify-center p-3 transition-all duration-200 active:scale-95 shadow-lg", res.bg, res.border)}>
                                    <res.icon className={cn("h-6 w-6 mb-1 drop-shadow-[0_0_5px_currentColor]", res.color)} />
                                    <span className="text-base font-bold text-white font-mono leading-none">{res.value}</span>
                                    <span className="text-[8px] text-white/30 uppercase tracking-widest font-bold mt-1">{res.label}</span>
                                </div>
                            ))}
                        </div>

                        {expandedCards.resources && (
                            <div className="mt-6 pt-6 border-t border-yellow-500/10 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="bg-black/40 rounded-3xl p-4 border border-yellow-500/10">
                                    <span className="text-[9px] font-mono text-yellow-400 uppercase font-bold tracking-widest block mb-2 opacity-60">Last_Sync</span>
                                    <p className="text-xs text-white/80 font-mono">
                                        {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. Active Event Section - MD3 Urgent Quest Style */}
                    <div className={cn(
                        "relative border-2 rounded-[2.5rem] transition-all duration-300 overflow-hidden shadow-2xl p-6",
                        activeEvent 
                            ? "border-red-500/40 bg-gradient-to-br from-red-950/20 to-black shadow-red-500/10" 
                            : "border-blue-900/40 bg-blue-950/10 opacity-60"
                    )}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={cn(
                                "text-base font-cinzel flex items-center gap-3 tracking-widest font-bold",
                                activeEvent ? "text-red-400 animate-pulse" : "text-blue-400"
                            )}>
                                {activeEvent ? <Activity className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                                {activeEvent ? 'URGENT_QUEST' : 'WORLD_STATUS'}
                            </h2>
                            {activeEvent && (
                                <button className="text-red-400/50" onClick={() => toggleCardExpansion('event')}>
                                    {expandedCards.event ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                                </button>
                            )}
                        </div>

                        {activeEvent ? (
                            <div className="space-y-6">
                                {/* Event Progress HUD */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] text-red-300 font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Target className="h-3 w-3" /> GLOBAL_PROGRESS</span>
                                        <span className="font-mono">{Math.round((activeEvent.progress / activeEvent.goal.target) * 100)}%</span>
                                    </div>
                                    <div className="h-2 bg-red-950/40 rounded-full overflow-hidden border border-red-500/20 shadow-inner">
                                        <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-1000 ease-out shadow-[0_0_8px_#ef4444]" style={{ width: `${(activeEvent.progress / activeEvent.goal.target) * 100}%` }} />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center text-center gap-4 py-2">
                                    <div className="p-5 bg-red-500/10 rounded-[2rem] border-2 border-red-500/20 shadow-inner">
                                        <Activity className="h-10 w-10 text-red-500 animate-bounce" />
                                    </div>
                                    <div>
                                        <h3 className="font-cinzel text-white text-lg font-bold tracking-wider mb-2">{activeEvent.name}</h3>
                                        <p className="text-xs text-red-200/60 font-mono leading-relaxed line-clamp-3 uppercase tracking-tight">{activeEvent.description}</p>
                                    </div>

                                    {/* Contribution HUD */}
                                    <div className="w-full bg-black/40 rounded-3xl p-4 border-2 border-red-500/10 shadow-lg">
                                        <div className="flex justify-between text-[10px] text-red-400 font-bold uppercase tracking-widest mb-2">
                                            <span>YOUR_CONTRIBUTION</span>
                                            <span className="font-mono text-white">{userContribution} PTS</span>
                                        </div>
                                        <p className="text-[9px] text-red-200/40 font-mono uppercase font-bold tracking-tighter">Complete missions to support the server!</p>
                                    </div>
                                </div>

                                {expandedCards.event && (
                                    <div className="mt-4 pt-6 border-t border-red-500/10 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="bg-black/40 rounded-3xl p-4 border border-red-500/10">
                                            <span className="text-[9px] font-mono text-red-400 uppercase font-bold block mb-1">Type</span>
                                            <p className="text-xs text-white uppercase font-mono">{activeEvent.type}</p>
                                        </div>
                                        <div className="bg-black/40 rounded-3xl p-4 border border-red-500/10">
                                            <span className="text-[9px] font-mono text-red-400 uppercase font-bold block mb-1">Rewards</span>
                                            <div className="flex gap-1.5 flex-wrap">
                                                {activeEvent.rewards?.map((reward: any, i: number) => (
                                                    <span key={i} className="text-[8px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded-md border border-red-500/20">
                                                        {reward.type}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 opacity-40">
                                <Shield className="h-12 w-12 text-blue-500 mb-4" />
                                <h3 className="font-cinzel text-white text-base">WORLD_AT_PEACE</h3>
                                <p className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.2em] mt-2">No active threats detected.</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};

export const DashboardMobile = memo(DashboardMobileComponent);
