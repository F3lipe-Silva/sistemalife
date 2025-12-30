"use client";

import React, { memo, useState, useMemo } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonButton,
  IonText,
  IonButtons,
  IonMenuButton,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonBadge,
  IonFab,
  IonFabButton
} from '@ionic/react';
import { add, funnel, options } from 'ionicons/icons';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { cn } from '@/lib/utils';
import { CheckCircle, Lock, Play, Star, Zap, Clock, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { MissionDetailsDialog } from './missions/MissionDetailsDialog';
import { MissionCompletionAnimation } from './missions/MissionCompletionAnimation';
import { MissionStatsPanel } from './missions/MissionStatsPanel';

const MissionsMobileComponent = () => {
    const { profile, missions, completeMission, adjustDailyMission } = usePlayerDataContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('active'); // 'active', 'completed'
    const [selectedMission, setSelectedMission] = useState<any>(null);
    const [showDetails, setShowDetails] = useState(false);
    
    // Animation state
    const [animationState, setAnimationState] = useState({
        showAnimation: false,
        missionName: '',
        xpGained: 0,
        fragmentsGained: 0,
        levelUp: false,
        newLevel: 0
    });

    const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
        setTimeout(() => {
            event.detail.complete();
        }, 1500);
    };

    const visibleMissions = useMemo(() => {
        if (!missions) return [];
        let filtered = missions;

        if (statusFilter === 'active') {
            filtered = filtered.filter((m: any) => !m.concluido);
        } else if (statusFilter === 'completed') {
            filtered = filtered.filter((m: any) => m.concluido);
        }

        if (searchTerm) {
            filtered = filtered.filter((m: any) => m.nome.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        return filtered;
    }, [missions, statusFilter, searchTerm]);

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
            default: return 'text-gray-500 border-gray-500';
        }
    };

    if (!profile) {
        return (
             <div className="flex h-full flex-col items-center justify-center p-8 gap-6 bg-background">
                <Skeleton className="w-full h-32 rounded-xl" />
                <Skeleton className="w-full h-32 rounded-xl" />
                <Skeleton className="w-full h-32 rounded-xl" />
            </div>
        );
    }

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar className="bg-background/80 backdrop-blur-md border-b border-border/20 [--background:transparent]">
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle className="font-cinzel text-foreground">MISSÕES</IonTitle>
                    <IonButtons slot="end">
                         <IonButton className="text-foreground">
                            <IonIcon icon={options} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
                <IonToolbar className="bg-background/95 backdrop-blur-xl border-b border-border/10 [--background:var(--background)] px-2 pb-2">
                    <IonSearchbar 
                        value={searchTerm} 
                        onIonInput={e => setSearchTerm(e.detail.value!)} 
                        placeholder="Buscar missões..."
                        className="text-sm pb-0"
                        style={{ '--background': 'rgba(255,255,255,0.05)', '--color': 'var(--foreground)', '--placeholder-color': 'var(--muted-foreground)', '--border-radius': '12px' }}
                    ></IonSearchbar>
                    <IonSegment value={statusFilter} onIonChange={e => setStatusFilter(e.detail.value as string)} className="mt-2" mode="ios">
                        <IonSegmentButton value="active">
                            <IonLabel>Ativas</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value="completed">
                            <IonLabel>Concluídas</IonLabel>
                        </IonSegmentButton>
                    </IonSegment>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="ion-padding">
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent></IonRefresherContent>
                </IonRefresher>

                <div className="pb-24 space-y-4 pt-2">
                    
                    {/* Missions List */}
                    {visibleMissions.length === 0 ? (
                        <div className="text-center py-10 opacity-50">
                            <Target className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                            <p>Nenhuma missão encontrada.</p>
                        </div>
                    ) : (
                        visibleMissions.map((mission: any) => {
                            const activeDaily = mission.missoes_diarias?.find((d: any) => !d.concluido);
                            return (
                                <IonCard 
                                    key={mission.id} 
                                    className={cn(
                                        "mx-0 my-3 rounded-sm overflow-hidden active:scale-98 transition-transform",
                                        "bg-black/60 backdrop-blur-sm border border-blue-900/40",
                                        mission.concluido ? "opacity-70 border-green-900/40" : ""
                                    )}
                                    style={{
                                        '--background': 'transparent',
                                        'boxShadow': 'none'
                                    }}
                                    onClick={() => {
                                        setSelectedMission(activeDaily || mission);
                                        setShowDetails(true);
                                    }}
                                >
                                    <div className="flex">
                                        {/* Rank Strip */}
                                        <div className={cn("w-1.5", mission.concluido ? "bg-green-500" : "bg-blue-500")}></div>
                                        
                                        <div className="p-4 flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex flex-col">
                                                    <h3 className="font-cinzel font-bold text-lg text-foreground leading-tight">{mission.nome}</h3>
                                                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">
                                                        {mission.meta_associada || "MISSÃO GERAL"}
                                                    </span>
                                                </div>
                                                <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg border-2 font-black font-cinzel text-sm", getRankColor(mission.rank))}>
                                                    {mission.rank}
                                                </div>
                                            </div>

                                            {activeDaily ? (
                                                <div className="mt-3 bg-black/20 p-2.5 rounded-lg border border-white/5">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Zap className="h-3 w-3 text-yellow-400" />
                                                        <span className="text-xs font-bold text-yellow-400 uppercase tracking-wide">Objetivo Atual</span>
                                                    </div>
                                                    <p className="text-sm text-foreground/90 leading-snug">{activeDaily.nome}</p>
                                                    
                                                    {/* Mini Progress */}
                                                    <div className="mt-2 flex gap-1">
                                                        {activeDaily.subTasks?.map((st: any, i: number) => (
                                                            <div key={i} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-yellow-500" 
                                                                    style={{ width: `${Math.min(100, ((st.current || 0) / st.target) * 100)}%` }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-3 flex items-center gap-2 text-muted-foreground text-xs">
                                                    <Clock className="h-3 w-3" />
                                                    <span>Aguardando nova missão diária...</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </IonCard>
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
            </IonContent>
        </IonPage>
    );
};

export const MissionsMobile = memo(MissionsMobileComponent);
