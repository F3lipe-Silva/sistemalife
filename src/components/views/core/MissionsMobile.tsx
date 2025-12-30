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
import { cn } from '@/lib/utils';
import { CheckCircle, Lock, Play, Star, Zap, Clock, Target, ChevronRight, MoreHorizontal, Edit3, Trash2, Menu, Settings, Search, History, GitMerge, PlusCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MissionDetailsDialog } from './missions/MissionDetailsDialog';
import { MissionCompletionAnimation } from './missions/MissionCompletionAnimation';
import { MissionStatsPanel } from './missions/MissionStatsPanel';

// Define RefresherEventDetail locally for now
interface RefresherEventDetail {
  complete(): void;
}

const MissionsMobileComponent = () => {
    const { profile, missions, completeMission, adjustDailyMission } = usePlayerDataContext();
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
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const startY = useRef<number>(0);
    const currentY = useRef<number>(0);

    // Animation state
    const [animationState, setAnimationState] = useState({
        showAnimation: false,
        missionName: '',
        xpGained: 0,
        fragmentsGained: 0,
        levelUp: false,
        newLevel: 0
    });

    // Native haptic feedback with enhanced patterns
    const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
        if (navigator.vibrate) {
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
        
        // Get manual missions from profile
        const manualMissions = (profile?.manual_missions || []).map((m: any) => ({ ...m, isManual: true, rank: 'M' }));
        
        // Combine epic missions and manual missions
        let allMissions = [...missions, ...manualMissions];
        
        // Apply status filter
        let filtered = allMissions;
        if (statusFilter === 'active') {
            // For active filter, include:
            // - Non-completed epic missions
            // - Non-completed manual missions  
            // - Stuck completed missions (completed but no active daily missions)
            const stuckCompletedMissions = missions.filter((m: any) => 
                m.concluido && !m.missoes_diarias?.some((dm: any) => !dm.concluido)
            );
            filtered = [
                ...allMissions.filter((m: any) => !m.concluido),
                ...stuckCompletedMissions
            ];
        } else if (statusFilter === 'completed') {
            filtered = allMissions.filter((m: any) => m.concluido);
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter((m: any) => 
                m.nome.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [missions, profile?.manual_missions, statusFilter, searchTerm]);

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
        <div className="h-screen bg-background overflow-hidden flex flex-col max-w-full">
            <header className="bg-gradient-to-b from-background via-background/95 to-background/90 backdrop-blur-xl border-b border-border/10 flex-shrink-0" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-4 min-h-[56px] sm:min-h-[64px]">
                    <button className="text-foreground p-2 sm:p-2.5 rounded-xl hover:bg-muted/10 transition-colors">
                        <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>

                    {/* Dynamic Title with Mission Count */}
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <h1 className="font-cinzel text-foreground tracking-wider text-lg sm:text-xl font-semibold">
                            MISSÕES
                        </h1>
                        <div className="flex items-center gap-1 mt-0.5">
                            <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", isRefreshing ? "bg-blue-500" : "bg-green-500")} />
                            <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: isRefreshing ? '#3b82f6' : '#22c55e' }}>
                                {isRefreshing ? 'SYNCING...' : `${visibleMissions.length} MISSIONS`}
                            </span>
                        </div>
                    </div>

                                                    <button className="text-foreground p-2 sm:p-2.5 rounded-xl hover:bg-muted/10 transition-colors" onClick={() => setShowStatsPanel(true)}>
                        <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                </div>

                {/* Native-style search and filter bar */}
                <div className="bg-gradient-to-b from-background/80 to-background/60 backdrop-blur-xl border-b border-border/5 px-3 sm:px-4 pb-3 sm:pb-4 flex-shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Buscar missões..."
                            className="w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm bg-muted/30 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-muted-foreground/60"
                            style={{
                                '--background': 'rgba(255,255,255,0.08)',
                                '--color': 'var(--foreground)',
                                '--placeholder-color': 'var(--muted-foreground)',
                            } as React.CSSProperties}
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                            aria-label="Buscar missões"
                        />
                    </div>

                    <div className="flex gap-2 mt-3 bg-muted/20 p-1.5 rounded-xl">
                        <button
                            onClick={() => setStatusFilter('active')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all",
                                statusFilter === 'active' 
                                    ? "bg-blue-500/25 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-500/20" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                            )}
                            aria-label="Mostrar missões ativas"
                            aria-pressed={statusFilter === 'active'}
                        >
                            <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden xs:inline">Ativas</span>
                            <span className="xs:hidden">A</span>
                        </button>
                        <button
                            onClick={() => setStatusFilter('completed')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all",
                                statusFilter === 'completed' 
                                    ? "bg-green-500/25 text-green-300 border border-green-500/40 shadow-lg shadow-green-500/20" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                            )}
                            aria-label="Mostrar missões concluídas"
                            aria-pressed={statusFilter === 'completed'}
                        >
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden xs:inline">Concluídas</span>
                            <span className="xs:hidden">C</span>
                        </button>
                    </div>
                </div>
            </header>

            <main 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 pb-safe bg-gradient-to-b from-background via-background to-background/95 relative" 
                style={{ '--padding-bottom': '120px' } as React.CSSProperties}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Pull-to-refresh indicator */}
                {isPullToRefresh && (
                    <div className="absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none z-10"
                        style={{ 
                            transform: `translateY(${pullToRefreshThreshold}px)`,
                            opacity: pullToRefreshThreshold / 120
                        }}
                    >
                        <div className="bg-blue-500/20 backdrop-blur-sm rounded-full p-3 border border-blue-500/30">
                            <RefreshCw className={cn(
                                "h-5 w-5 text-blue-400",
                                pullToRefreshThreshold > 60 && "animate-spin"
                            )} />
                        </div>
                    </div>
                )}

                <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2 animate-fade-in">
                    
                    {/* Missions List */}
                    {visibleMissions.length === 0 ? (
                        <div className="text-center py-12 sm:py-16 opacity-60">
                            <div className="p-4 sm:p-6 bg-gradient-to-br from-muted/20 to-muted/10 rounded-full w-fit mx-auto mb-4 sm:mb-6 border border-muted/30">
                                <Target className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
                            </div>
                            <h3 className="font-cinzel text-muted-foreground mb-3 text-lg sm:text-xl">NENHUMA MISSÃO</h3>
                            <p className="text-sm text-muted-foreground/70 max-w-xs mx-auto px-4">Não foram encontradas missões com os filtros atuais.</p>
                        </div>
                    ) : (
                        visibleMissions.map((mission: any, index: number) => {
                            // Handle different mission types
                            const isManualMission = mission.isManual;
                            const activeDaily = isManualMission ? null : mission.missoes_diarias?.find((d: any) => !d.concluido);
                            
                            return (
                                <div
                                    key={mission.id}
                                    className={cn(
                                        "rounded-xl overflow-hidden transition-all duration-300 cursor-pointer transform",
                                        "bg-gradient-to-br from-black/70 to-black/50 backdrop-blur-md border",
                                        mission.concluido
                                            ? "border-green-900/50 bg-gradient-to-br from-green-950/30 to-green-950/10 hover:scale-[1.02]"
                                            : "border-blue-900/50 hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl hover:shadow-blue-500/10"
                                    )}
                                    style={{
                                        'boxShadow': mission.concluido ? '0 8px 32px -8px rgba(34, 197, 94, 0.15)' : '0 8px 32px -8px rgba(59, 130, 246, 0.15)',
                                        'animationDelay': `${index * 50}ms`
                                    } as React.CSSProperties}
                                    onClick={() => {
                                        triggerHapticFeedback('light');
                                        setSelectedMission(activeDaily || mission);
                                        setShowDetails(true);
                                    }}
                                    onTouchStart={(e) => {
                                        startY.current = e.touches[0].clientX;
                                    }}
                                    onTouchMove={(e) => {
                                        const deltaX = e.touches[0].clientX - startY.current;
                                        if (Math.abs(deltaX) > 50) {
                                            setSwipeDirection(deltaX > 0 ? 'right' : 'left');
                                        }
                                    }}
                                    onTouchEnd={() => {
                                        if (swipeDirection) {
                                            handleMissionSwipe(mission, swipeDirection);
                                        }
                                    }}
                                >
                                    {/* Swipe indicators */}
                                    {swipeDirection && (
                                        <div className="absolute inset-0 pointer-events-none z-10">
                                            {swipeDirection === 'right' && (
                                                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-yellow-500/20 backdrop-blur-sm rounded-full p-2 border border-yellow-500/30">
                                                    <Star className="h-4 w-4 text-yellow-400" />
                                                </div>
                                            )}
                                            {swipeDirection === 'left' && (
                                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500/20 backdrop-blur-sm rounded-full p-2 border border-blue-500/30">
                                                    <ChevronRight className="h-4 w-4 text-blue-400" />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="p-0">
                                        <div className="flex">
                                            {/* Status Indicator */}
                                            <div className={cn(
                                                "w-2 flex-shrink-0 rounded-r-lg",
                                                mission.concluido ? "bg-gradient-to-b from-green-400 via-green-500 to-green-600" : "bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600"
                                            )} />

                                            <div className="p-3 sm:p-4 flex-1">
                                                {/* Header */}
                                                <div className="flex justify-between items-start mb-3 sm:mb-4">
                                                    <div className="flex-1 min-w-0 pr-1.5 sm:pr-2">
                                                        <h3 className="font-cinzel font-bold text-sm sm:text-base text-foreground leading-tight truncate">
                                                            {mission.nome}
                                                        </h3>
                                                        <div className="flex items-center gap-1 sm:gap-1.5 mt-1 flex-wrap">
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[8px] sm:text-[9px] border-muted-foreground/30 text-muted-foreground px-1 sm:px-1.5 py-0.5 bg-muted/10 max-w-[100px] sm:max-w-[120px] truncate"
                                                            >
                                                                {mission.meta_associada || "GERAL"}
                                                            </Badge>
                                                            {mission.concluido && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-[8px] sm:text-[9px] border-green-500/40 text-green-300 px-1 sm:px-1.5 py-0.5 bg-green-500/10 flex-shrink-0"
                                                                >
                                                                    <CheckCircle className="h-1.5 w-1.5 sm:h-2 sm:w-2 mr-1" />
                                                                    <span className="hidden xs:inline">CONCLUÍDA</span>
                                                                    <span className="xs:hidden">✓</span>
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className={cn(
                                                        "flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl border-2 font-black font-cinzel text-xs sm:text-sm flex-shrink-0 shadow-lg ml-1 sm:ml-2",
                                                        getRankColor(mission.rank)
                                                    )}>
                                                        {mission.rank}
                                                    </div>
                                                </div>

                                                {/* Mission Content */}
                                                {isManualMission ? (
                                                    /* Manual Mission Content */
                                                    <div className="bg-gradient-to-br from-slate-500/10 to-slate-500/5 p-3 sm:p-4 rounded-xl border border-slate-500/20 shadow-inner">
                                                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                                            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-slate-500/20 to-slate-500/10 rounded-xl border border-slate-500/30">
                                                                <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                                                            </div>
                                                            <span className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wide">Missão Manual</span>
                                                        </div>
                                                        <p className="text-xs sm:text-sm text-foreground/95 leading-snug mb-3 sm:mb-4">{mission.descricao}</p>

                                                        {/* Manual Mission Progress */}
                                                        {mission.subTasks && mission.subTasks.length > 0 && (
                                                            <div className="space-y-2 sm:space-y-3">
                                                                {mission.subTasks.map((st: any, i: number) => (
                                                                    <div key={i} className="space-y-1.5 sm:space-y-2">
                                                                        <div className="flex justify-between text-[9px] sm:text-[11px] text-muted-foreground/80">
                                                                            <span className="truncate pr-2 font-medium">{st.name}</span>
                                                                            <span className="font-mono text-foreground/60">{st.current || 0}/{st.target}</span>
                                                                        </div>
                                                                        <div className="h-1.5 sm:h-2 bg-muted/30 rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-gradient-to-r from-slate-400 via-slate-400 to-slate-300 transition-all duration-700 ease-out rounded-full shadow-sm"
                                                                                style={{ width: `${Math.min(100, ((st.current || 0) / st.target) * 100)}%` }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : activeDaily ? (
                                                    /* Epic Mission with Active Daily */
                                                    <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 p-3 sm:p-4 rounded-xl border border-yellow-500/20 shadow-inner">
                                                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                                            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 rounded-xl border border-yellow-500/30">
                                                                <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                                                            </div>
                                                            <span className="text-xs sm:text-sm font-bold text-yellow-300 uppercase tracking-wide">Missão Ativa</span>
                                                        </div>
                                                        <p className="text-xs sm:text-sm text-foreground/95 leading-snug mb-3 sm:mb-4">{activeDaily.nome}</p>

                                                        {/* Enhanced Progress Bars */}
                                                        <div className="space-y-2 sm:space-y-3">
                                                            {activeDaily.subTasks?.map((st: any, i: number) => (
                                                                <div key={i} className="space-y-1.5 sm:space-y-2">
                                                                    <div className="flex justify-between text-[9px] sm:text-[11px] text-muted-foreground/80">
                                                                        <span className="truncate pr-2 font-medium">{st.name}</span>
                                                                        <span className="font-mono text-foreground/60">{st.current || 0}/{st.target}</span>
                                                                    </div>
                                                                    <div className="h-1.5 sm:h-2 bg-muted/30 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-gradient-to-r from-yellow-400 via-yellow-400 to-yellow-300 transition-all duration-700 ease-out rounded-full shadow-sm"
                                                                            style={{ width: `${Math.min(100, ((st.current || 0) / st.target) * 100)}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* Epic Mission - No Active Daily */
                                                    <div className="flex items-center gap-3 sm:gap-4 text-muted-foreground bg-gradient-to-br from-muted/20 to-muted/10 p-3 sm:p-4 rounded-xl border border-muted/20">
                                                        <div className="p-2 sm:p-3 bg-gradient-to-br from-muted/30 to-muted/20 rounded-xl border border-muted/30">
                                                            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-xs sm:text-sm font-medium text-foreground/80">Aguardando Missão</p>
                                                            <p className="text-[10px] sm:text-xs opacity-60 mt-1">Nova missão será gerada em breve</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Indicator */}
                                            <div className="pr-3 sm:pr-4 flex items-center">
                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-1 mr-2">
                                                    {/* Priority Button */}
                                                    <button
                                                        className={cn(
                                                            "p-1.5 rounded-lg transition-colors",
                                                            priorityMissions.has(mission.id) 
                                                                ? "text-yellow-400 bg-yellow-500/20" 
                                                                : "text-muted-foreground/60 hover:text-yellow-400 hover:bg-muted/10"
                                                        )}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            togglePriority(mission.id);
                                                        }}
                                                        aria-label={priorityMissions.has(mission.id) ? "Remover prioridade" : "Adicionar prioridade"}
                                                        aria-pressed={priorityMissions.has(mission.id)}
                                                    >
                                                        <Star className={cn("h-3 w-3 sm:h-4 sm:w-4", priorityMissions.has(mission.id) && "fill-yellow-400")} />
                                                    </button>

                                                    {/* Progression Button - Only for non-manual missions */}
                                                    {!isManualMission && (
                                                        <button
                                                            className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-blue-400 hover:bg-muted/10 transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleShowProgression(mission);
                                                            }}
                                                            aria-label="Ver árvore de progressão"
                                                        >
                                                            <GitMerge className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/40 transition-transform group-hover:translate-x-1" />
                                            </div>
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
                        isManual={false} // Simplification for now
                        onContribute={async (subTask, amount, mission) => {
                             // Logic would go here or be passed
                             const rankedMission = missions.find((rm: any) => rm.missoes_diarias.some((dm: any) => dm.id === mission.id));
                             if (rankedMission) {
                                await completeMission({
                                    rankedMissionId: rankedMission.id,
                                    dailyMissionId: mission.id,
                                    subTask,
                                    amount,
                                    feedback: null
                                });
                             }
                        }}
                        onSave={() => {}}
                        onDelete={() => {}}
                        onAdjustDifficulty={(mission, feedback) => {
                             // Adjust logic
                        }}
                    />
                )}
            </main>

            {/* Progression Tree Dialog */}
            <Dialog open={showProgressionTree} onOpenChange={setShowProgressionTree}>
                <DialogContent className="max-w-[95vw] w-full max-h-[80vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="text-primary text-lg">Árvore de Progressão da Missão</DialogTitle>
                        <DialogDescription className="text-sm">
                            Esta é a sequência de missões épicas para a meta "{selectedGoalMissions[0]?.meta_associada}".
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-2 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {selectedGoalMissions.map((m: any, index: number) => (
                            <div key={m.id} className="relative">
                                {/* Connection line */}
                                {index < selectedGoalMissions.length - 1 && (
                                    <div className="absolute left-4 top-8 w-0.5 h-8 bg-gradient-to-b from-primary/30 to-muted/30" />
                                )}
                                
                                <div className={cn(
                                    `rounded-lg border-l-4 overflow-hidden relative bg-gradient-to-r`,
                                    m.concluido 
                                        ? 'border-green-500 from-green-950/20 to-transparent' 
                                        : 'border-primary from-primary/20 to-transparent',
                                    "p-3 shadow-sm"
                                )}>
                                    {/* Progress indicator */}
                                    <div className="absolute top-2 right-2">
                                        {m.concluido ? (
                                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                                        ) : (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                        )}
                                    </div>
                                    
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                `${m.concluido ? 'text-muted-foreground line-through' : 'text-foreground'}`,
                                                "font-bold text-sm leading-tight"
                                            )}>
                                                {m.nome}
                                            </p>
                                            <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                                                {m.descricao}
                                            </p>
                                        </div>
                                        <span className={cn(
                                            `text-xs font-bold px-2 py-1 rounded-full ml-2 flex-shrink-0`,
                                            getRankColor(m.rank)
                                        )}>
                                            {m.rank}
                                        </span>
                                    </div>
                                    
                                    {/* Status indicator */}
                                    <div className="flex items-center mt-2">
                                        {m.concluido ? (
                                            <div className="flex items-center text-green-400">
                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                <span className="text-xs font-medium">Concluída</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-blue-400">
                                                <Zap className="mr-1 h-3 w-3" />
                                                <span className="text-xs font-medium">Em Progresso</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Floating Action Button for Manual Missions */}
            <button
                onClick={() => {
                    triggerHapticFeedback('medium');
                    setSelectedMission(null);
                    setShowDetails(true);
                }}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group z-40 active:scale-95"
                style={{ 
                    bottom: 'calc(6px + env(safe-area-inset-bottom))',
                    right: 'calc(6px + env(safe-area-inset-right))'
                }}
                aria-label="Criar nova missão manual"
                role="button"
                tabIndex={0}
            >
                <PlusCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
        </div>
    );
};

export const MissionsMobile = memo(MissionsMobileComponent);
