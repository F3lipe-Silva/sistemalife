import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
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
        <div className={cn("items-center", isMobile ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 md:grid-cols-2 gap-4")}>
            <div className={cn("w-full", isMobile ? "h-44" : "h-64")}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={statsData}>
                        <defs>
                            <radialGradient id="radar-fill">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                            </radialGradient>
                        </defs>
                        <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: isMobile ? 10 : 12, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name={profile.nome_utilizador} dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#radar-fill)" fillOpacity={0.8} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--popover))',
                                borderColor: 'hsl(var(--border))',
                                color: 'hsl(var(--foreground))',
                                borderRadius: 'var(--radius)',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            }}
                            cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '5 5' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className={cn("gap-2", isMobile ? "grid grid-cols-2 gap-2" : "grid grid-cols-1 sm:grid-cols-2 gap-2")}>
                {statsData.map((stat) => (
                    <StatItem key={stat.subject} label={stat.subject} value={stat.value} isMobile={isMobile} />
                ))}
            </div>
        </div>
    );
};
