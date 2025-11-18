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
                     <DialogContent className={cn("bg-gradient-to-br from-background to-secondary/20 border-border/50", isMobile ? "max-w-[95vw]" : "")}>
                        <DialogHeader>
                            <DialogTitle className={cn("text-primary font-cinzel text-center", isMobile ? "text-lg" : "text-xl")}>Escolha o modo de criação da meta</DialogTitle>
                            <DialogDescription className={cn("text-center", isMobile ? "text-sm" : "")}>
                                Como você prefere definir a sua próxima grande meta?
                            </DialogDescription>
                        </DialogHeader>
                        <div className={cn("grid gap-4 py-4", isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                           <button onClick={() => setWizardMode('simple')} className={cn("group border border-gray-700/50 rounded-lg hover:bg-gradient-to-br hover:from-cyan-400/10 hover:to-cyan-400/5 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20 hover:scale-[1.02] bg-gradient-to-br from-card/80 to-card/40", isMobile ? "p-3" : "p-4")}>
                               <div className="flex flex-col items-center text-center">
                                   <div className="relative mb-3">
                                       <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300" />
                                       <div className="relative bg-gradient-to-br from-cyan-400/20 to-cyan-400/10 p-3 rounded-full">
                                           <Feather className={cn("text-cyan-400 group-hover:scale-110 transition-transform duration-300", isMobile ? "h-8 w-8" : "h-10 w-10")}/>
                                       </div>
                                   </div>
                                   <h3 className={cn("font-bold text-gray-200 group-hover:text-cyan-300 transition-colors duration-300", isMobile ? "text-base" : "")}>Modo Rápido</h3>
                                   <p className={cn("text-gray-400 group-hover:text-gray-300 transition-colors duration-300", isMobile ? "text-xs" : "text-sm")}>Apenas dê um nome à sua meta. A IA fará o resto.</p>
                               </div>
                           </button>
                           <button onClick={() => setWizardMode('detailed')} className={cn("group border border-gray-700/50 rounded-lg hover:bg-gradient-to-br hover:from-purple-400/10 hover:to-purple-400/5 transition-all duration-300 hover:shadow-lg hover:shadow-purple-400/20 hover:scale-[1.02] bg-gradient-to-br from-card/80 to-card/40", isMobile ? "p-3" : "p-4")}>
                               <div className="flex flex-col items-center text-center">
                                   <div className="relative mb-3">
                                       <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300" />
                                       <div className="relative bg-gradient-to-br from-purple-400/20 to-purple-400/10 p-3 rounded-full">
                                           <ZapIcon className={cn("text-purple-400 group-hover:scale-110 transition-transform duration-300", isMobile ? "h-8 w-8" : "h-10 w-10")}/>
                                       </div>
                                   </div>
                                   <h3 className={cn("font-bold text-gray-200 group-hover:text-purple-300 transition-colors duration-300", isMobile ? "text-base" : "")}>Modo Detalhado</h3>
                                   <p className={cn("text-gray-400 group-hover:text-gray-300 transition-colors duration-300", isMobile ? "text-xs" : "text-sm")}>Seja guiado pela IA para criar uma meta SMART completa.</p>
                               </div>
                           </button>
                        </div>
                    </DialogContent>
                );
            case 'simple':
                 return (
                    <DialogContent className={cn("bg-gradient-to-br from-background to-secondary/20 border-border/50", isMobile ? "max-w-[95vw]" : "")}>
                        <DialogHeader>
                            <DialogTitle className={cn("text-primary font-cinzel flex items-center gap-2", isMobile ? "text-lg" : "")}>
                                <Feather className="text-cyan-400" />
                                Modo Rápido: Nova Meta
                            </DialogTitle>
                            <DialogDescription className={isMobile ? "text-sm" : ""}>
                                Digite o nome da sua meta. O Sistema irá transformá-la num objetivo SMART para si.
                            </DialogDescription>
                        </DialogHeader>
                        <div className={cn("py-4 space-y-4", isMobile ? "space-y-2" : "")}>
                             <div>
                                <Label htmlFor="goal-name" className={cn("text-primary", isMobile ? "text-sm" : "")}>Nome da Meta</Label>
                                <Input
                                    id="goal-name"
                                    placeholder="Ex: Aprender a investir na bolsa"
                                    value={quickGoalData.name}
                                    onChange={(e) => setQuickGoalData(prev => ({...prev, name: e.target.value}))}
                                    disabled={isLoadingSimpleGoal}
                                    onKeyPress={(e) => e.key === 'Enter' && handleCreateSimpleGoal()}
                                    className={cn("bg-card/50 border-gray-600 focus:border-cyan-400 transition-colors duration-200", isMobile ? "text-sm h-8" : "")}
                                />
                             </div>
                             <div>
                                <Label htmlFor="prazo" className={cn("text-primary", isMobile ? "text-sm" : "")}>Prazo (Opcional)</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal bg-card/80 mt-1 border-gray-600 hover:bg-card/90 transition-all duration-200",
                                            !quickGoalData.prazo && "text-muted-foreground",
                                            isMobile ? "h-8 text-sm" : ""
                                        )}
                                        >
                                        <CalendarIcon className={cn("mr-2", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                                        {quickGoalData.prazo ? format(new Date(quickGoalData.prazo), "PPP") : <span>Escolha uma data</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                        mode="single"
                                        selected={quickGoalData.prazo ? new Date(quickGoalData.prazo) : undefined}
                                        onSelect={(date) => setQuickGoalData(prev => ({...prev, prazo: date ? date.toISOString().split('T')[0] : null}))}
                                        initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                        </div>
                        <DialogFooter className={cn("flex-col-reverse gap-2", isMobile ? "sm:flex-col" : "sm:flex-row sm:justify-end")}>
                            <Button variant="outline" onClick={handleCloseWizard} disabled={isLoadingSimpleGoal} className={cn("border-gray-600 hover:bg-gray-700/50 transition-all duration-200", isMobile ? "h-8 text-sm" : "")}>{isMobile ? "Cancelar" : "Cancelar"}</Button>
                            <Button onClick={handleCreateSimpleGoal} disabled={isLoadingSimpleGoal || !quickGoalData.name.trim()} className={cn("bg-gradient-to-r from-cyan-500 to-cyan-500/80 hover:from-cyan-600 hover:to-cyan-600/80 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl", isMobile ? "h-8 text-sm" : "")}>
                                {isLoadingSimpleGoal ? (isMobile ? "A criar..." : "A criar...") : (isMobile ? "Criar Meta" : "Criar Meta")}
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
            <div className={cn("items-start gap-4 mb-4", isMobile ? "flex flex-col" : "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6")}>
                <div className="flex flex-col gap-2">
                    <h1 className={cn("font-bold text-primary font-cinzel tracking-wider", isMobile ? "text-2xl" : "text-3xl")}>Metas</h1>
                    <p className={cn("text-muted-foreground max-w-2xl", isMobile ? "text-sm" : "")}>Suas grandes conquistas aguardam. Cada meta gera uma árvore de missões épicas para guiá-lo.</p>
                </div>
                <div className={cn("flex flex-col gap-2 w-full", isMobile ? "sm:w-full" : "sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto")}>
                     <Button onClick={handleGetSuggestions} variant="outline" className={cn("text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10 hover:text-cyan-300 transition-all duration-200 hover:scale-105", isMobile ? "w-full text-sm h-8" : "w-full sm:w-auto")}>
                        <Wand2 className={cn("mr-2", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                        {isMobile ? "Sugerir" : "Sugerir Novas Metas"}
                    </Button>
                    <Button onClick={() => handleOpenWizard()} className={cn("bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl", isMobile ? "w-full text-sm h-8" : "w-full sm:w-auto")}>
                        <PlusCircle className={cn("mr-2", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                        {isMobile ? "Adicionar" : "Adicionar Meta"}
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
                        <Card key={meta.id} className={cn("bg-gradient-to-br from-card/80 to-card/40 border border-border/80 flex flex-col transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative group overflow-hidden", meta.concluida && "bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30 shadow-green-500/20", isMobile ? "text-sm" : "")}>
                            {meta.concluida && (
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
                            )}
                            <CardHeader className={cn("relative z-10", isMobile ? "p-3" : "")}>
                                <div className={cn("items-start gap-4", isMobile ? "flex justify-between" : "flex justify-between items-start gap-4")}>
                                    <div className="flex-1">
                                         <CardTitle className={cn("text-foreground flex items-center gap-2", isMobile ? "text-base" : "text-lg")}>
                                            {meta.concluida && <CheckCircle className={cn("text-green-500 flex-shrink-0 animate-in fade-in-50 duration-500", isMobile ? "h-4 w-4" : "h-5 w-5")} />}
                                            <span className={cn(meta.concluida && "line-through text-muted-foreground")}>{meta.nome}</span>
                                        </CardTitle>
                                        <CardDescription className={cn("mt-1", isMobile ? "mt-1" : "mt-1")}>
                                            <Badge variant={meta.concluida ? "secondary" : "default"} className={cn("transition-all duration-300", !meta.concluida && "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/30 hover:from-primary/30 hover:to-primary/20", isMobile ? "text-xs" : "")}>
                                                {meta.categoria}
                                            </Badge>
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <Button onClick={() => handleOpenEditDialog(meta)} variant="ghost" size="icon" className={cn("text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/10 rounded-full transition-all duration-200", isMobile ? "h-6 w-6" : "h-8 w-8")} aria-label={`Editar meta ${meta.nome}`}>
                                            <Edit className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className={cn("text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all duration-200", isMobile ? "h-6 w-6" : "h-8 w-8")} aria-label={`Excluir meta ${meta.nome}`}>
                                                    <Trash2 className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className={isMobile ? "text-lg" : ""}>Tem a certeza?</AlertDialogTitle>
                                                    <AlertDialogDescription className={isMobile ? "text-sm" : ""}>
                                                        Esta ação não pode ser desfeita. Isto irá apagar permanentemente a sua meta e toda a sua árvore de progressão de missões. A habilidade adquirida não será removida.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter className={isMobile ? "flex-col gap-2" : ""}>
                                                    <AlertDialogCancel className={isMobile ? "text-sm h-8" : ""}>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(meta.id)} className={isMobile ? "text-sm h-8" : ""}>Continuar</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className={cn("flex-grow space-y-4 relative z-10", isMobile ? "p-3 space-y-2" : "")}>
                                 <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger className="w-full">
                                            <div className="relative">
                                                <Progress value={progress} className={cn("bg-secondary/50 shadow-inner", isMobile ? "h-2" : "h-3")} />
                                                {progress > 0 && (
                                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 rounded-full" style={{ width: `${progress}%` }} />
                                                )}
                                                {progress > 5 && (
                                                    <span className={cn("absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-primary-foreground mix-blend-difference", isMobile ? "text-[10px]" : "text-xs")}>
                                                        {Math.round(progress)}%
                                                    </span>
                                                )}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className={isMobile ? "text-xs" : ""}>{completedMissionsCount} de {totalMissionsCount} missões épicas concluídas</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                {meta.prazo && (
                                    <div className={cn("flex items-center gap-2 text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                                        <CalendarIcon className={cn("text-primary/70", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                                        <span>Prazo: {format(new Date(meta.prazo), "dd/MM/yyyy")}</span>
                                    </div>
                                )}
                            </CardContent>
                             <CardFooter className={cn("flex-col items-start gap-4 relative z-10", isMobile ? "p-3 gap-2" : "")}>
                                <div className={cn("flex gap-2 w-full", isMobile ? "flex-col" : "flex-wrap")}>
                                    <Button variant="outline" size="sm" onClick={() => setDetailedMeta(meta)} className={cn("flex-1 transition-all duration-200 hover:bg-primary/10 hover:border-primary/50", isMobile ? "text-xs py-1 h-8" : "")}>
                                        <Info className={cn("mr-1", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                                        {isMobile ? "Detalhes" : "Detalhes"}
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleGetRoadmap(meta)} className={cn("flex-1 transition-all duration-200 hover:bg-accent/10 hover:border-accent/50", isMobile ? "text-xs py-1 h-8" : "")}>
                                        <MapIcon className={cn("mr-1", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                                        {isMobile ? "Estratégia" : "Estratégia"}
                                    </Button>
                                </div>
                                 {stats && stats.length > 0 && (
                                    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 w-full pt-4 border-t border-border/50", isMobile ? "pt-2" : "")}>
                                        <strong className={cn("text-muted-foreground shrink-0", isMobile ? "text-xs" : "text-sm")}>Atributos:</strong>
                                        <div className="flex flex-wrap items-center gap-3">
                                        {stats.map((stat: any) => (
                                            <div key={stat} className={cn("flex items-center gap-1.5 text-card-foreground bg-secondary/30 px-2 py-1 rounded-full transition-all duration-200 hover:bg-secondary/50", isMobile ? "gap-1 px-1.5 py-0.5" : "")}>
                                                {statIcons[stat]}
                                                <span className={cn("capitalize", isMobile ? "text-xs" : "text-xs")}>{stat}</span>
                                            </div>
                                        ))}
                                        </div>
                                    </div>
                                )}
                            </CardFooter>
                        </Card>
                    )})}
            </div>
            
            {sortedMetas.length === 0 && (
                <div className={cn("flex flex-col items-center justify-center text-center py-16 px-4 rounded-lg border-2 border-dashed border-border/50 bg-gradient-to-br from-secondary/20 to-secondary/10", isMobile ? "py-8" : "")}>
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl" />
                        <div className="relative bg-gradient-to-br from-card to-card/80 p-6 rounded-full border border-border/50">
                            <Star className={cn("text-primary animate-pulse", isMobile ? "h-12 w-12" : "h-16 w-16")} />
                        </div>
                    </div>
                    <h3 className={cn("font-bold text-foreground mb-2 font-cinzel", isMobile ? "text-xl" : "text-2xl")}>Sua Jornada Começa Aqui</h3>
                    <p className={cn("text-muted-foreground mb-6 max-w-md", isMobile ? "text-sm" : "")}>Defina suas primeiras metas e veja o Sistema criar uma árvore completa de missões épicas para guiá-lo rumo à vitória.</p>
                    <div className={cn("flex gap-3", isMobile ? "flex-col w-full max-w-xs" : "")}>
                        <Button onClick={() => handleOpenWizard()} className={cn("bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl", isMobile ? "w-full" : "")}>
                            <PlusCircle className={cn("mr-2", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                            Criar Primeira Meta
                        </Button>
                        <Button onClick={handleGetSuggestions} variant="outline" className={cn("border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 transition-all duration-200 hover:scale-105", isMobile ? "w-full" : "")}>
                            <Wand2 className={cn("mr-2", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                            Ver Sugestões
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
                    <DialogContent className={cn("max-w-2xl", isMobile ? "max-w-[95vw]" : "")}>
                        <DialogHeader>
                            <DialogTitle className={isMobile ? "text-lg" : ""}>{detailedMeta.nome}</DialogTitle>
                            <DialogDescription className={isMobile ? "text-sm" : ""}>
                                Detalhes SMART da sua meta.
                            </DialogDescription>
                        </DialogHeader>
                        <div className={cn("py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2", isMobile ? "space-y-2 py-2 text-sm" : "")}>
                             <p className="break-words"><strong className="text-primary">Específico:</strong> {detailedMeta.detalhes_smart.specific}</p>
                            <p className="break-words"><strong className="text-primary">Mensurável:</strong> {detailedMeta.detalhes_smart.measurable}</p>
                            <p className="break-words"><strong className="text-primary">Atingível:</strong> {detailedMeta.detalhes_smart.achievable}</p>
                            <p className="break-words"><strong className="text-primary">Relevante:</strong> {detailedMeta.detalhes_smart.relevant}</p>
                            <p className="break-words"><strong className="text-primary">Temporal:</strong> {detailedMeta.detalhes_smart.timeBound}</p>
                        </div>
                         <DialogFooter className={isMobile ? "flex-col gap-2" : ""}>
                            <Button variant="outline" onClick={() => setDetailedMeta(null)} className={isMobile ? "h-8 text-sm" : ""}>Fechar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
            
            <Dialog open={showSuggestionDialog} onOpenChange={setShowSuggestionDialog}>
                <DialogContent className={cn("max-w-2xl bg-gradient-to-br from-background to-secondary/20 border-border/50", isMobile ? "max-w-[95vw]" : "")}>
                    <DialogHeader>
                        <DialogTitle className={cn("flex items-center gap-2 text-primary font-cinzel", isMobile ? "text-lg" : "text-xl")}>
                            <Wand2 className="animate-pulse"/>
                            Sugestões do Sistema
                        </DialogTitle>
                        <DialogDescription className={isMobile ? "text-sm" : ""}>
                            Com base no seu perfil, o Sistema acredita que estes seriam os próximos passos ideais na sua jornada.
                        </DialogDescription>
                    </DialogHeader>
                    <div className={cn("py-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2", isMobile ? "space-y-2 py-2" : "")}>
                        {isLoadingSuggestions && (
                            <div className="space-y-3">
                                <Skeleton className={isMobile ? "h-16 w-full" : "h-20 w-full"} />
                                <Skeleton className={isMobile ? "h-16 w-full" : "h-20 w-full"} />
                                <Skeleton className={isMobile ? "h-16 w-full" : "h-20 w-full"} />
                            </div>
                        )}
                        {suggestions.map((s, index) => (
                            <div key={index} className={cn("border border-border/50 rounded-lg hover:bg-gradient-to-r hover:from-secondary/30 hover:to-accent/20 transition-all duration-300 hover:shadow-md hover:scale-[1.01] group", isMobile ? "p-2" : "p-4")}>
                                <div className={cn("items-start gap-2", isMobile ? "flex flex-col" : "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2")}>
                                    <div className="flex-grow">
                                        <h3 className={cn("font-bold text-foreground group-hover:text-primary transition-colors duration-200", isMobile ? "text-base" : "")}>{s.name}</h3>
                                        <p className={cn("text-muted-foreground mt-1", isMobile ? "text-xs" : "text-sm")}>{s.description}</p>
                                        <span className={cn("text-primary bg-primary/20 px-2 py-1 rounded-full mt-2 inline-block border border-primary/30", isMobile ? "text-xs" : "text-xs")}>{s.category}</span>
                                    </div>
                                    <Button size="sm" className={cn("ml-0 flex-shrink-0 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg", isMobile ? "h-8 text-sm w-full mt-2" : "sm:ml-4")} onClick={() => handleSelectSuggestion(s.name)}>
                                        Iniciar
                                    </Button>
                                </div>
                            </div>
                        ))}
                         {!isLoadingSuggestions && suggestions.length === 0 && (
                            <div className={cn("flex flex-col items-center justify-center text-center py-8", isMobile ? "py-4" : "")}>
                                <div className="bg-gradient-to-br from-secondary/30 to-secondary/10 p-4 rounded-full mb-4">
                                    <Wand2 className={cn("text-muted-foreground", isMobile ? "h-8 w-8" : "h-10 w-10")} />
                                </div>
                                <p className={cn("text-center text-muted-foreground", isMobile ? "text-sm" : "")}>Não foi possível gerar sugestões neste momento.</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            
            <Dialog open={!!roadmapMeta} onOpenChange={() => setRoadmapMeta(null)}>
                <DialogContent className={cn("max-w-3xl bg-gradient-to-br from-background to-secondary/20 border-border/50", isMobile ? "max-w-[95vw]" : "")}>
                     <DialogHeader>
                        <DialogTitle className={cn("font-cinzel text-primary flex items-center gap-3", isMobile ? "text-lg" : "text-2xl")}>
                            <MapIcon className="animate-pulse" />
                            Roteiro Estratégico
                        </DialogTitle>
                        <DialogDescription className={isMobile ? "text-sm" : ""}>
                            O plano de batalha do Estratega Mestre para a sua meta: <span className="font-bold text-foreground">{roadmapMeta?.nome}</span>
                        </DialogDescription>
                    </DialogHeader>
                     <ScrollArea className={cn("max-h-[60vh] mt-4 pr-4", isMobile ? "max-h-[50vh]" : "")}>
                        {isLoadingRoadmap && (
                             <div className="flex items-center justify-center p-16">
                                <LoaderCircle className={cn("text-primary animate-spin", isMobile ? "h-8 w-8" : "h-10 w-10")} />
                            </div>
                        )}
                        {roadmap && (
                             <div className="relative pl-6 py-4">
                                <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-accent/30 to-primary/50 -z-10 rounded-full" />
                                {roadmap.map((phase, index) => (
                                    <div key={index} className="relative mb-8">
                                         <div className={cn("absolute -left-1 top-1 h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent border-4 border-background flex items-center justify-center shadow-lg", isMobile ? "h-6 w-6" : "")}>
                                            <span className={cn("font-bold text-primary-foreground", isMobile ? "text-sm" : "")}>{index + 1}</span>
                                        </div>
                                        <div className="pl-12">
                                            <Card className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
                                                <CardHeader className={isMobile ? "p-3" : ""}>
                                                    <CardTitle className={cn("font-cinzel text-accent flex items-center gap-2", isMobile ? "text-base" : "")}>
                                                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                                                        {phase.phaseTitle}
                                                    </CardTitle>
                                                    <CardDescription className={isMobile ? "text-xs" : ""}>{phase.phaseDescription}</CardDescription>
                                                </CardHeader>
                                                <CardContent className={isMobile ? "p-3" : ""}>
                                                    <ul className={cn("space-y-3", isMobile ? "space-y-2" : "")}>
                                                        {phase.strategicMilestones.map((milestone, mIndex) => (
                                                             <li key={mIndex} className="flex items-start gap-3 hover:bg-secondary/30 p-2 rounded-md transition-colors duration-200">
                                                                <Milestone className={cn("text-accent/80 mt-1 flex-shrink-0", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                                                                <span className={isMobile ? "text-sm" : "text-foreground"}>{milestone}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                     <DialogFooter className={cn("mt-4", isMobile ? "flex-col gap-2" : "")}>
                        <Button variant="outline" onClick={() => setRoadmapMeta(null)} className={cn("transition-all duration-200 hover:bg-secondary/50", isMobile ? "h-8 text-sm" : "")}>Fechar</Button>
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
