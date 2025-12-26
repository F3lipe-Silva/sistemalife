import React, { useMemo } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { Activity, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatItem } from './StatItem';
import { Progress } from '@/components/ui/progress';

interface ProfileStatsProps {
    profile: any;
    isMobile?: boolean;
}

export const ProfileStats = ({ profile, isMobile = false }: ProfileStatsProps) => {
    const statsData = useMemo(() => [
        { subject: 'FOR', value: profile.estatisticas.forca, fullMark: 100, label: 'Força' },
        { subject: 'INT', value: profile.estatisticas.inteligencia, fullMark: 100, label: 'Inteligência' },
        { subject: 'SAB', value: profile.estatisticas.sabedoria, fullMark: 100, label: 'Sabedoria' },
        { subject: 'CON', value: profile.estatisticas.constituicao, fullMark: 100, label: 'Constituição' },
        { subject: 'DES', value: profile.estatisticas.destreza, fullMark: 100, label: 'Destreza' },
        { subject: 'CAR', value: profile.estatisticas.carisma, fullMark: 100, label: 'Carisma' },
    ], [profile.estatisticas]);

    const dominantStat = useMemo(() => {
        return [...statsData].sort((a, b) => b.value - a.value)[0];
    }, [statsData]);

    return (
        <div className="space-y-8">
            {/* Header: Stat Highlight */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="font-cinzel text-xl text-foreground font-bold tracking-wider flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        CAPACIDADES
                    </h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Análise de Potencial</p>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
                    <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase">Foco: {dominantStat.label}</span>
                </div>
            </div>

            {/* Optimized Radar and Compact Stats Layout */}
            <div className={cn(
                "grid gap-8 items-center",
                isMobile ? "grid-cols-1" : "lg:grid-cols-5"
            )}>
                {/* Visual Radar - 3/5 width on desktop */}
                <div className={cn(
                    "relative rounded-3xl bg-background/20 backdrop-blur-sm border border-border/20 overflow-hidden",
                    isMobile ? "h-64" : "lg:col-span-3 h-80"
                )}>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={statsData}>
                            <PolarGrid stroke="hsl(var(--border))" opacity={0.2} />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 'bold' }}
                            />
                            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Status"
                                dataKey="value"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                fill="hsl(var(--primary))"
                                fillOpacity={0.3}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Stats List - 2/5 width on desktop */}
                <div className={cn(
                    "grid gap-3",
                    isMobile ? "grid-cols-2" : "lg:col-span-2 grid-cols-1"
                )}>
                    {statsData.map((stat) => (
                        <div key={stat.subject} className="space-y-1.5 group">
                            <div className="flex justify-between items-end px-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">
                                    {stat.label}
                                </span>
                                <span className="text-sm font-mono font-bold text-foreground">
                                    {stat.value}
                                </span>
                            </div>
                            <Progress value={stat.value} className="h-1.5 bg-secondary/40" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};