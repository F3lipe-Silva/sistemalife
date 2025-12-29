"use client";

import { memo, useMemo, useState } from 'react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { WorldEventCard } from './dashboard/WorldEventCard';
import { ProfileHeader } from './dashboard/ProfileHeader';
import { ProfileStats } from './dashboard/ProfileStats';
import { ProfileResources } from './dashboard/ProfileResources';
import { Sparkles, Activity, Eye, EyeOff, Target, Users, Zap, Heart, Shield, Crown, Flame, Gem, KeySquare, User } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Componente para o Header da Dashboard - Compacto
const DashboardHeader = ({ profile, isMobile }: { profile: any; isMobile: boolean }) => (
    <header className="space-y-4">
        {/* Status Bar Superior - Compacto */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1.5 bg-primary/10 border-primary/20 backdrop-blur-sm">
                    <Activity className="h-3 w-3 text-primary animate-pulse" />
                    <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-medium">Sistema</span>
                </Badge>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 hidden sm:inline-block">·</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 hidden sm:inline-block">Comando</span>
            </div>

            <Badge variant="secondary" className="gap-1.5 bg-secondary/50 border-border/30 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-muted-foreground">Online</span>
            </Badge>
        </div>

        {/* Título e Métricas - Mais Compacto */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
                <h1 className="font-cinzel text-2xl sm:text-3xl tracking-[0.15em] text-gradient font-bold">
                    Centro de Comando
                </h1>
                <p className="text-sm text-muted-foreground/70">
                    Monitore sua jornada RPG
                </p>
            </div>

            {/* Métricas Principais - Grid Compacto */}
            <div className="grid grid-cols-4 gap-2">
                <Card className="bg-card/40 border-border/30 backdrop-blur-sm">
                    <CardContent className="p-2 sm:p-3 text-center">
                        <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Nv</div>
                        <div className="text-sm sm:text-base font-bold text-primary">{profile?.nivel || 1}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border/30 backdrop-blur-sm">
                    <CardContent className="p-2 sm:p-3 text-center">
                        <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">XP</div>
                        <div className="text-sm sm:text-base font-bold text-green-400">{profile?.xp?.toLocaleString() || 0}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border/30 backdrop-blur-sm">
                    <CardContent className="p-2 sm:p-3 text-center">
                        <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">HP</div>
                        <div className="text-sm sm:text-base font-bold text-red-400">{profile?.hp_atual || 100}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card/40 border-border/30 backdrop-blur-sm">
                    <CardContent className="p-2 sm:p-3 text-center">
                        <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Stk</div>
                        <div className="text-sm sm:text-base font-bold text-blue-400">{profile?.streak_atual || 0}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </header>
);



// Componente para Recursos em Cards
const ResourcesWidget = ({ profile, isMobile }: { profile: any; isMobile: boolean }) => {
    const resources = [
        { label: 'Nome Completo', value: `${profile.primeiro_nome} ${profile.apelido}`, icon: User, color: 'text-blue-400' },
        { label: 'Sequência Atual', value: `${profile.streak_atual || 0} dias`, icon: Flame, color: 'text-orange-400' },
        { label: 'Fragmentos', value: profile.fragmentos || 0, icon: Gem, color: 'text-yellow-400' },
        { label: 'Cristais Dungeon', value: profile.dungeon_crystals || 0, icon: KeySquare, color: 'text-purple-400' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {resources.map((resource, index) => (
                    <Card key={resource.label} className="bg-gradient-to-br from-card/40 to-card/20 backdrop-blur-sm border-border/30 hover:scale-[1.02] transition-transform">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ${resource.color}`}>
                                <resource.icon className={`h-6 w-6 ${resource.color}`} />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">{resource.label}</div>
                                <div className="text-lg font-bold text-foreground">{resource.value}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};


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
                    <Skeleton className="w-20 h-20 rounded-3xl bg-primary/20" />
                    <Sparkles className="absolute inset-0 m-auto h-10 w-10 text-primary animate-spin" />
                    <div className="absolute -inset-3 bg-primary/10 rounded-3xl blur-2xl animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                    <Skeleton className="h-6 w-48 mx-auto bg-muted/20" />
                    <Skeleton className="h-4 w-32 mx-auto bg-muted/20" />
                </div>
            </div>
        );
    }

    return (
        <section
            className={cn(
                'relative flex h-full flex-col gap-6 font-sans text-white animate-fade-in',
                isMobile ? 'pb-32' : ''
            )}
        >
            {/* Header */}
            <DashboardHeader profile={profile} isMobile={isMobile} />

                        {/* Main Content - Organizado em seções individuais */}

                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

                            {/* Visão Geral */}

                            <Card className="bg-card/50 backdrop-blur-sm border-border/30 lg:col-span-2">

                                <CardHeader className="pb-2">

                                    <div className="flex items-center justify-between">

                                        <CardTitle className="font-cinzel text-lg text-foreground">Visão Geral</CardTitle>

                                        <Button

                                            variant="ghost"

                                            size="sm"

                                            onClick={() => setVisibleSections(prev => ({ ...prev, overview: !prev.overview }))}

                                            className="h-8 w-8 p-0"

                                        >

                                            {visibleSections.overview ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}

                                        </Button>

                                    </div>

                                </CardHeader>

                                <CardContent>

                                    {visibleSections.overview && (

                                        <div className="space-y-6">

                                            <ProfileHeader profile={profile} isMobile={isMobile} />

                                        </div>

                                    )}

                                </CardContent>

                            </Card>

            

                            {/* Recursos */}

                            <Card className="bg-card/50 backdrop-blur-sm border-border/30">

                                <CardHeader className="pb-2">

                                    <div className="flex items-center justify-between">

                                        <CardTitle className="font-cinzel text-lg text-foreground">Recursos</CardTitle>

                                        <Button

                                            variant="ghost"

                                            size="sm"

                                            onClick={() => setVisibleSections(prev => ({ ...prev, resources: !prev.resources }))}

                                            className="h-8 w-8 p-0"

                                        >

                                            {visibleSections.resources ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}

                                        </Button>

                                    </div>

                                </CardHeader>

                                <CardContent>

                                    {visibleSections.resources && (

                                        <div className="space-y-6">

                                            <ResourcesWidget profile={profile} isMobile={isMobile} />

                                        </div>

                                    )}

                                </CardContent>

                            </Card>

            

            

                            {/* World Event Card */}

                            {activeEvent && (

                                <Card className="bg-card/50 backdrop-blur-sm border-border/30 lg:col-span-2 xl:col-span-1">

                                    <CardHeader className="pb-2">

                                        <div className="flex items-center justify-between">

                                            <CardTitle className="font-cinzel text-lg text-foreground">Evento Mundial Ativo</CardTitle>

                                            <Button

                                                variant="ghost"

                                                size="sm"

                                                onClick={() => setVisibleSections(prev => ({ ...prev, events: !prev.events }))}

                                                className="h-8 w-8 p-0"

                                            >

                                                {visibleSections.events ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}

                                            </Button>

                                        </div>

                                    </CardHeader>

                                    <CardContent>

                                        {visibleSections.events && (

                                            <div className="space-y-6">

                                                <WorldEventCard event={activeEvent} userContribution={userContribution} isMobile={isMobile} />

                                            </div>

                                        )}

                                    </CardContent>

                                </Card>

                            )}

                        </div>
        </section>
    );
};

export const DashboardView = memo(DashboardViewComponent);