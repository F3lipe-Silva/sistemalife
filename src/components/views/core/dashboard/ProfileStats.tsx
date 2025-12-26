import React, { useMemo } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Activity, Star, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ProfileStatsProps {
    profile: any;
    isMobile?: boolean;
}

export const ProfileStats = ({ profile, isMobile = false }: ProfileStatsProps) => {
    const statsData = useMemo(() => [
        { subject: 'FOR', value: profile.estatisticas?.forca || 0, fullMark: 100, label: 'Força' },
        { subject: 'INT', value: profile.estatisticas?.inteligencia || 0, fullMark: 100, label: 'Inteligência' },
        { subject: 'SAB', value: profile.estatisticas?.sabedoria || 0, fullMark: 100, label: 'Sabedoria' },
        { subject: 'CON', value: profile.estatisticas?.constituicao || 0, fullMark: 100, label: 'Constituição' },
        { subject: 'DES', value: profile.estatisticas?.destreza || 0, fullMark: 100, label: 'Destreza' },
        { subject: 'CAR', value: profile.estatisticas?.carisma || 0, fullMark: 100, label: 'Carisma' },
    ], [profile.estatisticas]);

    const dominantStat = useMemo(() => {
        return [...statsData].sort((a, b) => b.value - a.value)[0];
    }, [statsData]);

    if (isMobile) {
        return (
            <div className="space-y-6" role="region" aria-labelledby="stats-heading">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20 shadow-sm">
                            <Activity className="h-5 w-5 text-primary" aria-hidden="true" />
                        </div>
                        <div>
                            <h3
                                id="stats-heading"
                                className="text-base font-bold text-foreground uppercase tracking-wide leading-tight"
                            >
                                Atributos
                            </h3>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5 font-medium">
                                Status de Combate
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 shadow-sm hover:bg-primary/15 transition-colors duration-200">
                        <Star className="h-3.5 w-3.5 text-primary fill-primary" aria-hidden="true" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                            {dominantStat.label} Máx
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div
                        className="relative rounded-3xl bg-card/30 border border-border/10 shadow-inner overflow-hidden h-56 hover:shadow-md transition-shadow duration-300"
                        role="img"
                        aria-label="Gráfico radar dos atributos do personagem"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={statsData}>
                                <PolarGrid stroke="hsl(var(--primary))" opacity={0.15} />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{
                                        fill: 'hsl(var(--muted-foreground))',
                                        fontSize: 10,
                                        fontWeight: '600'
                                    }}
                                />
                                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Status"
                                    dataKey="value"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2.5}
                                    fill="hsl(var(--primary))"
                                    fillOpacity={0.2}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {statsData.map((stat) => (
                            <div
                                key={stat.subject}
                                className="space-y-2 p-4 rounded-2xl bg-card/20 border border-border/10 hover:bg-card/30 transition-all duration-200 hover:shadow-sm active:scale-95"
                                role="group"
                                aria-labelledby={`stat-${stat.subject}`}
                            >
                                <div className="flex justify-between items-end">
                                    <span
                                        id={`stat-${stat.subject}`}
                                        className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                                    >
                                        {stat.label}
                                    </span>
                                    <span className="text-sm font-mono font-bold text-foreground">
                                        {stat.value}
                                    </span>
                                </div>
                                <Progress
                                    value={stat.value}
                                    className="h-2 bg-muted/30 [&>div]:bg-primary/70 rounded-full"
                                    aria-label={`${stat.label}: ${stat.value} de 100`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // DESKTOP VERSION (AS IT WAS BEFORE)
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
                        <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-cinzel text-2xl text-foreground font-bold tracking-wider">SISTEMA DE ATRIBUTOS</h3>
                        <p className="text-sm text-muted-foreground uppercase tracking-[0.2em]">Análise de Potencial de Combate</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 shadow-lg shadow-primary/5">
                    <Star className="h-5 w-5 text-primary fill-primary animate-pulse" />
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">Especialização: {dominantStat.label}</span>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-12 items-center">
                <div className="col-span-3 relative rounded-3xl bg-background/40 backdrop-blur-sm border border-border/30 p-8 h-96 shadow-inner">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={statsData}>
                            <PolarGrid stroke="hsl(var(--primary))" opacity={0.2} />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 'bold' }} />
                            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Status" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fill="hsl(var(--primary))" fillOpacity={0.35} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="col-span-2 space-y-5">
                    {statsData.map((stat) => (
                        <div key={stat.subject} className="space-y-2 group">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] group-hover:text-primary transition-colors">
                                    {stat.label}
                                </span>
                                <span className="text-lg font-mono font-bold text-foreground">
                                    {stat.value}
                                </span>
                            </div>
                            <Progress value={stat.value} className="h-2 bg-secondary/50" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};