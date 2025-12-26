"use client";

import { memo } from 'react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ProfileHeader } from './dashboard/ProfileHeader';
import { ProfileStats } from './dashboard/ProfileStats';
import { Sparkles, Timer } from 'lucide-react';

const DashboardViewComponent = () => {
    const { profile } = usePlayerDataContext();
    const isMobile = useIsMobile();

    if (!profile || !profile.estatisticas) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-8 gap-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center animate-pulse">
                        <Sparkles className="h-10 w-10 text-primary animate-spin" />
                    </div>
                </div>
                <p className="text-lg tracking-[0.3em] text-muted-foreground font-medium animate-pulse">Sincronizando Sistema...</p>
            </div>
        );
    }

    return (
        <section className={cn(
            'relative flex h-full flex-col font-sans text-white animate-fade-in gap-6',
            isMobile ? 'pb-24 pt-2' : 'pb-8'
        )}>
            {/* Minimal Command Header */}
            <div className="flex items-center justify-between px-1">
                <div>
                    <h1 className="font-cinzel text-2xl font-bold text-gradient tracking-tight">Centro de Comando</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">Sincronização Ativa</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-secondary/30 border border-border/20 backdrop-blur-sm shadow-inner">
                    <Timer className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-xs font-bold font-mono text-cyan-400">{profile?.streak_atual || 0} DIAS</span>
                </div>
            </div>

            {/* Profile Identity Card */}
            <ProfileHeader profile={profile} isMobile={isMobile} />

            {/* Attributes Optimization - Integrated Layout */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                <div className="relative overflow-hidden bg-gradient-to-b from-card/40 to-background border border-border/30 rounded-[32px] p-6 shadow-2xl">
                    {/* Background Visual Element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                    
                    <ProfileStats profile={profile} isMobile={isMobile} />
                </div>
            </div>
        </section>
    );
};

export const DashboardView = memo(DashboardViewComponent);
