"use client";

import React, { memo, useState, useMemo, useRef, useEffect, useCallback } from 'react';
// Temporarily commenting out Ionic imports due to compatibility issues
// import {
//   IonPage,
//   IonHeader,
//   IonToolbar,
//   IonTitle,
//   IonContent,
//   IonRefresher,
//   IonRefresherContent,
//   RefresherEventDetail,
//   IonCard,
//   IonCardHeader,
//   IonCardTitle,
//   IonCardContent,
//   IonIcon,
//   IonButton,
//   IonText,
//   IonButtons,
//   IonMenuButton,
//   IonSearchbar,
//   IonSegment,
//   IonSegmentButton,
//   IonLabel,
//   IonBadge,
//   IonFab,
//   IonFabButton,
//   IonRippleEffect,
//   IonItem,
//   IonReorder,
//   IonReorderGroup,
//   IonItemSliding,
//   IonItemOptions,
//   IonItemOption
// } from '@ionic/react';
import { add, funnel, options, refresh, search, filter, checkmarkCircle, time, flame, star, chevronForward } from 'ionicons/icons';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
    Target, 
    Zap, 
    Star, 
    Clock, 
    Lock, 
    ChevronRight, 
    Eye, 
    EyeOff, 
    RefreshCw, 
    History, 
    CheckCircle, 
    Loader2, 
    GitMerge, 
    Wand2, 
    Search,
    Flame,
    ShieldAlert,
    PlusCircle,
    LoaderCircle,
    BookOpen,
    Skull
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MissionDetailsDialog } from './missions/MissionDetailsDialog';
import { MissionCompletionAnimation } from './missions/MissionCompletionAnimation';
import { MissionStatsPanel } from './missions/MissionStatsPanel';
import { endOfDay, differenceInDays, parseISO } from 'date-fns';

// Define RefresherEventDetail locally for now
interface RefresherEventDetail {
  complete(): void;
}

