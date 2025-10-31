"use client";

import { useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { Flame, CheckCircle, Percent, Trophy, TrendingUp, Target, Award } from 'lucide-react';
import { subDays, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';

interface StatCardProps {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    title: string;
    value: number;
    unit?: string;
    color?: string;
    gradient?: string;
    trend?: 'up' | 'down' | 'neutral';
}

const StatCard = memo(({ icon: Icon, title, value, unit, color, gradient, trend }: StatCardProps) => (
    <Card className={cn("bg-card/60 border-border/80 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group", gradient)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className={cn("p-2 rounded-full bg-secondary/50 group-hover:scale-110 transition-transform", color)}>
                <Icon className={`h-5 w-5 ${color || 'text-muted-foreground'}`} />
            </div>
        </CardHeader>
        <CardContent>
            <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-foreground">
                    {value} <span className="text-base font-normal text-muted-foreground">{unit}</span>
                </div>
                {trend && (
                    <div className={cn("flex items-center text-xs font-semibold",
                        trend === 'up' ? 'text-green-500' : 
                        trend === 'down' ? 'text-red-500' : 
                        'text-muted-foreground'
                    )}>
                        {trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                        {trend === 'down' && <TrendingUp className="h-3 w-3 mr-1 rotate-180" />}
                    </div>
                )}
            </div>
        </CardContent>
    </Card>
));

const MissionStatsPanelComponent = () => {
    const { profile, missions } = usePlayerDataContext();

    const weeklyCompletionRate = useMemo(() => {
        const oneWeekAgo = subDays(new Date(), 7);
        const missionsLastWeek = missions
            .flatMap((m: any) => m.missoes_diarias || [])
            .filter((dm: any) => dm.completed_at && isAfter(new Date(dm.completed_at), oneWeekAgo));
            
        const completedCount = missionsLastWeek.length;
        const totalPossible = 7;
        
        if (totalPossible <= 0) return 0;
        return Math.round((completedCount / totalPossible) * 100);

    }, [missions]);

    const activeMissionsCount = useMemo(() => {
        return missions.filter((m: any) => !m.concluido).length;
    }, [missions]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <StatCard 
                icon={Flame} 
                title="Streak Atual" 
                value={profile?.streak_atual || 0} 
                unit="dias"
                color="text-orange-400"
                gradient="border-l-4 border-l-orange-400"
                trend={profile?.streak_atual > 0 ? 'up' : 'neutral'}
            />
            <StatCard 
                icon={Trophy} 
                title="Melhor Streak" 
                value={profile?.best_streak || profile?.streak_atual || 0} 
                unit="dias"
                color="text-yellow-400"
                gradient="border-l-4 border-l-yellow-400"
            />
            <StatCard 
                icon={CheckCircle} 
                title="Total de Missões" 
                value={profile?.missoes_concluidas_total || 0}
                color="text-green-400"
                gradient="border-l-4 border-l-green-400"
            />
            <StatCard 
                icon={Percent} 
                title="Conclusão Semanal" 
                value={weeklyCompletionRate}
                unit="%"
                color="text-blue-400"
                gradient="border-l-4 border-l-blue-400"
                trend={weeklyCompletionRate >= 70 ? 'up' : weeklyCompletionRate >= 40 ? 'neutral' : 'down'}
            />
            <StatCard 
                icon={Target} 
                title="Missões Ativas" 
                value={activeMissionsCount}
                color="text-purple-400"
                gradient="border-l-4 border-l-purple-400"
            />
        </div>
    );
};

export const MissionStatsPanel = memo(MissionStatsPanelComponent);
