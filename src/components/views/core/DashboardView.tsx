"use client";

import { memo, useRef, useState } from 'react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ProfileHeader } from './dashboard/ProfileHeader';
import { ProfileStats } from './dashboard/ProfileStats';
import { Sparkles, Timer, ChevronLeft, ChevronRight } from 'lucide-react';

const DashboardViewComponent = () => {
    const { profile } = usePlayerDataContext();
    const isMobile = useIsMobile();
    const [currentSection, setCurrentSection] = useState(0);
    const touchStartRef = useRef<{ x: number, y: number } | null>(null);
    const touchEndRef = useRef<{ x: number, y: number } | null>(null);
    const minSwipeDistance = 50;

    const sections = [
        { id: 'profile', label: 'Perfil' },
        { id: 'stats', label: 'Atributos' }
    ];

    const onTouchStart = (e: React.TouchEvent) => {
        touchEndRef.current = null;
        touchStartRef.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
    };

    const onTouchMove = (e: React.TouchEvent) => {
        touchEndRef.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
    };

    const onTouchEnd = () => {
        if (!touchStartRef.current || !touchEndRef.current) return;

        const distanceX = touchStartRef.current.x - touchEndRef.current.x;
        const distanceY = touchStartRef.current.y - touchEndRef.current.y;

        if (Math.abs(distanceX) > Math.abs(distanceY) && Math.abs(distanceX) > minSwipeDistance) {
            if (distanceX > 0 && currentSection < sections.length - 1) {
                // Swipe left - next section
                setCurrentSection(prev => prev + 1);
            } else if (distanceX < 0 && currentSection > 0) {
                // Swipe right - previous section
                setCurrentSection(prev => prev - 1);
            }
        }

        touchStartRef.current = null;
        touchEndRef.current = null;
    };

    const navigateSection = (direction: 'prev' | 'next') => {
        if (direction === 'prev' && currentSection > 0) {
            setCurrentSection(prev => prev - 1);
        } else if (direction === 'next' && currentSection < sections.length - 1) {
            setCurrentSection(prev => prev + 1);
        }
    };

    if (!profile || !profile.estatisticas) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-8 gap-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center animate-pulse">
                        <Sparkles className="h-10 w-10 text-primary animate-spin" />
                    </div>
                </div>
                <p className="text-lg tracking-[0.3em] text-muted-foreground font-medium animate-pulse uppercase">Sincronizando...</p>
            </div>
        );
    }

    if (isMobile) {
        return (
            <section
                className="relative flex flex-col font-sans text-foreground animate-fade-in gap-6 pb-24 pt-2 px-4"
                role="main"
                aria-labelledby="dashboard-title"
            >
                {/* Enhanced Command Header with Better Accessibility */}
                <header className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1
                            id="dashboard-title"
                            className="font-cinzel text-xl font-bold text-foreground tracking-tight leading-tight"
                        >
                            Centro de Comando
                        </h1>
                        <div className="flex items-center gap-2">
                            <div
                                className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
                                aria-hidden="true"
                            />
                            <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                                Sistema Ativo
                            </p>
                        </div>
                    </div>
                    <div
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/20 shadow-md3-2 hover:shadow-md3-3 active:shadow-md3-1 transition-all duration-200 active:scale-95"
                        role="status"
                        aria-label={`Sequência atual: ${profile?.streak_atual || 0} dias`}
                    >
                        <Timer className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-sm font-mono font-semibold text-foreground">
                            {profile?.streak_atual || 0}D
                        </span>
                    </div>
                </header>

                {/* Navigation Controls for Mobile */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigateSection('prev')}
                        disabled={currentSection === 0}
                        className={cn(
                            "p-2 rounded-full transition-all duration-200",
                            currentSection === 0
                                ? "opacity-30 cursor-not-allowed"
                                : "bg-card/50 hover:bg-card/70 active:scale-95 shadow-sm"
                        )}
                        aria-label="Seção anterior"
                    >
                        <ChevronLeft className="h-5 w-5 text-foreground" />
                    </button>

                    <div className="flex items-center gap-2">
                        {sections.map((section, index) => (
                            <button
                                key={section.id}
                                onClick={() => setCurrentSection(index)}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all duration-200",
                                    currentSection === index
                                        ? "bg-primary scale-125"
                                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                                )}
                                aria-label={`Ir para ${section.label}`}
                                aria-current={currentSection === index ? 'true' : 'false'}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => navigateSection('next')}
                        disabled={currentSection === sections.length - 1}
                        className={cn(
                            "p-2 rounded-full transition-all duration-200",
                            currentSection === sections.length - 1
                                ? "opacity-30 cursor-not-allowed"
                                : "bg-card/50 hover:bg-card/70 active:scale-95 shadow-sm"
                        )}
                        aria-label="Próxima seção"
                    >
                        <ChevronRight className="h-5 w-5 text-foreground" />
                    </button>
                </div>

                {/* Swipeable Content Container */}
                <div
                    className="relative overflow-hidden flex-1"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    style={{
                        transform: `translateX(-${currentSection * 100}%)`,
                        transition: 'transform 0.3s ease-out'
                    }}
                >
                    {/* Profile Section */}
                    <div className="absolute inset-0 w-full flex-shrink-0 pr-4">
                        <div
                            className="animate-in fade-in slide-in-from-bottom-2 duration-500 focus-within:ring-2 focus-within:ring-primary/50 focus-within:ring-offset-2 rounded-3xl"
                            tabIndex={-1}
                        >
                            <ProfileHeader profile={profile} isMobile={true} />
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="absolute inset-0 w-full flex-shrink-0 pl-4">
                        <div
                            className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 focus-within:ring-2 focus-within:ring-primary/50 focus-within:ring-offset-2 rounded-3xl"
                            tabIndex={-1}
                        >
                            <div className="relative overflow-hidden bg-card/60 backdrop-blur-xl border border-border/10 rounded-3xl shadow-md3-2 hover:shadow-md3-3 transition-shadow duration-300">
                                <div
                                    className="absolute top-0 right-0 w-40 h-40 bg-primary/8 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"
                                    aria-hidden="true"
                                />
                                <div className="relative p-6">
                                    <ProfileStats profile={profile} isMobile={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // DESKTOP VERSION (RESTORING ORIGINAL LAYOUT STYLE)
    return (
        <section className="relative flex h-full flex-col font-sans text-white animate-fade-in gap-8 pb-8 pt-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-cinzel text-3xl font-bold text-gradient tracking-[0.1em]">CENTRO DE COMANDO</h1>
                    <p className="text-xs text-muted-foreground uppercase tracking-[0.3em] mt-1">Status de Sincronização: Operacional</p>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-secondary/30 border border-border/30 backdrop-blur-sm shadow-xl">
                    <Timer className="h-5 w-5 text-cyan-400" />
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none mb-1">Sequência Atual</p>
                        <p className="text-lg font-bold font-mono text-cyan-400 leading-none">{profile?.streak_atual || 0} DIAS</p>
                    </div>
                </div>
            </div>

            <ProfileHeader profile={profile} isMobile={false} />

            <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-card/30 border border-border/30 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
                    <ProfileStats profile={profile} isMobile={false} />
                </div>
            </div>
        </section>
    );
};

export const DashboardView = memo(DashboardViewComponent);
