"use client";

import { memo, useMemo, useState } from 'react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { WorldEventCard } from './dashboard/WorldEventCard';
import { ProfileHeader } from './dashboard/ProfileHeader';
import { ProfileResources } from './dashboard/ProfileResources';
import { Activity, Eye, EyeOff, Bell, User, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Componente para o Header da Dashboard - Estilo "System Notification"
const DashboardHeader = ({ profile, isMobile }: { profile: any; isMobile: boolean }) => (
    <header className="space-y-2 mb-6">
         {/* System Alert Bar */}
         <div className="flex items-center justify-between bg-primary/30 border-y border-primary/50 py-2 px-4 backdrop-blur-sm">
             <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-primary animate-pulse" />
                <span className="font-mono text-xs text-primary/70 uppercase tracking-widest">
                    SYSTEM NOTIFICATIONS: <span className="text-foreground">NO NEW ALERTS</span>
                </span>
             </div>
             <div className="flex items-center gap-2">
                 <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]" />
                 <span className="font-mono text-xs text-green-400 tracking-wider">ONLINE</span>
             </div>
         </div>

         {/* Welcome Message */}
         <div className="px-2">
             <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-foreground tracking-wider drop-shadow-[0_0_10px_var(--primary-shadow)]">
                 BEM-VINDO, <span className="text-primary">{profile?.primeiro_nome?.toUpperCase() || 'JOGADOR'}</span>
             </h1>
             <p className="text-primary/60 font-mono text-sm tracking-wide mt-1">
                 PAINEL DE CONTROLE DO SISTEMA INICIADO.
             </p>
         </div>
    </header>
);

const DashboardViewComponent = () => {
    const { profile, worldEvents } = usePlayerDataContext();
    const isMobile = useIsMobile();
    const [visibleSections, setVisibleSections] = useState({
        overview: true,
        resources: true,
        events: true
    });

    const activeEvent = useMemo(() => {
        return (worldEvents || []).find((e: any) => e.isActive);
    }, [worldEvents]);

    const userContribution = useMemo(() => {
        if (!profile?.event_contribution || !activeEvent) return 0;
        return profile.event_contribution.eventId === activeEvent.id ? profile.event_contribution.contribution : 0;
    }, [profile, activeEvent]);

    if (!profile || !profile.estatisticas) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-8 gap-6">
                <div className="relative">
                    <Skeleton className="w-20 h-20 rounded-full bg-primary/20" />
                    <Activity className="absolute inset-0 m-auto h-10 w-10 text-primary animate-spin" />
                </div>
                <div className="text-center space-y-2">
                    <Skeleton className="h-6 w-48 mx-auto bg-primary/20" />
                    <div className="text-primary/50 font-mono text-sm animate-pulse">LOADING SYSTEM DATA...</div>
                </div>
            </div>
        );
    }

    return (
        <section
            className={cn(
                'relative flex h-full flex-col gap-4 font-sans text-foreground animate-fade-in',
                isMobile ? 'pb-32' : ''
            )}
        >
            {/* Background Grid Effect */}
            <div className="fixed inset-0 pointer-events-none z-[-1] opacity-10 bg-[linear-gradient(rgb(var(--background-rgb))_1px,transparent_1px),linear-gradient(90deg,rgb(var(--background-rgb))_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

            <DashboardHeader profile={profile} isMobile={isMobile} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                
                {/* Profile Overview - Spans 2 cols on Large */}
                <div className="lg:col-span-2 space-y-4">
                     <div className="flex items-center justify-between px-2 border-b border-primary/30 pb-2 mb-2">
                        <h3 className="font-mono text-sm text-primary font-bold uppercase tracking-widest flex items-center gap-2">
                            <User className="h-4 w-4" /> STATUS DO JOGADOR
                        </h3>
                     </div>
                     <ProfileHeader profile={profile} isMobile={isMobile} />
                </div>

                {/* Resources Panel */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2 border-b border-yellow-500/30 pb-2 mb-2">
                        <h3 className="font-mono text-sm text-yellow-500/80 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Zap className="h-4 w-4" /> RECURSOS
                        </h3>
                         <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setVisibleSections(prev => ({ ...prev, resources: !prev.resources }))}
                            className="h-6 w-6 p-0 text-yellow-500/50 hover:text-yellow-400"
                        >
                            {visibleSections.resources ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        </Button>
                    </div>
                    {visibleSections.resources && (
                         <div className="bg-black/40 backdrop-blur-md border border-yellow-900/30 p-4 rounded-sm relative group">
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-yellow-500/50" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-yellow-500/50" />
                            <ProfileResources profile={profile} isMobile={isMobile} />
                        </div>
                    )}
                </div>

                {/* Active Events - Spans full width on mobile/small, 1 col on large */}
                {activeEvent && visibleSections.events && (
                     <div className="lg:col-span-2 xl:col-span-1 space-y-4">
                        <div className="flex items-center justify-between px-2 border-b border-red-500/30 pb-2 mb-2">
                            <h3 className="font-mono text-sm text-red-400 font-bold uppercase tracking-widest flex items-center gap-2 animate-pulse">
                                <Activity className="h-4 w-4" /> URGENT QUEST
                            </h3>
                        </div>
                        <WorldEventCard event={activeEvent} userContribution={userContribution} isMobile={isMobile} />
                    </div>
                )}
            </div>
        </section>
    );
};

export const DashboardView = memo(DashboardViewComponent);