const MissionsMobileComponent = () => {
    const { profile, missions, metas, completeMission, adjustDailyMission, generatePendingDailyMissions, generatingMission, setGeneratingMission, missionFeedback, addDailyMission, persistData } = usePlayerDataContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('active'); // 'active', 'completed'
    const [selectedMission, setSelectedMission] = useState<any>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showStatsPanel, setShowStatsPanel] = useState(false);
    const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
    const [priorityMissions, setPriorityMissions] = useState<Set<string | number>>(new Set());
    const [isPullToRefresh, setIsPullToRefresh] = useState(false);
    const [pullToRefreshThreshold, setPullToRefreshThreshold] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
    const [showProgressionTree, setShowProgressionTree] = useState(false);
    const [selectedGoalMissions, setSelectedGoalMissions] = useState<any[]>([]);
    const [timeUntilMidnight, setTimeUntilMidnight] = useState('');
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const startY = useRef<number>(0);
    const currentY = useRef<number>(0);
    const { toast } = useToast();

    // Animation state
    const [animationState, setAnimationState] = useState({
        showAnimation: false,
        missionName: '',
        xpGained: 0,
        fragmentsGained: 0,
        levelUp: false,
        newLevel: 0
    });

    useEffect(() => {
        const calculateTimeUntilMidnight = () => {
            const now = new Date();
            const midnight = endOfDay(now);
            const diff = midnight.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeUntilMidnight('00:00:00');
                return;
            }

            const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
            const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
            const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

            setTimeUntilMidnight(`${hours}:${minutes}:${seconds}`);
        };

        calculateTimeUntilMidnight();
        const timerId = setInterval(calculateTimeUntilMidnight, 1000);
        return () => clearInterval(timerId);
    }, []);

    // Native haptic feedback with enhanced patterns
    const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            const patterns = { 
                light: 50, 
                medium: 100, 
                heavy: 200,
                success: [50, 50, 100],
                warning: [100, 50, 100],
                error: [200, 100, 200]
            };
            navigator.vibrate(patterns[type]);
        }
    }, []);

    const handleGenerateMissions = async () => {
        if (generatingMission) return;
        triggerHapticFeedback('medium');
        if (generatePendingDailyMissions) {
            try {
                await generatePendingDailyMissions();
                toast({ title: "Protocolo Iniciado", description: "O Sistema está forjando novas missões." });
            } catch (err) {
                toast({ variant: 'destructive', title: "Erro de Sistema", description: "Falha ao gerar missões." });
            }
        }
    };

    const handleAddManualMission = () => {
        triggerHapticFeedback('medium');
        const newManualMission = {
            id: `manual_${Date.now()}`,
            nome: 'Nova Missão Manual',
            descricao: 'Descreva sua missão...',
            xp_conclusao: 10,
            fragmentos_conclusao: 1,
            concluido: false,
            rank: 'E',
            isManual: true,
            subTasks: []
        };
        setSelectedMission(newManualMission);
        setShowDetails(true);
    };

    const handleSaveManualMission = (missionData: any) => {
        const manualMissions = profile.manual_missions || [];
        let updatedMissions;

        const exists = manualMissions.some((m: any) => m.id === missionData.id);

        if (exists) {
            updatedMissions = manualMissions.map((m: any) => m.id === missionData.id ? missionData : m);
        } else {
            updatedMissions = [...manualMissions, missionData];
        }
        
        persistData('profile', { ...profile, manual_missions: updatedMissions });
        setShowDetails(false);
        setSelectedMission(null);
        toast({ title: 'Missão Salva', description: 'Dados da missão manual atualizados.' });
    };

    const handleDeleteManualMission = (missionId: string | number) => {
        const updatedMissions = (profile.manual_missions || []).filter((m: any) => m.id !== missionId);
        persistData('profile', { ...profile, manual_missions: updatedMissions });
        setShowDetails(false);
        setSelectedMission(null);
        toast({ title: 'Missão Removida', description: 'Missão manual excluída do registro.' });
    };

    const handleUnlockMission = async (mission: any) => {
        if (!mission) return;
        setGeneratingMission(mission.id);
        try {
            const meta = metas.find((m: any) => m.nome === mission.meta_associada);
            const history = mission.missoes_diarias?.filter((d: any) => d.concluido).map((d: any) => `- ${d.nome}`).join('\n') || '';

            let feedbackForAI = missionFeedback?.[mission.id];
            if (!feedbackForAI) {
                if (mission.concluido) {
                    feedbackForAI = `A missão anterior "${mission.nome}" foi concluída, mas a geração da próxima falhou. Gere uma nova missão diária que continue a progressão do Caçador.`;
                } else {
                    feedbackForAI = `Esta é uma missão de qualificação para um rank superior. Gere uma missão diária desafiadora, mas alcançável, para provar que o Caçador está pronto para este novo nível de dificuldade.`;
                }
            }

            const response = await fetch('/api/generate-mission', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rankedMissionName: mission.nome,
                    metaName: meta?.nome || "Objetivo geral",
                    goalDeadline: meta?.prazo,
                    history: history || `O utilizador está a tentar uma missão de rank superior.`,
                    userLevel: profile.nivel,
                    feedback: feedbackForAI,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch from API');
            }

            const result = await response.json();

            if (!result.nextMissionName || !result.nextMissionDescription || !result.subTasks || result.subTasks.length === 0) {
                throw new Error('Resposta da API incompleta. Tente novamente.');
            }

            const validSubTasks = result.subTasks.filter((st: any) =>
                st.name && st.name.trim().length > 0 &&
                st.target && st.target > 0
            );

            if (validSubTasks.length === 0) {
                throw new Error('Missão gerada sem sub-tarefas válidas. Tente novamente.');
            }

            const newDailyMission = {
                id: Date.now(),
                nome: result.nextMissionName,
                descricao: result.nextMissionDescription,
                xp_conclusao: result.xp || 15,
                fragmentos_conclusao: result.fragments || 2,
                concluido: false,
                tipo: 'diaria',
                learningResources: result.learningResources || [],
                subTasks: validSubTasks.map((st: any) => ({ ...st, current: 0, unit: st.unit || '' })),
            };

            addDailyMission({ rankedMissionId: mission.id, newDailyMission });
            toast({ title: "Desafio Aceite!", description: `A sua missão de qualificação "${newDailyMission.nome}" está pronta.` });
        } catch (error) {
            console.error("Unlock Error", error);
            toast({ variant: 'destructive', title: "Erro de Desbloqueio", description: 'Não foi possível gerar a missão de qualificação.' });
        } finally {
            setGeneratingMission(null);
        }
    };

    // Enhanced toggle with better feedback
    const togglePriority = useCallback((missionId: string | number) => {
        setPriorityMissions(prev => {
            const newSet = new Set(prev);
            const isAdding = !newSet.has(missionId);
            if (isAdding) {
                newSet.add(missionId);
                triggerHapticFeedback('success');
            } else {
                newSet.delete(missionId);
                triggerHapticFeedback('light');
            }
            return newSet;
        });
    }, []);

    // Enhanced pull-to-refresh with gesture detection
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const container = scrollContainerRef.current;
        if (container && container.scrollTop === 0) {
            startY.current = e.touches[0].clientY;
            setIsPullToRefresh(true);
        }
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (isPullToRefresh) {
            currentY.current = e.touches[0].clientY;
            const deltaY = currentY.current - startY.current;
            const threshold = Math.min(deltaY * 0.5, 120); // Max 120px pull
            setPullToRefreshThreshold(threshold);
        }
    }, [isPullToRefresh]);

    const handleTouchEnd = useCallback(async () => {
        if (isPullToRefresh && pullToRefreshThreshold > 60) {
            triggerHapticFeedback('medium');
            await handleRefresh({ detail: { complete: () => {} } } as CustomEvent<RefresherEventDetail>);
        }
        setIsPullToRefresh(false);
        setPullToRefreshThreshold(0);
    }, [isPullToRefresh, pullToRefreshThreshold]);

    // Swipe gesture handling for missions
    const handleMissionSwipe = useCallback((mission: any, direction: 'left' | 'right') => {
        triggerHapticFeedback('light');
        if (direction === 'right') {
            // Quick action: toggle priority
            togglePriority(mission.id);
        } else if (direction === 'left') {
            // Quick action: open details
            setSelectedMission(mission);
            setShowDetails(true);
        }
        setSwipeDirection(null);
    }, [togglePriority, triggerHapticFeedback]);

    // Show progression tree
    const handleShowProgression = useCallback((mission: any) => {
        triggerHapticFeedback('light');
        
        // Find all missions for the same goal
        const goalMissions = missions
            .filter((m: any) => m.meta_associada === mission.meta_associada)
            .sort((a: any, b: any) => {
                const rankOrder = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
                return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
            });
        
        // If no missions found for this goal, show only the current mission
        if (goalMissions.length === 0) {
            setSelectedGoalMissions([mission]);
        } else {
            setSelectedGoalMissions(goalMissions);
        }
        
        setShowProgressionTree(true);
    }, [missions, triggerHapticFeedback]);

    // Enhanced refresh with better loading states
    const handleRefresh = useCallback(async (event: CustomEvent<RefresherEventDetail>) => {
        setIsRefreshing(true);
        triggerHapticFeedback('medium');

        // Simulate data refresh with staggered loading
        await new Promise(resolve => setTimeout(resolve, 1200));

        setLastRefreshTime(Date.now());
        setIsRefreshing(false);
        event.detail.complete();
        triggerHapticFeedback('success');
    }, []);

    const visibleMissions = useMemo(() => {
        if (!missions) return [];
        
        const rankOrder = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
        const activeEpicMissions = new Map<string, any>();

        // Lógica de "Uma por Meta": Pegar apenas a missão de menor rank ativa para cada meta
        for (const mission of missions) {
            if (mission.concluido) continue;

            // EXCEÇÃO: Missões do Demon Castle sempre aparecem
            if (mission.tipo === 'demon_castle') {
                activeEpicMissions.set(`demon_${mission.id}`, mission);
                continue;
            }

            const existingMissionForGoal = activeEpicMissions.get(mission.meta_associada);
            const currentRankIndex = existingMissionForGoal ? rankOrder.indexOf(existingMissionForGoal.rank) : -1;
            const newRankIndex = rankOrder.indexOf(mission.rank);

            if (!existingMissionForGoal || newRankIndex < currentRankIndex) {
                activeEpicMissions.set(mission.meta_associada, mission);
            }
        }

        const manualMissions = (profile?.manual_missions || []).map((m: any) => ({ ...m, isManual: true, rank: 'M' }));
        const completedEpicMissions = missions.filter((m: any) => m.concluido);
        
        let missionsToDisplay = [];
        if (statusFilter === 'active') {
            const stuckCompletedMissions = missions.filter((m: any) => 
                m.concluido && !m.missoes_diarias?.some((dm: any) => !dm.concluido)
            );
            missionsToDisplay = [...Array.from(activeEpicMissions.values()), ...manualMissions.filter((m: any) => !m.concluido), ...stuckCompletedMissions];
        } else if (statusFilter === 'completed') {
            missionsToDisplay = [...completedEpicMissions, ...manualMissions.filter((m: any) => m.concluido)];
        } else {
            missionsToDisplay = [...Array.from(activeEpicMissions.values()), ...completedEpicMissions, ...manualMissions];
        }

        if (searchTerm) {
            missionsToDisplay = missionsToDisplay.filter((m: any) => 
                m.nome.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Ordenação consistente
        missionsToDisplay.sort((a, b) => {
            // 1. Demon Castle vem primeiro (Destaque absoluto)
            const aDemon = a.tipo === 'demon_castle';
            const bDemon = b.tipo === 'demon_castle';
            if (aDemon !== bDemon) return aDemon ? -1 : 1;

            // 2. Prioridade manual do usuário
            const aPriority = priorityMissions.has(a.id);
            const bPriority = priorityMissions.has(b.id);
            if (aPriority !== bPriority) return aPriority ? -1 : 1;
            
            // 3. Status de conclusão
            if (a.concluido !== b.concluido) return a.concluido ? 1 : -1;
            
            // 4. Rank
            return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
        });

        return missionsToDisplay;
    }, [missions, profile?.manual_missions, statusFilter, searchTerm, priorityMissions]);

    const getRankColor = (rank: string) => {
        switch (rank) {
            case 'F': return 'text-gray-400 border-gray-500';
            case 'E': return 'text-green-400 border-green-500';
            case 'D': return 'text-cyan-400 border-cyan-500';
            case 'C': return 'text-blue-400 border-blue-500';
            case 'B': return 'text-purple-400 border-purple-500';
            case 'A': return 'text-red-400 border-red-500';
            case 'S': return 'text-yellow-400 border-yellow-500';
            case 'SS': return 'text-orange-400 border-orange-500';
            case 'SSS': return 'text-pink-400 border-pink-500';
            case 'M': return 'text-slate-400 border-slate-500';
            default: return 'text-gray-500 border-gray-500';
        }
    };

    // Loading skeleton component
    const MissionSkeleton = () => (
        <div className="rounded-xl overflow-hidden bg-gradient-to-br from-black/70 to-black/50 backdrop-blur-md border border-blue-900/50">
            <div className="flex">
                <div className="w-2 bg-blue-500/30 animate-pulse" />
                <div className="p-3 sm:p-4 flex-1">
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0 pr-1.5 sm:pr-2">
                            <Skeleton className="h-5 w-3/4 mb-2" />
                            <div className="flex gap-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-12" />
                            </div>
                        </div>
                        <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl" />
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 p-3 sm:p-4 rounded-xl border border-yellow-500/20">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <Skeleton className="w-6 h-6 rounded-lg" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-4 w-full mb-3" />
                        <div className="space-y-2 sm:space-y-3">
                            <div className="space-y-1.5 sm:space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-3 w-8" />
                                </div>
                                <Skeleton className="h-1.5 sm:h-2 w-full rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pr-3 sm:pr-4 flex items-center">
                    <Skeleton className="h-4 w-4" />
                </div>
            </div>
        </div>
    );

    if (!profile) {
        return (
             <div className="flex h-full flex-col items-center justify-center p-8 gap-6 bg-background">
                <MissionSkeleton />
                <MissionSkeleton />
                <MissionSkeleton />
            </div>
        );
    }

    return (
        <div className="h-screen bg-black overflow-hidden flex flex-col max-w-full relative">
            {/* Background System Effect */}
            <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-[0.03] pointer-events-none z-50" />
            
            <header className="bg-black/90 backdrop-blur-2xl border-b border-blue-500/20 flex-shrink-0 z-40 pt-safe">
                <div className="px-4 py-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-cinzel text-white tracking-[0.2em] text-xl font-bold drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                                QUEST LOG
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <div className={cn("h-2 w-2 rounded-full animate-pulse", isRefreshing ? "bg-blue-500" : "bg-blue-400")} />
                                <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400/80 font-bold">
                                    {isRefreshing ? 'SYNCING...' : `${visibleMissions.length} MISSIONS`}
                                </span>
                                <span className="text-[10px] font-mono text-blue-500/60 mx-1">|</span>
                                <Clock className="h-3 w-3 text-blue-500" />
                                <span className="text-[10px] font-mono text-blue-300 tabular-nums">{timeUntilMidnight}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowStatsPanel(!showStatsPanel)}
                                className="text-blue-400 p-3 rounded-2xl border-2 border-blue-500/20 bg-blue-500/5 active:bg-blue-500/20 shadow-lg transition-all"
                            >
                                {showStatsPanel ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                            </button>
                            <button 
                                onClick={handleGenerateMissions}
                                disabled={!!generatingMission}
                                className={cn(
                                    "text-blue-400 p-3 rounded-2xl border-2 border-blue-500/20 bg-blue-500/5 active:bg-blue-500/20 shadow-lg transition-all",
                                    generatingMission && "opacity-50 grayscale animate-pulse"
                                )}
                            >
                                <Wand2 className={cn("h-6 w-6", generatingMission && "animate-spin-slow")} />
                            </button>
                        </div>
                    </div>

                    <Collapsible open={showStatsPanel} onOpenChange={setShowStatsPanel}>
                        <CollapsibleContent className="animate-in slide-in-from-top-2 duration-300">
                            <div className="mb-4">
                                <MissionStatsPanel />
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* Search Bar - MD3 Style */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500/50 h-5 w-5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search missions..."
                            className="w-full pl-12 pr-4 h-14 bg-blue-950/20 border border-blue-500/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-mono text-sm text-blue-100 placeholder:text-blue-500/30"
                        />
                    </div>

                    <div className="flex gap-2 p-1.5 bg-blue-950/30 border border-blue-500/10 rounded-2xl">
                        <button
                            onClick={() => setStatusFilter('active')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-mono uppercase tracking-widest transition-all",
                                statusFilter === 'active' 
                                    ? "bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-lg" 
                                    : "text-blue-500/50 hover:text-blue-400"
                            )}
                        >
                            <Zap className="h-4 w-4" />
                            Active
                        </button>
                        <button
                            onClick={() => setStatusFilter('completed')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-mono uppercase tracking-widest transition-all",
                                statusFilter === 'completed' 
                                    ? "bg-green-600/30 text-green-300 border border-green-500/40 shadow-lg" 
                                    : "text-green-500/50 hover:text-green-400"
                            )}
                        >
                            <CheckCircle className="h-4 w-4" />
                            Done
                        </button>
                    </div>
                </div>
            </header>

            <main 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-4 py-4 pb-safe bg-black relative" 
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="space-y-4 pb-24">
                    {visibleMissions.length === 0 ? (
                        <div className="text-center py-20 opacity-40 flex flex-col items-center">
                            <Target className="h-16 w-16 text-blue-500 mb-4" />
                            <h3 className="font-cinzel text-xl text-blue-100">NO MISSIONS FOUND</h3>
                            <p className="text-sm font-mono mt-2">Adjust your filters, Hunter.</p>
                        </div>
                    ) : (
                        visibleMissions.map((mission: any, index: number) => {
                            const isManualMission = mission.isManual;
                            const activeDaily = isManualMission ? mission : mission.missoes_diarias?.find((d: any) => !d.concluido);
                            const isPriority = priorityMissions.has(mission.id);
                            
                            // Lógica de destaque Demon Castle - Somente se o tipo for explicitamente esse
                            const isDemonCastle = mission.tipo === 'demon_castle';
                            const isEpic = !!mission.is_epic;

                            // Check for level lock (only for non-manual missions)
                            const isLocked = !isManualMission && mission.level_requirement && profile.nivel < mission.level_requirement;

                            if (isLocked) {
                                return (
                                    <div key={mission.id} className="relative border border-red-900/30 bg-red-950/10 rounded-[2rem] p-6 flex flex-col items-center text-center opacity-80 overflow-hidden">
                                        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(220,38,38,0.05)_10px,rgba(220,38,38,0.05)_20px)]" />
                                        <Lock className="h-8 w-8 text-red-500/60 mb-3 relative z-10" />
                                        <h3 className="font-mono font-bold text-red-400 uppercase tracking-widest text-sm relative z-10">{mission.nome}</h3>
                                        <div className="bg-black/40 border border-red-500/20 px-3 py-1 rounded-lg mt-3 relative z-10">
                                            <span className="text-[10px] font-mono text-red-300">REQ: LEVEL {mission.level_requirement}</span>
                                        </div>
                                        <p className="text-red-300/40 text-[10px] mt-2 font-mono uppercase tracking-wide relative z-10">Access Restricted</p>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={mission.id}
                                    className={cn(
                                        "relative border-2 rounded-[2rem] transition-all duration-300 active:scale-[0.97] overflow-hidden shadow-xl",
                                        isDemonCastle 
                                            ? "border-red-600/50 from-red-950/40 via-black to-black shadow-red-900/40 bg-gradient-to-br ring-1 ring-red-500/20" 
                                            : mission.concluido
                                                ? "border-green-900/40 opacity-70"
                                                : isPriority 
                                                    ? "border-yellow-500/60 shadow-yellow-500/10" 
                                                    : "border-blue-900/50",
                                        !isDemonCastle && "bg-gradient-to-br from-blue-950/20 to-black"
                                    )}
                                    onClick={() => {
                                        triggerHapticFeedback('light');
                                        setSelectedMission(activeDaily || mission);
                                        setShowDetails(true);
                                    }}
                                >
                                    {isDemonCastle && (
                                        <div className="absolute top-0 right-0 p-3 flex gap-1 z-20">
                                            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
                                            <span className="text-[8px] font-mono text-red-400 uppercase tracking-tighter font-bold">DEMON CASTLE EVENT</span>
                                        </div>
                                    )}
                                    <div className="flex flex-col p-5">
                                        <div className="flex gap-4 items-start mb-4">
                                            {/* Rank Badge - MD3 Style but System Theme */}
                                            <div className={cn(
                                                "flex-shrink-0 w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center bg-black/80 shadow-inner",
                                                isDemonCastle 
                                                    ? "border-red-500 shadow-red-900/50" 
                                                    : getRankColor(mission.rank).replace('text-', 'border-').replace('400', '500')
                                            )}>
                                                <span className={cn(
                                                    "font-cinzel font-black text-2xl leading-none", 
                                                    isDemonCastle ? "text-red-500" : getRankColor(mission.rank)
                                                )}>
                                                    {mission.rank}
                                                </span>
                                                <span className="text-[8px] font-mono text-gray-500 uppercase mt-1 font-bold">RANK</span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className={cn(
                                                    "font-mono font-bold text-base text-wrap leading-tight",
                                                    isDemonCastle ? "text-red-50" : "text-blue-50"
                                                )}>
                                                    {mission.nome}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    <span className={cn(
                                                        "px-2 py-0.5 border rounded-full text-[10px] font-mono font-bold uppercase",
                                                        isDemonCastle 
                                                            ? "bg-red-500/10 border-red-500/40 text-red-400" 
                                                            : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                                    )}>
                                                        {mission.meta_associada || "GENERAL"}
                                                    </span>
                                                    {isEpic && (
                                                        <span className="px-2 py-0.5 bg-red-600 border border-red-400 rounded-full text-[8px] font-mono text-white font-black animate-pulse">
                                                            EPIC
                                                        </span>
                                                    )}
                                                    {mission.concluido && (
                                                        <span className="text-[10px] font-mono text-green-400 uppercase font-bold flex items-center gap-1">
                                                            <CheckCircle className="h-3 w-3" /> VERIFIED
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                    {isDemonCastle && (
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <button 
                                                                    className="p-2 text-red-400/60 hover:text-red-400 active:scale-125 transition-transform"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <BookOpen className="h-5 w-5" />
                                                                </button>
                                                            </DialogTrigger>
                                                            <DialogContent className="bg-black/95 border-2 border-red-600/50 text-white max-w-[90vw] rounded-3xl">
                                                                <DialogHeader>
                                                                    <DialogTitle className="font-cinzel text-lg text-red-500 uppercase tracking-widest flex items-center gap-2">
                                                                        <Skull className="h-5 w-5" /> ARQUIVO SOMBRIO
                                                                    </DialogTitle>
                                                                </DialogHeader>
                                                                <div className="py-4 font-mono text-xs leading-relaxed border-t border-red-900/30 mt-2 whitespace-pre-line text-red-50/80 max-h-[50vh] overflow-y-auto">
                                                                    {mission.descricao}
                                                                </div>
                                                                <div className="bg-red-950/20 border border-red-900/30 p-3 rounded-2xl mt-2">
                                                                    <p className="text-[8px] text-red-500 uppercase font-black mb-1">PROTOCOLO DE PUNIÇÃO</p>
                                                                    <p className="text-[10px] text-red-200/60 italic">"A falha não é uma opção no Demon Castle. O Sistema cobrará seu preço em vitalidade."</p>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    )}
                                                    <button 
                                                        className={cn(
                                                            "p-2 transition-transform active:scale-125", 
                                                            isPriority ? "text-yellow-500" : (isDemonCastle ? "text-red-500/30" : "text-blue-500/30")
                                                        )}
                                                        onClick={(e) => { e.stopPropagation(); togglePriority(mission.id); }}
                                                    >
                                                        <Star className={cn("h-5 w-5", isPriority && "fill-yellow-400")} />
                                                    </button>
                                                {!isManualMission && (
                                                    <button 
                                                        className={cn(
                                                            "p-2 transition-colors",
                                                            isDemonCastle ? "text-red-500/30 hover:text-red-400" : "text-blue-500/30 hover:text-blue-400"
                                                        )}
                                                        onClick={(e) => { e.stopPropagation(); handleShowProgression(mission); }}
                                                    >
                                                        <GitMerge className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Active Content HUD */}
                                        {activeDaily && !mission.concluido && (
                                            <div className={cn(
                                                "mt-2 border rounded-2xl p-4 space-y-4 shadow-inner",
                                                isDemonCastle 
                                                    ? "bg-red-500/10 border-red-500/20" 
                                                    : "bg-blue-500/5 border-blue-500/10"
                                            )}>
                                                <div className="flex justify-between items-center">
                                                    <span className={cn(
                                                        "text-xs font-mono uppercase tracking-tighter font-bold flex items-center gap-2",
                                                        isDemonCastle ? "text-red-400" : "text-blue-400"
                                                    )}>
                                                        <Zap className="h-4 w-4" /> {isDemonCastle ? 'DEMON_CHALLENGE' : 'CURRENT_TASK'}
                                                    </span>
                                                    <span className={cn(
                                                        "text-xs font-mono px-2 py-1 rounded-lg",
                                                        isDemonCastle ? "text-red-200 bg-red-500/20" : "text-blue-200 bg-blue-500/10"
                                                    )}>{activeDaily.nome}</span>
                                                </div>
                                                
                                                {/* Progress Bars - Thick MD3 Style */}
                                                <div className="space-y-3">
                                                    {activeDaily.subTasks?.map((st: any, i: number) => (
                                                        <div key={i} className="space-y-2">
                                                            <div className="flex justify-between text-xs font-mono text-blue-100/70">
                                                                <span className="truncate pr-4 font-bold uppercase">{st.name}</span>
                                                                <span className={isDemonCastle ? "text-red-400" : "text-blue-400"}>
                                                                    {st.current || 0}/{st.target} {st.unit}
                                                                </span>
                                                            </div>
                                                            <div className={cn(
                                                                "h-3 rounded-full overflow-hidden border",
                                                                isDemonCastle ? "bg-red-950/40 border-red-500/20" : "bg-blue-950/40 border-blue-500/20"
                                                            )}>
                                                                <div
                                                                    className={cn(
                                                                        "h-full transition-all duration-1000 ease-out",
                                                                        isDemonCastle 
                                                                            ? "bg-gradient-to-r from-red-600 to-orange-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                                                                            : "bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                                    )}
                                                                    style={{ width: `${Math.min(100, ((st.current || 0) / st.target) * 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {!activeDaily && !mission.concluido && (
                                            <div className="mt-2 border-2 border-dashed border-blue-500/20 rounded-2xl p-6 flex flex-col items-center gap-2 opacity-60">
                                                <Clock className="h-8 w-8 text-blue-500/40 animate-pulse" />
                                                <span className="text-xs font-mono text-blue-500/60 uppercase font-bold tracking-widest">Awaiting system update...</span>
                                            </div>
                                        )}
                                        
                                        <div className="mt-4 flex items-center justify-end text-blue-500/40 text-xs font-mono gap-1 group-active:text-blue-400 transition-colors font-bold">
                                            TAP TO EXPAND <ChevronRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <MissionCompletionAnimation
                    isOpen={animationState.showAnimation}
                    onClose={() => setAnimationState(prev => ({ ...prev, showAnimation: false }))}
                    missionName={animationState.missionName}
                    xpGained={animationState.xpGained}
                    fragmentsGained={animationState.fragmentsGained}
                    levelUp={animationState.levelUp}
                    newLevel={animationState.newLevel}
                />

                {showDetails && selectedMission && (
                    <MissionDetailsDialog
                        isOpen={showDetails}
                        onClose={() => setShowDetails(false)}
                        mission={selectedMission}
                        isManual={!!selectedMission.isManual}
                        onContribute={async (subTask, amount, mission) => {
                             // Logic would go here or be passed
                             const rankedMission = missions.find((rm: any) => rm.missoes_diarias?.some((dm: any) => dm.id === mission.id));
                             const isManual = mission.isManual;
                             
                             if (isManual) {
                                // Manual mission update logic needs to be handled here or via context
                                // For now, assuming completeMission handles it if passed correctly, 
                                // but completeMission expects rankedMissionId
                                console.log("Manual mission update", mission);
                             } else if (rankedMission) {
                                await completeMission({
                                    rankedMissionId: rankedMission.id,
                                    dailyMissionId: mission.id,
                                    subTask,
                                    amount,
                                    feedback: null
                                });
                             }
                        }}
                        onSave={handleSaveManualMission}
                        onDelete={handleDeleteManualMission}
                        onAdjustDifficulty={(mission, feedback) => {
                             const rankedMission = missions.find((rm: any) => rm.missoes_diarias?.some((dm: any) => dm.id === mission.id));
                             if (rankedMission) {
                                adjustDailyMission(rankedMission.id, mission.id, feedback);
                             }
                        }}
                    />
                )}
            </main>

            {/* FAB for Manual Missions */}
            <button
                onClick={handleAddManualMission}
                className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 border-2 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all active:scale-90 active:bg-blue-500 flex items-center justify-center rounded-full z-40"
                style={{ bottom: 'calc(96px + env(safe-area-inset-bottom))' }}
            >
                <PlusCircle className="h-6 w-6" />
            </button>

            {/* Progression Tree Dialog - MD3 Full Width Style */}
            <Dialog open={showProgressionTree} onOpenChange={setShowProgressionTree}>
                <DialogContent className={cn("bg-black/95 border-2 border-blue-500/50 max-w-[95vw] w-full p-0 shadow-[0_0_30px_rgba(37,99,235,0.3)] backdrop-blur-xl sm:rounded-none overflow-hidden")}>
                    <DialogHeader className="p-6 border-b border-blue-900/50 bg-blue-950/20">
                        <DialogTitle className="text-white font-cinzel tracking-widest text-lg uppercase font-bold flex items-center gap-2">
                            <GitMerge className="h-5 w-5 text-blue-400" />
                            Progression Tree
                        </DialogTitle>
                        <DialogDescription className="text-blue-400/60 font-mono text-[10px] uppercase font-bold mt-1">
                            {selectedGoalMissions[0]?.meta_associada || 'Mission Sequence'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                        {selectedGoalMissions.map((m: any, i: number) => (
                            <div key={m.id} className={cn(
                                "relative border-l-2 pl-4 py-2",
                                m.concluido ? "border-green-500/50" : "border-blue-500/30"
                            )}>
                                <div className={cn(
                                    "absolute -left-[5px] top-3 w-2.5 h-2.5 rounded-full border-2",
                                    m.concluido ? "bg-black border-green-500" : "bg-black border-blue-500"
                                )} />
                                <div className={cn(
                                    "p-3 rounded-xl border",
                                    m.concluido ? "bg-green-950/10 border-green-500/20" : "bg-blue-950/10 border-blue-500/20"
                                )}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-mono text-xs font-bold text-white">{m.nome}</span>
                                        <Badge variant="outline" className={cn("text-[10px]", getRankColor(m.rank))}>{m.rank}</Badge>
                                    </div>
                                    <p className="text-[10px] text-blue-200/60 font-mono leading-tight">{m.descricao}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export const MissionsMobile = memo(MissionsMobileComponent);
