"use client";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import { useState, useCallback, memo } from 'react';
import { Trash2, Swords, Brain, Zap, ShieldCheck, Star, BookOpen, Wand2, PlusCircle, Link2, AlertTriangle, KeySquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { statCategoryMapping } from '@/lib/mappings';
import { useToast } from '@/hooks/use-toast';
import { generateSkillFromGoal } from '@/lib/ai-client';
import * as mockData from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { Progress } from '@/components/ui/progress';
import { useIsMobile } from '@/hooks/use-mobile';


const statIcons = {
    forca: <Swords className="h-4 w-4 text-red-400" />,
    inteligencia: <Brain className="h-4 w-4 text-blue-400" />,
    destreza: <Zap className="h-4 w-4 text-yellow-400" />,
    constituicao: <ShieldCheck className="h-4 w-4 text-green-400" />,
    sabedoria: <BookOpen className="h-4 w-4 text-purple-400" />,
    carisma: <Star className="h-4 w-4 text-pink-400" />,
};


const SkillsViewComponent = ({ onEnterDungeon }: { onEnterDungeon: () => void }) => {
    const { profile, skills, metas, persistData, spendDungeonCrystal } = usePlayerDataContext();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedMetaId, setSelectedMetaId] = useState<string | number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const isMobile = useIsMobile();

    const getSkillColor = (category: string) => {
        switch(category){
            case 'Desenvolvimento de Carreira': return 'border-blue-500';
            case 'Saúde & Fitness': return 'border-green-500';
            case 'Crescimento Pessoal': return 'border-purple-500';
            default: return 'border-gray-500';
        }
    };

    const handleDeleteSkill = async (skillId: string | number) => {
        const skillToDelete = skills.find((s: any) => s.id === skillId);
        if (!skillToDelete) return;

        // Remove the link from the associated meta
        const updatedMetas = metas.map((meta: any) => {
            if (meta.habilidade_associada_id === skillId) {
                return { ...meta, habilidade_associada_id: null };
            }
            return meta;
        });
        await persistData('metas', updatedMetas);

        // Delete the skill
        const newSkills = skills.filter((s: any) => s.id !== skillId);
        await persistData('skills', newSkills);

        toast({
            title: "Habilidade Removida",
            description: `A habilidade "${skillToDelete.nome}" foi removida.`
        });
    };
    
    const handleToastError = (error: any, customMessage = 'Não foi possível continuar. O Sistema pode estar sobrecarregado.') => {
        console.error("Erro de IA:", error);
        if (error instanceof Error && (error.message.includes('429') || error.message.includes('Quota'))) {
             toast({ variant: 'destructive', title: 'Quota de IA Excedida', description: 'Você atingiu o limite de pedidos. Tente novamente mais tarde.' });
        } else {
             toast({ variant: 'destructive', title: 'Erro de IA', description: customMessage });
        }
    };

    const handleSaveNewSkill = async () => {
        if (!selectedMetaId) {
            toast({ variant: 'destructive', title: 'Nenhuma meta selecionada', description: 'Por favor, escolha uma meta para associar a nova habilidade.'});
            return;
        }
        
        setIsLoading(true);
        const selectedMeta = metas.find((m: any) => m.id === Number(selectedMetaId));

        try {
            const skillResult = await generateSkillFromGoal({
                goalName: selectedMeta.nome,
                goalDescription: Object.values(selectedMeta.detalhes_smart).join(' '),
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
                pre_requisito: null, 
                nivel_minimo_para_desbloqueio: null,
                ultima_atividade_em: new Date().toISOString(),
            };

            await persistData('skills', [...skills, newSkill]);
            
            const updatedMetas = metas.map((meta: any) => 
                meta.id === Number(selectedMetaId)
                ? { ...meta, habilidade_associada_id: newSkillId }
                : meta
            );
            await persistData('metas', updatedMetas);

            toast({ title: 'Nova Habilidade Adquirida!', description: `A habilidade "${newSkill.nome}" foi adicionada à sua árvore.`});
            setShowAddDialog(false);
            setSelectedMetaId(null);

        } catch (error) {
            handleToastError(error, "Não foi possível gerar a nova habilidade.");
        } finally {
            setIsLoading(false);
        }
    };

    const metasWithoutSkills = metas.filter((meta: any) => !skills.some((skill: any) => skill.id === meta.habilidade_associada_id));

    if (isMobile) {
        return (
            <IonPage>
                <IonHeader className="ion-no-border">
                    <IonToolbar className="bg-background/80 backdrop-blur-md border-b border-border/20 [--background:transparent]">
                        <IonButtons slot="start">
                            <IonMenuButton />
                        </IonButtons>
                        <IonTitle className="font-cinzel text-foreground">HABILIDADES</IonTitle>
                        <IonButtons slot="end">
                            <Button onClick={() => setShowAddDialog(true)} size="icon" variant="ghost" className="text-foreground">
                                <PlusCircle className="h-5 w-5" />
                            </Button>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>

                <IonContent fullscreen className="ion-padding">
                    <IonRefresher slot="fixed" onIonRefresh={(e) => { setTimeout(() => e.detail.complete(), 1500); }}>
                        <IonRefresherContent></IonRefresherContent>
                    </IonRefresher>

                    <div className="pb-24 space-y-4">
                        <div className="bg-blue-950/20 border border-blue-500/20 rounded-lg p-3">
                            <h2 className="text-blue-400 font-cinzel text-sm tracking-widest mb-1">ÁRVORE DE HABILIDADES</h2>
                            <p className="text-[10px] text-blue-300/60 font-mono leading-relaxed">
                                Habilidades evoluem com o combate e tarefas diárias. Inatividade prolongada resulta em <span className="text-purple-400 font-bold">CORRUPÇÃO DE DADOS</span> (Decaimento de XP).
                            </p>
                        </div>

                        <div className="space-y-3">
                            {skills.map((skill: any) => {
                                const skillProgress = (skill.xp_atual / skill.xp_para_proximo_nivel) * 100;
                                const stats: string[] = statCategoryMapping[skill.categoria as keyof typeof statCategoryMapping] || [];
                                const associatedMeta = metas.find((m: any) => m.habilidade_associada_id === skill.id);
                                
                                const lastActivity = new Date(skill.ultima_atividade_em || new Date());
                                const daysSinceActivity = (new Date().getTime() - lastActivity.getTime()) / (1000 * 3600 * 24);
                                const isDecaying = daysSinceActivity > 14;
                                const isAtRisk = daysSinceActivity > 7 && !isDecaying;

                                return (
                                    <div key={skill.id} className={cn(
                                        "relative bg-black/60 border rounded-xl overflow-hidden transition-all duration-300",
                                        isDecaying ? "border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "border-blue-900/40",
                                        isAtRisk && "border-yellow-500/50"
                                    )}>
                                        {/* Mobile Card Layout */}
                                        <div className="p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("p-2 rounded-lg bg-black/40 border", isDecaying ? "border-purple-500/50 text-purple-400" : "border-blue-500/30 text-blue-400")}>
                                                        {isDecaying || isAtRisk ? (
                                                            <AlertTriangle className="h-5 w-5 animate-pulse" />
                                                        ) : (
                                                            <Zap className="h-5 w-5" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white font-mono text-sm uppercase tracking-wide">{skill.nome}</h3>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] bg-blue-950/40 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/20">LVL {skill.nivel_atual}</span>
                                                            {associatedMeta && (
                                                                <span className="text-[9px] text-blue-400/50 font-mono truncate max-w-[120px]">
                                                                    LINK: {associatedMeta.nome}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex gap-1">
                                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400/50 hover:text-blue-400 hover:bg-blue-500/10" onClick={() => spendDungeonCrystal(skill.id)} disabled={(profile?.dungeon_crystals || 0) <= 0}>
                                                        <KeySquare className="h-4 w-4" />
                                                    </Button>
                                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400/50 hover:text-red-400 hover:bg-red-500/10" onClick={() => {}}> 
                                                         {/* Note: Delete dialog logic simplified for mobile view integration, would normally wire up to same state */}
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <p className="text-[10px] text-gray-400/80 font-mono mb-3 line-clamp-2 border-l-2 border-blue-500/20 pl-2">
                                                {skill.descricao}
                                            </p>

                                            {/* Progress Bar */}
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[9px] font-mono text-blue-400/60 uppercase">
                                                    <span>MASTERY</span>
                                                    <span>{skill.xp_atual} / {skill.xp_para_proximo_nivel} XP</span>
                                                </div>
                                                <div className="w-full bg-blue-950/30 h-1 rounded-full overflow-hidden">
                                                    <div className={cn(
                                                        "h-full transition-all duration-500",
                                                        isDecaying ? "bg-purple-500" : "bg-blue-500"
                                                     )} style={{ width: `${skillProgress}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Reusing existing Dialogs (Add Skill, etc) - they are responsive by default */}
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogContent className="max-w-[95vw] bg-black/95 border-blue-500/30">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-white font-cinzel text-lg">
                                    <PlusCircle className="text-blue-500 h-5 w-5"/>
                                    NOVA HABILIDADE
                                </DialogTitle>
                                <DialogDescription className="text-xs font-mono text-gray-400">
                                    Selecione uma meta para sintetizar uma nova habilidade baseada nela.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-3">
                                <Label htmlFor="meta-select-mobile" className="text-blue-400 font-mono text-[10px] uppercase tracking-widest">META ALVO</Label>
                                <Select onValueChange={(value) => setSelectedMetaId(value)} value={selectedMetaId ? String(selectedMetaId) : ''}>
                                    <SelectTrigger id="meta-select-mobile" className="w-full bg-blue-950/20 border-blue-500/30 text-white font-mono text-xs h-10">
                                        <SelectValue placeholder="SELECIONE..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black border-blue-500/30 text-white font-mono text-xs">
                                        {metasWithoutSkills.length > 0 ? (
                                            metasWithoutSkills.map((meta: any) => (
                                                <SelectItem key={meta.id} value={String(meta.id)} className="focus:bg-blue-900/20">{meta.nome}</SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="none" disabled>NENHUMA META DISPONÍVEL</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter className="flex-col gap-2">
                                <Button variant="outline" onClick={() => setShowAddDialog(false)} className="w-full border-gray-700 text-gray-400 h-9 text-xs">CANCELAR</Button>
                                <Button onClick={handleSaveNewSkill} disabled={isLoading || !selectedMetaId} className="w-full bg-blue-600 hover:bg-blue-500 h-9 text-xs">
                                    {isLoading ? 'ANALISANDO...' : 'SINTETIZAR'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <div className={cn("h-full overflow-y-auto", "p-4 md:p-6")}>
            <div className={cn("flex flex-col gap-2 mb-6", isMobile ? "sm:flex-row sm:items-center sm:justify-between" : "sm:flex-row sm:items-center sm:justify-between")}>
                <div>
                    <h1 className={cn("font-bold text-white font-cinzel tracking-[0.15em] drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]", isMobile ? "text-xl" : "text-3xl")}>
                        ABILITY TREE
                    </h1>
                    <p className={cn("text-blue-400/60 font-mono text-xs tracking-widest uppercase mt-1", isMobile ? "text-[10px]" : "text-sm")}>
                        PLAYER SKILLS & MASTERY
                    </p>
                </div>
                <Button onClick={() => setShowAddDialog(true)} className={cn("bg-blue-600 hover:bg-blue-500 text-white font-mono uppercase tracking-wider shadow-[0_0_10px_rgba(37,99,235,0.3)]", isMobile ? "w-full h-8 text-xs" : "sm:w-auto")}>
                    <PlusCircle className={cn("mr-2", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                    ACQUIRE SKILL
                </Button>
            </div>
            
            <p className={cn("text-blue-300/50 font-mono mb-6 border-l-2 border-blue-500/30 pl-3", isMobile ? "text-[10px] mb-4" : "text-xs mb-8")}>
                SYSTEM NOTICE: Abilities evolve through combat and daily tasks. Prolonged inactivity results in <span className="text-purple-400 font-bold animate-pulse">DATA CORRUPTION</span> (XP Decay).
            </p>

            <div className={cn("space-y-3", isMobile ? "space-y-2" : "space-y-4")}>
                {skills.map((skill: any) => {
                    const skillProgress = (skill.xp_atual / skill.xp_para_proximo_nivel) * 100;
                    const stats: string[] = statCategoryMapping[skill.categoria as keyof typeof statCategoryMapping] || [];
                    const associatedMeta = metas.find((m: any) => m.habilidade_associada_id === skill.id);
                    
                    const lastActivity = new Date(skill.ultima_atividade_em || new Date());
                    const daysSinceActivity = (new Date().getTime() - lastActivity.getTime()) / (1000 * 3600 * 24);
                    const isDecaying = daysSinceActivity > 14;
                    const isAtRisk = daysSinceActivity > 7 && !isDecaying;

                    return(
                    <div key={skill.id} className={cn(
                        "relative bg-black/60 border rounded-sm transition-all duration-300 group overflow-hidden",
                        isMobile ? "p-3" : "p-5",
                        isDecaying ? "border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "border-blue-900/40 hover:border-blue-500/50 hover:shadow-[0_0_10px_rgba(59,130,246,0.1)]",
                        isAtRisk && "border-yellow-500/50"
                    )}>
                        {/* Corruption Effect Overlay */}
                        {isDecaying && (
                            <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-10 pointer-events-none mix-blend-overlay animate-pulse-slow" />
                        )}

                        <div className={cn("flex flex-col gap-4", isMobile ? "sm:flex-row sm:items-start" : "sm:flex-row sm:items-start")}>
                            <div className="flex-1 min-w-0">
                                <div className={cn("flex justify-between items-start", isMobile ? "flex-wrap gap-2" : "")}>
                                    <div className={cn("flex items-center gap-3 min-w-0")}>
                                        <div className={cn("p-2 border bg-black/40", isDecaying ? "border-purple-500/50 text-purple-400" : "border-blue-500/30 text-blue-400")}>
                                            {isDecaying || isAtRisk ? (
                                                <AlertTriangle className={cn("flex-shrink-0 animate-pulse", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                                            ) : (
                                                <Zap className={cn("flex-shrink-0", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                                            )}
                                        </div>
                                        <div>
                                            <p className={cn("font-bold text-white font-mono uppercase tracking-wide break-words", isMobile ? "text-sm" : "text-lg")}>{skill.nome}</p>
                                            {associatedMeta && (
                                                <div className={cn("flex items-center gap-1 text-[10px] text-blue-400/50 font-mono mt-0.5")}>
                                                    <Link2 className="h-3 w-3" />
                                                    <span className="truncate uppercase">LINK: {associatedMeta.nome}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                     <div className="flex items-center gap-1">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                     <Button variant="ghost" size="icon" className={cn("text-blue-400/50 hover:text-blue-400 hover:bg-blue-500/10 rounded-none h-8 w-8")} aria-label={`Entrar na masmorra de ${skill.nome}`} onClick={() => spendDungeonCrystal(skill.id)} disabled={(profile?.dungeon_crystals || 0) <= 0}>
                                                        <KeySquare className={cn("", isMobile ? "h-4 w-4" : "h-4 w-4")} />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-black border-blue-500/30 text-xs font-mono">
                                                    <p>USE DUNGEON KEY ({(profile?.dungeon_crystals || 0)})</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className={cn("text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-none h-8 w-8")} aria-label={`Excluir habilidade ${skill.nome}`}>
                                                    <Trash2 className={cn("", isMobile ? "h-4 w-4" : "h-4 w-4")} />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-black/95 border-red-900/50">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className={isMobile ? "text-lg text-red-500 font-mono" : "text-xl text-red-500 font-mono"}>CONFIRM DELETION</AlertDialogTitle>
                                                    <AlertDialogDescription className={isMobile ? "text-xs font-mono text-gray-400" : "text-sm font-mono text-gray-400"}>
                                                        Deleting ability "{skill.nome}" will sever its connection to the associated objective. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter className={isMobile ? "flex-col gap-2" : ""}>
                                                    <AlertDialogCancel className="bg-transparent border-gray-700 text-gray-400 hover:bg-gray-800 rounded-none font-mono text-xs">CANCEL</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteSkill(skill.id)} className="bg-red-900/20 border border-red-500/50 text-red-500 hover:bg-red-900/40 rounded-none font-mono text-xs">DELETE</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                                <p className={cn("text-gray-400/80 mt-2 font-mono text-xs break-words border-l-2 border-blue-500/20 pl-2", isMobile ? "text-[10px]" : "text-xs")}>{skill.descricao}</p>

                                {stats.length > 0 && (
                                     <div className={cn("flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-blue-900/20")}>
                                        <strong className={cn("text-blue-500/50 font-mono uppercase text-[10px]")}>BUFFS:</strong>
                                        <div className="flex flex-wrap items-center gap-2">
                                        {stats.map((stat: string) => (
                                            <div key={stat} className={cn("flex items-center gap-1.5 px-1.5 py-0.5 bg-blue-950/30 border border-blue-500/20 rounded-none")}>
                                                {statIcons[stat as keyof typeof statIcons]}
                                                <span className={cn("capitalize text-blue-300 font-mono text-[10px] uppercase")}>{stat}</span>
                                            </div>
                                        ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Level Display - System Style */}
                            <div className={cn("flex flex-col items-center justify-center border border-blue-500/30 bg-blue-950/10 min-w-[80px] p-2", isMobile ? "w-full flex-row justify-between px-4" : "")}>
                                <div className={cn("text-center", isMobile ? "text-left" : "")}>
                                    <p className={cn("text-blue-500/50 text-[10px] font-mono uppercase tracking-widest")}>LEVEL</p>
                                    <p className={cn("font-bold text-white font-mono text-2xl drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]", isMobile ? "text-xl" : "")}>{skill.nivel_atual}</p>
                                </div>
                                <div className={cn("text-center", isMobile ? "text-right" : "mt-2 pt-2 border-t border-blue-500/20 w-full")}>
                                    <p className={cn("text-blue-500/50 text-[10px] font-mono uppercase tracking-widest")}>MAX</p>
                                    <p className={cn("font-bold text-blue-300 font-mono text-sm")}>{skill.nivel_maximo}</p>
                                </div>
                            </div>
                        </div>
                        
                        {skill.nivel_atual > 0 && (
                             <div className={cn("mt-4")}>
                                <div className={cn("flex justify-between text-[10px] font-mono text-blue-400/60 mb-1 uppercase")}>
                                    <span>MASTERY PROGRESS</span>
                                    <span>{skill.xp_atual} / {skill.xp_para_proximo_nivel} XP</span>
                                </div>
                                <div className={cn("w-full bg-blue-950/30 h-1.5 border border-blue-900/30")}>
                                    <div className={cn(
                                        "h-full transition-all duration-500 shadow-[0_0_5px_currentColor]",
                                        isDecaying ? "bg-purple-500 shadow-purple-500/50" : "bg-blue-500 shadow-blue-500/50"
                                     )} style={{ width: `${skillProgress}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                )})}
            </div>

            <Dialog open={showAddDialog} onOpenChange={(isOpen) => { if(!isOpen) { setShowAddDialog(false); setSelectedMetaId(null); } else { setShowAddDialog(true); }}}>
                <DialogContent className={cn("bg-black/95 border-blue-500/30 max-w-lg", isMobile ? "max-w-[95vw] p-4" : "")}>
                    <DialogHeader>
                        <DialogTitle className={cn("flex items-center gap-2 text-white font-cinzel tracking-wider", isMobile ? "text-lg" : "text-xl")}>
                            <PlusCircle className="text-blue-500"/>
                            NEW ABILITY ACQUISITION
                        </DialogTitle>
                        <DialogDescription className={isMobile ? "text-xs font-mono text-gray-400" : "text-sm font-mono text-gray-400"}>
                            Select a target objective to synthesize a new ability. System AI will generate relevant parameters.
                        </DialogDescription>
                    </DialogHeader>
                    <div className={cn("py-4 space-y-4", isMobile ? "py-2 space-y-3" : "")}>
                        <Label htmlFor="meta-select" className={cn("text-blue-400 font-mono text-xs uppercase tracking-widest")}>TARGET OBJECTIVE</Label>
                        <Select onValueChange={(value) => setSelectedMetaId(value)} value={selectedMetaId ? String(selectedMetaId) : ''}>
                            <SelectTrigger id="meta-select" className={cn("w-full bg-blue-950/20 border-blue-500/30 text-white font-mono text-xs rounded-none focus:ring-blue-500/50", isMobile ? "h-9" : "")}>
                                <SelectValue placeholder="SELECT DATA SOURCE..." />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-blue-500/30 text-white font-mono text-xs">
                                {metasWithoutSkills.length > 0 ? (
                                    metasWithoutSkills.map((meta: any) => (
                                        <SelectItem key={meta.id} value={String(meta.id)} className="focus:bg-blue-900/20">{meta.nome}</SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled>NO VALID DATA SOURCES AVAILABLE</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter className={isMobile ? "flex-col gap-2" : ""}>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)} className={cn("border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white rounded-none font-mono text-xs", isMobile ? "h-8" : "")}>CANCEL</Button>
                        <Button onClick={handleSaveNewSkill} disabled={isLoading || !selectedMetaId} className={cn("bg-blue-600 hover:bg-blue-500 text-white rounded-none font-mono text-xs", isMobile ? "h-8" : "")}>
                            {isLoading ? 'ANALYZING...' : 'INITIATE SYNTHESIS'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export const SkillsView = memo(SkillsViewComponent);
