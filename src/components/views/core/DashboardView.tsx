"use client";

import { memo, useMemo } from 'react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { WorldEventCard } from './dashboard/WorldEventCard';
import { ProfileHeader } from './dashboard/ProfileHeader';
import { ProfileStats } from './dashboard/ProfileStats';
import { ProfileResources } from './dashboard/ProfileResources';
import { Sparkles, Activity, TrendingUp, Target, Calendar, Award } from 'lucide-react';

// Componente para o Header da Dashboard - Compacto
const DashboardHeader = ({ profile, isMobile }: { profile: any; isMobile: boolean }) => (
    <header className="space-y-3">
        {/* Status Bar Superior - Compacto */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                    <Activity className="h-3 w-3 text-primary animate-pulse" />
                    <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-medium">Sistema</span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">·</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">Comando</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/30 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-muted-foreground">Online</span>
            </div>
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
            <div className={cn("grid gap-2", isMobile ? "grid-cols-2" : "grid-cols-4")}>
                <div className="px-3 py-2 rounded-lg bg-card/40 border border-border/30 backdrop-blur-sm text-center transition-transform active:scale-95 duration-200">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Nv</div>
                    <div className="text-sm font-bold text-primary">{profile?.nivel || 1}</div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-card/40 border border-border/30 backdrop-blur-sm text-center transition-transform active:scale-95 duration-200">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">XP</div>
                    <div className="text-sm font-bold text-green-400">{profile?.xp?.toLocaleString() || 0}</div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-card/40 border border-border/30 backdrop-blur-sm text-center transition-transform active:scale-95 duration-200">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">HP</div>
                    <div className="text-sm font-bold text-red-400">{profile?.hp_atual || 100}</div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-card/40 border border-border/30 backdrop-blur-sm text-center transition-transform active:scale-95 duration-200">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Stk</div>
                    <div className="text-sm font-bold text-blue-400">{profile?.streak_atual || 0}</div>
                </div>
            </div>
        </div>
    </header>
);

// Componente para Ações Rápidas
const QuickActionsPanel = () => (
    <div className="rounded-2xl bg-gradient-to-br from-card/40 to-card/20 backdrop-blur-sm border border-border/30 p-4">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-accent" />
            </div>
            <h3 className="font-cinzel text-lg text-foreground">Centro de Ações</h3>
        </div>

        <div className="grid gap-3">
            <button className="w-full p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border border-primary/30 transition-all hover:scale-[1.02] hover:shadow-lg text-left group">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                        <Target className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                        <div className="font-semibold text-foreground">Nova Missão</div>
                        <div className="text-sm text-muted-foreground">Gere um desafio personalizado</div>
                    </div>
                    <div className="text-primary group-hover:translate-x-1 transition-transform">→</div>
                </div>
            </button>

            <button className="w-full p-3 rounded-xl bg-gradient-to-r from-accent/10 to-accent/5 hover:from-accent/20 hover:to-accent/10 border border-accent/30 transition-all hover:scale-[1.02] hover:shadow-lg text-left group">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                        <TrendingUp className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1">
                        <div className="font-semibold text-foreground">Análise de Progresso</div>
                        <div className="text-sm text-muted-foreground">Veja estatísticas detalhadas</div>
                    </div>
                    <div className="text-accent group-hover:translate-x-1 transition-transform">→</div>
                </div>
            </button>

            <button className="w-full p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-purple-500/5 hover:from-purple-500/20 hover:to-purple-500/10 border border-purple-500/30 transition-all hover:scale-[1.02] hover:shadow-lg text-left group">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                        <Award className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                        <div className="font-semibold text-foreground">Loja de Recompensas</div>
                        <div className="text-sm text-muted-foreground">Troque seus fragmentos</div>
                    </div>
                    <div className="text-purple-400 group-hover:translate-x-1 transition-transform">→</div>
                </div>
            </button>
        </div>
    </div>
);

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
            <div className="flex h-full flex-col items-center justify-center p-8 gap-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center animate-pulse">
                        <Sparkles className="h-10 w-10 text-primary animate-spin" />
                    </div>
                    <div className="absolute -inset-3 bg-primary/10 rounded-3xl blur-2xl animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-lg tracking-[0.3em] text-muted-foreground font-medium animate-pulse">INICIALIZANDO SISTEMA</p>
                    <p className="text-sm text-muted-foreground/60">Carregando dados do jogador...</p>
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

            {/* Main Content Grid - Refatorado */}
            <div className={cn(
                "grid auto-rows-min",
                // Mobile: 1 coluna empilhada
                isMobile ? "grid-cols-1 gap-4" : "gap-6 lg:grid-cols-12"
            )}>
                {/* Perfil e Estatísticas - Área Principal */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Profile Header */}
                    <ProfileHeader profile={profile} isMobile={isMobile} />

                    {/* Stats Section - Destaque principal */}
                    <div className="min-h-[450px] lg:min-h-[550px]">
                        <ProfileStats profile={profile} isMobile={isMobile} />
                    </div>
                </div>

                {/* Sidebar - Recursos, Eventos e Ações */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Resources Grid */}
                    <ProfileResources profile={profile} isMobile={isMobile} />

                    {/* World Event Card */}
                    {activeEvent && (
                        <WorldEventCard event={activeEvent} userContribution={userContribution} isMobile={isMobile} />
                    )}

                    {/* Quick Actions Panel */}
                    <QuickActionsPanel />

                    {/* Espaço para widgets adicionais futuros */}
                    <div className="hidden lg:block">
                        {/* Placeholder para futuras expansões */}
                    </div>
                </div>
            </div>
        </section>
    );
};

export const DashboardView = memo(DashboardViewComponent);
