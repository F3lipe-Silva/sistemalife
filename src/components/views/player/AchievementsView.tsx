
"use client";

import { achievements as staticAchievements } from '@/lib/achievements';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CheckCircle, Award, Book, BarChart, Gem, Shield, Flame, Trophy, BrainCircuit, Star, Swords, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { format, parseISO } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { useIsMobile } from '@/hooks/use-mobile';

const iconMap = {
    Award,
    Book,
    BarChart,
    Gem,
    Shield,
    Flame,
    Trophy,
    BrainCircuit,
    Star,
    Swords
};

export const AchievementsView = () => {
    const { profile, skills, metas, missions } = usePlayerDataContext();
    const isMobile = useIsMobile();

    if (!profile) {
        return <div>A carregar perfil...</div>;
    }

    const allAchievements = [
        ...staticAchievements,
        ...(profile.generated_achievements || [])
    ];
    
    const getProgress = (achievement: any) => {
        const { type, value, category } = achievement.criteria;
        
        switch (type) {
            case 'missions_completed':
                return { current: profile.missoes_concluidas_total || 0, target: value };
            case 'level_reached':
                return { current: profile.nivel || 1, target: value };
            case 'goals_completed':
                return { current: metas.filter((m: any) => m.concluida).length, target: value };
            case 'skill_level_reached':
                 const skill = skills.find((s: any) => s.categoria === category);
                 return { current: skill ? skill.nivel_atual : 0, target: value };
            case 'streak_maintained':
                return { current: profile.streak_atual || 0, target: value };
            case 'missions_in_category_completed':
                const categoryGoals = metas.filter((m: any) => m.categoria === category).map((m: any) => m.nome);
                const count = missions
                    .filter((m: any) => categoryGoals.includes(m.meta_associada))
                    .flatMap((m: any) => m.missoes_diarias || [])
                    .filter((dm: any) => dm.concluido).length;
                return { current: count, target: value };
            default:
                return { current: 0, target: value };
        }
    };

    return (
        <div className={cn("h-full overflow-y-auto relative", isMobile ? "p-2" : "p-4 md:p-6")}>
             <div className="absolute inset-0 bg-grid-cyan-400/10 [mask-image:linear-gradient(to_bottom,white_5%,transparent_80%)] -z-10"></div>

            <div className={cn("mb-8 flex flex-col gap-2 border-b border-blue-900/30 pb-4")}>
                <h1 className={cn("font-black text-white font-cinzel tracking-[0.1em] uppercase drop-shadow-md", isMobile ? "text-2xl" : "text-3xl")}>
                    HALL OF FAME
                </h1>
                <p className={cn("text-blue-400/60 font-mono text-xs tracking-widest uppercase")}>
                    ACHIEVEMENT RECORDS
                </p>
            </div>

            <div className={cn(
                "grid gap-4", 
                isMobile 
                    ? "grid-cols-1 sm:grid-cols-2" 
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            )}>
                {allAchievements.map((achievement: any) => {
                    const isUnlocked = achievement.unlocked;
                    const unlockedDate = achievement.unlockedAt;

                    const { current, target } = getProgress(achievement);
                    const progressPercentage = target > 0 ? (current / target) * 100 : 0;
                    
                    const Icon = typeof achievement.icon === 'string' ? iconMap[achievement.icon as keyof typeof iconMap] || Award : achievement.icon;


                    return (
                        <div 
                            key={achievement.id}
                            className={cn(
                                "relative group border bg-black/60 transition-all duration-300 overflow-hidden flex flex-col min-h-[180px]",
                                isUnlocked 
                                    ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)] hover:border-yellow-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]' 
                                    : 'border-blue-900/30 opacity-80 hover:opacity-100 hover:border-blue-500/30',
                                isMobile ? 'p-3' : 'p-5'
                            )}
                        >
                            {/* Locked Overlay */}
                            {!isUnlocked && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="text-center">
                                        <Lock className="h-8 w-8 text-blue-500/50 mx-auto mb-2" />
                                        <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">LOCKED</span>
                                    </div>
                                </div>
                            )}

                            {/* Background Glow for Unlocked */}
                            {isUnlocked && (
                                <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-all duration-500" />
                            )}

                            <div className="flex items-start gap-4 mb-4 relative z-10">
                                <div className={cn(
                                    "flex items-center justify-center flex-shrink-0 border p-3 bg-black",
                                     isUnlocked ? 'border-yellow-500 text-yellow-400' : 'border-blue-900 text-blue-500/50',
                                     isMobile ? 'w-12 h-12' : 'w-14 h-14'
                                 )}>
                                    <Icon className={isMobile ? "w-6 h-6" : "w-7 h-7"}/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={cn("font-bold font-mono uppercase leading-tight line-clamp-2", isUnlocked ? 'text-white' : 'text-gray-500', isMobile ? "text-xs" : "text-sm")}>
                                        {achievement.name}
                                    </h3>
                                     {isUnlocked && unlockedDate && (
                                        <p className={cn("text-[9px] font-mono text-yellow-500/60 mt-1 uppercase tracking-wider")}>
                                            UNLOCKED: {format(parseISO(unlockedDate), 'yyyy-MM-dd')}
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex-grow relative z-10">
                                <p className={cn("font-mono text-xs leading-relaxed line-clamp-3", isUnlocked ? 'text-gray-400' : 'text-gray-600')}>
                                    {achievement.description}
                                </p>
                            </div>

                             {!isUnlocked && (
                                <div className="mt-4 pt-3 border-t border-blue-900/30 relative z-10">
                                    <div className="flex justify-between items-center mb-1 text-[10px] font-mono text-blue-500/60 uppercase">
                                        <span>PROGRESS</span>
                                        <span>{Math.min(current, target)} / {target}</span>
                                    </div>
                                    <div className="h-1 bg-blue-950/50 border border-blue-900/30 w-full">
                                        <div 
                                            className="h-full bg-blue-600 shadow-[0_0_5px_#2563eb]" 
                                            style={{ width: `${progressPercentage}%` }} 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
