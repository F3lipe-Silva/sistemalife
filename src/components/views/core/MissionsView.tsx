"use client";

import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { Circle, CheckCircle, Timer, Sparkles, History, GitMerge, LifeBuoy, Link, Undo2, ChevronsDown, ChevronsUp, RefreshCw, Gem, Plus, Eye, EyeOff, LoaderCircle, AlertTriangle, Search, PlusCircle, Trophy, MessageSquare, Lock, Edit, Wand2, Star, Zap, TrendingUp as TrendingUpIcon, Filter, SortAsc, CalendarClock, Target as TargetIcon, Activity, Flame } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { MissionDetailsDialog } from './missions/MissionDetailsDialog';
import { MissionCompletionAnimation } from './missions/MissionCompletionAnimation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { MissionStatsPanel } from './missions/MissionStatsPanel';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { differenceInDays, parseISO, isToday, endOfDay } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TrendingDown, TrendingUp, CheckCircle2 } from 'lucide-react';
import { generateNextDailyMission } from '@/lib/ai-client';
import { useIsMobile } from '@/hooks/use-mobile';

// Type definitions
interface SubTask {
    name: string;
    target: number;
    unit: string;
    current: number;
}

// Add the Mission interface that matches the one in MissionDetailsDialog
interface Mission {
    id?: string | number;
    nome: string;
    descricao: string;
    xp_conclusao: number;
    fragmentos_conclusao: number;
    concluido?: boolean;
    tipo?: string;
    subTasks: SubTask[];
    learningResources?: string[];
    isManual?: boolean;
}

interface DailyMission {
    id: string | number;
    nome: string;
    descricao: string;
    xp_conclusao: number;
    fragmentos_conclusao: number;
    concluido: boolean;
    tipo: string;
    subTasks: SubTask[];
    learningResources?: string[];
    completed_at?: string;
}

interface RankedMission {
    id: string | number;
    nome: string;
    descricao: string;
    concluido: boolean;
    rank: string;
    level_requirement: number;
    meta_associada: string;
    total_missoes_diarias: number;
    ultima_missao_concluida_em: string | null;
    missoes_diarias: DailyMission[];
    isManual?: boolean;
    subTasks?: SubTask[];
    tipo?: string;
    is_epic?: boolean;
}

interface Meta {
    id: string | number;
    nome: string;
    prazo?: string;
    concluida: boolean;
}

interface Profile {
    nivel: number;
    xp: number;
    xp_para_proximo_nivel: number;
    user_settings: {
        layout_density: string;
        mission_view_style: string;
    };
    manual_missions: RankedMission[];
}

type FeedbackType = 'hint' | 'too_hard' | 'too_easy';
type DifficultyType = 'too_easy' | 'perfect' | 'too_hard';

interface FeedbackModalState {
    open: boolean;
    mission: DailyMission | null;
    type: FeedbackType | null;
}

interface ContributionModalState {
    open: boolean;
    subTask: SubTask | null;
    mission: DailyMission | null;
}

interface MissionCompletionFeedbackState {
    open: boolean;
    missionName: string;
    rankedMissionId: string | number | null;
    dailyMissionId?: string | number | null;
    subTask?: SubTask | null;
    amount?: number | null;
}

interface AnimationState {
    showAnimation: boolean;
    missionName: string;
    xpGained: number;
    fragmentsGained: number;
    levelUp: boolean;
    newLevel: number;
}

interface DialogState {
    open: boolean;
    mission: DailyMission | RankedMission | null;
    isManual: boolean;
}

interface MissionFeedbackDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (feedbackType: FeedbackType, userText: string) => void;
    mission: DailyMission;
    feedbackType: FeedbackType;
}

interface ContributionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subTask: SubTask;
    onContribute: (amount: number) => void;
}

interface MissionCompletionFeedbackDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitFeedback: (feedbackData: { difficulty: DifficultyType; comment?: string }) => void;
    missionName: string;
}

interface TriggerWrapperProps {
    children: React.ReactNode;
}

