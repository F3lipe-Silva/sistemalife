import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatItem } from './StatItem';

interface ProfileStatsProps {
    profile: any;
    isMobile?: boolean;
}

export const ProfileStats = ({ profile, isMobile = false }: ProfileStatsProps) => {
    const statsData = [
        { subject: 'Força', value: profile.estatisticas.forca, fullMark: 100 },
        { subject: 'Inteligência', value: profile.estatisticas.inteligencia, fullMark: 100 },
        { subject: 'Sabedoria', value: profile.estatisticas.sabedoria, fullMark: 100 },
        { subject: 'Constituição', value: profile.estatisticas.constituicao, fullMark: 100 },
        { subject: 'Destreza', value: profile.estatisticas.destreza, fullMark: 100 },
        { subject: 'Carisma', value: profile.estatisticas.carisma, fullMark: 100 },
    ];

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-cinzel text-2xl text-foreground">Sistema de Atributos</h3>
                        <p className="text-sm text-muted-foreground">Análise completa das suas capacidades</p>
                    </div>
                </div>

                {/* Rank Badge */}
                <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-medium text-primary">Sistema Ativo</span>
                </div>
            </div>

            {/* Radar Chart Container */}
            <div className={cn(
                "relative rounded-2xl bg-gradient-to-br from-card/40 to-card/20 backdrop-blur-sm border border-border/30 p-8",
                isMobile ? "h-64" : "h-96"
            )}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-4 left-4 w-32 h-32 rounded-full bg-primary/20 blur-3xl" />
                    <div className="absolute bottom-4 right-4 w-24 h-24 rounded-full bg-accent/20 blur-2xl" />
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={statsData}>
                        <defs>
                            <radialGradient id="radar-fill">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                            </radialGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                        <PolarGrid stroke="hsl(var(--border))" strokeDasharray="2 2" opacity={0.3} />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{
                                fill: 'hsl(var(--foreground))',
                                fontSize: isMobile ? 11 : 13,
                                fontWeight: '600'
                            }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                            tickCount={6}
                        />
                        <Radar
                            name={profile.nome_utilizador}
                            dataKey="value"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            fill="url(#radar-fill)"
                            fillOpacity={0.8}
                            filter="url(#glow)"
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--popover))',
                                borderColor: 'hsl(var(--border))',
                                color: 'hsl(var(--foreground))',
                                borderRadius: 'var(--radius)',
                                boxShadow: '0 8px 32px rgb(0 0 0 / 0.3)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid hsl(var(--border))'
                            }}
                            cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '5 5' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Stats Grid - Enhanced */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                {statsData.map((stat, index) => (
                    <div key={stat.subject} className="group relative">
                        {/* Background glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <StatItem
                            label={stat.subject}
                            value={stat.value}
                            isMobile={isMobile}
                        />
                    </div>
                ))}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border/30">
                <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{statsData.reduce((sum, stat) => sum + stat.value, 0)}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Total</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{Math.max(...statsData.map(s => s.value))}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Máximo</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{(statsData.reduce((sum, stat) => sum + stat.value, 0) / statsData.length).toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Média</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{statsData.filter(s => s.value >= 50).length}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Dominantes</div>
                </div>
            </div>
        </div>
    );
};
