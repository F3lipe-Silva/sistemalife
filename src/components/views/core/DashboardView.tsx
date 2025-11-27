"use client";

import { memo, useMemo } from 'react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { WorldEventCard } from './dashboard/WorldEventCard';
import { ProfileHeader } from './dashboard/ProfileHeader';
import { ProfileStats } from './dashboard/ProfileStats';
import { ProfileResources } from './dashboard/ProfileResources';

const DashboardViewComponent = () => {
    const { profile, worldEvents } = usePlayerDataContext();
    const isMobile = useIsMobile();

    const activeEvent = useMemo(() => {
        return (worldEvents || []).find((e: any) => e.isActive);
    }, [worldEvents]);

    const userContribution = useMemo(() => {
        if (!profile?.event_contribution || !activeEvent) return 0;
        return profile.event_contribution.eventId === activeEvent.id ? profile.event_contribution.contribution : 0;
    }, [profile, activeEvent]);

    if (!profile || !profile.estatisticas) {
        return (
            <div className="p-6 h-full flex items-center justify-center">
                <p className="text-primary text-lg">A carregar dados do Sistema...</p>
            </div>
        );
    }

    return (
        <div className={cn("p-4 h-full font-sans animate-in fade-in-50 slide-in-from-bottom-4 duration-700", isMobile ? "p-3 pb-40" : "md:p-4")}>
            <div className={cn("flex items-center mb-3 gap-2", isMobile ? "flex-row" : "sm:flex-row justify-between items-start mb-4 gap-2")}>
                <h1 className={cn("font-cinzel font-bold text-primary tracking-wider", isMobile ? "text-xl" : "text-3xl")}>STATUS</h1>
            </div>

            <div className={cn("bg-gradient-to-br from-card/80 to-card/40 border border-border/80 rounded-lg space-y-3 backdrop-blur-sm shadow-xl", isMobile ? "p-3" : "p-3 md:p-4")}>

                <ProfileHeader profile={profile} isMobile={isMobile} />

                <ProfileResources profile={profile} isMobile={isMobile} />

                <WorldEventCard event={activeEvent} userContribution={userContribution} isMobile={isMobile} />

                <hr className="border-border/50" />

                <ProfileStats profile={profile} isMobile={isMobile} />

            </div>
        </div>
    );
};

export const DashboardView = memo(DashboardViewComponent);
