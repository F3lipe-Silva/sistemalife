"use client";

import React, { memo, useState, useMemo, useRef } from 'react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { cn } from '@/lib/utils';
import { SmartGoalWizard } from './metas/SmartGoalWizard';
import { CheckCircle, Calendar as CalendarIcon, Target, Search, Menu, Milestone, PlusCircle, ChevronRight, Clock, Wand2, Feather, Zap as ZapIcon, Map as MapIcon, Edit, Trash2, LoaderCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import { generateSimpleSmartGoal, generateGoalRoadmap } from '@/lib/ai-client';
import { generateGoalSuggestion } from '@/lib/ai-client';
import { generateSkillFromGoal } from '@/lib/ai-client';
import { generateInitialEpicMission } from '@/lib/ai-client';
import { generateUserAchievements } from '@/lib/ai-client';
import * as mockData from '@/lib/data';

const MetasMobileComponent = () => {
    const { metas, missions, profile, skills, persistData } = usePlayerDataContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [showWizard, setShowWizard] = useState(false);
    const [wizardMode, setWizardMode] = useState<'selection' | 'simple' | 'detailed'>('selection');
    const [quickGoalData, setQuickGoalData] = useState({ name: '', prazo: null });
    const [isLoading, setIsLoading] = useState(false);
    
    // Roadmap State
    const [roadmap, setRoadmap] = useState<any[] | null>(null);
    const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);
    const [roadmapMeta, setRoadmapMeta] = useState<any>(null);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [metaToEdit, setMetaToEdit] = useState<any>(null);
    
    // Sugestões
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const startY = useRef<number>(0);
    const currentY = useRef<number>(0);
    const { toast } = useToast();

    const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            const patterns = { light: 50, medium: 100, heavy: 200 };
            navigator.vibrate(patterns[type]);
        }
    };

    const handleGetRoadmap = async (meta: any) => {
        triggerHapticFeedback('medium');
        setRoadmapMeta(meta);
        setIsLoadingRoadmap(true);
        setRoadmap(null);
        try {
            const result = await generateGoalRoadmap({
                goalName: meta.nome,
                goalDetails: Object.values(meta.detalhes_smart).join(' '),
                userLevel: profile.nivel,
            });
            setRoadmap(result.roadmap);
        } catch(error: any) {
            toast({ variant: 'destructive', title: "Erro de Estratégia", description: "Não foi possível gerar o roadmap." });
            setRoadmapMeta(null);
        } finally {
            setIsLoadingRoadmap(false);
        }
    };

    const handleOpenEditDialog = (meta: any) => {
        triggerHapticFeedback('light');
        setMetaToEdit({ ...meta });
        setIsEditing(true);
    };
    
    const handleCloseEditDialog = () => {
        setIsEditing(false);
        setMetaToEdit(null);
    };

    const handleSaveEditedGoal = () => {
        if (!metaToEdit) return;
        handleSaveMeta(metaToEdit);
        handleCloseEditDialog();
    };

    const handleDelete = async (id: number) => {
        triggerHapticFeedback('heavy');
        const metaToDelete = metas.find((m: any) => m.id === id);
        if (metaToDelete) {
            await persistData('missions', missions.filter((mission: any) => mission.meta_associada !== metaToDelete.nome));
            await persistData('metas', metas.filter((m: any) => m.id !== id));
            if (metaToDelete.habilidade_associada_id) {
                await persistData('skills', skills.filter((s: any) => s.id !== metaToDelete.habilidade_associada_id));
            }
            toast({ title: "Meta Eliminada", description: `A meta "${metaToDelete.nome}" foi removida.` });
        }
    };

    const handleSaveMeta = async (newOrUpdatedMeta: any) => {
        setIsLoading(true);
        try {
            const isEditingGoal = !!(newOrUpdatedMeta.id && metas.some((m: any) => m.id === newOrUpdatedMeta.id));

            if (isEditingGoal) {
                const metaOriginal = metas.find((m: any) => m.id === newOrUpdatedMeta.id);
                const updatedMetas = metas.map((m: any) => m.id === newOrUpdatedMeta.id ? { ...m, ...newOrUpdatedMeta } : m);
                
                let updatedMissions = [...missions];
                if (metaOriginal && metaOriginal.nome !== newOrUpdatedMeta.nome) {
                    updatedMissions = missions.map((mission: any) => 
                        mission.meta_associada === metaOriginal.nome 
                        ? { ...mission, meta_associada: newOrUpdatedMeta.nome }
                        : mission
                    );
                }
                
                if (metaOriginal && metaOriginal.nome !== newOrUpdatedMeta.nome && newOrUpdatedMeta.habilidade_associada_id) {
                     const newSkills = skills.map((s: any) => 
                        s.id === newOrUpdatedMeta.habilidade_associada_id 
                        ? {...s, nome: `Maestria em ${newOrUpdatedMeta.nome}`} 
                        : s
                    );
                    await persistData('skills', newSkills);
                }

                await persistData('missions', updatedMissions);
                await persistData('metas', updatedMetas);
                toast({ title: "Meta Atualizada!", description: "A sua meta foi atualizada com sucesso." });
            } else {
                // Logic for new meta
                const goalDescription = Object.values(newOrUpdatedMeta.detalhes_smart).join(' ');
                const skillResult = await generateSkillFromGoal({
                    goalName: newOrUpdatedMeta.nome,
                    goalDescription: goalDescription,
                    existingCategories: mockData.categoriasMetas
                });

                const newSkillId = Date.now();
                const newSkill = {
                    id: newSkillId,
                    nome: skillResult.skillName,
                    descricao: skillResult.skillDescription,
                    categoria: skillResult.skillCategory,
                    nivel_atual: 1,
                    nivel_maximo: 10,
                    xp_atual: 0,
                    xp_para_proximo_nivel: 50,
                };
                
                const newMetaWithId = { 
                    ...newOrUpdatedMeta, 
                    id: Date.now() + 1, 
                    concluida: false, 
                    user_id: profile.id, 
                    habilidade_associada_id: newSkillId
                };
                
                const initialMissionResult = await generateInitialEpicMission({
                    goalName: newMetaWithId.nome,
                    goalDetails: JSON.stringify(newMetaWithId.detalhes_smart),
                    userLevel: profile.nivel,
                });

                const newMissions = (initialMissionResult.progression || []).map((epicMission: any, index: number) => {
                    const isFirstMission = index === 0;
                    return {
                        id: Date.now() + index + 2,
                        nome: epicMission.epicMissionName,
                        descricao: epicMission.epicMissionDescription,
                        concluido: false,
                        rank: epicMission.rank,
                        level_requirement: 1, 
                        meta_associada: newMetaWithId.nome,
                        total_missoes_diarias: 10, 
                        ultima_missao_concluida_em: null,
                        missoes_diarias: isFirstMission ? [{
                            id: Date.now() + (initialMissionResult.progression?.length || 0) + 3,
                            nome: initialMissionResult.firstDailyMissionName,
                            descricao: initialMissionResult.firstDailyMissionDescription,
                            xp_conclusao: initialMissionResult.firstDailyMissionXp,
                            fragmentos_conclusao: initialMissionResult.firstDailyMissionFragments,
                            concluido: false,
                            tipo: 'diaria',
                            subTasks: initialMissionResult.firstDailyMissionSubTasks,
                        }] : [],
                    };
                });
                
                await persistData('skills', [...skills, newSkill]);
                await persistData('metas', [...metas, newMetaWithId]);
                await persistData('missions', [...missions, ...newMissions]);
                
                toast({ title: "Meta Forjada!", description: "Seu novo objetivo e missão inicial estão prontos." });
            }
            
            handleCloseWizard();
        } catch (err) {
            toast({ variant: 'destructive', title: "Erro de Forja", description: "O Sistema falhou em processar a meta." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetSuggestions = async () => {
        triggerHapticFeedback('medium');
        setIsLoadingSuggestions(true);
        setShowSuggestions(true);
        try {
            const result = await generateGoalSuggestion({
                userLevel: profile.nivel,
                existingGoals: metas.map((m: any) => m.nome),
                userInterests: profile.interests || []
            });
            setSuggestions(result.suggestions || []);
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro de Sugestão", description: "Não foi possível gerar sugestões." });
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const handleSelectSuggestion = async (suggestionName: string) => {
        triggerHapticFeedback('light');
        setShowSuggestions(false);
        setQuickGoalData({ ...quickGoalData, name: suggestionName });
        setWizardMode('simple');
        setShowWizard(true);
    };

    const handleCreateSimpleGoal = async () => {
        if (!quickGoalData.name.trim()) return;
        setIsLoading(true);
        try {
            const { refinedGoal } = await generateSimpleSmartGoal({ goalName: quickGoalData.name });
            await handleSaveMeta({
                id: null,
                nome: refinedGoal.name,
                categoria: 'Desenvolvimento Pessoal', 
                prazo: quickGoalData.prazo,
                concluida: false,
                detalhes_smart: refinedGoal,
                user_id: profile.id
            });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro de IA", description: "Falha ao processar meta rápida." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenWizard = () => {
        triggerHapticFeedback('medium');
        setWizardMode('selection');
        setShowWizard(true);
    };

    const handleCloseWizard = () => {
        setShowWizard(false);
        setWizardMode('selection');
    };

    // Swipe and Pull-to-refresh logic
    const handleTouchStart = (e: React.TouchEvent) => {
        startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        currentY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
        if (currentY.current - startY.current > 150 && scrollContainerRef.current?.scrollTop === 0) {
            triggerHapticFeedback('medium');
            toast({ title: "Sincronizando...", description: "Atualizando objetivos do sistema." });
        }
    };

    const sortedMetas = useMemo(() => {
        if (!metas) return [];
        let filtered = [...metas];
        
        if (searchTerm) {
            filtered = filtered.filter((m: any) => m.nome.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        return filtered.sort((a: any, b: any) => (a.concluida ? 1 : -1) - (b.concluida ? 1 : -1) || a.nome.localeCompare(b.nome));
    }, [metas, searchTerm]);

    if (!metas) {
        return (
             <div className="flex h-screen flex-col items-center justify-center p-8 gap-6 bg-black">
                <Skeleton className="w-full h-48 rounded-[2.5rem] bg-blue-900/20" />
                <Skeleton className="w-full h-48 rounded-[2.5rem] bg-blue-900/20" />
            </div>
        );
    }

    const renderWizardContent = () => {
        switch (wizardMode) {
            case 'selection':
                return (
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            <button 
                                onClick={() => setWizardMode('simple')}
                                className="group relative border-2 border-blue-900/40 bg-blue-950/10 p-6 rounded-3xl transition-all active:scale-95 text-left overflow-hidden"
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center shadow-inner">
                                        <Feather className="text-cyan-400 w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white font-mono uppercase tracking-widest text-base">QUICK MODE</h3>
                                        <p className="text-blue-100/40 text-[10px] font-mono leading-tight mt-1 uppercase">Rapid deployment. AI generates parameters.</p>
                                    </div>
                                </div>
                            </button>

                            <button 
                                onClick={() => setWizardMode('detailed')}
                                className="group relative border-2 border-blue-900/40 bg-blue-950/10 p-6 rounded-3xl transition-all active:scale-95 text-left overflow-hidden"
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center shadow-inner">
                                        <ZapIcon className="text-purple-400 w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white font-mono uppercase tracking-widest text-base">DETAILED MODE</h3>
                                        <p className="text-blue-100/40 text-[10px] font-mono leading-tight mt-1 uppercase">Full calibration. SMART analysis protocol.</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                );
            case 'detailed':
                return (
                    <div className="h-full">
                        <SmartGoalWizard
                            onClose={handleCloseWizard}
                            onSave={(meta) => {
                                console.log("Saving detailed meta", meta);
                                handleCloseWizard();
                            }}
                            metaToEdit={null}
                            profile={profile}
                        />
                    </div>
                );
            case 'simple':
                return (
                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest font-bold ml-2">Objective Name</label>
                                <input 
                                    className="w-full h-14 bg-blue-950/20 border-2 border-cyan-900/30 rounded-2xl px-6 text-white font-mono focus:outline-none focus:border-cyan-500 transition-all uppercase"
                                    placeholder="EX: MASTER SWORDSMANSHIP"
                                    value={quickGoalData.name}
                                    onChange={(e) => setQuickGoalData({...quickGoalData, name: e.target.value})}
                                    disabled={isLoading}
                                />
                            </div>
                            <button 
                                className="w-full py-4 bg-cyan-600 text-white font-mono font-bold rounded-2xl shadow-lg border-2 border-cyan-400 active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50"
                                onClick={handleCreateSimpleGoal}
                                disabled={isLoading || !quickGoalData.name.trim()}
                            >
                                {isLoading ? 'FORGING...' : 'INITIATE_FORGE'}
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="h-screen bg-black overflow-hidden flex flex-col max-w-full relative">
            {/* Background System Effect */}
            <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-[0.03] pointer-events-none z-50" />
            
            <header className="bg-black/90 backdrop-blur-2xl border-b border-blue-500/20 flex-shrink-0 z-40" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
                {/* System Alert Bar */}
                <div className="flex items-center justify-between bg-blue-950/40 border-b border-blue-900/30 py-2.5 px-4">
                    <div className="flex items-center gap-3">
                        <Target className="h-4 w-4 text-blue-400 animate-pulse" />
                        <span className="font-mono text-[10px] text-blue-300 uppercase tracking-[0.2em] font-bold">
                            OBJECTIVE_SYNC: <span className="text-white">ACTIVE</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]" />
                        <span className="font-mono text-[10px] text-blue-400 font-bold tracking-wider uppercase">Tracking</span>
                    </div>
                </div>

                <div className="px-4 py-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-cinzel text-white tracking-widest text-2xl font-bold drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]">
                                SYSTEM <span className="text-blue-400">METAS</span>
                            </h1>
                            <p className="text-blue-300/60 font-mono text-[10px] tracking-[0.15em] mt-1 font-bold uppercase">
                                LONG_TERM_ACQUISITION
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleGetSuggestions}
                                className="text-blue-400 p-3 rounded-2xl border-2 border-blue-500/20 bg-blue-500/5 active:bg-blue-500/20 shadow-lg"
                            >
                                <Wand2 className="h-6 w-6" />
                            </button>
                            <button 
                                onClick={() => triggerHapticFeedback('medium')}
                                className="text-blue-400 p-3 rounded-2xl border-2 border-blue-500/20 bg-blue-500/5 active:bg-blue-500/20 shadow-lg"
                            >
                                <Menu className="h-7 w-7" />
                            </button>
                        </div>
                    </div>

                    {/* Search Bar - MD3 Style */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500/50 h-5 w-5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Filter objectives..."
                            className="w-full pl-12 pr-4 h-14 bg-blue-950/20 border border-blue-500/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-mono text-sm text-blue-100 placeholder:text-blue-500/30"
                        />
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
                <div className="flex flex-col gap-5 pb-32 animate-fade-in">
                    {sortedMetas.length === 0 ? (
                        <div className="text-center py-20 opacity-40 flex flex-col items-center">
                            <Target className="h-16 w-16 text-blue-500 mb-4" />
                            <h3 className="font-cinzel text-xl text-blue-100 uppercase tracking-widest">NO_OBJECTIVES_FOUND</h3>
                            <p className="text-sm font-mono mt-2 uppercase">Initiate target protocols, Hunter.</p>
                        </div>
                    ) : (
                        sortedMetas.map((meta: any) => {
                            const relatedMissions = missions.filter((m: any) => m.meta_associada === meta.nome);
                            const completedMissionsCount = relatedMissions.filter((m: any) => m.concluido).length;
                            const totalMissionsCount = relatedMissions.length;
                            const progress = totalMissionsCount > 0 ? (completedMissionsCount / totalMissionsCount) * 100 : (meta.concluida ? 100 : 0);

                            return (
                                <div 
                                    key={meta.id} 
                                    className={cn(
                                        "relative border-2 rounded-[2.5rem] transition-all duration-300 active:scale-[0.97] overflow-hidden shadow-2xl p-6",
                                        "bg-gradient-to-br from-blue-950/20 to-black",
                                        meta.concluida ? "opacity-60 border-green-900/40" : "border-blue-900/40 shadow-blue-500/5"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                {meta.concluida && <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />}
                                                <h3 className={cn(
                                                    "font-cinzel font-bold text-lg text-white truncate leading-tight uppercase tracking-wider",
                                                    meta.concluida && "line-through text-green-400/40"
                                                )}>{meta.nome}</h3>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-[0.15em] border-blue-500/20 text-blue-400 bg-blue-500/5 px-3 py-1 rounded-full font-bold">
                                                {meta.categoria}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="text-blue-400/30 p-2 rounded-xl border border-blue-500/10 active:bg-blue-500/10">
                                                <Milestone className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="w-full space-y-2">
                                            <div className="flex justify-between text-[10px] font-mono text-blue-400 font-bold uppercase tracking-widest">
                                                <span>PROGRESS_ANALYSIS</span>
                                                <span>{Math.round(progress)}%</span>
                                            </div>
                                            <div className="h-3 bg-blue-950/40 rounded-full overflow-hidden border border-blue-500/20 shadow-inner">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-out shadow-[0_0_10px_#3b82f6]" 
                                                    style={{ width: `${progress}%` }} 
                                                />
                                            </div>
                                            <div className="flex justify-between items-center text-[9px] font-mono text-blue-300/40 font-bold uppercase">
                                                <span>Verified Sequences</span>
                                                <span>{completedMissionsCount}/{totalMissionsCount}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between border-t border-blue-500/10 pt-4">
                                            {meta.prazo ? (
                                                <div className="flex items-center gap-2 text-blue-200/60 font-mono text-[10px] font-bold uppercase tracking-widest">
                                                    <CalendarIcon className="h-4 w-4 text-blue-500" />
                                                    <span>DEADLINE: {format(new Date(meta.prazo), "yyyy-MM-dd")}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-blue-200/30 font-mono text-[10px] font-bold uppercase tracking-widest">
                                                    <Clock className="h-4 w-4 text-blue-500/30" />
                                                    <span>NO_DEADLINE</span>
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <button onClick={() => handleGetRoadmap(meta)} className="text-blue-400 p-2 rounded-xl border border-blue-500/20 active:bg-blue-500/20">
                                                    <MapIcon className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleOpenEditDialog(meta)} className="text-blue-400 p-2 rounded-xl border border-blue-500/20 active:bg-blue-500/20">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button className="text-red-400 p-2 rounded-xl border border-red-500/20 active:bg-red-500/20">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-black/95 border-red-900/50 max-w-[95vw] rounded-2xl">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-red-500 font-mono uppercase">WARNING: DELETION IMMINENT</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-gray-400 font-mono text-xs">
                                                                This action cannot be undone. Target objective and associated quest data will be permanently erased.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="bg-transparent border-gray-700 text-gray-400">CANCEL</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(meta.id)} className="bg-red-900/20 border border-red-500/50 text-red-500">CONFIRM</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>

            {/* Floating Action Button - MD3 Large FAB Style */}
            <button
                onClick={handleOpenWizard}
                className="fixed bottom-8 right-6 w-20 h-20 bg-blue-600 border-4 border-blue-400 text-white shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all active:scale-90 active:bg-blue-500 flex items-center justify-center group z-40 rounded-[2rem]"
                style={{ 
                    bottom: 'calc(32px + env(safe-area-inset-bottom))',
                    right: '24px'
                }}
            >
                <PlusCircle className="h-10 w-10 group-hover:rotate-90 transition-transform duration-500" />
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white/40 rounded-tl-lg" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-white/40 rounded-br-lg" />
            </button>

            {/* Roadmap Dialog */}
            <Dialog open={!!roadmapMeta} onOpenChange={() => setRoadmapMeta(null)}>
                <DialogContent className="bg-black/95 border-2 border-blue-500/50 max-w-[95vw] w-full p-0 shadow-[0_0_30px_rgba(37,99,235,0.3)] backdrop-blur-xl sm:rounded-none overflow-hidden">
                     <div className="border-b border-blue-900/50 bg-blue-950/20 px-6 py-4 relative z-10">
                        <DialogTitle className="font-black text-white font-cinzel tracking-[0.15em] uppercase flex items-center gap-3 drop-shadow-md text-lg">
                            <MapIcon className="h-5 w-5 text-blue-400 animate-pulse" />
                            STRATEGIC ROADMAP
                        </DialogTitle>
                        <DialogDescription className="text-xs font-mono text-blue-400/60 uppercase tracking-wide mt-1">
                            OPTIMIZED PATH FOR: <span className="text-white font-bold">{roadmapMeta?.nome}</span>
                        </DialogDescription>
                    </div>
                     <ScrollArea className="max-h-[60vh] mt-4 pr-4 relative z-10">
                        {isLoadingRoadmap && (
                             <div className="flex flex-col items-center justify-center p-16 space-y-4">
                                <LoaderCircle className="text-blue-500 animate-spin h-8 w-8" />
                                <span className="font-mono text-xs text-blue-400 animate-pulse uppercase tracking-widest">CALCULATING STRATEGY...</span>
                            </div>
                        )}
                        {roadmap && (
                             <div className="relative pl-8 py-6 pr-6">
                                <div className="absolute left-[29px] top-6 bottom-6 w-0.5 bg-blue-900/50 -z-10" />
                                {roadmap.map((phase, index) => (
                                    <div key={index} className="relative mb-8 last:mb-0 group">
                                         <div className="absolute -left-[13px] top-0 h-6 w-6 bg-black border-2 border-blue-500 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.5)] z-20 group-hover:border-blue-400 transition-colors">
                                            <span className="font-bold text-blue-400 font-mono text-[10px]">{index + 1}</span>
                                        </div>
                                        <div className="pl-6">
                                            <div className="bg-black/60 border border-blue-900/30 p-4 relative overflow-hidden group-hover:border-blue-500/30 transition-colors rounded-xl">
                                                <h3 className="font-bold text-white font-cinzel uppercase tracking-wide mb-1 flex items-center gap-2 text-sm">
                                                    {phase.phaseTitle}
                                                </h3>
                                                <p className="text-gray-400 font-mono text-[10px] mb-3 border-b border-blue-900/20 pb-2">{phase.phaseDescription}</p>
                                                
                                                <ul className="space-y-1.5">
                                                    {phase.strategicMilestones.map((milestone: any, mIndex: any) => (
                                                         <li key={mIndex} className="flex items-start gap-2 text-blue-100/80 font-mono text-xs">
                                                            <Milestone className="text-blue-500/70 mt-0.5 flex-shrink-0 h-3 w-3" />
                                                            <span>{milestone}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                     <DialogFooter className="px-4 pb-4 pt-4 bg-black/40 border-t border-blue-900/30">
                        <Button variant="outline" onClick={() => setRoadmapMeta(null)} className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 rounded-none font-mono text-xs uppercase tracking-widest w-full h-9">CLOSE STRATEGY</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            {isEditing && metaToEdit && (
                 <Dialog open={isEditing} onOpenChange={handleCloseEditDialog}>
                    <DialogContent className="max-w-[95vw] bg-black/95 border-2 border-blue-500/50 rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-cinzel text-white uppercase">Editar Meta: {metaToEdit.nome}</DialogTitle>
                            <DialogDescription className="text-sm font-mono text-blue-400/60">
                                Refine os detalhes da sua meta SMART.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            <div>
                                <Label htmlFor="prazo" className="text-primary text-xs font-mono uppercase">Prazo (Opcional)</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal h-10 border-blue-500/30 bg-blue-950/20 text-white",
                                            !metaToEdit.prazo && "text-muted-foreground"
                                        )}
                                        >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {metaToEdit.prazo ? format(new Date(metaToEdit.prazo), "PPP") : <span>Escolha uma data</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-black border-blue-500/50">
                                        <Calendar
                                        mode="single"
                                        selected={metaToEdit.prazo ? new Date(metaToEdit.prazo) : undefined}
                                        onSelect={(date) => setMetaToEdit((prev: any) => ({...prev, prazo: date ? date.toISOString().split('T')[0] : null}))}
                                        initialFocus
                                        className="text-white"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            {/* SMART Fields */}
                            {['specific', 'measurable', 'achievable', 'relevant', 'timeBound'].map((field) => (
                                <div key={field}>
                                    <Label htmlFor={field} className="text-primary text-xs font-mono uppercase mb-1 block">{field}</Label>
                                    <Textarea 
                                        id={field} 
                                        value={metaToEdit.detalhes_smart[field]} 
                                        onChange={(e) => setMetaToEdit((prev: any) => ({...prev, detalhes_smart: {...prev.detalhes_smart, [field]: e.target.value}}))} 
                                        className="text-sm min-h-[60px] bg-blue-950/10 border-blue-500/20 text-blue-100" 
                                    />
                                </div>
                            ))}
                        </div>
                         <DialogFooter className="flex-col gap-2">
                            <Button variant="outline" onClick={handleCloseEditDialog} className="h-10 text-xs font-mono uppercase">Cancelar</Button>
                            <Button onClick={handleSaveEditedGoal} className="h-10 text-xs font-mono uppercase bg-blue-600 hover:bg-blue-500">Salvar Alterações</Button>
                        </DialogFooter>
                    </DialogContent>
                 </Dialog>
            )}

            {showWizard && (
                <Dialog open={showWizard} onOpenChange={setShowWizard}>
                    <DialogContent className={cn(
                        "bg-black/95 border-2 border-blue-500/30 p-0 overflow-hidden shadow-2xl",
                        wizardMode === 'detailed' ? "max-w-[100vw] w-screen h-screen rounded-none" : "max-w-[95vw] w-[95vw] rounded-[2.5rem]"
                    )}>
                        {wizardMode !== 'detailed' && (
                            <DialogHeader className="p-6 border-b border-blue-500/20 bg-blue-950/20">
                                <DialogTitle className="text-white font-cinzel tracking-widest text-xl uppercase font-bold text-center">
                                    OBJECTIVE_PROTOCOL
                                </DialogTitle>
                                <DialogDescription className="text-blue-400/60 font-mono text-[10px] uppercase font-bold text-center mt-1">
                                    SELECT CONFIGURATION MODE
                                </DialogDescription>
                            </DialogHeader>
                        )}
                        
                        <div className={cn(wizardMode === 'detailed' ? "h-full overflow-y-auto" : "")}>
                            {renderWizardContent()}
                        </div>
                        
                        {wizardMode === 'selection' && (
                            <DialogFooter className="p-4 bg-blue-950/10">
                                <button 
                                    onClick={handleCloseWizard}
                                    className="w-full py-3 text-[10px] font-mono text-blue-400/60 uppercase font-bold tracking-widest hover:text-blue-400"
                                >
                                    ABORT_OPERATION
                                </button>
                            </DialogFooter>
                        )}
                    </DialogContent>
                </Dialog>
            )}

            {/* Suggestions Dialog */}
            <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
                <DialogContent className="max-w-[95vw] w-[95vw] bg-black/95 border-2 border-blue-500/30 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="p-6 border-b border-blue-500/20 bg-blue-950/20">
                        <DialogTitle className="text-white font-cinzel tracking-widest text-xl uppercase font-bold text-center flex items-center justify-center gap-3">
                            <Wand2 className="h-6 w-6 text-blue-400 animate-pulse" /> SYSTEM_ADVICE
                        </DialogTitle>
                        <DialogDescription className="text-blue-400/60 font-mono text-[10px] uppercase font-bold text-center mt-1">
                            OPTIMAL PATHWAYS DETECTED
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        {isLoadingSuggestions ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-4">
                                <ZapIcon className="h-10 w-10 text-blue-500 animate-spin-slow" />
                                <p className="text-[10px] font-mono text-blue-400 animate-pulse uppercase font-bold">Scanning_User_Affinity...</p>
                            </div>
                        ) : suggestions.map((s, i) => (
                            <button 
                                key={i}
                                onClick={() => handleSelectSuggestion(s.name)}
                                className="w-full border-2 border-blue-900/40 bg-blue-950/10 p-5 rounded-3xl text-left active:scale-95 transition-all shadow-lg"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-mono font-bold text-white uppercase text-sm">{s.name}</h3>
                                    <Badge className="bg-blue-500/20 text-blue-400 text-[8px] border-blue-500/20 font-bold">{s.category}</Badge>
                                </div>
                                <p className="text-[10px] font-mono text-blue-100/40 uppercase leading-tight">{s.description}</p>
                            </button>
                        ))}
                    </div>

                    <DialogFooter className="p-4 bg-blue-950/10">
                        <button onClick={() => setShowSuggestions(false)} className="w-full py-3 text-[10px] font-mono text-blue-400/60 uppercase font-bold">CLOSE_ANALYSIS</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export const MetasMobile = memo(MetasMobileComponent);
