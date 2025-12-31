"use client";

import { useState, useCallback, useEffect } from 'react';
import { Feather, Zap, ZapIcon, Wand2, Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from "date-fns";
import { generateGoalCategory } from '@/lib/ai-client';
import { generateSmartGoalQuestion } from '@/lib/ai-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useIsMobile } from '@/hooks/use-mobile';
import * as mockData from '@/lib/data';

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

export const SmartGoalWizard = ({ onClose, onSave, metaToEdit, profile, initialGoalName = '' }: SmartGoalWizardProps) => {
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
        
        const updatedGoal = { 
            name: goalState.nome,
            specific: goalState.detalhes_smart.specific || userInput,
            measurable: goalState.detalhes_smart.measurable || (goalState.detalhes_smart.specific ? userInput : ''),
            achievable: goalState.detalhes_smart.achievable || (goalState.detalhes_smart.measurable ? userInput : ''),
            relevant: goalState.detalhes_smart.relevant || (goalState.detalhes_smart.achievable ? userInput : ''),
            timeBound: goalState.detalhes_smart.timeBound || (goalState.detalhes_smart.relevant ? userInput : '')
        };
        
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
