
"use client";

import { useMemo, memo } from 'react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Swords, Brain, User, Paintbrush, Handshake, Heart, LoaderCircle, ShieldCheck } from 'lucide-react';
import { statCategoryMapping } from '@/lib/mappings';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { Meta } from '@/hooks/use-player-data';

interface ClassDataItem {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
    categories: string[];
    bonus: string;
    title: string;
}

const classData: Record<string, ClassDataItem> = {
    'Guerreiro': {
        title: 'WARRIOR',
        icon: Swords,
        color: 'text-red-500',
        bgColor: 'bg-red-950/20',
        borderColor: 'border-red-500/50',
        description: 'Focuses on overcoming physical challenges and strengthening the body.',
        categories: ['Saúde & Fitness'],
        bonus: '+5% XP in Health & Fitness quests.'
    },
    'Mago': {
        title: 'MAGE',
        icon: Brain,
        color: 'text-blue-500',
        bgColor: 'bg-blue-950/20',
        borderColor: 'border-blue-500/50',
        description: 'Dedicated to expanding knowledge and mastering new competencies.',
        categories: ['Desenvolvimento de Carreira', 'Finanças', 'Cultura & Conhecimento'],
        bonus: 'Requires 10% less XP to evolve Intelligence skills.'
    },
    'Artesão': {
        title: 'ARTISAN',
        icon: Paintbrush,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-950/20',
        borderColor: 'border-yellow-500/50',
        description: 'A master of creation and expression. Transforms ideas into reality.',
        categories: ['Hobbies & Criatividade'],
        bonus: '+10% "critical hit" chance in creative tasks.'
    },
    'Diplomata': {
        title: 'DIPLOMAT',
        icon: Handshake,
        color: 'text-green-500',
        bgColor: 'bg-green-950/20',
        borderColor: 'border-green-500/50',
        description: 'Expert in building bridges and strengthening bonds.',
        categories: ['Relacionamentos'],
        bonus: '+10% XP in Relationship quests.'
    },
    'Sábio': {
        title: 'SAGE',
        icon: Heart,
        color: 'text-purple-500',
        bgColor: 'bg-purple-950/20',
        borderColor: 'border-purple-500/50',
        description: 'Focused on self-knowledge and inner balance.',
        categories: ['Crescimento Pessoal'],
        bonus: 'Reduces XP loss from skill corruption by 25%.'
    },
    'Explorador': {
        title: 'RANGER',
        icon: ShieldCheck,
        color: 'text-orange-500',
        bgColor: 'bg-orange-950/20',
        borderColor: 'border-orange-500/50',
        description: 'An adventurer who braves the world and new experiences.',
        categories: ['Viagens & Aventura'],
        bonus: 'Increases chance of finding "rare quests" by 10%.'
    },
    'Neófito': {
        title: 'NOVICE',
        icon: User,
        color: 'text-gray-400',
        bgColor: 'bg-gray-950/20',
        borderColor: 'border-gray-500/50',
        description: 'A hunter at the beginning of their journey.',
        categories: [],
        bonus: '+5% XP in all activities until Level 5.'
    }
};

const ClassViewComponent = () => {
    const { profile, metas, isDataLoaded } = usePlayerDataContext();

    const userClass = useMemo(() => {
        if (!metas || metas.length === 0) return classData['Neófito'];

        const activeGoals = metas.filter((m: Meta) => !m.concluida);
        if (activeGoals.length === 0) return classData['Neófito'];
        
        const categoryCounts: Record<string, number> = activeGoals.reduce((acc: Record<string, number>, meta: Meta) => {
            const category = meta.categoria || "Crescimento Pessoal";
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});

        const primaryCategory = Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b);
        
        for (const className in classData) {
            if (classData[className].categories.includes(primaryCategory)) {
                return classData[className];
            }
        }
        
        return classData['Neófito'];

    }, [metas]);
    
    if (!isDataLoaded) {
        return (
            <div className="p-4 md:p-6 h-full flex items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }
    
    const Icon = userClass.icon;

    return (
        <div className="p-4 md:p-6 h-full overflow-y-auto relative">
             <div className="absolute inset-0 bg-grid-cyan-400/10 [mask-image:linear-gradient(to_bottom,white_5%,transparent_80%)] -z-10"></div>

             <div className="mb-8 flex flex-col gap-2 border-b border-blue-900/30 pb-4">
                <h1 className="text-3xl font-black text-white font-cinzel tracking-[0.1em] uppercase drop-shadow-md">CLASS ADVANCEMENT</h1>
                <p className="text-blue-400/60 font-mono text-xs tracking-widest uppercase">
                    CURRENT JOB ANALYSIS
                </p>
            </div>
            
             <Card className={cn("max-w-4xl mx-auto bg-black/80 backdrop-blur-md border-2 shadow-2xl relative overflow-hidden", userClass.borderColor)}>
                 <div className={cn("absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20", userClass.bgColor.replace('/20', ''))} />
                 
                 <CardHeader className="text-center items-center pt-8 pb-2 relative z-10">
                    <div className={cn("w-28 h-28 rounded-full flex items-center justify-center mb-6 border-4 shadow-[0_0_20px_currentColor] bg-black", userClass.borderColor, userClass.color)}>
                         <Icon className="w-14 h-14" />
                    </div>
                    <div className="space-y-1">
                        <div className={cn("text-xs font-mono uppercase tracking-widest opacity-70", userClass.color)}>CURRENT CLASS</div>
                        <CardTitle className={cn("text-5xl font-black font-cinzel tracking-widest uppercase drop-shadow-lg", userClass.color)}>
                            {userClass.title}
                        </CardTitle>
                    </div>
                    <CardDescription className="text-sm font-mono text-gray-400 max-w-lg mt-4 border-l-2 border-r-2 border-gray-800 px-4 py-2">
                        {userClass.description}
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-8 p-8 relative z-10">
                    <div className="p-4 bg-black/60 border border-gray-800 relative group">
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gray-600" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gray-600" />
                        <h3 className={cn("text-xs font-bold font-mono uppercase tracking-widest mb-2", userClass.color)}>CLASS PASSIVE</h3>
                        <p className="text-white font-mono text-sm">{userClass.bonus}</p>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-gray-500 font-mono uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">MASTERY PROGRESS</h3>
                        <div className="space-y-4">
                           {Object.keys(statCategoryMapping).map(category => {
                                const goalsInCategory = metas.filter((m: Meta) => m.categoria === category && !m.concluida).length;
                                const totalGoals = metas.filter((m: Meta) => !m.concluida).length || 1;
                                const progress = (goalsInCategory / totalGoals) * 100;
                                
                                if(goalsInCategory > 0) {
                                    return (
                                        <div key={category} className="group">
                                            <div className="flex justify-between items-center text-xs mb-1 font-mono uppercase">
                                                <span className="text-gray-400">{category}</span>
                                                <span className={cn("font-bold", userClass.color)}>{goalsInCategory} TARGETS</span>
                                            </div>
                                             <div className="h-1.5 bg-gray-900 border border-gray-800 w-full">
                                                <div 
                                                    className={cn("h-full transition-all duration-500 shadow-[0_0_5px_currentColor]", userClass.bgColor.replace('/20', ''))} 
                                                    style={{ width: `${progress}%` }} 
                                                />
                                             </div>
                                        </div>
                                    )
                                }
                                return null;
                           })}
                        </div>
                    </div>
                </CardContent>
             </Card>
        </div>
    );
};

export const ClassView = memo(ClassViewComponent);
