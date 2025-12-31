"use client";

import React, { memo, useState, useRef, useMemo } from 'react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { cn } from '@/lib/utils';
import { 
    Clock, CheckCircle2, Circle, Flame, Calendar, 
    AlertCircle, Sparkles, Menu, History, Play, Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const RoutineMobileComponent = () => {
    const { profile, routine, completeRoutineTask } = usePlayerDataContext();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const startY = useRef<number>(0);
    const currentY = useRef<number>(0);

    const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            const patterns = { light: 50, medium: 100, heavy: 200 };
            navigator.vibrate(patterns[type]);
        }
    };

    const handleTaskToggle = async (taskId: string | number, currentStatus: boolean) => {
        triggerHapticFeedback(currentStatus ? 'light' : 'medium');
        await completeRoutineTask(taskId);
    };

    const handleTouchStart = (e: React.TouchEvent) => { startY.current = e.touches[0].clientY; };
    const handleTouchMove = (e: React.TouchEvent) => { currentY.current = e.touches[0].clientY; };
    const handleTouchEnd = () => {
        if (currentY.current - startY.current > 150 && scrollContainerRef.current?.scrollTop === 0) {
            triggerHapticFeedback('medium');
        }
    };

    const sortedRoutine = useMemo(() => {
        if (!routine) return [];
        return [...routine].sort((a: any, b: any) => {
            if (a.concluida !== b.concluida) return a.concluida ? 1 : -1;
            return a.horario.localeCompare(b.horario);
        });
    }, [routine]);

    const completedTasks = routine?.filter((t: any) => t.concluida).length || 0;
    const totalTasks = routine?.length || 0;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    if (!routine) {
        return (
             <div className="flex h-screen flex-col items-center justify-center bg-black text-blue-500 font-mono">
                <Clock className="h-12 w-12 animate-pulse" />
                <p className="mt-4 uppercase tracking-widest text-xs">Loading_Schedule...</p>
            </div>
        );
    }

    return (
        <div className="h-screen bg-black overflow-hidden flex flex-col max-w-full relative">
            <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-[0.03] pointer-events-none z-50" />
            
            <header className="bg-black/90 backdrop-blur-2xl border-b border-blue-500/20 flex-shrink-0 z-40" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                <div className="flex items-center justify-between bg-blue-950/40 border-b border-blue-900/30 py-2.5 px-4">
                    <div className="flex items-center gap-3">
                        <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
                        <span className="font-mono text-[10px] text-orange-300 uppercase tracking-[0.2em] font-bold">
                            STREAK_ACTIVE: <span className="text-white">{profile?.streak_atual || 0} DAYS</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-blue-400 font-bold tracking-wider uppercase">{new Date().toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    </div>
                </div>

                <div className="px-4 py-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="font-cinzel text-white tracking-widest text-2xl font-bold drop-shadow-[0_0_12px_rgba(59,130,246,0.6)] uppercase">
                                DAILY <span className="text-blue-400">CYCLE</span>
                            </h1>
                            <p className="text-blue-300/60 font-mono text-[10px] tracking-[0.15em] mt-1 font-bold uppercase">
                                CHRONOS_SYNCHRONIZATION
                            </p>
                        </div>
                        <button className="text-blue-400 p-3 rounded-2xl border-2 border-blue-500/20 bg-blue-500/5 active:bg-blue-500/20 transition-all shadow-lg">
                            <History className="h-7 w-7" />
                        </button>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-mono text-blue-400 font-bold uppercase">
                            <span>CYCLE_COMPLETION</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-blue-950/40 rounded-full overflow-hidden border border-blue-500/20 shadow-inner">
                            <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 shadow-[0_0_10px_#3b82f6]" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </div>
            </header>

            <main 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-4 py-6 pb-safe bg-black relative" 
                onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
            >
                <div className="relative pl-8 space-y-8 animate-fade-in pb-32">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-4 top-2 bottom-32 w-0.5 bg-gradient-to-b from-blue-500/50 via-blue-500/20 to-transparent" />

                    {sortedRoutine.map((task: any, index: number) => (
                        <div key={task.id} className="relative group">
                            {/* Timeline Point */}
                            <div className={cn(
                                "absolute -left-6 top-1.5 h-4 w-4 rounded-full border-2 transition-all duration-500 z-10 shadow-[0_0_10px_rgba(59,130,246,0.2)]",
                                task.concluida ? "bg-green-500 border-black" : "bg-black border-blue-500 animate-pulse"
                            )} />

                            <div 
                                className={cn(
                                    "border-2 rounded-[2rem] transition-all duration-300 active:scale-[0.97] overflow-hidden p-5",
                                    task.concluida 
                                        ? "bg-green-950/5 border-green-900/20 opacity-60" 
                                        : "bg-blue-950/10 border-blue-900/40 shadow-xl"
                                )}
                                onClick={() => handleTaskToggle(task.id, task.concluida)}
                            >
                                <div className="flex gap-4 items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                                                {task.horario}
                                            </span>
                                            {task.concluida && (
                                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[8px] font-bold uppercase tracking-widest">Verified</Badge>
                                            )}
                                        </div>
                                        <h3 className={cn(
                                            "font-cinzel font-bold text-base tracking-wider uppercase",
                                            task.concluida ? "text-green-400/40 line-through" : "text-white"
                                        )}>
                                            {task.nome}
                                        </h3>
                                        <p className="text-[10px] font-mono text-blue-100/40 mt-1 uppercase tracking-tight">
                                            {task.descricao || "Routine protocol sequence active."}
                                        </p>
                                    </div>

                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-500",
                                        task.concluida ? "bg-green-500/20 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]" : "bg-blue-500/5 border-blue-500/30"
                                    )}>
                                        {task.concluida ? <CheckCircle2 className="h-6 w-6 text-green-400" /> : <Circle className="h-6 w-6 text-blue-500/20" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <button
                className="fixed bottom-8 right-6 w-20 h-20 bg-orange-600 border-4 border-orange-400 text-white shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all active:scale-90 flex items-center justify-center group z-40 rounded-[2rem]"
                style={{ bottom: 'calc(32px + env(safe-area-inset-bottom))', right: '24px' }}
                onClick={() => triggerHapticFeedback('heavy')}
            >
                <Flame className="h-10 w-10 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white/40 rounded-tl-lg" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-white/40 rounded-br-lg" />
            </button>
        </div>
    );
};

export const RoutineMobile = memo(RoutineMobileComponent);