// Helper Dialog for getting user feedback
const MissionFeedbackDialog: React.FC<MissionFeedbackDialogProps> = ({ open, onOpenChange, onSubmit, mission, feedbackType }) => {
    const [feedbackText, setFeedbackText] = useState('');
    const [loading, setLoading] = useState(false);
    const isMobile = useIsMobile();

    const dialogTitles: Record<FeedbackType, string> = {
        'hint': 'Precisa de uma Dica?',
        'too_hard': 'Missão Muito Difícil?',
        'too_easy': 'Missão Muito Fácil?'
    };

    const dialogDescriptions: Record<FeedbackType, string> = {
        'hint': 'Descreva onde você está bloqueado e o Sistema fornecerá uma pista.',
        'too_hard': 'Descreva por que a missão está muito difícil. O Sistema irá ajustar o próximo passo.',
        'too_easy': 'Descreva por que a missão foi muito fácil para que o Sistema possa aumentar o desafio.'
    };

    const handleSubmit = async () => {
        setLoading(true);
        await onSubmit(feedbackType, feedbackText);
        setLoading(false);
        onOpenChange(false);
        setFeedbackText('');
    };

    if (!mission || !feedbackType) return null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) setFeedbackText(''); onOpenChange(isOpen); }}>
            <DialogContent className={isMobile ? "max-w-[95vw]" : ""}>
                <DialogHeader>
                    <DialogTitle className={isMobile ? "text-lg" : ""}>{dialogTitles[feedbackType]}</DialogTitle>
                    <DialogDescription className={isMobile ? "text-sm" : ""}>{dialogDescriptions[feedbackType]}</DialogDescription>
                </DialogHeader>
                <div className={cn("py-4", isMobile ? "py-2" : "")}>
                    <Textarea
                        placeholder="Forneça mais detalhes aqui..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        disabled={loading}
                        className={isMobile ? "text-sm" : ""}
                    />
                </div>
                <DialogFooter className={isMobile ? "flex-col gap-2" : ""}>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className={isMobile ? "h-8 text-sm" : ""}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className={isMobile ? "h-8 text-sm" : ""}>
                        {loading ? "A enviar..." : "Enviar Feedback"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const ContributionDialog: React.FC<ContributionDialogProps> = ({ open, onOpenChange, subTask, onContribute }) => {
    const [amount, setAmount] = useState('');
    const isMobile = useIsMobile();

    if (!subTask) return null;

    const remaining = subTask.target - (subTask.current || 0);

    const handleContribute = () => {
        const contribution = parseInt(amount, 10);
        if (!isNaN(contribution) && contribution > 0) {
            onContribute(contribution);
            onOpenChange(false);
            setAmount('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) setAmount(''); onOpenChange(isOpen); }}>
            <DialogContent className={isMobile ? "max-w-[95vw]" : ""}>
                <DialogHeader>
                    <DialogTitle className={isMobile ? "text-lg" : ""}>Contribuir para: {subTask.name}</DialogTitle>
                    <DialogDescription className={isMobile ? "text-sm" : ""}>
                        Insira a quantidade que você concluiu. O seu esforço fortalece o seu progresso.
                    </DialogDescription>
                </DialogHeader>
                <div className={cn("py-4 space-y-4", isMobile ? "py-2 space-y-2" : "")}>
                    <p className={cn("text-center bg-secondary p-2 rounded-md", isMobile ? "text-xs p-1" : "text-sm p-2")}>
                        Progresso atual: <span className="font-bold text-primary">{subTask.current || 0} / {subTask.target}</span>
                    </p>
                    <div>
                        <Label htmlFor="contribution-amount" className={isMobile ? "text-sm" : ""}>Nova Contribuição</Label>
                        <Input
                            id="contribution-amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder={`Ex: 5 (Máx: ${remaining})`}
                            min="1"
                            max={remaining}
                            className={isMobile ? "h-8 text-sm" : ""}
                        />
                    </div>
                </div>
                <DialogFooter className={isMobile ? "flex-col gap-2" : ""}>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className={isMobile ? "h-8 text-sm" : ""}>Cancelar</Button>
                    <Button onClick={handleContribute} disabled={!amount || parseInt(amount, 10) <= 0 || parseInt(amount, 10) > remaining} className={isMobile ? "h-8 text-sm" : ""}>
                        Contribuir
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const MissionCompletionFeedbackDialog: React.FC<MissionCompletionFeedbackDialogProps> = ({ isOpen, onClose, onSubmitFeedback, missionName }) => {
    const [difficulty, setDifficulty] = useState<DifficultyType | ''>('');
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isMobile = useIsMobile();

    const handleSubmit = async () => {
        if (!difficulty) return;

        setIsSubmitting(true);

        const feedbackData = {
            difficulty: difficulty as DifficultyType,
            comment: comment.trim() || undefined,
        };

        // Reset form and close dialog immediately
        setDifficulty('');
        setComment('');
        setIsSubmitting(false);
        onClose();

        // Send feedback in background
        onSubmitFeedback(feedbackData);
    };

    const handleClose = () => {
        setDifficulty('');
        setComment('');
        onClose();
    };

    const difficultyOptions = [
        {
            value: 'too_easy',
            label: 'Muito Fácil',
            description: 'A missão foi simples demais, preciso de mais desafio (+1,5% de dificuldade)',
            icon: <TrendingDown className={cn("h-4 w-4 text-green-500", isMobile ? "h-3 w-3" : "h-4 w-4")} />,
            color: 'border-green-200 hover:border-green-400',
        },
        {
            value: 'perfect',
            label: 'Perfeita',
            description: 'A dificuldade estava ideal para o meu nível (+1% de dificuldade)',
            icon: <CheckCircle2 className={cn("h-4 w-4 text-blue-500", isMobile ? "h-3 w-3" : "h-4 w-4")} />,
            color: 'border-blue-200 hover:border-blue-400',
        },
        {
            value: 'too_hard',
            label: 'Muito Difícil',
            description: 'A missão foi desafiadora demais, preciso de passos menores (-0,5% de dificuldade)',
            icon: <TrendingUp className={cn("h-4 w-4 text-red-500", isMobile ? "h-3 w-3" : "h-4 w-4")} />,
            color: 'border-red-200 hover:border-red-400',
        },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className={cn("max-w-md", isMobile ? "max-w-[95vw]" : "")}>
                <DialogHeader className="text-center">
                    <DialogTitle className={cn("flex items-center justify-center gap-2", isMobile ? "text-lg" : "")}>
                        <MessageSquare className={cn("text-primary", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                        Feedback da Missão
                    </DialogTitle>
                    <DialogDescription className={isMobile ? "text-sm" : ""}>
                        Como foi completar "<span className="font-semibold text-foreground">{missionName}</span>"?
                    </DialogDescription>
                </DialogHeader>

                <div className={cn("py-4 space-y-4", isMobile ? "py-2 space-y-2" : "")}>
                    <div>
                        <Label className={cn("font-medium", isMobile ? "text-sm" : "text-sm")}>Dificuldade da Missão</Label>
                        <RadioGroup value={difficulty as string} onValueChange={(value) => setDifficulty(value as DifficultyType | '')} className={cn("mt-2", isMobile ? "mt-1" : "")}>
                            {difficultyOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={cn(`flex items-start space-x-3 border rounded-lg p-3 cursor-pointer transition-colors ${option.color} ${difficulty === option.value ? 'bg-secondary/50' : 'hover:bg-secondary/20'}`, isMobile ? "p-2 space-x-2" : "p-3 space-x-3")}
                                    onClick={() => setDifficulty(option.value as DifficultyType | '')}
                                >
                                    <RadioGroupItem value={option.value} id={option.value} className="mt-0.5 pointer-events-none" />
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            {option.icon}
                                            <Label htmlFor={option.value} className={cn("font-normal cursor-pointer", isMobile ? "text-sm" : "")}>
                                                {option.label}
                                            </Label>
                                        </div>
                                        <p className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-xs")}>{option.description}</p>
                                    </div>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {difficulty && (
                        <div className="space-y-2">
                            <Label htmlFor="comment" className={cn("font-medium", isMobile ? "text-sm" : "text-sm")}>
                                Comentário Adicional (Opcional)
                            </Label>
                            <Textarea
                                id="comment"
                                placeholder={`Descreva o que ${difficulty === 'too_easy' ? 'foi muito simples' : difficulty === 'too_hard' ? 'foi muito desafiador' : 'funcionou bem'} nesta missão...`}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                                disabled={isSubmitting}
                                className={isMobile ? "text-sm" : ""}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className={isMobile ? "flex-col gap-2" : ""}>
                    <Button
                        onClick={handleSubmit}
                        disabled={!difficulty || isSubmitting}
                        className={cn("w-full", isMobile ? "h-8 text-sm" : "")}
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const MissionsView = () => {
    const { profile, missions, metas, completeMission, generatingMission, setGeneratingMission, missionFeedback, setMissionFeedback, persistData, generatePendingDailyMissions, addDailyMission, adjustDailyMission } = usePlayerDataContext() as {
        profile: Profile;
        missions: RankedMission[];
        metas: Meta[];
        completeMission: (params: { rankedMissionId: string | number; dailyMissionId: string | number; subTask: SubTask; amount: number; feedback: string | null }) => Promise<void>;
        generatingMission: string | number | null;
        setGeneratingMission: (id: string | number | null) => void;
        missionFeedback: Record<string | number, string>;
        setMissionFeedback: (missionId: string | number, feedback: string) => void;
        persistData: (key: string, data: any) => Promise<void>;
        generatePendingDailyMissions?: () => Promise<void>;
        addDailyMission: (payload: { rankedMissionId: string | number; newDailyMission: DailyMission }) => void;
        adjustDailyMission: (rankedMissionId: string | number, dailyMissionId: string | number, feedback: 'too_easy' | 'too_hard') => Promise<void>;
    };
    const [showProgressionTree, setShowProgressionTree] = useState(false);
    const [selectedGoalMissions, setSelectedGoalMissions] = useState<RankedMission[]>([]);
    const [feedbackModalState, setFeedbackModalState] = useState<FeedbackModalState>({ open: false, mission: null, type: null });
    const [contributionModalState, setContributionModalState] = useState<ContributionModalState>({ open: false, subTask: null, mission: null });
    const [missionCompletionFeedbackState, setMissionCompletionFeedbackState] = useState<MissionCompletionFeedbackState>({
        open: false,
        missionName: '',
        rankedMissionId: null
    });
    const [animationState, setAnimationState] = useState<AnimationState>({
        showAnimation: false,
        missionName: '',
        xpGained: 0,
        fragmentsGained: 0,
        levelUp: false,
        newLevel: 0
    });

    const [activeAccordionItem, setActiveAccordionItem] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [rankFilter, setRankFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('active');
    const [sortBy, setSortBy] = useState<string>('rank'); // 'rank', 'progress', 'priority'
    const [priorityMissions, setPriorityMissions] = useState<Set<string | number>>(new Set());

    const [dialogState, setDialogState] = useState<DialogState>({ open: false, mission: null, isManual: false });
    const [isPanelVisible, setIsPanelVisible] = useState(false);

    const [timeUntilMidnight, setTimeUntilMidnight] = useState('');

    // Mobile detection and bottom bar state
    const isMobile = useIsMobile();
    const [showMobileMenu, setShowMobileMenu] = useState(false);


    const { toast } = useToast();
    const rankOrder = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];

    const layout = profile?.user_settings?.layout_density || 'default';
    const accordionSpacing = layout === 'compact' ? 'space-y-2' : layout === 'comfortable' ? 'space-y-6' : 'space-y-4';

    // Toggle priority for missions
    const togglePriority = (missionId: string | number) => {
        setPriorityMissions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(missionId)) {
                newSet.delete(missionId);
            } else {
                newSet.add(missionId);
            }
            return newSet;
        });
    };

    useEffect(() => {
        const calculateTimeUntilMidnight = () => {
            const now = new Date();
            const midnight = endOfDay(now); // Use date-fns for robust end of day calculation

            const diff = midnight.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeUntilMidnight('00:00:00');
                if (generatePendingDailyMissions && !generatingMission) {
                    console.log("Generating pending missions...");
                    generatePendingDailyMissions();
                }
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
    }, [generatePendingDailyMissions, generatingMission]);

    useEffect(() => {
        // This effect ensures the dialog state is updated when the global state changes.
        if (dialogState.open && dialogState.mission) {
            let latestMissionData: RankedMission | DailyMission | undefined;
            if (dialogState.isManual) {
                latestMissionData = profile.manual_missions?.find(m => m.id === dialogState.mission?.id);
            } else {
                const rankedMission = missions.find(rm => rm.missoes_diarias.some(dm => dm.id === dialogState.mission?.id));
                latestMissionData = rankedMission?.missoes_diarias.find(dm => dm.id === dialogState.mission?.id);
            }

            if (latestMissionData) {
                setDialogState(prev => ({ ...prev, mission: latestMissionData as DailyMission | RankedMission }));
            }
        }
    }, [missions, profile.manual_missions, dialogState.open]);


    const handleToastError = (error: any, customMessage = 'Não foi possível continuar. O Sistema pode estar sobrecarregado.') => {
        console.error("Erro de IA:", error);
        if (error instanceof Error && (error.message.includes('429') || error.message.includes('Quota'))) {
            toast({ variant: 'destructive', title: 'Quota de IA Excedida', description: 'Você atingiu o limite de pedidos. Tente novamente mais tarde.' });
        } else {
            toast({ variant: 'destructive', title: 'Erro de IA', description: customMessage });
        }
    };

    const handleMissionFeedback = async (mission: DailyMission, feedbackType: 'too_hard' | 'too_easy') => {
        if (!mission) return;

        const rankedMission = missions.find((rm: RankedMission) => rm.missoes_diarias.some((dm: DailyMission) => dm.id === mission.id));
        if (!rankedMission) return;

        await adjustDailyMission(rankedMission.id, mission.id, feedbackType);
    };

    const handleMissionCompletionFeedback = async (feedbackData: { difficulty: DifficultyType; comment?: string }) => {
        const { rankedMissionId, dailyMissionId, subTask, amount } = missionCompletionFeedbackState;

        if (profile?.user_settings?.mission_view_style === 'popup') {
            setDialogState({ open: false, mission: null, isManual: false });
        }

        let feedbackText = null;

        if (feedbackData.difficulty !== 'perfect') {
            const difficultyText: Record<DifficultyType, string> = {
                'too_easy': 'muito fácil',
                'too_hard': 'muito difícil',
                'perfect': 'perfeita'
            };
            const selectedDifficultyText = difficultyText[feedbackData.difficulty];

            feedbackText = `O utilizador considerou a missão ${selectedDifficultyText}`;
            if (feedbackData.comment) {
                feedbackText += `. Comentário adicional: "${feedbackData.comment}"`;
            }
        } else {
            // For perfect rating, we still want to pass the feedback to adjust difficulty by +1%
            feedbackText = "O utilizador considerou a missão perfeita. Ajuste a dificuldade da próxima missão com um aumento de +1%.";
            if (feedbackData.comment) {
                feedbackText += ` Comentário adicional: "${feedbackData.comment}"`;
            }
        }

        const missionToComplete = missions.find((rm: RankedMission) => rm.id === rankedMissionId)?.missoes_diarias?.find((dm: DailyMission) => dm.id === dailyMissionId);
        const currentLevel = profile.nivel;

        if (missionToComplete) {
            const currentXP = profile.xp || 0;
            const xpForNextLevel = profile.xp_para_proximo_nivel || 100;
            const willLevelUp = (currentXP + missionToComplete.xp_conclusao) >= xpForNextLevel;

            setAnimationState({
                showAnimation: true,
                missionName: missionToComplete.nome,
                xpGained: missionToComplete.xp_conclusao,
                fragmentsGained: missionToComplete.fragmentos_conclusao || 0,
                levelUp: willLevelUp,
                newLevel: willLevelUp ? currentLevel + 1 : currentLevel
            });
        }

        setTimeout(async () => {
            if (rankedMissionId !== null && dailyMissionId !== null && subTask !== null && amount !== null) {
                await completeMission({
                    rankedMissionId: rankedMissionId as string | number,
                    dailyMissionId: dailyMissionId as string | number,
                    subTask: subTask as SubTask,
                    amount: amount as number,
                    feedback: feedbackText
                });
            }
        }, 500);

        setTimeout(() => {
            if (feedbackData.difficulty === 'perfect') {
                toast({
                    title: "Missão Concluída!",
                    description: "Obrigado pelo feedback! A próxima missão manterá a dificuldade similar com um ajuste de +1%."
                });
            } else {
                const adjustmentText = feedbackData.difficulty === 'too_easy'
                    ? 'mais desafiadora com um aumento de +1,5% de dificuldade'
                    : 'mais acessível com uma redução de -0,5% de dificuldade';
                toast({
                    title: "Missão Concluída!",
                    description: `Obrigado pelo feedback! A próxima missão será ${adjustmentText}.`
                });
            }
        }, 4000);

        setMissionCompletionFeedbackState({ open: false, missionName: '', rankedMissionId: null });
    };

    const handleShowProgression = (clickedMission: RankedMission) => {
        const goalMissions = missions
            .filter((m: RankedMission) => m.meta_associada === clickedMission.meta_associada)
            .sort((a: RankedMission, b: RankedMission) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));
        setSelectedGoalMissions(goalMissions);
        setShowProgressionTree(true);
    };

    const getRankColor = (rank: string) => {
        switch (rank) {
            case 'F': return 'text-gray-400';
            case 'E': return 'text-green-400';
            case 'D': return 'text-cyan-400';
            case 'C': return 'text-blue-400';
            case 'B': return 'text-purple-400';
            case 'A': return 'text-red-400';
            case 'S': return 'text-yellow-400';
            case 'SS': return 'text-orange-400';
            case 'SSS': return 'text-pink-400';
            case 'M': return 'text-slate-400';
            default: return 'text-gray-500';
        }
    }

    const onContributeToQuest = (subTask: SubTask, amount: number, missionToUpdate: DailyMission | RankedMission) => {
        const isManual = 'isManual' in missionToUpdate && missionToUpdate.isManual;
        if (isManual) {
            const updatedManualMissions = (profile.manual_missions || []).map((m: RankedMission) =>
                m.id === missionToUpdate.id
                    ? {
                        ...m,
                        subTasks: m.subTasks?.map((st: SubTask) =>
                            st.name === subTask.name
                                ? { ...st, current: Math.min(st.target, (st.current || 0) + amount) }
                                : st
                        ) || []
                    }
                    : m
            );
            persistData('profile', { ...profile, manual_missions: updatedManualMissions });
        } else {
            const dailyMission = missionToUpdate as DailyMission;
            const rankedMission = missions.find((rm: RankedMission) => rm.missoes_diarias.some((dm: DailyMission) => dm.id === dailyMission.id));
            if (rankedMission) {
                const tempCurrent = (subTask.current || 0) + amount;
                const willCompleteMission = dailyMission.subTasks?.every((st: SubTask) => {
                    if (st.name === subTask.name) {
                        return tempCurrent >= st.target;
                    }
                    return (st.current || 0) >= st.target;
                });

                if (willCompleteMission) {
                    setMissionCompletionFeedbackState({
                        open: true,
                        missionName: dailyMission.nome,
                        rankedMissionId: rankedMission.id,
                        dailyMissionId: dailyMission.id,
                        subTask,
                        amount
                    });
                } else {
                    completeMission({ rankedMissionId: rankedMission.id, dailyMissionId: dailyMission.id, subTask, amount, feedback: null });
                }
            }
        }
    };

    const handleSaveManualMission = (missionData: RankedMission) => {
        const manualMissions = profile.manual_missions || [];
        let updatedMissions;

        if (missionData.id) {
            updatedMissions = manualMissions.map((m: RankedMission) => m.id === missionData.id ? missionData : m);
        } else {
            const newMission = { ...missionData, id: `manual_${Date.now()}`, concluido: false };
            updatedMissions = [...manualMissions, newMission];
        }
        persistData('profile', { ...profile, manual_missions: updatedMissions });
        setDialogState({ open: false, mission: null, isManual: false });
    }

    const handleDeleteManualMission = (missionId: string | number) => {
        const updatedMissions = (profile.manual_missions || []).filter((m: RankedMission) => m.id !== missionId);
        persistData('profile', { ...profile, manual_missions: updatedMissions });
        setDialogState({ open: false, mission: null, isManual: false });
        toast({ title: 'Missão Manual Removida', description: 'A sua missão personalizada foi excluída com sucesso.' });
    }

    const handleUnlockMission = async (mission: RankedMission) => {
        if (!mission) return;
        setGeneratingMission(mission.id);
        try {
            const meta = metas.find(m => m.nome === mission.meta_associada);
            const history = mission.missoes_diarias.filter((d: DailyMission) => d.concluido).map((d: DailyMission) => `- ${d.nome}`).join('\n');

            let feedbackForAI = missionFeedback[mission.id];
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

            // Validate the result structure
            if (!result.nextMissionName || !result.nextMissionDescription || !result.subTasks || result.subTasks.length === 0) {
                throw new Error('Resposta da API incompleta. Tente novamente.');
            }

            // Validate subtasks
            const validSubTasks = result.subTasks.filter((st: SubTask) =>
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
                subTasks: validSubTasks.map((st: SubTask) => ({ ...st, current: 0, unit: st.unit || '' })),
            };

            addDailyMission({ rankedMissionId: mission.id, newDailyMission });
            toast({ title: "Desafio Aceite!", description: `A sua missão de qualificação "${newDailyMission.nome}" está pronta.` });
        } catch (error) {
            handleToastError(error, 'Não foi possível gerar a missão de qualificação.');
        } finally {
            setGeneratingMission(null);
        }
    };

    const visibleMissions = useMemo(() => {
        const activeEpicMissions = new Map<string, RankedMission>();

        for (const mission of missions) {
            if (mission.concluido) continue;

            const existingMissionForGoal = activeEpicMissions.get(mission.meta_associada);
            const currentRankIndex = existingMissionForGoal ? rankOrder.indexOf(existingMissionForGoal.rank) : -1;
            const newRankIndex = rankOrder.indexOf(mission.rank);

            if (!existingMissionForGoal || newRankIndex < currentRankIndex) {
                activeEpicMissions.set(mission.meta_associada, mission);
            }
        }

        const completedEpicMissions = missions.filter((m: RankedMission) => m.concluido);
        const manualMissions = (profile.manual_missions || []).map((m: RankedMission) => ({ ...m, isManual: true, rank: 'M' }));

        let missionsToDisplay = [];
        if (statusFilter === 'active') {
            const stuckCompletedMissions = missions.filter(m => m.concluido && !m.missoes_diarias.some(dm => !dm.concluido));
            missionsToDisplay = [...Array.from(activeEpicMissions.values()), ...manualMissions.filter((m: RankedMission) => !m.concluido), ...stuckCompletedMissions];
        } else if (statusFilter === 'completed') {
            missionsToDisplay = [...completedEpicMissions, ...manualMissions.filter((m: RankedMission) => m.concluido)];
        } else {
            missionsToDisplay = [...Array.from(activeEpicMissions.values()), ...completedEpicMissions, ...manualMissions];
        }

        if (rankFilter !== 'all') {
            if (rankFilter === 'M') {
                missionsToDisplay = missionsToDisplay.filter((m: RankedMission) => m.isManual);
            } else {
                missionsToDisplay = missionsToDisplay.filter((m: RankedMission) => m.rank === rankFilter);
            }
        }

        if (searchTerm) {
            missionsToDisplay = missionsToDisplay.filter((m: RankedMission) => m.nome.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // Apply sorting
        missionsToDisplay.sort((a, b) => {
            // 1. Demon Castle vem primeiro (Destaque absoluto)
            const aDemon = a.tipo === 'demon_castle';
            const bDemon = b.tipo === 'demon_castle';
            if (aDemon !== bDemon) return aDemon ? -1 : 1;

            // 2. Priority missions second
            const aPriority = priorityMissions.has(a.id);
            const bPriority = priorityMissions.has(b.id);
            if (aPriority !== bPriority) {
                return aPriority ? -1 : 1;
            }

            // 3. Then by completion status
            if (a.concluido !== b.concluido) {
                return a.concluido ? 1 : -1;
            }

            // Then by selected sort option
            if (sortBy === 'progress') {
                const aProgress = a.isManual ?
                    (a.subTasks?.filter((st: SubTask) => (st.current || 0) >= st.target).length || 0) / (a.subTasks?.length || 1) :
                    (a.missoes_diarias?.filter((d: DailyMission) => d.concluido).length || 0) / (a.total_missoes_diarias || 1);
                const bProgress = b.isManual ?
                    (b.subTasks?.filter((st: SubTask) => (st.current || 0) >= st.target).length || 0) / (b.subTasks?.length || 1) :
                    (b.missoes_diarias?.filter((d: DailyMission) => d.concluido).length || 0) / (b.total_missoes_diarias || 1);
                return bProgress - aProgress;
            }

            // Default: by rank
            return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
        });

        return missionsToDisplay;

    }, [missions, statusFilter, rankFilter, searchTerm, rankOrder, profile.manual_missions, sortBy, priorityMissions]);

    const missionViewStyle = profile?.user_settings?.mission_view_style || 'inline';

    const renderActiveMissionContent = (mission: RankedMission) => {
        const activeDailyMission = mission.isManual ? mission : mission.missoes_diarias?.find((d: DailyMission) => !d.concluido);
        const sortedDailyMissions = mission.isManual ? null : [...mission.missoes_diarias].sort((a, b) => (a.concluido ? 1 : -1) - (b.concluido ? 1 : -1) || 0);

        if (generatingMission === mission.id) {
            return (
                <div className={cn("bg-blue-950/20 border border-blue-500/30 border-dashed flex flex-col items-center justify-center text-center animate-in fade-in duration-300 relative", isMobile ? "p-3 h-32" : "p-4 h-48")}>
                    <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-10 pointer-events-none" />
                    <Sparkles className={cn("text-blue-400 animate-pulse-slow mb-4", isMobile ? "h-8 w-8" : "h-10 w-10")} />
                    <p className={cn("font-mono font-bold text-blue-300 uppercase tracking-widest", isMobile ? "text-sm" : "text-base")}>GENERATING NEW QUEST...</p>
                    <p className={cn("text-blue-400/60 font-mono text-xs mt-2", isMobile ? "text-[10px]" : "text-sm")}>System is analyzing player data.</p>
                </div>
            );
        }

        if (activeDailyMission) {
            return (
                <div className={cn("animate-in fade-in-50 slide-in-from-top-4 duration-500 border-l-2 relative overflow-hidden", 
                    isMobile ? "p-3" : "p-4",
                    mission.tipo === 'demon_castle' ? "bg-red-950/30 border-red-500" : "bg-black/40 border-blue-500"
                )}>
                    {/* Active Quest Marker */}
                    <div className={cn("absolute top-0 right-0 px-2 py-0.5 text-white text-[10px] font-mono font-bold tracking-widest uppercase",
                        mission.tipo === 'demon_castle' ? "bg-red-600" : "bg-blue-600"
                    )}>
                        ACTIVE
                    </div>

                    <div className={cn("flex flex-col gap-3", isMobile ? "md:flex-row md:items-start" : "md:flex-row md:items-start")}>
                        <div className="flex-grow min-w-0">
                            <div className="flex items-start gap-3">
                                <div className={cn("p-1.5 border mt-1",
                                    mission.tipo === 'demon_castle' ? "bg-red-500/10 border-red-500/30" : "bg-blue-500/10 border-blue-500/30"
                                )}>
                                    <Zap className={cn(isMobile ? "h-3 w-3" : "h-4 w-4", mission.tipo === 'demon_castle' ? "text-red-400" : "text-blue-400")} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn("font-bold font-cinzel tracking-wide", 
                                        isMobile ? "text-base" : "text-lg",
                                        mission.tipo === 'demon_castle' ? "text-red-50" : "text-white"
                                    )}>{activeDailyMission.nome}</p>
                                    <p className={cn("mt-1 font-mono", 
                                        isMobile ? "text-xs" : "text-sm",
                                        mission.tipo === 'demon_castle' ? "text-red-200/60" : "text-blue-200/60"
                                    )}>{activeDailyMission.descricao}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className={cn("flex items-center gap-2 self-end md:self-start", isMobile ? "w-full justify-between md:w-auto" : "")}>
                             <div className="flex gap-2">
                                {activeDailyMission && 'xp_conclusao' in activeDailyMission && (
                                    <div className={cn("px-2 py-1 border flex items-center gap-1.5",
                                        mission.tipo === 'demon_castle' ? "bg-red-900/20 border-red-500/30" : "bg-blue-900/20 border-blue-500/30"
                                    )}>
                                        <span className={cn("text-[10px] font-bold font-mono", mission.tipo === 'demon_castle' ? "text-red-400" : "text-blue-400")}>XP</span>
                                        <span className="text-sm font-bold text-white font-mono">{activeDailyMission.xp_conclusao}</span>
                                    </div>
                                )}
                                {activeDailyMission && 'fragmentos_conclusao' in activeDailyMission && (
                                    <div className="px-2 py-1 bg-yellow-900/20 border border-yellow-500/30 flex items-center gap-1.5">
                                        <Gem className={cn("text-yellow-500", isMobile ? "w-3 h-3" : "w-3 h-3")} />
                                        <span className="text-sm font-bold text-white font-mono">{activeDailyMission.fragmentos_conclusao || 0}</span>
                                    </div>
                                )}
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className={cn("text-blue-400/60 hover:text-blue-400 hover:bg-blue-500/10 rounded-none h-8 w-8")} aria-label="Opções da missão">
                                        <Wand2 className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-black/90 border-blue-500/30 text-blue-100">
                                    <DropdownMenuItem className="hover:bg-blue-900/30 hover:text-white focus:bg-blue-900/30 focus:text-white cursor-pointer font-mono text-xs" onSelect={() => handleMissionFeedback(activeDailyMission as DailyMission, 'too_hard')}>REPORT: DIFFICULTY TOO HIGH</DropdownMenuItem>
                                    <DropdownMenuItem className="hover:bg-blue-900/30 hover:text-white focus:bg-blue-900/30 focus:text-white cursor-pointer font-mono text-xs" onSelect={() => handleMissionFeedback(activeDailyMission as DailyMission, 'too_easy')}>REPORT: DIFFICULTY TOO LOW</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Subtasks - System Style */}
                    <div className={cn("mt-4 space-y-2 border-t pt-3",
                        mission.tipo === 'demon_castle' ? "border-red-500/20" : "border-blue-500/20"
                    )}>
                        <div className={cn("text-[10px] font-mono uppercase tracking-widest mb-2",
                            mission.tipo === 'demon_castle' ? "text-red-500" : "text-blue-500"
                        )}>OBJECTIVES</div>
                        {activeDailyMission.subTasks?.map((st: SubTask, index: number) => {
                            const isCompleted = (st.current || 0) >= st.target;
                            const progress = Math.min(100, ((st.current || 0) / st.target) * 100);
                            return (
                                <div key={index} className={cn("relative bg-black/60 border p-2 group transition-colors",
                                    mission.tipo === 'demon_castle' 
                                        ? "border-red-900/50 hover:border-red-500/50" 
                                        : "border-blue-900/50 hover:border-blue-500/50"
                                )}>
                                    {/* Progress Bar Background */}
                                    <div 
                                        className={cn("absolute inset-0 pointer-events-none transition-all duration-500 ease-out origin-left",
                                            mission.tipo === 'demon_castle' ? "bg-red-900/20" : "bg-blue-900/10"
                                        )}
                                        style={{ transform: `scaleX(${progress / 100})` }}
                                    />
                                    
                                    <div className={cn("flex justify-between items-center gap-2 relative z-10")}>
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className={cn("w-3 h-3 border flex items-center justify-center", 
                                                mission.tipo === 'demon_castle' 
                                                    ? (isCompleted ? "bg-red-500 border-red-500/50" : "border-red-500/50")
                                                    : (isCompleted ? "bg-blue-500 border-blue-500/50" : "border-blue-500/50")
                                            )}>
                                                {isCompleted && <CheckCircle className={cn("h-3 w-3", mission.tipo === 'demon_castle' ? "text-white" : "text-black")} />}
                                            </div>
                                            <span className={cn("font-mono text-sm truncate", 
                                                isCompleted 
                                                    ? (mission.tipo === 'demon_castle' ? "text-red-500 line-through" : "text-blue-500 line-through")
                                                    : (mission.tipo === 'demon_castle' ? "text-red-100" : "text-blue-100")
                                            )}>
                                                {st.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={cn("font-mono text-xs", mission.tipo === 'demon_castle' ? "text-red-300" : "text-blue-300")}>
                                                {st.current || 0} <span className={mission.tipo === 'demon_castle' ? "text-red-500/50" : "text-blue-500/50"}>/</span> {st.target} <span className={cn("text-[10px] uppercase", mission.tipo === 'demon_castle' ? "text-red-500/50" : "text-blue-500/50")}>{st.unit}</span>
                                            </span>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className={cn("h-6 w-6 rounded-none bg-transparent transition-all",
                                                    mission.tipo === 'demon_castle'
                                                        ? "border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500"
                                                        : "border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white hover:border-blue-500"
                                                )}
                                                onClick={() => setContributionModalState({ open: true, subTask: st, mission: activeDailyMission as DailyMission })}
                                                disabled={isCompleted}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between mt-4 pt-2 border-t border-blue-500/10">
                         {sortedDailyMissions && sortedDailyMissions.length > 1 && (
                            <Collapsible>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" className="text-blue-500/60 hover:text-blue-400 hover:bg-transparent p-0 h-auto font-mono text-[10px] uppercase tracking-widest flex items-center gap-1">
                                        <History className="h-3 w-3" />
                                        HISTORY_LOG ({sortedDailyMissions.filter(dm => dm.concluido).length})
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-1 mt-2">
                                    {sortedDailyMissions.filter(dm => dm.concluido).map((dm: DailyMission) => (
                                        <div key={dm.id} className="flex items-center gap-2 text-xs text-blue-500/40 font-mono pl-2 border-l border-blue-500/20">
                                            <span>[COMPLETED]</span>
                                            <span className="truncate">{dm.nome}</span>
                                        </div>
                                    ))}
                                </CollapsibleContent>
                            </Collapsible>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className={cn("bg-red-950/10 border border-red-900/30 p-4 flex flex-col items-center justify-center text-center relative overflow-hidden", isMobile ? "h-32" : "h-48")}>
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(220,38,38,0.05)_10px,rgba(220,38,38,0.05)_20px)]" />
                <Lock className={cn("text-red-500/50 mb-3", isMobile ? "h-8 w-8" : "h-10 w-10")} />
                <p className="font-mono font-bold text-red-400 uppercase tracking-widest text-sm">ACCESS DENIED</p>
                <p className="text-red-300/50 text-xs mt-1 font-mono max-w-xs">
                    Requirements not met. Level {mission.level_requirement} required.
                </p>
                <Button 
                    variant="outline" 
                    className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 font-mono text-xs uppercase tracking-wider"
                    onClick={() => handleUnlockMission(mission)} 
                    disabled={generatingMission === mission.id}
                >
                    {generatingMission === mission.id ? <LoaderCircle className="animate-spin mr-2 h-3 w-3" /> : "ATTEMPT BREAKTHROUGH"}
                </Button>
            </div>
        );
    };

    return (
        <div className={cn("h-full flex flex-col w-full overflow-x-hidden", isMobile ? "p-2" : "p-2 md:p-6", accordionSpacing)}>
            <div className={cn("flex-shrink-0 mb-6 overflow-x-hidden", isMobile ? "px-1 mb-3" : "")}>
                {/* Header System Style */}
                <div className="flex items-center justify-between border-b border-blue-500/30 pb-4 mb-4">
                    <div>
                        <h1 className={cn("font-bold text-white font-cinzel tracking-[0.1em] drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]", isMobile ? "text-xl" : "text-3xl")}>
                            QUEST LOG
                        </h1>
                        <p className="text-blue-400/60 font-mono text-xs tracking-widest mt-1">
                            ACTIVE MISSIONS DATABASE
                        </p>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                         <div className="px-3 py-1 bg-blue-950/40 border border-blue-500/30 rounded-sm">
                            <span className="text-[10px] font-mono text-blue-400">QUESTS AVAILABLE:</span>
                            <span className="ml-2 font-mono font-bold text-white">{visibleMissions.length}</span>
                         </div>
                    </div>
                </div>

                {/* Mobile Quick Actions */}
                {isMobile && (
                    <div className="mt-2 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsPanelVisible(!isPanelVisible)}
                            className="flex-shrink-0 text-xs h-8 px-3 bg-blue-950/20 border-blue-500/30 text-blue-300 hover:bg-blue-900/40"
                        >
                            {isPanelVisible ? <EyeOff className="mr-1 h-3 w-3" /> : <Eye className="mr-1 h-3 w-3" />}
                            STATS
                        </Button>
                        {generatePendingDailyMissions && (
                            <Button
                                onClick={() => {
                                    if (!generatingMission) {
                                        generatePendingDailyMissions();
                                    } else {
                                        toast({
                                            variant: 'destructive',
                                            title: 'SYSTEM BUSY',
                                            description: 'Process already running.'
                                        });
                                    }
                                }}
                                variant="outline"
                                className="flex-shrink-0 text-xs h-8 px-3 text-yellow-400 border-yellow-500/30 bg-yellow-950/10 hover:bg-yellow-900/20"
                                disabled={!!generatingMission}
                            >
                                <RefreshCw className={cn("mr-1 h-3 w-3", generatingMission ? "animate-spin" : "")} />
                                {generatingMission ? 'GENERATING...' : 'GENERATE'}
                            </Button>
                        )}
                    </div>
                )}

                <Collapsible open={isPanelVisible} onOpenChange={setIsPanelVisible} className={cn("mt-4 overflow-x-hidden", isMobile ? "block px-1 mt-3" : "block")}>
                    <CollapsibleContent className="space-y-6 animate-in fade-in-50 duration-300 overflow-x-hidden">
                        <MissionStatsPanel />
                        <div className={cn("flex flex-col gap-4", isMobile ? "gap-2 md:flex-row" : "md:flex-row")}>
                            {/* Search Bar - System Style */}
                            <div className={cn("flex-grow overflow-x-hidden relative group", isMobile ? "min-w-full" : "min-w-[200px]")}>
                                <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 text-blue-500/50 group-focus-within:text-blue-400 transition-colors", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                                <Input
                                    placeholder="SEARCH DATABASE..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className={cn("bg-black/40 border-blue-500/30 focus:border-blue-400 text-blue-100 placeholder:text-blue-500/30 font-mono uppercase rounded-none", isMobile ? "pl-8 h-9 text-xs" : "pl-9")}
                                />
                            </div>
                            
                            {/* Filters - System Style */}
                            <div className={cn("flex gap-2 flex-wrap overflow-x-hidden", isMobile ? "gap-2 sm:flex-grow-0" : "sm:flex-grow-0")}>
                                <Select value={rankFilter} onValueChange={setRankFilter}>
                                    <SelectTrigger className={cn("flex-1 overflow-x-hidden bg-black/40 border-blue-500/30 text-blue-300 rounded-none font-mono text-xs uppercase", isMobile ? "min-w-[100px] h-9" : "md:w-[150px]")}>
                                        <Filter className={cn("mr-2 h-3 w-3 text-blue-500")} />
                                        <SelectValue placeholder="RANK" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black/90 border-blue-500/30 text-blue-300 font-mono text-xs uppercase">
                                        <SelectItem value="all">ALL RANKS</SelectItem>
                                        {rankOrder.map(r => <SelectItem key={r} value={r}>RANK {r}</SelectItem>)}
                                        <SelectItem value="M">MANUAL</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className={cn("flex-1 bg-black/40 border-blue-500/30 text-blue-300 rounded-none font-mono text-xs uppercase", isMobile ? "min-w-[100px] h-9" : "md:w-[150px]")}>
                                        <Activity className={cn("mr-2 h-3 w-3 text-blue-500")} />
                                        <SelectValue placeholder="STATUS" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black/90 border-blue-500/30 text-blue-300 font-mono text-xs uppercase">
                                        <SelectItem value="all">ALL</SelectItem>
                                        <SelectItem value="active">ACTIVE</SelectItem>
                                        <SelectItem value="completed">COMPLETED</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {generatePendingDailyMissions && !isMobile && (
                                <Button onClick={() => {
                                    if (!generatingMission) {
                                        generatePendingDailyMissions();
                                    } else {
                                        toast({
                                            variant: 'destructive',
                                            title: 'SYSTEM BUSY',
                                            description: 'Generation sequence already initiated.'
                                        });
                                    }
                                }} variant="outline" className="text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10 hover:text-yellow-300 hover:border-yellow-500 font-mono text-xs uppercase tracking-widest" disabled={!!generatingMission}>
                                    <RefreshCw className={cn("mr-2 h-3 w-3", generatingMission ? "animate-spin" : "")} />
                                    {generatingMission ? 'GENERATING...' : 'GENERATE QUESTS'}
                                </Button>
                            )}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>

            <div className={cn("flex-grow overflow-y-auto overflow-x-hidden w-full space-y-3", isMobile ? "px-0" : "px-0")}>
                <Accordion
                    type="single"
                    collapsible
                    className={cn("w-full overflow-x-hidden space-y-3")}
                    value={activeAccordionItem || undefined}
                    onValueChange={(value: string) => {
                        if (missionViewStyle === 'inline') {
                            setActiveAccordionItem(value || null);
                        }
                    }}
                >
                    {visibleMissions.map(mission => {
                        const wasCompletedToday = mission.ultima_missao_concluida_em && isToday(parseISO(mission.ultima_missao_concluida_em));
                        const isManualMission = mission.isManual;
                        const completedDailyMissions = isManualMission ? [] : (mission.missoes_diarias || []).filter((d: DailyMission) => d.concluido);

                        let missionProgress;
                        if (isManualMission) {
                            const totalSubs = mission.subTasks?.length || 0;
                            const completedSubs = mission.subTasks?.filter((st: SubTask) => (st.current || 0) >= st.target).length || 0;
                            missionProgress = totalSubs > 0 ? (completedSubs / totalSubs) * 100 : (mission.concluido ? 100 : 0);
                        } else {
                            missionProgress = (completedDailyMissions.length / (mission.total_missoes_diarias || 10)) * 100;
                        }

                        const associatedMeta = !isManualMission ? metas.find((m: Meta) => m.nome === mission.meta_associada) : null;
                        const daysRemaining = associatedMeta && associatedMeta.prazo ? differenceInDays(parseISO(associatedMeta.prazo), new Date()) : null;

                        const activeDailyMission = isManualMission ? mission : mission.missoes_diarias?.find((d: DailyMission) => !d.concluido);

                        const isDemonCastle = mission.tipo === 'demon_castle';
                        const isEpic = !!mission.is_epic;

                        const TriggerWrapper: React.FC<TriggerWrapperProps> = ({ children }) => {
                            if (missionViewStyle === 'inline' || isManualMission) {
                                return <AccordionTrigger className="flex-1 hover:no-underline text-left p-0 w-full">{children}</AccordionTrigger>;
                            }
                            return <div className="flex-1 text-left w-full cursor-pointer" onClick={() => setDialogState({ open: true, mission: (activeDailyMission || mission), isManual: !!isManualMission })}>{children}</div>;
                        };

                        return (
                            <AccordionItem 
                                value={`item-${mission.id}`} 
                                key={mission.id} 
                                className={cn(
                                    "relative border rounded-sm overflow-hidden transition-all duration-300 group",
                                    isDemonCastle 
                                        ? "border-red-600/50 bg-red-950/20 shadow-[0_0_20px_rgba(220,38,38,0.15)] ring-1 ring-red-500/20" 
                                        : "bg-black/60 backdrop-blur-sm",
                                    priorityMissions.has(mission.id) && !isDemonCastle ? "border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]" : "border-blue-900/40 hover:border-blue-500/50",
                                    "data-[state=open]:border-blue-500 data-[state=open]:bg-blue-950/10"
                                )}
                            >
                                {isDemonCastle && (
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
                                )}
                                
                                {priorityMissions.has(mission.id) && !isDemonCastle && (
                                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[30px] border-r-[30px] border-t-transparent border-r-yellow-500/80 z-20 pointer-events-none" />
                                )}
                                
                                <div className={cn("transition-all duration-300 overflow-x-hidden", generatingMission === mission.id ? 'opacity-50' : '', isMobile ? "p-3" : "p-4")}>
                                    <div className={cn("flex flex-col gap-2")}>
                                        <div className={cn("flex items-start gap-4")}>
                                            <TriggerWrapper>
                                                <div className="flex-1 text-left min-w-0 flex items-start gap-4 overflow-x-hidden">
                                                    {/* Rank Badge - System Style */}
                                                    <div className={cn(
                                                        "flex-shrink-0 flex items-center justify-center font-cinzel font-black border-2 bg-black shadow-lg relative group-hover:scale-105 transition-transform",
                                                        isDemonCastle 
                                                            ? "border-red-500 text-red-500 shadow-red-900/50" 
                                                            : getRankColor(mission.rank).replace('text-', 'border-').replace('400', '500'),
                                                        isMobile ? "w-12 h-12 text-2xl" : "w-14 h-14 text-3xl"
                                                    )}>
                                                        <span className={cn(isDemonCastle ? "text-red-500" : getRankColor(mission.rank), "drop-shadow-[0_0_5px_currentColor]")}>
                                                            {mission.rank}
                                                        </span>
                                                        <span className="absolute bottom-0.5 text-[8px] font-mono text-gray-500 uppercase tracking-wider">RANK</span>
                                                    </div>

                                                    <div className="flex-1 min-w-0 overflow-x-hidden space-y-1">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <p className={cn("font-bold uppercase tracking-wider font-mono truncate", 
                                                                    isMobile ? "text-sm" : "text-base",
                                                                    isDemonCastle ? "text-red-50" : "text-white"
                                                                )}>
                                                                    {mission.nome}
                                                                </p>
                                                                {isEpic && (
                                                                    <span className="px-2 py-0.5 bg-red-600 border border-red-400 rounded-none text-[8px] font-mono text-white font-black animate-pulse">
                                                                        EPIC
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {!isManualMission && daysRemaining !== null && (
                                                                <span className={cn("text-[10px] font-bold font-mono px-1.5 py-0.5 border flex items-center gap-1 uppercase tracking-wider whitespace-nowrap",
                                                                    daysRemaining < 7 ? "border-red-500/50 text-red-400 bg-red-950/20" :
                                                                        daysRemaining < 30 ? "border-yellow-500/50 text-yellow-400 bg-yellow-950/20" :
                                                                            "border-green-500/50 text-green-400 bg-green-950/20")}>
                                                                    {daysRemaining}D REMAINING
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-2">
                                                            {associatedMeta && !isManualMission && (
                                                                <div className={cn("flex items-center gap-1 text-[10px] font-mono uppercase tracking-wide",
                                                                    isDemonCastle ? "text-red-400/60" : "text-blue-400/60"
                                                                )}>
                                                                    <Link className="h-3 w-3" />
                                                                    <span className="truncate">{associatedMeta.nome}</span>
                                                                </div>
                                                            )}
                                                            {isDemonCastle && (
                                                                <div className="flex items-center gap-1 text-[10px] font-mono text-red-500 font-bold uppercase tracking-tighter">
                                                                    <Flame className="h-3 w-3 animate-pulse" />
                                                                    <span>Demon Castle Event</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Progress Bar - System Style */}
                                                        {!isManualMission && (
                                                            <div className={cn("relative h-1.5 border mt-2 w-full max-w-[200px]",
                                                                isDemonCastle ? "bg-red-950/50 border-red-900/30" : "bg-blue-950/50 border-blue-900/30"
                                                            )}>
                                                                <div 
                                                                    className={cn("absolute inset-y-0 left-0 transition-all duration-1000",
                                                                        isDemonCastle 
                                                                            ? "bg-red-500 shadow-[0_0_8px_#ef4444]" 
                                                                            : "bg-blue-500 shadow-[0_0_5px_#3b82f6]"
                                                                    )}
                                                                    style={{ width: `${missionProgress}%` }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TriggerWrapper>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-1 self-start">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={cn("text-gray-500 hover:text-yellow-400 hover:bg-transparent rounded-none h-8 w-8",
                                                                    priorityMissions.has(mission.id) && "text-yellow-400"
                                                                )}
                                                                onClick={(e) => { e.stopPropagation(); togglePriority(mission.id); }}
                                                            >
                                                                <Star className={cn("h-4 w-4", priorityMissions.has(mission.id) && "fill-yellow-400")} />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="font-mono text-xs bg-black border-blue-500/30">
                                                            <p>TOGGLE PRIORITY</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                
                                                {/* More buttons logic... */}
                                                {!isManualMission && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="icon" className={cn("text-gray-500 hover:text-blue-400 hover:bg-transparent rounded-none h-8 w-8")} onClick={(e) => { e.stopPropagation(); handleShowProgression(mission) }}>
                                                                    <GitMerge className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="font-mono text-xs bg-black border-blue-500/30">
                                                                <p>VIEW PROGRESSION TREE</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <AccordionContent className={cn("pt-4 border-t border-blue-500/10 mt-3")}>
                                        {renderActiveMissionContent(mission)}
                                    </AccordionContent>
                                </div>
                                {generatingMission === mission.id ? (
                                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30 backdrop-blur-sm">
                                        <LoaderCircle className="h-8 w-8 text-blue-500 animate-spin" />
                                        <p className="mt-2 font-mono text-blue-400 text-xs animate-pulse">PROCESSING REQUEST...</p>
                                    </div>
                                ) : wasCompletedToday ? (
                                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30 backdrop-blur-sm border-2 border-green-500/30">
                                        <div className="p-4 border border-green-500/50 bg-green-950/30 text-center relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-full h-[1px] bg-green-500/50" />
                                            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-green-500/50" />
                                            <p className="font-mono font-bold text-green-400 text-lg tracking-widest">MISSION COMPLETE</p>
                                            <p className="font-mono text-xs text-green-300/70 mt-1">COOLDOWN ACTIVE</p>
                                            <p className="font-cinzel font-bold text-white text-2xl mt-2">{timeUntilMidnight}</p>
                                        </div>
                                    </div>
                                ) : null}
                            </AccordionItem>
                        )
                    })}
                    {visibleMissions.length === 0 && (
                        <div className={cn("flex flex-col items-center justify-center text-center py-12 px-4 border border-blue-900/30 bg-blue-950/10 relative overflow-hidden")}>
                            <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-5 pointer-events-none" />
                            <Search className="h-12 w-12 text-blue-500/30 mb-4" />
                            <p className="font-mono font-bold text-blue-400 text-lg uppercase tracking-widest">NO DATA FOUND</p>
                            <p className="font-mono text-blue-300/50 text-xs mt-2 max-w-md">
                                Query returned 0 results. Adjust filters or initiate new objective protocols.
                            </p>
                        </div>
                    )}
                </Accordion>
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

            <MissionCompletionFeedbackDialog
                isOpen={missionCompletionFeedbackState.open}
                onClose={() => setMissionCompletionFeedbackState(prev => ({ ...prev, open: false }))}
                onSubmitFeedback={handleMissionCompletionFeedback}
                missionName={missionCompletionFeedbackState.missionName}
            />

            <ContributionDialog
                open={contributionModalState.open}
                onOpenChange={(open) => setContributionModalState(prev => ({ ...prev, open }))}
                subTask={contributionModalState.subTask as SubTask}
                onContribute={(amount) => {
                    if (contributionModalState.subTask && contributionModalState.mission) {
                        onContributeToQuest(contributionModalState.subTask, amount, contributionModalState.mission as DailyMission);
                    }
                }}
            />

            {dialogState.open &&
                <MissionDetailsDialog
                    isOpen={dialogState.open}
                    onClose={() => setDialogState({ open: false, mission: null, isManual: false })}
                    mission={dialogState.mission as any}
                    isManual={dialogState.isManual}
                    onContribute={(subTask, amount, mission) => {
                        onContributeToQuest(subTask, amount, mission as DailyMission | RankedMission);
                    }}
                    onSave={(missionData) => handleSaveManualMission(missionData as unknown as RankedMission)}
                    onDelete={(missionId) => handleDeleteManualMission(missionId)}
                    onAdjustDifficulty={(mission, feedback) => {
                        const rankedMission = missions.find(rm => rm.missoes_diarias?.some(dm => dm.id === mission.id));
                        if (rankedMission) {
                            adjustDailyMission(
                                rankedMission.id as string | number,
                                mission.id!,
                                feedback
                            );
                        }
                    }}
                />
            }

            <Dialog open={showProgressionTree} onOpenChange={setShowProgressionTree}>
                <DialogContent className={cn("max-w-2xl overflow-x-hidden", isMobile ? "max-w-[95vw]" : "")}>
                    <DialogHeader>
                        <DialogTitle className={cn("text-primary", isMobile ? "text-lg" : "text-2xl")}>Árvore de Progressão da Missão</DialogTitle>
                        <DialogDescription className={isMobile ? "text-sm" : ""}>
                            Esta é a sequência de missões épicas para a meta "{selectedGoalMissions[0]?.meta_associada}".
                        </DialogDescription>
                    </DialogHeader>
                    <div className={cn("mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-4 overflow-x-hidden", isMobile ? "mt-2 space-y-2" : "")}>
                        {selectedGoalMissions.map((m: RankedMission, index: number) => (
                            <div key={m.id} className={cn(`rounded-lg border-l-4 ${m.concluido ? 'border-green-500 bg-secondary/50 opacity-70' : 'border-primary bg-secondary'} overflow-x-hidden`, isMobile ? "p-2" : "p-4")}>
                                <div className="flex justify-between items-center">
                                    <p className={cn(`${m.concluido ? 'text-muted-foreground line-through' : 'text-foreground'}`, isMobile ? "font-bold text-sm" : "font-bold")}>{m.nome}</p>
                                    <span className={cn(`text-xs font-bold px-2 py-1 rounded-full ${getRankColor(m.rank)}`, isMobile ? "text-xs px-1 py-0.5" : "")}>Rank {m.rank}</span>
                                </div>
                                <p className={cn("text-muted-foreground mt-1", isMobile ? "text-xs" : "text-sm")}>{m.descricao}</p>
                                {m.concluido && (
                                    <div className={cn("flex items-center text-green-400 mt-2", isMobile ? "text-xs" : "text-sm")}>
                                        <CheckCircle className={cn("mr-2", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                                        <span>Concluída</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default memo(MissionsView);

