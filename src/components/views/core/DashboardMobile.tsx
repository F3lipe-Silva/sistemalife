"use client";

import React, { memo, useMemo, useState, useRef, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonIcon,
  IonButton,
  IonButtons,
  IonMenuButton,
  IonAvatar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonRippleEffect
} from '@ionic/react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { notifications, personCircle, refresh, statsChart, flame, skull, chevronDown, chevronUp } from 'ionicons/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Bell, Zap, Trophy, Coins, Gem, Heart, Shield, TrendingUp, Target, Sword, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const DashboardMobileComponent = () => {
    const { profile, worldEvents } = usePlayerDataContext();
    const [expandedCards, setExpandedCards] = useState({
        stats: false,
        resources: false,
        event: false
    });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());

    // Native haptic feedback simulation
    const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
        if (navigator.vibrate) {
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

    const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
        setIsRefreshing(true);
        triggerHapticFeedback('medium');

        // Simulate data refresh
        await new Promise(resolve => setTimeout(resolve, 1500));

        setLastRefreshTime(Date.now());
        setIsRefreshing(false);
        event.detail.complete();
        triggerHapticFeedback('light');
    };

    // Auto-collapse cards after 10 seconds of inactivity
    useEffect(() => {
        const timer = setTimeout(() => {
            setExpandedCards({ stats: false, resources: false, event: false });
        }, 10000);

        return () => clearTimeout(timer);
    }, [expandedCards]);

    if (!profile || !profile.estatisticas) {
        return (
             <div className="flex h-full flex-col items-center justify-center p-8 gap-6 bg-background">
                <Skeleton className="w-20 h-20 rounded-full bg-blue-900/20" />
                <div className="text-center space-y-2">
                    <Skeleton className="h-6 w-48 mx-auto bg-blue-900/20" />
                </div>
            </div>
        );
    }

    const xpPercentage = (profile.xp / profile.xp_para_proximo_nivel) * 100;
    const maxHP = Math.floor(profile.estatisticas.constituicao / 5) * 100;
    const hpPercentage = ((profile.hp_atual || maxHP) / maxHP) * 100;

    return (
        <IonPage>
            <IonHeader className="ion-no-border" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                <IonToolbar className="bg-background/95 backdrop-blur-xl border-b border-border/10 min-h-[56px]" style={{ '--background': 'var(--background)' }}>
                    <IonButtons slot="start">
                        <IonMenuButton className="text-foreground" />
                    </IonButtons>

                    {/* Dynamic Title with Status */}
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <IonTitle className="font-cinzel text-foreground text-sm tracking-wider">
                            SYSTEM LIFE
                        </IonTitle>
                        <div className="flex items-center gap-1 mt-0.5">
                            <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[9px] font-mono text-green-400 uppercase tracking-widest">
                                {isRefreshing ? 'SYNCING...' : 'ONLINE'}
                            </span>
                        </div>
                    </div>

                    <IonButtons slot="end">
                        <IonButton className="text-foreground relative" onClick={() => triggerHapticFeedback('light')}>
                            <IonIcon icon={notifications} />
                            {/* Notification Badge */}
                            <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full border border-background" />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>

                {/* Native-style status bar overlay */}
                <div className="absolute top-0 left-0 right-0 h-[env(safe-area-inset-top)] bg-background/80 backdrop-blur-xl pointer-events-none" />
            </IonHeader>

            <IonContent
                fullscreen
                className="ion-padding"
                scrollY={true}
                style={{
                    '--padding-top': '16px',
                    '--padding-bottom': '120px', // Safe area for tab bar
                    '--padding-start': '16px',
                    '--padding-end': '16px'
                }}
            >
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent
                        pullingText="Puxe para atualizar..."
                        refreshingText="Sincronizando dados..."
                        refreshingSpinner="crescent"
                    />
                </IonRefresher>

                <div className="flex flex-col gap-4 pb-safe animate-fade-in">
                    
                    {/* 1. Status Section (Native Card Style) */}
                    <IonCard className="mx-0 my-2 bg-black/40 backdrop-blur-md border border-blue-900/30 rounded-xl overflow-hidden ion-activatable ripple-parent">
                        <IonCardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <IonCardTitle className="text-sm font-cinzel text-white flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-blue-400" />
                                    STATUS DO SISTEMA
                                </IonCardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleCardExpansion('stats')}
                                    className="h-6 w-6 p-0 text-blue-400 hover:text-white"
                                >
                                    {expandedCards.stats ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                            </div>
                        </IonCardHeader>

                        <IonCardContent className="pt-0">
                            <div className="flex gap-3">
                                {/* Avatar Card */}
                                <div className="w-[100px] bg-black/20 rounded-lg border border-blue-900/20 p-2 flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
                                    <Avatar className="w-14 h-14 border-2 border-blue-500/30">
                                        <AvatarImage src={profile.avatar_url} className="object-cover" />
                                        <AvatarFallback className="text-xs font-cinzel">LV</AvatarFallback>
                                    </Avatar>
                                    <div className="mt-2 text-center">
                                        <p className="text-[9px] text-blue-400 font-mono uppercase tracking-wider">LEVEL</p>
                                        <p className="text-lg font-bold text-white font-cinzel leading-none">{profile.nivel}</p>
                                    </div>
                                </div>

                                {/* Compact Bars */}
                                <div className="flex-1 flex flex-col gap-2">
                                    {/* Status Badge */}
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-[9px] border-green-500/30 text-green-400 bg-green-950/20">
                                            <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse mr-1" />
                                            ONLINE
                                        </Badge>
                                        <span className="text-[9px] font-mono text-blue-300 uppercase truncate max-w-[80px]">
                                            {profile.classe || 'NO CLASS'}
                                        </span>
                                    </div>

                                    {/* Progress Bars */}
                                    <div className="space-y-2">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[9px] uppercase font-bold text-red-400">
                                                <span className="flex items-center gap-1">
                                                    <Heart className="h-3 w-3" />
                                                    HP
                                                </span>
                                                <span className="font-mono">{profile.hp_atual || maxHP}/{maxHP}</span>
                                            </div>
                                            <div className="h-2 bg-red-950/50 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-700 ease-out" style={{ width: `${hpPercentage}%` }} />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[9px] uppercase font-bold text-blue-400">
                                                <span className="flex items-center gap-1">
                                                    <TrendingUp className="h-3 w-3" />
                                                    XP
                                                </span>
                                                <span className="font-mono">{Math.floor(xpPercentage)}%</span>
                                            </div>
                                            <div className="h-2 bg-blue-950/50 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-700 ease-out" style={{ width: `${xpPercentage}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Stats */}
                            {expandedCards.stats && (
                                <div className="mt-4 pt-4 border-t border-blue-900/20 space-y-3 animate-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'FORÇA', value: profile.estatisticas.forca, color: 'text-red-400', icon: Sword },
                                            { label: 'INTELIGÊNCIA', value: profile.estatisticas.inteligencia, color: 'text-purple-400', icon: Zap },
                                            { label: 'DESTREZA', value: profile.estatisticas.destreza, color: 'text-green-400', icon: Target },
                                            { label: 'CONSTITUIÇÃO', value: profile.estatisticas.constituicao, color: 'text-orange-400', icon: Shield },
                                            { label: 'SABEDORIA', value: profile.estatisticas.sabedoria, color: 'text-cyan-400', icon: Activity },
                                            { label: 'CARISMA', value: profile.estatisticas.carisma, color: 'text-pink-400', icon: Heart },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-black/20 rounded-lg p-2 border border-white/5">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <stat.icon className={cn("h-3 w-3", stat.color)} />
                                                    <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                                                </div>
                                                <p className={cn("text-sm font-bold font-cinzel", stat.color)}>{stat.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </IonCardContent>
                        <IonRippleEffect />
                    </IonCard>

                    {/* 2. Resources Section (Native Horizontal Scroll) */}
                    <IonCard className="mx-0 my-2 bg-black/40 backdrop-blur-md border border-yellow-900/30 rounded-xl overflow-hidden ion-activatable ripple-parent">
                        <IonCardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <IonCardTitle className="text-sm font-cinzel text-white flex items-center gap-2">
                                    <Coins className="h-4 w-4 text-yellow-400" />
                                    RECURSOS DO SISTEMA
                                </IonCardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleCardExpansion('resources')}
                                    className="h-6 w-6 p-0 text-yellow-400 hover:text-white"
                                >
                                    {expandedCards.resources ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                            </div>
                        </IonCardHeader>

                        <IonCardContent className="pt-0">
                            {/* Horizontal Scroll Container */}
                            <div className="relative overflow-hidden">
                                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 px-1" style={{ scrollBehavior: 'smooth' }}>
                                    {[
                                        { icon: Coins, value: profile.moedas || 0, color: 'text-yellow-400', bg: 'bg-yellow-950/20', border: 'border-yellow-900/30', label: 'Gold' },
                                        { icon: Gem, value: profile.fragmentos || 0, color: 'text-purple-400', bg: 'bg-purple-950/20', border: 'border-purple-900/30', label: 'Fragments' },
                                        { icon: Zap, value: profile.energia || '100%', color: 'text-blue-400', bg: 'bg-blue-950/20', border: 'border-blue-900/30', label: 'Energy' },
                                        { icon: Trophy, value: profile.missoes_concluidas_total || 0, color: 'text-orange-400', bg: 'bg-orange-950/20', border: 'border-orange-900/30', label: 'Missions' }
                                    ].map((res, i) => (
                                        <div key={i} className={cn("min-w-[90px] h-[70px] rounded-lg border flex flex-col items-center justify-center p-2 flex-shrink-0 transition-all duration-200 active:scale-95", res.bg, res.border)}>
                                            <res.icon className={cn("h-5 w-5 mb-1 drop-shadow-[0_0_3px_currentColor]", res.color)} />
                                            <span className="text-sm font-bold text-white font-mono">{res.value}</span>
                                            <span className="text-[8px] text-muted-foreground uppercase tracking-wider">{res.label}</span>
                                        </div>
                                    ))}
                                </div>
                                {/* Native iOS-style scroll indicator */}
                                <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/60 to-transparent pointer-events-none rounded-r-xl" />
                            </div>

                            {/* Expanded Resources Details */}
                            {expandedCards.resources && (
                                <div className="mt-4 pt-4 border-t border-yellow-900/20 animate-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrendingUp className="h-4 w-4 text-green-400" />
                                                <span className="text-xs font-mono text-green-400 uppercase">Última Atividade</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date().toLocaleDateString('pt-BR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Target className="h-4 w-4 text-blue-400" />
                                                <span className="text-xs font-mono text-blue-400 uppercase">Streak Atual</span>
                                            </div>
                                            <p className="text-lg font-bold text-white">{profile.streak_atual || 0} dias</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </IonCardContent>
                        <IonRippleEffect />
                    </IonCard>

                    {/* 3. Active Event Section (Native Card Style) */}
                    <IonCard className="mx-0 my-2 flex-1 bg-black/40 backdrop-blur-md border border-purple-900/30 rounded-xl overflow-hidden ion-activatable ripple-parent">
                        <IonCardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <IonCardTitle className="text-sm font-cinzel text-white flex items-center gap-2">
                                    {activeEvent ? <IonIcon icon={flame} className="h-4 w-4 text-purple-400" /> : <Shield className="h-4 w-4 text-gray-400" />}
                                    {activeEvent ? 'EVENTO ATIVO' : 'STATUS DO MUNDO'}
                                </IonCardTitle>
                                {activeEvent && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleCardExpansion('event')}
                                        className="h-6 w-6 p-0 text-purple-400 hover:text-white"
                                    >
                                        {expandedCards.event ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </Button>
                                )}
                            </div>
                        </IonCardHeader>

                        <IonCardContent className="pt-0 flex-1 flex flex-col">
                            {activeEvent ? (
                                <>
                                    {/* Event Progress Bar */}
                                    <div className="mb-3">
                                        <div className="flex justify-between text-[10px] text-purple-300 mb-2">
                                            <span className="flex items-center gap-1">
                                                <Target className="h-3 w-3" />
                                                PROGRESSO GLOBAL
                                            </span>
                                            <span className="font-mono">{Math.round((activeEvent.progress / activeEvent.goal.target) * 100)}%</span>
                                        </div>
                                        <div className="h-2 bg-purple-950/50 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-purple-600 to-purple-500 transition-all duration-1000 ease-out" style={{ width: `${(activeEvent.progress / activeEvent.goal.target) * 100}%` }} />
                                        </div>
                                    </div>

                                    {/* Event Details */}
                                    <div className="flex-1 flex flex-col justify-center items-center text-center gap-3">
                                        <div className="p-3 bg-purple-500/10 rounded-full">
                                            <Activity className="h-7 w-7 text-purple-400 animate-pulse" />
                                        </div>
                                        <div>
                                            <h3 className="font-cinzel text-white text-base leading-tight mb-2">{activeEvent.name}</h3>
                                            <p className="text-xs text-purple-200/80 line-clamp-3 leading-relaxed">{activeEvent.description}</p>
                                        </div>

                                        {/* User Contribution */}
                                        <div className="w-full bg-black/20 rounded-lg p-2 border border-purple-900/20">
                                            <div className="flex justify-between text-[10px] text-purple-300 mb-1">
                                                <span>SUA CONTRIBUIÇÃO</span>
                                                <span className="font-mono">{userContribution}</span>
                                            </div>
                                            <div className="text-xs text-center text-purple-200/60">
                                                Participe das missões para ajudar a comunidade!
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Event Details */}
                                    {expandedCards.event && (
                                        <div className="mt-4 pt-4 border-t border-purple-900/20 animate-in slide-in-from-bottom-2 duration-300">
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                                                        <span className="text-[9px] font-mono text-purple-300 uppercase">Tipo</span>
                                                        <p className="text-xs text-white font-medium">{activeEvent.type.replace('_', ' ')}</p>
                                                    </div>
                                                    <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                                                        <span className="text-[9px] font-mono text-purple-300 uppercase">Objetivo</span>
                                                        <p className="text-xs text-white font-medium">{activeEvent.goal.target} pts</p>
                                                    </div>
                                                </div>
                                                <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                                                    <span className="text-[9px] font-mono text-purple-300 uppercase">Recompensas</span>
                                                    <div className="flex gap-2 mt-1">
                                                        {activeEvent.rewards?.map((reward: any, i: number) => (
                                                            <Badge key={i} variant="outline" className="text-[8px] border-purple-500/30 text-purple-300">
                                                                {reward.type.replace('_', ' ')}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center opacity-60">
                                    <div className="p-4 bg-gray-500/10 rounded-full mb-3">
                                        <Shield className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-cinzel text-white text-base mb-1">MUNDO EM PAZ</h3>
                                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest text-center px-4">
                                        Nenhum evento ativo no momento. Mantenha suas missões atualizadas!
                                    </p>
                                    <div className="mt-4 text-[10px] text-muted-foreground">
                                        Última atualização: {new Date(lastRefreshTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            )}
                        </IonCardContent>
                        <IonRippleEffect />
                    </IonCard>

                </div>
            </IonContent>
        </IonPage>
    );
};

export const DashboardMobile = memo(DashboardMobileComponent);