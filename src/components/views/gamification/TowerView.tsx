"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, Calendar, Shield, Users, Trophy, CheckCircle, Gem, Zap, Clock, Ticket, LoaderCircle, Sparkles, Lock, ArrowUpCircle, Skull, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { generateTowerChallenge } from '@/lib/ai-client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';


const challengeTypes = {
  daily: { icon: Flame, color: 'text-orange-500', borderColor: 'border-orange-500/50', bg: 'bg-orange-950/20', label: 'DAILY' },
  weekly: { icon: Calendar, color: 'text-blue-500', borderColor: 'border-blue-500/50', bg: 'bg-blue-950/20', label: 'WEEKLY' },
  special: { icon: Shield, color: 'text-purple-500', borderColor: 'border-purple-500/50', bg: 'bg-purple-950/20', label: 'SPECIAL' },
  class: { icon: Trophy, color: 'text-yellow-500', borderColor: 'border-yellow-500/50', bg: 'bg-yellow-950/20', label: 'CLASS' },
  skill: { icon: Zap, color: 'text-cyan-500', borderColor: 'border-cyan-500/50', bg: 'bg-cyan-950/20', label: 'SKILL' },
};

const TowerView = () => {
    const { profile, missions, skills, metas, persistData, checkAndApplyTowerRewards, setCurrentPage } = usePlayerDataContext();
    const { toast } = useToast();
    const [isLoadingChallenge, setIsLoadingChallenge] = useState(false);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    useEffect(() => {
        checkAndApplyTowerRewards();
        const interval = setInterval(checkAndApplyTowerRewards, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, [checkAndApplyTowerRewards]);

    const towerProgress = useMemo(() => profile?.tower_progress || {
        currentFloor: 1,
        highestFloor: 1,
        dailyChallengesAvailable: 1,
        tower_tickets: 0,
        tower_lockout_until: null,
    }, [profile]);
    
    const activeChallenges = useMemo(() => profile?.active_tower_challenges || [], [profile]);
    const availableChallenges = useMemo(() => profile?.available_tower_challenges || [], [profile]);

    const handleGenerateChallenge = async () => {
        if (activeChallenges.length > 0) {
            toast({ variant: 'destructive', title: 'SYSTEM ALERT', description: 'Active challenge must be cleared first.' });
            return;
        }
        setIsLoadingChallenge(true);
        try {
            const allCurrentChallenges = [...activeChallenges, ...availableChallenges];
            const recentChallengeTitles = allCurrentChallenges.map(c => c.title);

            const result = await generateTowerChallenge({
                floorNumber: towerProgress.currentFloor,
                userProfile: JSON.stringify(profile),
                userSkills: JSON.stringify(skills),
                activeGoals: JSON.stringify(metas.filter((m: any) => !m.concluida)),
                recentChallenges: recentChallengeTitles,
            });

            // Replace available challenge instead of adding
            const newAvailableChallenges = [{ ...result, status: 'available' }];
            
            await persistData('profile', { 
                ...profile, 
                available_tower_challenges: newAvailableChallenges,
            });

            toast({ title: 'NEW CHALLENGE GENERATED', description: `Target: "${result.title}"` });

        } catch (error) {
            console.error("Error generating tower challenge:", error);
            toast({ variant: 'destructive', title: 'SYSTEM ERROR', description: 'Failed to generate challenge data.' });
        } finally {
            setIsLoadingChallenge(false);
        }
    };
    
     const handleAcceptChallenge = async (challengeToAccept: any) => {
        if ((towerProgress.tower_tickets || 0) <= 0) {
            toast({ variant: 'destructive', title: 'ACCESS DENIED', description: 'Insufficient Tower Tickets.' });
            return;
        }

        const newChallenge = {
            ...challengeToAccept,
            startedAt: new Date().toISOString(),
            requirements: challengeToAccept.requirements.map((r: any) => ({...r, current: 0})),
        };
        
        const updatedActiveChallenges = [...activeChallenges, newChallenge];
        const updatedAvailableChallenges = availableChallenges.filter((c: any) => c.id !== challengeToAccept.id);

        const updatedProfile = {
            ...profile,
            active_tower_challenges: updatedActiveChallenges,
            available_tower_challenges: updatedAvailableChallenges,
            tower_progress: {
                ...towerProgress,
                tower_tickets: (towerProgress.tower_tickets || 0) - 1,
            }
        };
        await persistData('profile', updatedProfile);
        
        toast({ title: "CHALLENGE ACCEPTED", description: `Objective "${challengeToAccept.title}" initiated. Ticket consumed.`});
    };
    
    const isLockedOut = towerProgress.tower_lockout_until && new Date(towerProgress.tower_lockout_until) > new Date();
    const lockoutTimeLeft = isLockedOut ? formatDistanceToNow(new Date(towerProgress.tower_lockout_until), { locale: ptBR, addSuffix: true }) : '';
    
    const challengesForCurrentFloor = [...activeChallenges, ...availableChallenges].filter(c => c.floor === towerProgress.currentFloor);
    const completedChallengesOnFloor = (profile.tower_progress.completed_challenges_floor || []).length;
    const requiredToAdvance = 3;
    const floorProgress = (completedChallengesOnFloor / requiredToAdvance) * 100;
    
    const canGenerateChallenge = activeChallenges.length === 0;

    return (
        <div className="w-full h-full flex flex-col bg-background relative">
             {/* Background Atmosphere */}
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-background to-background -z-10 pointer-events-none"></div>
             <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-5 pointer-events-none mix-blend-overlay -z-10"></div>

            {/* Compact Header */}
            <div className="flex-shrink-0 p-3 md:p-4 border-b border-purple-500/10 bg-background/95 backdrop-blur-md">
                 <div className="flex justify-between items-center gap-3 max-w-7xl mx-auto w-full">
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                        {isMobile && (
                            <button onClick={() => setCurrentPage('tower-lobby')} className="p-2 -ml-2 text-purple-400">
                                <ArrowUpCircle className="h-6 w-6 rotate-[-90deg]" />
                            </button>
                        )}
                        <Skull className="h-5 w-5 md:h-6 md:w-6 text-purple-500 flex-shrink-0 animate-pulse" />
                        <div className="min-w-0">
                            <h1 className="text-lg md:text-xl font-black text-white font-cinzel tracking-wider uppercase truncate">DEMON CASTLE</h1>
                            <p className="text-purple-400/60 font-mono text-[9px] tracking-widest uppercase hidden sm:block">FLOOR {towerProgress.currentFloor}</p>
                        </div>
                    </div>
                     <div className="flex gap-1.5 md:gap-2">
                        <div className="bg-black/60 border border-purple-500/30 px-2 py-1 text-center min-w-[50px] md:min-w-[60px]">
                             <p className="font-mono font-bold text-base md:text-lg text-white leading-none">{towerProgress.currentFloor}</p>
                             <p className="text-[8px] md:text-[9px] font-mono text-purple-400 uppercase tracking-wider">FLOOR</p>
                        </div>
                         <div className="bg-black/60 border border-purple-500/30 px-2 py-1 text-center min-w-[50px] md:min-w-[60px] hidden sm:block">
                             <p className="font-mono font-bold text-base md:text-lg text-white leading-none">{towerProgress.highestFloor}</p>
                             <p className="text-[8px] md:text-[9px] font-mono text-purple-400 uppercase tracking-wider">BEST</p>
                        </div>
                         <div className="bg-black/60 border border-yellow-500/30 px-2 py-1 text-center min-w-[50px] md:min-w-[60px]">
                            <div className="flex items-center justify-center gap-0.5">
                                 <Ticket className="h-3 w-3 text-yellow-500" />
                                <p className="font-mono font-bold text-base md:text-lg text-white leading-none">{towerProgress.tower_tickets || 0}</p>
                            </div>
                             <p className="text-[8px] md:text-[9px] font-mono text-yellow-500 uppercase tracking-wider">TICKS</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <div className="px-3 py-3 md:px-4 md:py-4 max-w-4xl mx-auto w-full">
                    <div className="relative w-full">
                        
                        {/* Future floor - Compact */}
                        <div className="text-center text-purple-500/20 mb-3 md:mb-4">
                            <ArrowUpCircle className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-1"/>
                            <p className="font-mono font-bold text-xs md:text-sm uppercase tracking-widest">FLOOR {towerProgress.currentFloor + 1} [LOCKED]</p>
                        </div>
                        
                        {/* Current Floor Card */}
                        <div className="w-full relative group">
                            {/* Glow Effect */}
                            <div className="absolute -inset-1 bg-purple-500/20 rounded-lg blur-lg group-hover:bg-purple-500/30 transition-all duration-500"></div>
                            
                            <div className="relative bg-black/80 backdrop-blur-md border-2 border-purple-500/50 p-6 overflow-hidden">
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-purple-500"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-purple-500"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-purple-500"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-purple-500"></div>

                                <div className="flex flex-col items-center mb-6">
                                    <h2 className="text-3xl font-black text-white font-cinzel uppercase tracking-[0.2em] mb-2 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]">FLOOR {towerProgress.currentFloor}</h2>
                                    <div className="w-full max-w-md space-y-1">
                                        <div className="flex justify-between text-[10px] font-mono text-purple-400 uppercase tracking-widest">
                                            <span>FLOOR CLEARANCE</span>
                                            <span>{Math.round(floorProgress)}%</span>
                                        </div>
                                        <Progress value={floorProgress} className="h-2 bg-purple-950/50 border border-purple-900/50 [&>div]:bg-purple-50" />
                                        <p className="text-center text-[10px] font-mono text-purple-500/60 uppercase mt-1">{completedChallengesOnFloor}/{requiredToAdvance} OBJECTIVES CLEARED</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {isLockedOut ? (
                                        <div className="text-center p-4 md:p-6 bg-red-950/30 border border-red-500/50 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(220,38,38,0.05)_10px,rgba(220,38,38,0.05)_20px)]" />
                                            <Lock className="h-10 w-10 md:h-12 md:w-12 text-red-500 mx-auto mb-2 md:mb-3 animate-pulse"/>
                                            <h3 className="text-red-500 font-mono font-bold text-sm md:text-base uppercase tracking-widest mb-1">SYSTEM LOCKOUT</h3>
                                            <p className="text-red-400/60 font-mono text-[10px] uppercase mb-2 md:mb-3">Recovery protocol active</p>
                                            <div className="inline-block px-3 py-1 bg-red-900/20 border border-red-500/30">
                                                <p className="font-mono font-bold text-red-400 text-xs md:text-sm">{lockoutTimeLeft}</p>
                                            </div>
                                        </div>
                                    ) : challengesForCurrentFloor.length > 0 ? (
                                        challengesForCurrentFloor.map((challenge: any) => {
                                            const typeInfo = challengeTypes[challenge.type as keyof typeof challengeTypes];
                                            const ChallengeIcon = typeInfo?.icon || Trophy;
                                            const isAccepted = !!challenge.startedAt;
                                            const progress = challenge.requirements && challenge.requirements.length > 0
                                                ? (challenge.requirements.reduce((sum: number, r: any) => sum + (r.current || 0), 0) / challenge.requirements.reduce((sum: number, r: any) => sum + r.target, 0)) * 100
                                                : 0;
                                            
                                            return (
                                                <div key={challenge.id} className={cn(
                                                    "relative p-2 md:p-3 border transition-all",
                                                    "bg-black/60",
                                                    isAccepted ? "border-purple-500" : "border-purple-900/30 hover:border-purple-500/50"
                                                )}>
                                                    {isAccepted && <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-purple-600 text-white text-[8px] font-mono font-bold uppercase tracking-widest">ACTIVE</div>}
                                                    
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex-grow">
                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                <div className={cn("p-1 border bg-black", typeInfo.borderColor, typeInfo.color)}>
                                                                    <ChallengeIcon className="h-3 w-3" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-bold text-white font-mono uppercase tracking-wide text-xs truncate">{challenge.title}</h3>
                                                                    <span className={cn("text-[8px] font-mono uppercase px-1 py-0.5 border bg-black/50", typeInfo.borderColor, typeInfo.color)}>{typeInfo.label}</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-purple-200/60 text-[10px] md:text-xs font-mono pl-10 border-l border-purple-500/20">{challenge.description}</p>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between gap-2 w-full">
                                                            <div className="flex gap-1.5">
                                                                <div className="flex items-center text-[10px] font-mono bg-purple-950/30 px-1.5 py-0.5 border border-purple-500/20 text-purple-300">
                                                                    <span className="font-bold">{challenge.rewards.xp}</span><span className="ml-1">XP</span>
                                                                </div>
                                                                <div className="flex items-center text-[10px] font-mono bg-yellow-950/30 px-1.5 py-0.5 border border-yellow-500/20 text-yellow-500">
                                                                    <span className="font-bold">{challenge.rewards.fragments}</span><span className="ml-1">FRAGS</span>
                                                                </div>
                                                            </div>
                                                            
                                                            {!isAccepted && (
                                                                <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white font-mono text-[10px] uppercase tracking-wider rounded-none h-6 px-3" onClick={() => handleAcceptChallenge(challenge)} disabled={(towerProgress.tower_tickets || 0) <= 0}>
                                                                    ACCEPT
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {isAccepted && (
                                                        <div className="mt-2 pt-2 border-t border-purple-500/20">
                                                            <div className="flex justify-between text-[9px] font-mono text-purple-400 uppercase mb-0.5">
                                                                <span>PROGRESS</span>
                                                                {challenge.timeLimit && (
                                                                    <span className="text-red-400 animate-pulse">{challenge.timeLimit}H LEFT</span>
                                                                )}
                                                            </div>
                                                            <Progress value={progress} className="h-1 bg-purple-950/50 border border-purple-500/30 [&>div]:bg-purple-500" />
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className="text-center py-6 md:py-8 border border-purple-900/30 border-dashed bg-purple-950/10">
                                            <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-purple-500/30 mx-auto mb-1.5" />
                                            <p className="font-mono text-purple-500/50 text-[10px] md:text-xs uppercase tracking-widest">NO ACTIVE SIGNALS</p>
                                        </div>
                                    )}
                                </div>

                                {!isLockedOut && (
                                    <div className="mt-3 md:mt-4 pt-3 border-t border-purple-500/30">
                                        <Button 
                                            onClick={handleGenerateChallenge} 
                                            disabled={isLoadingChallenge || !canGenerateChallenge}
                                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-mono uppercase tracking-wider h-8 md:h-10 rounded-none text-[10px] md:text-xs relative group overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                            {isLoadingChallenge ? (
                                                <span className="flex items-center gap-1.5"><LoaderCircle className="animate-spin h-3 w-3" /> SCANNING...</span>
                                            ) : (
                                                <span className="flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> {availableChallenges.length > 0 ? 'REROLL' : 'GENERATE CHALLENGE'}</span>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                         {/* Past floors - Hidden on mobile */}
                        {towerProgress.currentFloor > 1 && (
                            <div className="hidden md:block mt-4 space-y-2">
                                {Array.from({ length: Math.min(2, towerProgress.currentFloor - 1) }, (_, i) => towerProgress.currentFloor - 1 - i).map(floorNum => (
                                    <div key={floorNum} className="text-center text-purple-500/15 opacity-40">
                                        <CheckCircle className="h-4 w-4 mx-auto mb-0.5"/>
                                        <p className="font-mono text-[10px] uppercase tracking-widest">FLOOR {floorNum} CLEARED</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TowerView;
