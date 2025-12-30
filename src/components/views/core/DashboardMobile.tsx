"use client";

import React, { memo, useMemo } from 'react';
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
  IonAvatar
} from '@ionic/react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { notifications, personCircle } from 'ionicons/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Bell, Zap, Trophy, Coins, Gem, Heart, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DashboardMobileComponent = () => {
    const { profile, worldEvents } = usePlayerDataContext();

    const activeEvent = useMemo(() => {
        return (worldEvents || []).find((e: any) => e.isActive);
    }, [worldEvents]);

    const userContribution = useMemo(() => {
        if (!profile?.event_contribution || !activeEvent) return 0;
        return profile.event_contribution.eventId === activeEvent.id ? profile.event_contribution.contribution : 0;
    }, [profile, activeEvent]);

    const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
        setTimeout(() => {
            event.detail.complete();
        }, 2000);
    };

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
            <IonHeader className="ion-no-border">
                <IonToolbar className="bg-background/80 backdrop-blur-md border-b border-border/20 [--background:transparent]">
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle className="font-cinzel text-foreground text-sm">SYSTEM LIFE</IonTitle>
                    <IonButtons slot="end">
                         <IonButton className="text-foreground">
                            <IonIcon icon={notifications} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="ion-padding" scrollY={false}>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent></IonRefresherContent>
                </IonRefresher>

                <div className="h-full flex flex-col gap-3 pb-20">
                    
                    {/* 1. Status Section (Compact) */}
                    <div className="flex gap-3 h-[140px] shrink-0">
                        {/* Avatar Card */}
                        <div className="w-[110px] bg-black/40 rounded-xl border border-blue-900/30 p-2 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md">
                            <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
                            <Avatar className="w-16 h-16 border-2 border-blue-500/30">
                                <AvatarImage src={profile.avatar_url} className="object-cover" />
                                <AvatarFallback>PL</AvatarFallback>
                            </Avatar>
                            <div className="mt-2 text-center">
                                <p className="text-[10px] text-blue-400 font-mono uppercase tracking-wider">LEVEL</p>
                                <p className="text-xl font-bold text-white font-cinzel leading-none">{profile.nivel}</p>
                            </div>
                        </div>

                        {/* Bars & Info */}
                        <div className="flex-1 flex flex-col gap-2">
                            {/* System Alert Compact */}
                            <div className="h-8 bg-blue-950/30 rounded-lg flex items-center justify-between px-3 border border-blue-900/30">
                                <div className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]" />
                                    <span className="font-mono text-[10px] text-green-400 tracking-wider">ONLINE</span>
                                </div>
                                <span className="font-mono text-[10px] text-blue-300 uppercase tracking-widest truncate max-w-[100px]">
                                    {profile.classe || 'NO CLASS'}
                                </span>
                            </div>

                            {/* Bars */}
                            <div className="flex-1 bg-black/40 rounded-xl border border-blue-900/30 p-3 flex flex-col justify-center gap-3 backdrop-blur-md">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] uppercase font-bold text-red-400">
                                        <span>HP</span>
                                        <span>{profile.hp_atual}/{maxHP}</span>
                                    </div>
                                    <div className="h-1.5 bg-red-950/50 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${hpPercentage}%` }} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] uppercase font-bold text-blue-400">
                                        <span>XP</span>
                                        <span>{Math.floor(xpPercentage)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-blue-950/50 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${xpPercentage}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Resources (Horizontal Scroll) */}
                    <div className="h-[90px] shrink-0 bg-black/40 rounded-xl border border-yellow-900/30 p-2 overflow-x-auto flex gap-2 items-center backdrop-blur-md scrollbar-hide">
                        {[
                            { icon: Coins, value: profile.moedas, color: 'text-yellow-400', label: 'Gold' },
                            { icon: Gem, value: profile.fragmentos, color: 'text-purple-400', label: 'Fragments' },
                            { icon: Zap, value: profile.energia || '100%', color: 'text-blue-400', label: 'Energy' },
                            { icon: Trophy, value: profile.missoes_concluidas_total || 0, color: 'text-orange-400', label: 'Missions' }
                        ].map((res, i) => (
                            <div key={i} className="min-w-[100px] h-full bg-black/20 rounded-lg border border-white/5 flex flex-col items-center justify-center p-2">
                                <res.icon className={cn("h-4 w-4 mb-1", res.color)} />
                                <span className="text-sm font-bold text-white">{res.value}</span>
                                <span className="text-[9px] text-muted-foreground uppercase">{res.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* 3. Active Event (Compact or Placeholder) */}
                    <div className="flex-1 min-h-0 bg-black/40 rounded-xl border border-purple-900/30 relative overflow-hidden backdrop-blur-md flex flex-col">
                        {activeEvent ? (
                            <>
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-red-500" />
                                <div className="p-3 flex-1 flex flex-col justify-center items-center text-center gap-2">
                                    <div className="p-2 bg-purple-500/10 rounded-full mb-1">
                                        <Activity className="h-6 w-6 text-purple-400 animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="font-cinzel text-white text-lg leading-tight mb-1">EVENTO MUNDIAL</h3>
                                        <p className="text-xs text-purple-200/70 line-clamp-2 px-4">{activeEvent.description}</p>
                                    </div>
                                    <div className="w-full max-w-[200px] mt-2">
                                        <div className="flex justify-between text-[10px] text-purple-300 mb-1">
                                            <span>PROGRESSO</span>
                                            <span>{Math.round((activeEvent.progress / activeEvent.goal.target) * 100)}%</span>
                                        </div>
                                        <div className="h-1 bg-purple-950 rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500" style={{ width: `${(activeEvent.progress / activeEvent.goal.target) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-50">
                                <Shield className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">NO ACTIVE THREATS</p>
                            </div>
                        )}
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export const DashboardMobile = memo(DashboardMobileComponent);