"use client";

import { useState, useCallback, useEffect, memo } from 'react';
import { PlusCircle, Edit, Trash2, X, Feather, ZapIcon, Swords, Brain, Zap, ShieldCheck, Star, BookOpen, Wand2, Calendar as CalendarIcon, CheckCircle, Info, Map as MapIcon, LoaderCircle, Milestone, Skull } from 'lucide-react';
import { format } from "date-fns";
import * as mockData from '@/lib/data';
import { generateGoalCategory } from '@/ai/flows/generate-goal-category';
import { generateSmartGoalQuestion } from '@/ai/flows/generate-smart-goal-questions';
import { generateSimpleSmartGoal } from '@/ai/flows/generate-simple-smart-goal';
import { generateInitialEpicMission } from '@/ai/flows/generate-initial-epic-mission';
import { generateSkillFromGoal } from '@/ai/flows/generate-skill-from-goal';
import { generateGoalSuggestion } from '@/ai/flows/generate-goal-suggestion';
import { generateGoalRoadmap } from '@/ai/flows/generate-goal-roadmap';
import { generateUserAchievements } from '@/ai/flows/generate-user-achievements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { statCategoryMapping } from '@/lib/mappings';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { useIsMobile } from '@/hooks/use-mobile';

interface SmartGoalWizardProps {
    onClose: () => void;
    onSave: (meta: any) => void;
    metaToEdit: any;
    profile: any;
    initialGoalName?: string;
}

interface GoalState {
    id: number | null;
    nome: string;
    categoria: string;
    prazo: string | null;
    concluida: boolean;
    detalhes_smart: {
        specific: string;
        measurable: string;
        achievable: string;
        relevant: string;
        timeBound: string;
    };
    habilidade_associada_id?: number;
}

interface HistoryItem {
    question: string;
    answer: string;
}

