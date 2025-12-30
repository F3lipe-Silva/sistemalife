"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, Calendar, Shield, Users, Trophy, CheckCircle, Gem, Zap, Clock, Ticket, LoaderCircle, Sparkles, Lock, ArrowUpCircle, Skull, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { generateTowerChallenge } from '@/ai/flows/generate-tower-challenge';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';


const challengeTypes = {
  daily: { icon: Flame, color: 'text-orange-500', borderColor: 'border-orange-500/50', bg: 'bg-orange-950/20', label: 'DAILY' },
  weekly: { icon: Calendar, color: 'text-blue-500', borderColor: 'border-blue-500/50', bg: 'bg-blue-950/20', label: 'WEEKLY' },
  special: { icon: Shield, color: 'text-purple-500', borderColor: 'border-purple-500/50', bg: 'bg-purple-950/20', label: 'SPECIAL' },
  class: { icon: Trophy, color: 'text-yellow-500', borderColor: 'border-yellow-500/50', bg: 'bg-yellow-950/20', label: 'CLASS' },
  skill: { icon: Zap, color: 'text-cyan-500', borderColor: 'border-cyan-500/50', bg: 'bg-cyan-950/20', label: 'SKILL' },
};

const TowerView = () => {
    const { profile, missions, skills, metas, persistData, checkAndApplyTowerRewards } = usePlayerDataContext();
    const { toast } = useToast();
    const [isLoadingChallenge, setIsLoadingChallenge] = useState(false);
    
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
        <div className="p-4 md:p-6 h-full flex flex-col bg-background relative overflow-hidden">
             {/* Background Atmosphere */}
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-background to-background -z-10 pointer-events-none"></div>
             <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>

            {/* Header */}
            <div className="flex-shrink-0 z-10 mb-6">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <Skull className="h-8 w-8 text-purple-500 animate-pulse" />
                            <h1 className="text-3xl font-black text-white font-cinzel tracking-[0.2em] uppercase drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">DEMON CASTLE</h1>
                        </div>
                        <p className="text-purple-400/60 font-mono text-xs tracking-widest uppercase pl-11">
                           Ascend the floors. Prove your strength.
                        </p>
                    </div>
                     <div className="flex gap-2 w-full md:w-auto">
                        <div className="bg-black/60 border border-purple-500/30 p-2 text-center min-w-[80px]">
                             <p className="font-mono font-bold text-2xl text-white leading-none">{towerProgress.currentFloor}</p>
                             <p className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">FLOOR</p>
                        </div>
                         <div className="bg-black/60 border border-purple-500/30 p-2 text-center min-w-[80px]">
                             <p className="font-mono font-bold text-2xl text-white leading-none">{towerProgress.highestFloor}</p>
                             <p className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">RECORD</p>
                        </div>
                         <div className="bg-black/60 border border-yellow-500/30 p-2 text-center min-w-[80px]">
                            <div className="flex items-center justify-center gap-1">
                                 <Ticket className="h-4 w-4 text-yellow-500" />
                                <p className="font-mono font-bold text-2xl text-white leading-none">{towerProgress.tower_tickets || 0}</p>
                            </div>
                             <p className="text-[10px] font-mono text-yellow-500 uppercase tracking-wider">TICKETS</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <ScrollArea className="flex-grow z-10 -mx-4 px-4">
                <div className="relative flex flex-col items-center max-w-4xl mx-auto pb-10">
                    
                    {/* Future floor */}
                    <div className="text-center text-purple-500/20 mb-8 animate-pulse">
                        <ArrowUpCircle className="h-10 w-10 mx-auto mb-2"/>
                        <p className="font-mono font-bold text-lg uppercase tracking-widest">FLOOR {towerProgress.currentFloor + 1}</p>
                        <p className="font-mono text-xs">[LOCKED]</p>
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
                                    <Progress value={floorProgress} className="h-2 bg-purple-950/50 border border-purple-900/50 [&>div]:bg-purple-500" />
                                    <p className="text-center text-[10px] font-mono text-purple-500/60 uppercase mt-1">{completedChallengesOnFloor}/{requiredToAdvance} OBJECTIVES CLEARED</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {isLockedOut ? (
                                    <div className="text-center p-8 bg-red-950/30 border border-red-500/50 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(220,38,38,0.05)_10px,rgba(220,38,38,0.05)_20px)]" />
                                        <Lock className="h-16 w-16 text-red-500 mx-auto mb-4 animate-pulse"/>
                                        <h3 className="text-red-500 font-mono font-bold text-xl uppercase tracking-widest mb-1">SYSTEM LOCKOUT</h3>
                                        <p className="text-red-400/60 font-mono text-xs uppercase mb-4">You have been defeated. Recovery protocol active.</p>
                                        <div className="inline-block px-4 py-2 bg-red-900/20 border border-red-500/30">
                                            <p className="font-mono font-bold text-red-400 text-lg">{lockoutTimeLeft}</p>
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
                                                "relative p-4 border transition-all duration-300",
                                                "bg-black/60",
                                                isAccepted ? "border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.1)]" : "border-purple-900/30 hover:border-purple-500/50"
                                            )}>
                                                {isAccepted && <div className="absolute top-0 right-0 px-2 py-0.5 bg-purple-600 text-white text-[9px] font-mono font-bold uppercase tracking-widest">ACTIVE</div>}
                                                
                                                <div className="flex flex-col sm:flex-row gap-4">
                                                    <div className="flex-grow">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className={cn("p-1.5 border bg-black", typeInfo.borderColor, typeInfo.color)}>
                                                                <ChallengeIcon className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-white font-mono uppercase tracking-wide text-sm">{challenge.title}</h3>
                                                                <span className={cn("text-[9px] font-mono uppercase px-1.5 py-0.5 border bg-black/50", typeInfo.borderColor, typeInfo.color)}>{typeInfo.label} QUEST</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-purple-200/60 text-xs font-mono pl-10 border-l border-purple-500/20">{challenge.description}</p>
                                                    </div>
                                                    
                                                    <div className="flex flex-col items-start sm:items-end gap-3 flex-shrink-0 min-w-[120px]">
                                                        <div className="flex flex-col gap-1 w-full">
                                                            <div className="flex justify-between items-center text-xs font-mono bg-purple-950/30 px-2 py-1 border border-purple-500/20 text-purple-300">
                                                                <span>XP</span>
                                                                <span className="font-bold">{challenge.rewards.xp}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-xs font-mono bg-yellow-950/30 px-2 py-1 border border-yellow-500/20 text-yellow-500">
                                                                <span>FRAGS</span>
                                                                <span className="font-bold">{challenge.rewards.fragments}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        {!isAccepted && (
                                                            <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs uppercase tracking-wider rounded-none h-8" onClick={() => handleAcceptChallenge(challenge)} disabled={(towerProgress.tower_tickets || 0) <= 0}>
                                                                ACCEPT
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                {isAccepted && (
                                                    <div className="mt-4 pt-3 border-t border-purple-500/20">
                                                        <div className="flex justify-between text-[10px] font-mono text-purple-400 uppercase mb-1">
                                                            <span>COMPLETION</span>
                                                            {challenge.timeLimit && (
                                                                <span className="text-red-400 animate-pulse">{challenge.timeLimit}H REMAINING</span>
                                                            )}
                                                        </div>
                                                        <Progress value={progress} className="h-1.5 bg-purple-950/50 border border-purple-500/30 [&>div]:bg-purple-500" />
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="text-center py-12 border border-purple-900/30 border-dashed bg-purple-950/10">
                                        <AlertTriangle className="h-8 w-8 text-purple-500/30 mx-auto mb-2" />
                                        <p className="font-mono text-purple-500/50 text-xs uppercase tracking-widest">NO ACTIVE SIGNALS</p>
                                    </div>
                                )}
                            </div>

                            {!isLockedOut && (
                                <div className="mt-6 pt-4 border-t border-purple-500/30">
                                    <Button 
                                        onClick={handleGenerateChallenge} 
                                        disabled={isLoadingChallenge || !canGenerateChallenge}
                                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-mono uppercase tracking-[0.15em] h-12 rounded-none relative group overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                        {isLoadingChallenge ? (
                                            <span className="flex items-center gap-2"><LoaderCircle className="animate-spin h-4 w-4" /> SCANNING...</span>
                                        ) : (
                                            <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> {availableChallenges.length > 0 ? 'REROLL OBJECTIVE' : 'GENERATE DAILY CHALLENGE'}</span>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                     {/* Past floors */}
                    {Array.from({ length: Math.min(3, towerProgress.currentFloor - 1) }, (_, i) => towerProgress.currentFloor - 1 - i).map(floorNum => (
                         <div key={floorNum} className="text-center text-purple-500/20 opacity-50 mt-8 grayscale">
                            <CheckCircle className="h-6 w-6 mx-auto mb-1"/>
                            <p className="font-mono text-sm uppercase tracking-widest">FLOOR {floorNum} CLEARED</p>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};

export default TowerView;
