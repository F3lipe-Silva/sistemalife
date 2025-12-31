"use client";

import React, { memo, useState, useMemo, useRef } from 'react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { cn } from '@/lib/utils';
import { Trophy, Star, Shield, Zap, Search, Menu, CheckCircle, Lock, Sparkles, ChevronRight, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AchievementsMobileComponent = () => {
    const { profile } = usePlayerDataContext();
    const [searchTerm, setSearchTerm] = useState('');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            const patterns = { light: 50, medium: 100, heavy: 200 };
            navigator.vibrate(patterns[type]);
        }
    };

    const achievements = useMemo(() => {
        return (profile?.generated_achievements || []).filter((a: any) => 
            a.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a: any, b: any) => (a.unlocked ? -1 : 1));
    }, [profile, searchTerm]);

    if (!profile) return null;

    const unlockedCount = achievements.filter((a: any) => a.unlocked).length;
    const progress = (unlockedCount / (achievements.length || 1)) * 100;

    return (
        <div className="h-screen bg-black overflow-hidden flex flex-col max-w-full relative">
            <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-[0.03] pointer-events-none z-50" />
            
            <header className="bg-black/90 backdrop-blur-2xl border-b border-blue-500/20 flex-shrink-0 z-40" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
                <div className="flex items-center justify-between bg-yellow-950/40 border-b border-yellow-900/30 py-2.5 px-4">
                    <div className="flex items-center gap-3">
                        <Trophy className="h-4 w-4 text-yellow-500 animate-pulse" />
                        <span className="font-mono text-[10px] text-yellow-300 uppercase tracking-[0.2em] font-bold">
                            HONOR_LOG: <span className="text-white">{unlockedCount} UNLOCKED</span>
                        </span>
                    </div>
                </div>

                <div className="px-4 py-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-cinzel text-white tracking-widest text-2xl font-bold drop-shadow-[0_0_12px_rgba(234,179,8,0.4)] uppercase">
                                GREAT <span className="text-yellow-500">FEATS</span>
                            </h1>
                            <p className="text-yellow-300/60 font-mono text-[10px] tracking-[0.15em] mt-1 font-bold uppercase">
                                LEGENDARY_ACHIEVEMENTS
                            </p>
                        </div>
                        <button className="text-yellow-500 p-3 rounded-2xl border-2 border-yellow-500/20 bg-yellow-500/5 transition-all shadow-lg">
                            <Award className="h-7 w-7" />
                        </button>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-mono text-yellow-500 font-bold uppercase tracking-widest">
                            <span>TOTAL_MASTERY</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-yellow-950/40 rounded-full overflow-hidden border border-yellow-500/20 shadow-inner">
                            <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-1000 shadow-[0_0_10px_#eab308]" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-6 pb-32 bg-black relative">
                <div className="flex flex-col gap-5 animate-fade-in">
                    {achievements.map((ach: any, index: number) => (
                        <div 
                            key={ach.id || index} 
                            className={cn(
                                "relative border-2 rounded-[2.5rem] transition-all duration-300 overflow-hidden shadow-2xl p-6",
                                ach.unlocked 
                                    ? "bg-gradient-to-br from-yellow-950/20 to-black border-yellow-500/40 shadow-yellow-500/5" 
                                    : "bg-blue-950/10 border-blue-900/40 opacity-60 grayscale"
                            )}
                            onClick={() => triggerHapticFeedback(ach.unlocked ? 'medium' : 'light')}
                        >
                            <div className="flex gap-5 items-center">
                                <div className={cn(
                                    "w-16 h-16 rounded-3xl border-2 flex items-center justify-center shadow-inner relative",
                                    ach.unlocked ? "bg-yellow-500/10 border-yellow-500/30" : "bg-blue-500/5 border-blue-500/20"
                                )}>
                                    <Trophy className={cn("h-8 w-8", ach.unlocked ? "text-yellow-500" : "text-blue-500/30")} />
                                    {ach.unlocked && <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-yellow-400 animate-pulse" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className={cn(
                                        "font-cinzel font-bold text-lg truncate uppercase tracking-wider",
                                        ach.unlocked ? "text-white" : "text-blue-100/40"
                                    )}>
                                        {ach.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className={cn(
                                            "text-[9px] font-mono uppercase tracking-[0.15em] px-3 py-1 rounded-full font-bold",
                                            ach.unlocked ? "border-yellow-500/20 text-yellow-400 bg-yellow-500/5" : "border-blue-500/10 text-blue-400/40"
                                        )}>
                                            {ach.rarity || 'COMMON'}
                                        </Badge>
                                        {ach.unlocked && (
                                            <span className="text-[9px] font-mono text-green-400 uppercase font-bold flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" /> COMPLETED
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5">
                                <p className={cn(
                                    "text-xs font-mono leading-relaxed uppercase tracking-tight",
                                    ach.unlocked ? "text-blue-100/60" : "text-blue-100/20"
                                )}>
                                    {ach.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export const AchievementsMobile = memo(AchievementsMobileComponent);