const SmartGoalWizard = ({ onClose, onSave, metaToEdit, profile, initialGoalName = '' }: SmartGoalWizardProps) => {
    const isEditing = !!metaToEdit;
    const isMobile = useIsMobile();

    const getInitialGoalState = useCallback((): GoalState => {
        if (isEditing && metaToEdit) {
             return {
                id: metaToEdit.id || null,
                nome: metaToEdit.nome || '',
                categoria: metaToEdit.categoria || '',
                prazo: metaToEdit.prazo || null,
                concluida: metaToEdit.concluida || false,
                detalhes_smart: {
                    specific: metaToEdit.detalhes_smart?.specific || '',
                    measurable: metaToEdit.detalhes_smart?.measurable || '',
                    achievable: metaToEdit.detalhes_smart?.achievable || '',
                    relevant: metaToEdit.detalhes_smart?.relevant || '',
                    timeBound: metaToEdit.detalhes_smart?.timeBound || '',
                },
                habilidade_associada_id: metaToEdit.habilidade_associada_id,
            };
        }
        return {
            id: null,
            nome: initialGoalName,
            categoria: '',
            prazo: null,
            concluida: false,
            detalhes_smart: {
                specific: '',
                measurable: '',
                achievable: '',
                relevant: '',
                timeBound: '',
            }
        };
    }, [isEditing, metaToEdit, initialGoalName]);
    
    const [goalState, setGoalState] = useState<GoalState>(getInitialGoalState);
    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [exampleAnswers, setExampleAnswers] = useState<string[]>([]);
    const [userInput, setUserInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const { toast } = useToast();
    
     useEffect(() => {
        const initialState = getInitialGoalState();
        setGoalState(initialState);
        setHistory([]);
        setUserInput('');

        if (isEditing) {
            setCurrentQuestion("A sua meta SMART está completa. Pode refinar qualquer campo ou salvar as alterações.");
        } else if (initialGoalName) {
            handleInitialQuestion(initialGoalName);
        } else {
            setCurrentQuestion('');
        }
    }, [metaToEdit, isEditing, getInitialGoalState, initialGoalName]);

    const handleToastError = (error: any, customMessage = 'Não foi possível continuar. O Sistema pode estar sobrecarregado.') => {
        console.error("Erro de IA:", error);
        if (error instanceof Error && (error.message.includes('429') || error.message.includes('Quota'))) {
             toast({ variant: 'destructive', title: 'Quota de IA Excedida', description: 'Você atingiu o limite de pedidos. Tente novamente mais tarde.' });
        } else {
             toast({ variant: 'destructive', title: 'Erro de IA', description: customMessage });
        }
    };

    const handleInitialQuestion = useCallback(async (initialGoalName: string) => {
        setIsLoading(true);
        const initialGoal = { name: initialGoalName };
        setGoalState(prev => ({...prev, nome: initialGoalName}));
        
        try {
            const result = await generateSmartGoalQuestion({ goal: initialGoal, history: [] });
            if (result.nextQuestion) {
                setCurrentQuestion(result.nextQuestion);
                setExampleAnswers(result.exampleAnswers || []);
            } else if (result.isComplete && result.refinedGoal) {
                await handleSaveGoal(result.refinedGoal);
            }
        } catch (error: any) {
            handleToastError(error, 'Não foi possível iniciar o assistente.');
            onClose();
        } finally {
            setIsLoading(false);
        }
    },[onClose, toast]);


    const handleNextStep = async () => {
        if (!userInput.trim() || isLoading) return;

        const lastQuestion = currentQuestion;
        const newHistory = [...history, { question: lastQuestion, answer: userInput }];
        setHistory(newHistory);
        setIsLoading(true);
        setExampleAnswers([]);
        
        // Create a new object without the 'name' property to avoid duplication
        const updatedGoal = { 
            name: goalState.nome,
            specific: goalState.detalhes_smart.specific || userInput,
            measurable: goalState.detalhes_smart.measurable || (goalState.detalhes_smart.specific ? userInput : ''),
            achievable: goalState.detalhes_smart.achievable || (goalState.detalhes_smart.measurable ? userInput : ''),
            relevant: goalState.detalhes_smart.relevant || (goalState.detalhes_smart.achievable ? userInput : ''),
            timeBound: goalState.detalhes_smart.timeBound || (goalState.detalhes_smart.relevant ? userInput : '')
        };
        
        // Update the appropriate field based on what's been filled
        if (!goalState.detalhes_smart.specific) {
            updatedGoal.specific = userInput;
        } else if (!goalState.detalhes_smart.measurable) {
            updatedGoal.measurable = userInput;
        } else if (!goalState.detalhes_smart.achievable) {
            updatedGoal.achievable = userInput;
        } else if (!goalState.detalhes_smart.relevant) {
            updatedGoal.relevant = userInput;
        } else if (!goalState.detalhes_smart.timeBound) {
            updatedGoal.timeBound = userInput;
        }
        
        setUserInput(''); 

        try {
            const result = await generateSmartGoalQuestion({ goal: updatedGoal, history: newHistory });

            if (result.isComplete && result.refinedGoal) {
                await handleSaveGoal(result.refinedGoal);
            } else if (result.nextQuestion) {
                setCurrentQuestion(result.nextQuestion);
                setExampleAnswers(result.exampleAnswers || []);
            }
        } catch (error: any) {
            handleToastError(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveGoal = async (finalGoalDetails: any) => {
        setIsLoading(true);
        try {
            const finalName = finalGoalDetails.name || goalState.nome;
            
            const categoryResult = await generateGoalCategory({
                goalName: finalName,
                categories: mockData.categoriasMetas,
            });
            const newMeta: GoalState = {
                id: metaToEdit ? metaToEdit.id : null, 
                nome: finalName,
                categoria: categoryResult.category || 'Desenvolvimento Pessoal',
                prazo: goalState.prazo,
                concluida: false,
                detalhes_smart: {
                    specific: finalGoalDetails.specific || '',
                    measurable: finalGoalDetails.measurable || '',
                    achievable: finalGoalDetails.achievable || '',
                    relevant: finalGoalDetails.relevant || '',
                    timeBound: finalGoalDetails.timeBound || '',
                },
                habilidade_associada_id: metaToEdit?.habilidade_associada_id
            };
            onSave(newMeta);
            onClose(); 
        } catch (error: any) {
             handleToastError(error, 'Não foi possível sugerir uma categoria. A salvar com categoria padrão.');
             const finalName = finalGoalDetails.name || goalState.nome;
             const newMeta: GoalState = {
                id: metaToEdit ? metaToEdit.id : null,
                nome: finalName,
                categoria: 'Desenvolvimento Pessoal',
                prazo: goalState.prazo,
                concluida: false,
                detalhes_smart: {
                    specific: finalGoalDetails.specific || '',
                    measurable: finalGoalDetails.measurable || '',
                    achievable: finalGoalDetails.achievable || '',
                    relevant: finalGoalDetails.relevant || '',
                    timeBound: finalGoalDetails.timeBound || '',
                },
                habilidade_associada_id: metaToEdit?.habilidade_associada_id,
             };
             onSave(newMeta);
             onClose();
        } finally {
            setIsLoading(false);
        }
    }
    
    const renderInitialScreen = () => (
        <div className={cn("text-center animate-in fade-in-50 duration-500", isMobile ? "p-2" : "")}>
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-purple-400/20 rounded-full blur-xl" />
                <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/60 p-6 rounded-full border border-gray-700/50">
                    <Zap className={cn("text-cyan-400 animate-pulse", isMobile ? "h-8 w-8" : "h-12 w-12")} />
                </div>
            </div>
            <h2 className={cn("text-cyan-400 mb-4 font-cinzel", isMobile ? "text-xl" : "text-2xl")}>Qual é a meta que você tem em mente?</h2>
            <p className={cn("text-gray-400 mb-6 max-w-md mx-auto", isMobile ? "text-sm" : "")}>Descreva o seu objetivo inicial. O Sistema irá ajudá-lo a refiná-lo com o método SMART.</p>
             <Input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && userInput.trim() && handleInitialQuestion(userInput)}
                placeholder="Ex: Aprender a programar, correr uma maratona, ler mais livros..."
                className={cn("mx-auto bg-card/50 border-gray-600 focus:border-cyan-400 transition-colors duration-200", isMobile ? "max-w-full text-sm h-10" : "max-w-lg h-12")}
                disabled={isLoading}
            />
            <Button onClick={() => userInput.trim() && handleInitialQuestion(userInput)} className={cn("mt-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl", isMobile ? "text-sm h-8" : "h-10")} disabled={isLoading || !userInput.trim()}>
                <Zap className={cn("mr-2", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                Começar a Definir
            </Button>
        </div>
    );
    
    const renderQuestionScreen = () => (
        <div className={cn("w-full animate-in fade-in-50 duration-500", isMobile ? "max-w-full p-2" : "max-w-4xl")}>
            <p className={cn("text-gray-400 mb-4 text-center", isMobile ? "text-xs" : "")}>Meta: <span className="font-bold text-cyan-400">{goalState.nome}</span></p>
            <div className={cn("bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-lg shadow-2xl backdrop-blur-sm", isMobile ? "p-3" : "p-8")}>
                {isLoading && !currentQuestion ? (
                    <div className={cn("flex items-center justify-center space-x-2", isMobile ? "h-32" : "h-48")}>
                        <div className={cn("rounded-full animate-pulse bg-cyan-400", isMobile ? "h-2 w-2" : "h-3 w-3")} style={{ animationDelay: '-0.3s' }}></div>
                        <div className={cn("rounded-full animate-pulse bg-cyan-400", isMobile ? "h-2 w-2" : "h-3 w-3")} style={{ animationDelay: '-0.15s' }}></div>
                        <div className={cn("rounded-full animate-pulse bg-cyan-400", isMobile ? "h-2 w-2" : "h-3 w-3")}></div>
                    </div>
                ) : (
                    <>
                        <h2 className={cn("text-cyan-400 mb-6 min-h-[4rem] flex items-center justify-center", isMobile ? "text-base" : "text-2xl")}>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                                {currentQuestion}
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                            </div>
                        </h2>
                        
                        {!isEditing && (
                            <div className={cn("mb-4 text-left", isMobile ? "text-sm" : "")}>
                                <Label htmlFor="prazo" className="text-primary">Prazo (Opcional)</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal bg-card/80 mt-1 border-gray-600 hover:bg-card/90 transition-all duration-200",
                                            !goalState.prazo && "text-muted-foreground",
                                            isMobile ? "text-sm h-8" : ""
                                        )}
                                        >
                                        <CalendarIcon className={cn("mr-2", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                                        {goalState.prazo ? format(new Date(goalState.prazo), "PPP") : <span>Escolha uma data</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                        mode="single"
                                        selected={goalState.prazo ? new Date(goalState.prazo) : undefined}
                                        onSelect={(date) => setGoalState((prev: any) => ({...prev, prazo: date ? date.toISOString().split('T')[0] : null}))}
                                        initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}

                        <Textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleNextStep();
                              }
                            }}
                            placeholder="Seja detalhado na sua resposta ou escolha um exemplo abaixo..."
                            className={cn("text-base bg-card/50 border-gray-600 focus:border-cyan-400 transition-colors duration-200", isMobile ? "min-h-[80px] text-sm" : "min-h-[100px]")}
                            disabled={isLoading}
                        />

                        {exampleAnswers.length > 0 && !isLoading && (
                            <div className={cn("mt-6 space-y-2 text-left", isMobile ? "mt-3" : "")}>
                                 <p className={cn("text-gray-400 mb-2 flex items-center gap-2", isMobile ? "text-xs" : "text-sm")}>
                                    <Wand2 className="h-4 w-4 text-cyan-400" />
                                    Ou inspire-se com estes exemplos:
                                 </p>
                                {exampleAnswers.map((ex, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setUserInput(ex)}
                                        className={cn("w-full text-left rounded-md hover:bg-gradient-to-r hover:from-cyan-400/10 hover:to-purple-400/10 transition-all duration-200 hover:scale-[1.01] border border-gray-700/50 hover:border-cyan-400/30", 
                                            isMobile ? "p-2 text-xs bg-gray-800/60" : "p-3 text-sm bg-gray-800/60")}
                                    >
                                        {ex}
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        <div className={cn("flex flex-col-reverse gap-4 mt-6", isMobile ? "sm:flex-col" : "sm:flex-row justify-end items-center")}>
                            <Button variant="outline" onClick={onClose} disabled={isLoading} className={cn("border-gray-600 hover:bg-gray-700/50 transition-all duration-200", isMobile ? "h-8 text-sm" : "")}>
                                Cancelar
                            </Button>
                            <Button onClick={handleNextStep} className={cn("w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl", isMobile ? "sm:w-full h-8 text-sm" : "sm:w-auto")} disabled={isLoading || !userInput.trim()}>
                                Próximo Passo
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
    
    const renderContent = () => {
        if(!goalState.nome){
            return renderInitialScreen();
        }
        return renderQuestionScreen();
    }


    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className={cn("bg-transparent border-none shadow-none max-w-none w-auto flex items-center justify-center p-0", isMobile ? "m-0 rounded-none" : "")}>
                <DialogHeader className="sr-only">
                    <DialogTitle>Assistente de Metas</DialogTitle>
                </DialogHeader>
                <div className={cn("fixed inset-0 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4", isMobile ? "p-2" : "")}>
                    <Button onClick={onClose} variant="ghost" size="icon" className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200" aria-label="Fechar assistente de metas">
                        <X className={isMobile ? "h-5 w-5" : "h-6 w-6"} />
                    </Button>
                    {renderContent()}
                </div>
            </DialogContent>
        </Dialog>
    )
}

interface QuickGoalData {
    name: string;
    prazo: string | null;
}

interface Suggestion {
    name: string;
    description: string;
    category: string;
}

interface RoadmapPhase {
    phaseTitle: string;
    phaseDescription: string;
    strategicMilestones: string[];
}

const MetasViewComponent = () => {
    const { profile, metas, missions, skills, persistData } = usePlayerDataContext();
    const isMobile = useIsMobile();
    const [showWizardDialog, setShowWizardDialog] = useState(false);
    const [wizardMode, setWizardMode] = useState<string | null>(null); // 'simple' or 'detailed' or 'selection'
    const [quickGoalData, setQuickGoalData] = useState<QuickGoalData>({ name: '', prazo: null });
    
    const [isEditing, setIsEditing] = useState(false);
    const [metaToEdit, setMetaToEdit] = useState<any>(null);
    const [detailedMeta, setDetailedMeta] = useState<any>(null);

    const [isLoadingSimpleGoal, setIsLoadingSimpleGoal] = useState(false);
    
    const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    
    const [roadmap, setRoadmap] = useState<RoadmapPhase[] | null>(null);
    const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);
    const [roadmapMeta, setRoadmapMeta] = useState<any>(null);

    const { toast } = useToast();
    
    const layout = profile?.user_settings?.layout_density || 'default';
    const cardPadding = isMobile ? 'p-2' : layout === 'compact' ? 'p-3' : layout === 'comfortable' ? 'p-8' : 'p-6';
    const gapSize = isMobile ? 'gap-2' : layout === 'compact' ? 'gap-4' : layout === 'comfortable' ? 'gap-8' : 'gap-6';

    const handleToastError = (error: any, customMessage = 'Não foi possível continuar. O Sistema pode estar sobrecarregado.') => {
        console.error("Erro de IA:", error);
        if (error instanceof Error && (error.message.includes('429') || error.message.includes('Quota'))) {
             toast({ variant: 'destructive', title: 'Quota de IA Excedida', description: 'Você atingiu o limite de pedidos. Tente novamente mais tarde.' });
        } else {
             toast({ variant: 'destructive', title: 'Erro de IA', description: customMessage });
        }
    };
    
    const handleGetSuggestions = async () => {
        setShowSuggestionDialog(true);
        setIsLoadingSuggestions(true);
        setSuggestions([]);

        try {
            const completedGoals = metas.filter((m: any) => m.concluida);
            const result = await generateGoalSuggestion({
                profile: JSON.stringify(profile),
                skills: JSON.stringify(skills),
                completedGoals: JSON.stringify(completedGoals.map((m: any) => m.nome)),
                existingCategories: mockData.categoriasMetas,
            });
            setSuggestions(result.suggestions);
        } catch(error: any) {
            handleToastError(error, "Não foi possível gerar sugestões de metas.");
            setShowSuggestionDialog(false);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };
    
    const handleGetRoadmap = async (meta: any) => {
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
            handleToastError(error, "Não foi possível gerar a estratégia.");
            setRoadmapMeta(null);
        } finally {
            setIsLoadingRoadmap(false);
        }
    };
    
    const handleSelectSuggestion = (suggestionName: string) => {
        setShowSuggestionDialog(false);
        setQuickGoalData({ name: suggestionName, prazo: null });
        setWizardMode('simple');
        setShowWizardDialog(true);
    };

    const handleOpenWizard = () => {
        setWizardMode('selection');
        setShowWizardDialog(true);
    };

    const handleCloseWizard = () => {
        setShowWizardDialog(false);
        setWizardMode(null);
        setQuickGoalData({ name: '', prazo: null });
    };
    
    const handleOpenEditDialog = (meta: any) => {
        setMetaToEdit({ ...meta });
        setIsEditing(true);
    };
    
    const handleCloseEditDialog = () => {
        setIsEditing(false);
        setMetaToEdit(null);
    };
    
    const handleSaveEditedGoal = () => {
        if (!metaToEdit) return;
        handleSave(metaToEdit);
        handleCloseEditDialog();
    };


    const handleSave = async (newOrUpdatedMeta: any) => {
        setIsLoadingSimpleGoal(true);
        const isEditingGoal = !!(newOrUpdatedMeta.id && metas.some((m: any) => m.id === newOrUpdatedMeta.id));
        
        try {
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
                    persistData('skills', newSkills);
                }

                persistData('missions', updatedMissions);
                persistData('metas', updatedMetas);
                toast({ title: "Meta Atualizada!", description: "A sua meta foi atualizada com sucesso." });

            } else {
                // Creating new goal
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
                
                const relatedHistory = metas
                    .filter((m: any) => m.categoria === newMetaWithId.categoria)
                    .map((m: any) => `- Meta Concluída: ${m.nome}`)
                    .join('\n');
                
                const initialMissionResult = await generateInitialEpicMission({
                    goalName: newMetaWithId.nome,
                    goalDetails: JSON.stringify(newMetaWithId.detalhes_smart),
                    userLevel: profile.nivel,
                });

                if (initialMissionResult.fallback) {
                    toast({
                        variant: 'destructive',
                        title: 'Sistema Sobrecarregado',
                        description: 'Uma missão inicial simples foi criada. Tente editar a meta mais tarde para gerar uma árvore de progressão completa.',
                    });
                }
                
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
                            learningResources: initialMissionResult.firstDailyMissionLearningResources,
                            subTasks: initialMissionResult.firstDailyMissionSubTasks,
                        }] : [],
                    };
                });
                
                const updatedSkills = [...skills, newSkill];
                const updatedMetas = [...metas, newMetaWithId];
                const updatedMissions = [...missions, ...newMissions];

                persistData('skills', updatedSkills);
                persistData('metas', updatedMetas);
                persistData('missions', updatedMissions);
                
                // Gerar conquistas após salvar a meta
                try {
                    const achievementResult = await generateUserAchievements({
                        profile: JSON.stringify(profile),
                        skills: JSON.stringify(updatedSkills),
                        goals: JSON.stringify(updatedMetas.filter((m: any) => !m.concluida)),
                        existingAchievementIds: profile.generated_achievements?.map((a: any) => a.id) || [],
                    });
                     if (achievementResult.achievements && achievementResult.achievements.length > 0) {
                        const newAchievements = achievementResult.achievements.map((ach: any) => ({ ...ach, unlocked: false, unlockedAt: null }));
                        const updatedProfileAchievements = {
                            ...profile,
                            generated_achievements: [...(profile.generated_achievements || []), ...newAchievements]
                        };
                         await persistData('profile', updatedProfileAchievements);
                         toast({ title: 'Novas Conquistas Forjadas!', description: 'Verifique a aba de Conquistas para ver os seus novos desafios.' });
                    }
                } catch(achError: any) {
                    handleToastError(achError, "Não foi possível gerar novas conquistas para esta meta.");
                }

                handleGetRoadmap(newMetaWithId);
            }
        } catch (error: any) {
            handleToastError(error, 'Não foi possível salvar a meta. A IA pode estar sobrecarregado.');
        } finally {
            setIsLoadingSimpleGoal(false);
            handleCloseWizard();
        }
    };
    
    const handleCreateSimpleGoal = async () => {
        if (!quickGoalData.name.trim()) return;
        setIsLoadingSimpleGoal(true);
        try {
            const { refinedGoal, fallback } = await generateSimpleSmartGoal({ goalName: quickGoalData.name });
            
            if (fallback) {
                 toast({
                    variant: 'destructive',
                    title: 'Sistema Sobrecarregado',
                    description: 'Uma meta genérica foi criada. Por favor, edite-a para adicionar os detalhes SMART.',
                });
            }

            await handleSave({
                id: null,
                nome: refinedGoal.name,
                categoria: 'Desenvolvimento Pessoal', 
                prazo: quickGoalData.prazo,
                concluida: false,
                detalhes_smart: refinedGoal,
                user_id: profile.id
            });
        } catch (error: any) {
            handleToastError(error, 'Não foi possível criar a meta com a IA. Tente novamente.');
        } finally {
            setIsLoadingSimpleGoal(false);
            handleCloseWizard();
        }
    };


    const handleDelete = async (id: number) => {
        const metaToDelete = metas.find((m: any) => m.id === id);
        if (metaToDelete) {
            persistData('missions', missions.filter((mission: any) => mission.meta_associada !== metaToDelete.nome));
            persistData('metas', metas.filter((m: any) => m.id !== id));
            if (metaToDelete.habilidade_associada_id) {
                persistData('skills', skills.filter((s: any) => s.id !== metaToDelete.habilidade_associada_id));
            }
            toast({ title: "Meta Eliminada", description: `A meta "${metaToDelete.nome}" e seus componentes foram removidos.` });
        }
    };

    const renderWizardContent = () => {
        switch (wizardMode) {
            case 'selection':
                return (
                     <DialogContent className={cn("bg-black/95 border-2 border-blue-500/50 max-w-3xl w-full p-0 shadow-[0_0_30px_rgba(37,99,235,0.3)] backdrop-blur-xl sm:rounded-none overflow-hidden", isMobile ? "max-w-[95vw]" : "")}>
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-400 z-20" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-blue-400 z-20" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-400 z-20" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-400 z-20" />
                        
                        <div className="border-b border-blue-900/50 bg-blue-950/20 px-6 py-4 relative z-10">
                            <DialogTitle className={cn("text-xl font-black font-cinzel text-white uppercase tracking-widest drop-shadow-md text-center", isMobile ? "text-lg" : "")}>
                                OBJECTIVE INITIALIZATION PROTOCOL
                            </DialogTitle>
                            <DialogDescription className="text-xs font-mono text-blue-400/60 uppercase tracking-wide mt-1 text-center">
                                SELECT CONFIGURATION MODE
                            </DialogDescription>
                        </div>

                        <div className={cn("grid gap-6 p-8 relative z-10", isMobile ? "grid-cols-1 p-4" : "grid-cols-1 md:grid-cols-2")}>
                           <button onClick={() => setWizardMode('simple')} className={cn("group relative border border-blue-900/40 bg-black/60 p-6 transition-all duration-300 hover:border-cyan-500 hover:bg-cyan-950/10 overflow-hidden", isMobile ? "p-4" : "")}>
                               <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                               <div className="flex flex-col items-center text-center relative z-10">
                                   <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 bg-cyan-950/30 flex items-center justify-center mb-4 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all duration-300">
                                       <Feather className={cn("text-cyan-400 w-8 h-8 group-hover:scale-110 transition-transform duration-300")} />
                                   </div>
                                   <h3 className={cn("font-bold text-white font-mono uppercase tracking-widest text-lg mb-2 group-hover:text-cyan-300", isMobile ? "text-base" : "")}>QUICK MODE</h3>
                                   <p className={cn("text-gray-400 text-xs font-mono leading-relaxed max-w-xs", isMobile ? "text-[10px]" : "")}>Rapid deployment. Define target name, system generates parameters automatically.</p>
                               </div>
                           </button>

                           <button onClick={() => setWizardMode('detailed')} className={cn("group relative border border-blue-900/40 bg-black/60 p-6 transition-all duration-300 hover:border-purple-500 hover:bg-purple-950/10 overflow-hidden", isMobile ? "p-4" : "")}>
                               <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                               <div className="flex flex-col items-center text-center relative z-10">
                                   <div className="w-16 h-16 rounded-full border-2 border-purple-500/30 bg-purple-950/30 flex items-center justify-center mb-4 group-hover:border-purple-400 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-300">
                                       <ZapIcon className={cn("text-purple-400 w-8 h-8 group-hover:scale-110 transition-transform duration-300")} />
                                   </div>
                                   <h3 className={cn("font-bold text-white font-mono uppercase tracking-widest text-lg mb-2 group-hover:text-purple-300", isMobile ? "text-base" : "")}>DETAILED MODE</h3>
                                   <p className={cn("text-gray-400 text-xs font-mono leading-relaxed max-w-xs", isMobile ? "text-[10px]" : "")}>Full calibration. System guided SMART analysis for complex objectives.</p>
                               </div>
                           </button>
                        </div>
                    </DialogContent>
                );
            case 'simple':
                 return (
                    <DialogContent className={cn("bg-black/95 border-2 border-cyan-500/50 max-w-lg w-full p-0 shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-xl sm:rounded-none overflow-hidden", isMobile ? "max-w-[95vw]" : "")}>
                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 z-20" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 z-20" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 z-20" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 z-20" />

                        <div className="border-b border-cyan-900/50 bg-cyan-950/20 px-6 py-4 relative z-10">
                            <DialogTitle className={cn("flex items-center gap-2 text-cyan-400 font-black font-cinzel text-lg uppercase tracking-widest drop-shadow-md", isMobile ? "text-base" : "")}>
                                <Feather className="h-5 w-5" />
                                QUICK OBJECTIVE SETUP
                            </DialogTitle>
                            <DialogDescription className={cn("text-xs font-mono text-cyan-200/60 uppercase tracking-wide mt-1", isMobile ? "text-[10px]" : "")}>
                                ENTER TARGET DATA. SYSTEM WILL PROCESS PARAMETERS.
                            </DialogDescription>
                        </div>

                        <div className={cn("px-6 py-6 space-y-5 relative z-10", isMobile ? "px-4 py-4 space-y-4" : "")}>
                             <div className="space-y-2">
                                <Label htmlFor="goal-name" className={cn("text-cyan-500 font-mono text-xs uppercase tracking-widest", isMobile ? "text-[10px]" : "")}>OBJECTIVE DESIGNATION</Label>
                                <Input
                                    id="goal-name"
                                    placeholder="EX: MASTER C++ PROGRAMMING"
                                    value={quickGoalData.name}
                                    onChange={(e) => setQuickGoalData(prev => ({...prev, name: e.target.value}))}
                                    disabled={isLoadingSimpleGoal}
                                    onKeyPress={(e) => e.key === 'Enter' && handleCreateSimpleGoal()}
                                    className={cn("bg-black/60 border-cyan-900/50 text-white font-mono rounded-none focus-visible:ring-cyan-500/50 h-10 uppercase placeholder:text-cyan-900/50", isMobile ? "text-xs h-9" : "")}
                                />
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="prazo" className={cn("text-cyan-500 font-mono text-xs uppercase tracking-widest", isMobile ? "text-[10px]" : "")}>DEADLINE (OPTIONAL)</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal bg-black/60 border-cyan-900/50 text-white hover:bg-cyan-950/30 hover:text-cyan-400 rounded-none h-10 font-mono uppercase",
                                            !quickGoalData.prazo && "text-cyan-900/50",
                                            isMobile ? "h-9 text-xs" : ""
                                        )}
                                        >
                                        <CalendarIcon className={cn("mr-2", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                                        {quickGoalData.prazo ? format(new Date(quickGoalData.prazo), "PPP") : <span>SELECT DATE</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-black border border-cyan-500/50">
                                        <Calendar
                                        mode="single"
                                        selected={quickGoalData.prazo ? new Date(quickGoalData.prazo) : undefined}
                                        onSelect={(date) => setQuickGoalData(prev => ({...prev, prazo: date ? date.toISOString().split('T')[0] : null}))}
                                        initialFocus
                                        className="text-white"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                        </div>
                        <DialogFooter className={cn("px-6 pb-6 bg-black/40 border-t border-cyan-900/30 flex-col gap-2 pt-4", isMobile ? "px-4 pb-4 sm:flex-col" : "sm:flex-row sm:justify-end")}>
                            <Button variant="outline" onClick={handleCloseWizard} disabled={isLoadingSimpleGoal} className={cn("border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 rounded-none font-mono text-xs uppercase tracking-widest w-full sm:w-auto", isMobile ? "h-9" : "")}>CANCEL</Button>
                            <Button onClick={handleCreateSimpleGoal} disabled={isLoadingSimpleGoal || !quickGoalData.name.trim()} className={cn("bg-cyan-600 hover:bg-cyan-500 text-white rounded-none font-mono text-xs uppercase tracking-widest w-full sm:w-auto shadow-[0_0_15px_rgba(6,182,212,0.4)]", isMobile ? "h-9" : "")}>
                                {isLoadingSimpleGoal ? (isMobile ? "PROCESSING..." : "PROCESSING DATA...") : (isMobile ? "CONFIRM" : "INITIATE")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                 );
            case 'detailed':
                return (
                    <SmartGoalWizard
                        onClose={handleCloseWizard}
                        onSave={handleSave}
                        metaToEdit={null}
                        profile={profile}
                        initialGoalName={quickGoalData.name}
                    />
                );
            default:
                return null;
        }
    };

    const sortedMetas = [...metas].sort((a: any, b: any) => (a.concluida ? 1 : -1) - (b.concluida ? 1 : -1) || a.nome.localeCompare(b.nome));

    return (
        <div className={cn("h-full overflow-y-auto", cardPadding)}>
            <div className={cn("items-start gap-4 mb-6", isMobile ? "flex flex-col" : "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8")}>
                <div className="flex flex-col gap-1">
                    <h1 className={cn("font-bold text-white font-cinzel tracking-[0.15em] drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]", isMobile ? "text-xl" : "text-3xl")}>
                        SYSTEM OBJECTIVES
                    </h1>
                    <p className={cn("text-blue-400/60 font-mono text-xs tracking-widest uppercase", isMobile ? "text-[10px]" : "text-sm")}>
                        LONG-TERM TARGET ACQUISITION
                    </p>
                </div>
                <div className={cn("flex flex-col gap-2 w-full", isMobile ? "sm:w-full" : "sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto")}>
                     <Button onClick={handleGetSuggestions} variant="outline" className={cn("border-blue-500/30 text-blue-400 hover:bg-blue-950/30 hover:text-blue-300 hover:border-blue-400 font-mono uppercase tracking-wider", isMobile ? "w-full text-xs h-8" : "w-full sm:w-auto")}>
                        <Wand2 className={cn("mr-2", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                        {isMobile ? "SUGGEST" : "SYSTEM SUGGESTIONS"}
                    </Button>
                    <Button onClick={() => handleOpenWizard()} className={cn("bg-blue-600 hover:bg-blue-500 text-white font-mono uppercase tracking-wider shadow-[0_0_10px_rgba(37,99,235,0.3)]", isMobile ? "w-full text-xs h-8" : "w-full sm:w-auto")}>
                        <PlusCircle className={cn("mr-2", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                        {isMobile ? "ADD" : "NEW OBJECTIVE"}
                    </Button>
                </div>
            </div>
            
            <div className={cn("grid grid-cols-1", gapSize, isMobile ? "sm:grid-cols-1" : "lg:grid-cols-2 xl:grid-cols-3")}>
                {sortedMetas.map((meta: any) => {
                    const skill: any = skills.find((s: any) => s.id === meta.habilidade_associada_id);
                    // Add index signature to statCategoryMapping to avoid TypeScript error
                    const stats = skill ? (statCategoryMapping as any)[skill.categoria] : [];
                    const relatedMissions = missions.filter((m: any) => m.meta_associada === meta.nome);
                    const completedMissionsCount = relatedMissions.filter((m: any) => m.concluido).length;
                    const totalMissionsCount = relatedMissions.length;
                    const progress = totalMissionsCount > 0 ? (completedMissionsCount / totalMissionsCount) * 100 : (meta.concluida ? 100 : 0);
                    
                    return (
                        <div key={meta.id} className={cn("relative bg-black/60 border border-blue-900/40 rounded-sm overflow-hidden group hover:border-blue-500/50 transition-all duration-300", meta.concluida && "opacity-60 border-green-900/40 hover:border-green-500/50")}>
                            {/* Corner Accents */}
                            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-blue-500/30 group-hover:border-blue-400 transition-colors" />
                            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-blue-500/30 group-hover:border-blue-400 transition-colors" />
                            
                            {meta.concluida && (
                                <div className="absolute inset-0 bg-green-900/5 pointer-events-none" />
                            )}

                            <div className={cn("relative z-10 flex flex-col h-full", isMobile ? "p-3" : "p-5")}>
                                <div className={cn("flex justify-between items-start gap-4 mb-4")}>
                                    <div className="flex-1 min-w-0">
                                         <div className={cn("flex items-center gap-2 mb-1")}>
                                            {meta.concluida && <CheckCircle className={cn("text-green-500 flex-shrink-0", isMobile ? "h-4 w-4" : "h-5 w-5")} />}
                                            <h3 className={cn("font-bold text-white font-cinzel truncate uppercase tracking-wide", meta.concluida && "line-through text-muted-foreground", isMobile ? "text-base" : "text-lg")}>{meta.nome}</h3>
                                        </div>
                                        <Badge variant="outline" className={cn("rounded-none border-blue-500/30 bg-blue-950/20 text-blue-300 font-mono uppercase tracking-wider text-[10px]", isMobile ? "px-1.5 py-0.5" : "")}>
                                            {meta.categoria}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <Button onClick={() => handleOpenEditDialog(meta)} variant="ghost" size="icon" className={cn("text-blue-400/50 hover:text-blue-400 hover:bg-transparent rounded-none", isMobile ? "h-6 w-6" : "h-8 w-8")} aria-label={`Editar meta ${meta.nome}`}>
                                            <Edit className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className={cn("text-red-400/50 hover:text-red-400 hover:bg-transparent rounded-none", isMobile ? "h-6 w-6" : "h-8 w-8")} aria-label={`Excluir meta ${meta.nome}`}>
                                                    <Trash2 className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-black/95 border-red-900/50">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className={cn("text-red-500 font-mono uppercase", isMobile ? "text-lg" : "")}>WARNING: DELETION IMMINENT</AlertDialogTitle>
                                                    <AlertDialogDescription className={cn("text-gray-400 font-mono text-xs", isMobile ? "text-xs" : "")}>
                                                        This action cannot be undone. Target objective and associated quest data will be permanently erased.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter className={isMobile ? "flex-col gap-2" : ""}>
                                                    <AlertDialogCancel className="bg-transparent border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white rounded-none font-mono text-xs">CANCEL</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(meta.id)} className="bg-red-900/20 border border-red-500/50 text-red-500 hover:bg-red-900/40 rounded-none font-mono text-xs">CONFIRM DELETION</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>

                                <div className="flex-grow space-y-4">
                                     <div className="w-full space-y-1">
                                        <div className="flex justify-between text-[10px] font-mono text-blue-400/60 uppercase">
                                            <span>PROGRESS</span>
                                            <span>{Math.round(progress)}%</span>
                                        </div>
                                        <div className="relative h-1.5 bg-blue-950/30 border border-blue-900/20 w-full">
                                            <div 
                                                className="absolute inset-y-0 left-0 bg-blue-500 shadow-[0_0_8px_#3b82f6]" 
                                                style={{ width: `${progress}%` }} 
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-mono text-right">{completedMissionsCount}/{totalMissionsCount} QUESTS</p>
                                    </div>
                                    
                                    {meta.prazo && (
                                        <div className={cn("flex items-center gap-2 text-gray-400 font-mono text-xs border-t border-blue-900/20 pt-2", isMobile ? "text-[10px]" : "text-xs")}>
                                            <CalendarIcon className={cn("text-blue-500", isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
                                            <span>DEADLINE: {format(new Date(meta.prazo), "yyyy-MM-dd")}</span>
                                        </div>
                                    )}
                                </div>

                                <div className={cn("flex flex-col gap-3 mt-4 pt-3 border-t border-blue-900/30")}>
                                    <div className={cn("flex gap-2 w-full")}>
                                        <Button variant="outline" size="sm" onClick={() => setDetailedMeta(meta)} className={cn("flex-1 border-blue-500/30 text-blue-300 hover:bg-blue-500/10 hover:text-blue-200 rounded-none font-mono text-[10px] uppercase tracking-wider", isMobile ? "h-7" : "h-8")}>
                                            <Info className={cn("mr-1", isMobile ? "h-3 w-3" : "h-3 w-3")} />
                                            DETAILS
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleGetRoadmap(meta)} className={cn("flex-1 border-blue-500/30 text-blue-300 hover:bg-blue-500/10 hover:text-blue-200 rounded-none font-mono text-[10px] uppercase tracking-wider", isMobile ? "h-7" : "h-8")}>
                                            <MapIcon className={cn("mr-1", isMobile ? "h-3 w-3" : "h-3 w-3")} />
                                            STRATEGY
                                        </Button>
                                    </div>
                                     {stats && stats.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-2">
                                            {stats.map((stat: any) => (
                                                <div key={stat} className={cn("flex items-center gap-1 text-gray-400 bg-blue-950/20 border border-blue-900/20 px-1.5 py-0.5 rounded-none", isMobile ? "gap-1" : "")}>
                                                    {statIcons[stat]}
                                                    <span className={cn("capitalize font-mono text-[9px] uppercase", isMobile ? "" : "")}>{stat}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )})}
            </div>
            
            {sortedMetas.length === 0 && (
                <div className={cn("flex flex-col items-center justify-center text-center py-16 px-4 border border-blue-900/30 bg-blue-950/10 relative overflow-hidden", isMobile ? "py-8" : "")}>
                    <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-5 pointer-events-none" />
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl" />
                        <div className="relative bg-black border border-blue-500/50 p-6 rounded-full">
                            <Star className={cn("text-blue-400 animate-pulse", isMobile ? "h-10 w-10" : "h-14 w-14")} />
                        </div>
                    </div>
                    <h3 className={cn("font-bold text-white mb-2 font-mono uppercase tracking-widest", isMobile ? "text-lg" : "text-xl")}>NO OBJECTIVES FOUND</h3>
                    <p className={cn("text-blue-400/60 mb-6 max-w-md font-mono text-xs", isMobile ? "text-[10px]" : "text-xs")}>System requires clear targets to generate progression paths.</p>
                    <div className={cn("flex gap-3", isMobile ? "flex-col w-full max-w-xs" : "")}>
                        <Button onClick={() => handleOpenWizard()} className={cn("bg-blue-600 hover:bg-blue-500 text-white font-mono uppercase tracking-wider rounded-none", isMobile ? "w-full" : "")}>
                            <PlusCircle className={cn("mr-2", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                            INITIATE OBJECTIVE
                        </Button>
                        <Button onClick={handleGetSuggestions} variant="outline" className={cn("border-blue-500/30 text-blue-400 hover:bg-blue-900/20 font-mono uppercase tracking-wider rounded-none", isMobile ? "w-full" : "")}>
                            <Wand2 className={cn("mr-2", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                            ANALYZE SUGGESTIONS
                        </Button>
                    </div>
                </div>
            )}
            
            {showWizardDialog && (
                <Dialog open={showWizardDialog} onOpenChange={handleCloseWizard}>
                    {renderWizardContent()}
                </Dialog>
            )}

            {isEditing && metaToEdit && (
                 <Dialog open={isEditing} onOpenChange={handleCloseEditDialog}>
                    <DialogContent className={cn("max-w-2xl", isMobile ? "max-w-[95vw]" : "")}>
                        <DialogHeader>
                            <DialogTitle className={isMobile ? "text-lg" : ""}>Editar Meta: {metaToEdit.nome}</DialogTitle>
                            <DialogDescription className={isMobile ? "text-sm" : ""}>
                                Refine os detalhes da sua meta SMART.
                            </DialogDescription>
                        </DialogHeader>
                        <div className={cn("py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2", isMobile ? "space-y-2 py-2 text-sm" : "")}>
                            <div>
                                <Label htmlFor="prazo" className="text-primary">Prazo (Opcional)</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !metaToEdit.prazo && "text-muted-foreground",
                                            isMobile ? "h-8 text-sm" : ""
                                        )}
                                        >
                                        <CalendarIcon className={cn("mr-2", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                                        {metaToEdit.prazo ? format(new Date(metaToEdit.prazo), "PPP") : <span>Escolha uma data</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                        mode="single"
                                        selected={metaToEdit.prazo ? new Date(metaToEdit.prazo) : undefined}
                                        onSelect={(date) => setMetaToEdit((prev: any) => ({...prev, prazo: date ? date.toISOString().split('T')[0] : null}))}
                                        initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div>
                                <Label htmlFor="specific" className="text-primary">Específico</Label>
                                <Textarea id="specific" value={metaToEdit.detalhes_smart.specific} onChange={(e) => setMetaToEdit((prev: any) => ({...prev, detalhes_smart: {...prev.detalhes_smart, specific: e.target.value}}))} className={cn("min-h-[80px]", isMobile ? "text-sm min-h-[60px]" : "min-h-[80px]")} />
                            </div>
                             <div>
                                <Label htmlFor="measurable" className="text-primary">Mensurável</Label>
                                <Textarea id="measurable" value={metaToEdit.detalhes_smart.measurable} onChange={(e) => setMetaToEdit((prev: any) => ({...prev, detalhes_smart: {...prev.detalhes_smart, measurable: e.target.value}}))} className={cn("min-h-[80px]", isMobile ? "text-sm min-h-[60px]" : "min-h-[80px]")} />
                            </div>
                             <div>
                                <Label htmlFor="achievable" className="text-primary">Atingível</Label>
                                <Textarea id="achievable" value={metaToEdit.detalhes_smart.achievable} onChange={(e) => setMetaToEdit((prev: any) => ({...prev, detalhes_smart: {...prev.detalhes_smart, achievable: e.target.value}}))} className={cn("min-h-[80px]", isMobile ? "text-sm min-h-[60px]" : "min-h-[80px]")} />
                            </div>
                             <div>
                                <Label htmlFor="relevant" className="text-primary">Relevante</Label>
                                <Textarea id="relevant" value={metaToEdit.detalhes_smart.relevant} onChange={(e) => setMetaToEdit((prev: any) => ({...prev, detalhes_smart: {...prev.detalhes_smart, relevant: e.target.value}}))} className={cn("min-h-[80px]", isMobile ? "text-sm min-h-[60px]" : "min-h-[80px]")} />
                            </div>
                             <div>
                                <Label htmlFor="timeBound" className="text-primary">Temporal</Label>
                                <Textarea id="timeBound" value={metaToEdit.detalhes_smart.timeBound} onChange={(e) => setMetaToEdit((prev: any) => ({...prev, detalhes_smart: {...prev.detalhes_smart, timeBound: e.target.value}}))} className={cn("min-h-[80px]", isMobile ? "text-sm min-h-[60px]" : "min-h-[80px]")} />
                            </div>
                        </div>
                         <DialogFooter className={isMobile ? "flex-col gap-2" : ""}>
                            <Button variant="outline" onClick={handleCloseEditDialog} className={isMobile ? "h-8 text-sm" : ""}>Cancelar</Button>
                            <Button onClick={handleSaveEditedGoal} className={isMobile ? "h-8 text-sm" : ""}>Salvar Alterações</Button>
                        </DialogFooter>
                    </DialogContent>
                 </Dialog>
            )}

            {detailedMeta && (
                <Dialog open={!!detailedMeta} onOpenChange={() => setDetailedMeta(null)}>
                    <DialogContent className={cn("bg-black/95 border-2 border-blue-500/50 max-w-2xl w-full p-0 shadow-[0_0_30px_rgba(37,99,235,0.3)] backdrop-blur-xl sm:rounded-none overflow-hidden", isMobile ? "max-w-[95vw]" : "")}>
                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-400 z-20" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-blue-400 z-20" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-400 z-20" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-400 z-20" />

                        <div className="border-b border-blue-900/50 bg-blue-950/20 px-6 py-4 relative z-10">
                            <DialogTitle className={cn("text-lg md:text-xl font-black font-cinzel text-white uppercase tracking-widest drop-shadow-md truncate", isMobile ? "text-base" : "")}>
                                {detailedMeta.nome}
                            </DialogTitle>
                            <DialogDescription className={cn("text-xs font-mono text-blue-400/60 uppercase tracking-wide mt-1", isMobile ? "text-[10px]" : "")}>
                                OBJECTIVE ANALYSIS DATA
                            </DialogDescription>
                        </div>

                        <div className={cn("px-6 py-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar relative z-10", isMobile ? "px-4 py-4 space-y-3" : "")}>
                             <div className="bg-blue-950/10 border border-blue-900/30 p-3">
                                <strong className="text-blue-500 font-mono text-xs uppercase tracking-widest block mb-1">SPECIFIC</strong>
                                <p className="text-blue-100 font-mono text-sm leading-relaxed">{detailedMeta.detalhes_smart.specific}</p>
                             </div>
                             <div className="bg-blue-950/10 border border-blue-900/30 p-3">
                                <strong className="text-blue-500 font-mono text-xs uppercase tracking-widest block mb-1">MEASURABLE</strong>
                                <p className="text-blue-100 font-mono text-sm leading-relaxed">{detailedMeta.detalhes_smart.measurable}</p>
                             </div>
                             <div className="bg-blue-950/10 border border-blue-900/30 p-3">
                                <strong className="text-blue-500 font-mono text-xs uppercase tracking-widest block mb-1">ACHIEVABLE</strong>
                                <p className="text-blue-100 font-mono text-sm leading-relaxed">{detailedMeta.detalhes_smart.achievable}</p>
                             </div>
                             <div className="bg-blue-950/10 border border-blue-900/30 p-3">
                                <strong className="text-blue-500 font-mono text-xs uppercase tracking-widest block mb-1">RELEVANT</strong>
                                <p className="text-blue-100 font-mono text-sm leading-relaxed">{detailedMeta.detalhes_smart.relevant}</p>
                             </div>
                             <div className="bg-blue-950/10 border border-blue-900/30 p-3">
                                <strong className="text-blue-500 font-mono text-xs uppercase tracking-widest block mb-1">TIME-BOUND</strong>
                                <p className="text-blue-100 font-mono text-sm leading-relaxed">{detailedMeta.detalhes_smart.timeBound}</p>
                             </div>
                        </div>
                         <DialogFooter className={cn("px-6 pb-6 bg-black/40 border-t border-blue-900/30 pt-4", isMobile ? "px-4 pb-4 flex-col" : "sm:justify-end")}>
                            <Button variant="outline" onClick={() => setDetailedMeta(null)} className={cn("border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 rounded-none font-mono text-xs uppercase tracking-widest w-full sm:w-auto", isMobile ? "h-9" : "")}>CLOSE WINDOW</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
            
            <Dialog open={showSuggestionDialog} onOpenChange={setShowSuggestionDialog}>
                <DialogContent className={cn("bg-black/95 border-2 border-blue-500/50 max-w-2xl w-full p-0 shadow-[0_0_30px_rgba(37,99,235,0.3)] backdrop-blur-xl sm:rounded-none overflow-hidden", isMobile ? "max-w-[95vw]" : "")}>
                     {/* Corner Accents */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-400 z-20" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-blue-400 z-20" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-400 z-20" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-400 z-20" />

                    <div className="border-b border-blue-900/50 bg-blue-950/20 px-6 py-4 relative z-10">
                        <DialogTitle className={cn("flex items-center gap-3 text-white font-black font-cinzel text-lg uppercase tracking-widest drop-shadow-md", isMobile ? "text-base" : "text-xl")}>
                            <Wand2 className="h-5 w-5 text-blue-400 animate-pulse"/>
                            SYSTEM ANALYSIS SUGGESTIONS
                        </DialogTitle>
                        <DialogDescription className={cn("text-xs font-mono text-blue-400/60 uppercase tracking-wide mt-1", isMobile ? "text-[10px]" : "")}>
                            OPTIMAL PATHWAYS DETECTED BASED ON USER PROFILE
                        </DialogDescription>
                    </div>

                    <div className={cn("px-6 py-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar relative z-10", isMobile ? "px-4 py-4 space-y-3" : "")}>
                        {isLoadingSuggestions && (
                            <div className="space-y-4">
                                <div className="h-24 bg-blue-900/10 border border-blue-500/20 animate-pulse relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full animate-shimmer" />
                                </div>
                                <div className="h-24 bg-blue-900/10 border border-blue-500/20 animate-pulse relative overflow-hidden delay-100">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full animate-shimmer" />
                                </div>
                                <div className="h-24 bg-blue-900/10 border border-blue-500/20 animate-pulse relative overflow-hidden delay-200">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full animate-shimmer" />
                                </div>
                            </div>
                        )}
                        {suggestions.map((s, index) => (
                            <div key={index} className={cn("bg-black/60 border border-blue-900/40 p-4 group hover:border-blue-500/50 hover:bg-blue-950/10 transition-all duration-300 relative overflow-hidden", isMobile ? "p-3" : "")}>
                                {/* Hover Effect */}
                                <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all" />
                                
                                <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center justify-between")}>
                                    <div className="flex-grow space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className={cn("font-bold text-white font-mono uppercase tracking-wide", isMobile ? "text-sm" : "text-base")}>{s.name}</h3>
                                            <span className={cn("text-[10px] font-mono uppercase px-1.5 py-0.5 border border-blue-500/30 bg-blue-950/30 text-blue-300", isMobile ? "" : "")}>{s.category}</span>
                                        </div>
                                        <p className={cn("text-gray-400 font-mono text-xs leading-relaxed", isMobile ? "text-[10px]" : "")}>{s.description}</p>
                                    </div>
                                    <Button size="sm" className={cn("flex-shrink-0 bg-blue-600 hover:bg-blue-500 text-white rounded-none font-mono text-xs uppercase tracking-widest h-8 shadow-[0_0_10px_rgba(37,99,235,0.3)]", isMobile ? "w-full mt-2" : "w-auto sm:ml-4")} onClick={() => handleSelectSuggestion(s.name)}>
                                        ACCEPT
                                    </Button>
                                </div>
                            </div>
                        ))}
                         {!isLoadingSuggestions && suggestions.length === 0 && (
                            <div className={cn("flex flex-col items-center justify-center text-center py-12 border border-dashed border-blue-900/30 bg-blue-950/5", isMobile ? "py-8" : "")}>
                                <div className="p-4 rounded-full bg-blue-900/10 mb-4 animate-pulse">
                                    <Wand2 className={cn("text-blue-500/50", isMobile ? "h-8 w-8" : "h-10 w-10")} />
                                </div>
                                <p className={cn("text-blue-400/60 font-mono text-xs uppercase tracking-widest", isMobile ? "text-[10px]" : "")}>NO DATA GENERATED. RETRY ANALYSIS.</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter className={cn("px-6 pb-6 pt-4 bg-black/40 border-t border-blue-900/30", isMobile ? "px-4 pb-4 flex-col" : "sm:justify-end")}>
                        <Button variant="outline" onClick={() => setShowSuggestionDialog(false)} className={cn("border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 rounded-none font-mono text-xs uppercase tracking-widest w-full sm:w-auto", isMobile ? "h-9" : "")}>CLOSE</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <Dialog open={!!roadmapMeta} onOpenChange={() => setRoadmapMeta(null)}>
                <DialogContent className={cn("bg-black/95 border-2 border-blue-500/50 max-w-3xl w-full p-0 shadow-[0_0_30px_rgba(37,99,235,0.3)] backdrop-blur-xl sm:rounded-none overflow-hidden", isMobile ? "max-w-[95vw]" : "")}>
                     {/* Corner Accents */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-400 z-20" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-blue-400 z-20" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-400 z-20" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-400 z-20" />

                     <div className="border-b border-blue-900/50 bg-blue-950/20 px-6 py-4 relative z-10">
                        <DialogTitle className={cn("font-black text-white font-cinzel tracking-[0.15em] uppercase flex items-center gap-3 drop-shadow-md", isMobile ? "text-lg" : "text-xl")}>
                            <MapIcon className="h-5 w-5 text-blue-400 animate-pulse" />
                            STRATEGIC ROADMAP
                        </DialogTitle>
                        <DialogDescription className={cn("text-xs font-mono text-blue-400/60 uppercase tracking-wide mt-1", isMobile ? "text-[10px]" : "")}>
                            OPTIMIZED PATH FOR: <span className="text-white font-bold">{roadmapMeta?.nome}</span>
                        </DialogDescription>
                    </div>
                     <ScrollArea className={cn("max-h-[60vh] mt-4 pr-4 relative z-10", isMobile ? "max-h-[50vh]" : "")}>
                        {isLoadingRoadmap && (
                             <div className="flex flex-col items-center justify-center p-16 space-y-4">
                                <LoaderCircle className={cn("text-blue-500 animate-spin", isMobile ? "h-8 w-8" : "h-12 w-12")} />
                                <span className="font-mono text-xs text-blue-400 animate-pulse uppercase tracking-widest">CALCULATING STRATEGY...</span>
                            </div>
                        )}
                        {roadmap && (
                             <div className="relative pl-8 py-6 pr-6">
                                <div className="absolute left-[29px] top-6 bottom-6 w-0.5 bg-blue-900/50 -z-10" />
                                {roadmap.map((phase, index) => (
                                    <div key={index} className="relative mb-8 last:mb-0 group">
                                         <div className={cn("absolute -left-[13px] top-0 h-7 w-7 bg-black border-2 border-blue-500 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.5)] z-20 group-hover:border-blue-400 transition-colors", isMobile ? "h-6 w-6 -left-[11px]" : "")}>
                                            <span className={cn("font-bold text-blue-400 font-mono text-xs", isMobile ? "text-[10px]" : "")}>{index + 1}</span>
                                        </div>
                                        <div className="pl-6">
                                            <div className="bg-black/60 border border-blue-900/30 p-4 relative overflow-hidden group-hover:border-blue-500/30 transition-colors">
                                                {/* Tech deco */}
                                                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-blue-900/20" />
                                                
                                                <h3 className={cn("font-bold text-white font-cinzel uppercase tracking-wide mb-1 flex items-center gap-2", isMobile ? "text-sm" : "text-base")}>
                                                    {phase.phaseTitle}
                                                </h3>
                                                <p className={cn("text-gray-400 font-mono text-xs mb-3 border-b border-blue-900/20 pb-2", isMobile ? "text-[10px]" : "")}>{phase.phaseDescription}</p>
                                                
                                                <ul className={cn("space-y-2", isMobile ? "space-y-1.5" : "")}>
                                                    {phase.strategicMilestones.map((milestone, mIndex) => (
                                                         <li key={mIndex} className="flex items-start gap-2 text-blue-100/80 font-mono text-xs">
                                                            <Milestone className={cn("text-blue-500/70 mt-0.5 flex-shrink-0", isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
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
                     <DialogFooter className={cn("px-6 pb-6 pt-4 bg-black/40 border-t border-blue-900/30", isMobile ? "px-4 pb-4 flex-col" : "sm:justify-end")}>
                        <Button variant="outline" onClick={() => setRoadmapMeta(null)} className={cn("border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 rounded-none font-mono text-xs uppercase tracking-widest w-full sm:w-auto", isMobile ? "h-9" : "")}>CLOSE STRATEGY</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export const MetasView = memo(MetasViewComponent);

const statIcons: any = {
    forca: <Swords className="h-4 w-4 text-red-400" />,
    inteligencia: <Brain className="h-4 w-4 text-blue-400" />,
    destreza: <Zap className="h-4 w-4 text-yellow-400" />,
    constituicao: <ShieldCheck className="h-4 w-4 text-green-400" />,
    sabedoria: <BookOpen className="h-4 w-4 text-purple-400" />,
    carisma: <Star className="h-4 w-4 text-pink-400" />,
};
