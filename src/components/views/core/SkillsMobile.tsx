"use client";

import React, { memo, useState, useMemo, useRef } from 'react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { 
    Swords, Brain, Zap, ShieldCheck, Star, BookOpen, 
    Search, Menu, TrendingUp, Sparkles, ChevronRight, 
    Lock, Trophy, Cpu, Zap as ZapIcon, KeySquare, Trash2, PlusCircle, Link2, AlertTriangle 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { generateSkillFromGoal } from '@/lib/ai-client';
import * as mockData from '@/lib/data';

const statIcons: any = {
    forca: <Swords className="h-5 w-5 text-red-400" />,
    inteligencia: <Brain className="h-5 w-5 text-blue-400" />,
    destreza: <Zap className="h-5 w-5 text-yellow-400" />,
    constituicao: <ShieldCheck className="h-5 w-5 text-green-400" />,
    sabedoria: <BookOpen className="h-5 w-5 text-purple-400" />,
    carisma: <Star className="h-5 w-5 text-pink-400" />,
};

const SkillsMobileComponent = () => {
    const { skills, profile, metas, persistData, spendDungeonCrystal } = usePlayerDataContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedMetaId, setSelectedMetaId] = useState<string | number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
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

    const handleTouchStart = (e: React.TouchEvent) => { startY.current = e.touches[0].clientY; };
    const handleTouchMove = (e: React.TouchEvent) => { currentY.current = e.touches[0].clientY; };
    const handleTouchEnd = () => {
        if (currentY.current - startY.current > 150 && scrollContainerRef.current?.scrollTop === 0) {
            triggerHapticFeedback('medium');
        }
    };

    const handleSaveNewSkill = async () => {
        if (!selectedMetaId) {
            toast({ variant: 'destructive', title: 'Nenhuma meta selecionada', description: 'Por favor, escolha uma meta para associar a nova habilidade.'});
            return;
        }
        
        setIsLoading(true);
        triggerHapticFeedback('heavy');
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
            toast({ variant: 'destructive', title: 'Erro de IA', description: "Não foi possível gerar a nova habilidade." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSkill = async (skillId: string | number) => {
        triggerHapticFeedback('heavy');
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

    const filteredSkills = useMemo(() => {
        if (!skills) return [];
        return skills.filter((s: any) => 
            s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.categoria.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a: any, b: any) => b.nivel_atual - a.nivel_atual);
    }, [skills, searchTerm]);

    const metasWithoutSkills = useMemo(() => {
        if (!metas || !skills) return [];
        return metas.filter((meta: any) => !skills.some((skill: any) => skill.id === meta.habilidade_associada_id));
    }, [metas, skills]);

    if (!skills) {
        return (
             <div className="flex h-screen flex-col items-center justify-center p-8 gap-6 bg-black text-blue-500 font-mono">
                <Cpu className="h-12 w-12 animate-spin" />
                <p className="animate-pulse uppercase tracking-[0.2em] text-xs font-bold">Initializing_Neural_Link...</p>
            </div>
        );
    }

    return (
        <div className="h-screen bg-black overflow-hidden flex flex-col max-w-full relative">
            <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-[0.03] pointer-events-none z-50" />
            
            <header className="bg-black/90 backdrop-blur-2xl border-b border-blue-500/20 flex-shrink-0 z-40" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
                <div className="flex items-center justify-between bg-blue-950/40 border-b border-blue-900/30 py-2.5 px-4">
                    <div className="flex items-center gap-3">
                        <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
                        <span className="font-mono text-[10px] text-blue-300 uppercase tracking-[0.2em] font-bold">
                            MASTERY_DATABASE: <span className="text-white">ENCRYPTED</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]" />
                        <span className="font-mono text-[10px] text-blue-400 font-bold tracking-wider uppercase">Online</span>
                    </div>
                </div>

                <div className="px-4 py-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-cinzel text-white tracking-widest text-2xl font-bold drop-shadow-[0_0_12px_rgba(59,130,246,0.6)] uppercase">
                                SKILL <span className="text-blue-400">TREE</span>
                            </h1>
                            <p className="text-blue-300/60 font-mono text-[10px] tracking-[0.15em] mt-1 font-bold uppercase">
                                CAPACITY_UPGRADE_INTERFACE
                            </p>
                        </div>
                        <button className="text-blue-400 p-3 rounded-2xl border-2 border-blue-500/20 bg-blue-500/5 active:bg-blue-500/20 transition-all shadow-lg">
                            <Menu className="h-7 w-7" />
                        </button>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500/50 h-5 w-5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Scan neural patterns..."
                            className="w-full pl-12 pr-4 h-14 bg-blue-950/20 border border-blue-500/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-mono text-sm text-blue-100 placeholder:text-blue-500/30"
                        />
                    </div>
                </div>
            </header>

            <main 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-4 py-4 pb-safe bg-black relative" 
                onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
            >
                <div className="flex flex-col gap-5 pb-32 animate-fade-in">
                    {filteredSkills.map((skill: any, index: number) => {
                        const progress = (skill.xp_atual / skill.xp_para_proximo_nivel) * 100;
                        const isMaxLevel = skill.nivel_atual >= skill.nivel_maximo;
                        const associatedMeta = metas?.find((m: any) => m.habilidade_associada_id === skill.id);
                        
                        const lastActivity = new Date(skill.ultima_atividade_em || new Date());
                        const daysSinceActivity = (new Date().getTime() - lastActivity.getTime()) / (1000 * 3600 * 24);
                        const isDecaying = daysSinceActivity > 14;
                        const isAtRisk = daysSinceActivity > 7 && !isDecaying;
                        
                        return (
                            <div 
                                key={skill.id} 
                                className={cn(
                                    "relative border-2 rounded-[2.5rem] transition-all duration-300 active:scale-[0.97] overflow-hidden shadow-2xl p-6",
                                    "bg-gradient-to-br from-blue-950/20 to-black border-blue-900/40",
                                    isDecaying && "border-purple-500/60 shadow-purple-500/20"
                                )}
                                onClick={() => triggerHapticFeedback('light')}
                            >
                                <div className="flex justify-between items-start mb-5">
                                    <div className="flex gap-5 items-center">
                                        {/* Skill Icon MD3 */}
                                        <div className="relative">
                                            <div className={cn(
                                                "w-16 h-16 rounded-3xl border-2 flex items-center justify-center shadow-inner group",
                                                isDecaying ? "bg-purple-500/10 border-purple-500/30" : "bg-blue-500/10 border-blue-500/30"
                                            )}>
                                                <div className="absolute inset-0 bg-blue-400/5 animate-pulse rounded-3xl" />
                                                {statIcons[skill.categoria.toLowerCase()] || <ZapIcon className="h-8 w-8 text-blue-400" />}
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 bg-blue-600 border-2 border-black text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-lg font-mono">
                                                LV.{skill.nivel_atual}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-cinzel font-bold text-lg text-white truncate uppercase tracking-wider">
                                                {skill.nome}
                                            </h3>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                <Badge variant="outline" className="text-[9px] font-mono uppercase tracking-[0.15em] border-blue-500/20 text-blue-400 bg-blue-500/5 px-3 py-1 rounded-full font-bold">
                                                    {skill.categoria}
                                                </Badge>
                                                {isDecaying && <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[8px]">CORRUPTED</Badge>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2">
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                                            onClick={(e) => { e.stopPropagation(); spendDungeonCrystal(skill.id); }}
                                            disabled={(profile?.dungeon_crystals || 0) <= 0}
                                        >
                                            <KeySquare className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost" 
                                                    className="h-8 w-8 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-black/95 border-red-900/50 max-w-[95vw] rounded-2xl">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-red-500 font-mono uppercase">CONFIRM DELETION</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-gray-400 font-mono text-xs">
                                                        Deleting this skill will sever its neural link. Action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="bg-transparent border-gray-700 text-gray-400">CANCEL</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteSkill(skill.id)} className="bg-red-900/20 border border-red-500/50 text-red-500">DELETE</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-xs text-blue-100/60 font-mono leading-relaxed line-clamp-2 uppercase tracking-tight italic pl-2 border-l-2 border-blue-500/30">
                                        "{skill.descricao}"
                                    </p>
                                    
                                    {associatedMeta && (
                                        <div className="flex items-center gap-2 text-[10px] text-blue-400/40 font-mono uppercase">
                                            <Link2 className="h-3 w-3" />
                                            <span>LINKED: {associatedMeta.nome}</span>
                                        </div>
                                    )}

                                    <div className="w-full space-y-2">
                                        <div className="flex justify-between text-[10px] font-mono text-blue-400 font-bold uppercase tracking-widest">
                                            <span>EXPERIENCE_LEVEL</span>
                                            <span>{isMaxLevel ? 'MAX' : `${Math.round(progress)}%`}</span>
                                        </div>
                                        <div className="h-3 bg-blue-950/40 rounded-full overflow-hidden border border-blue-500/20 shadow-inner">
                                            <div 
                                                className={cn(
                                                    "h-full transition-all duration-1000 ease-out",
                                                    isMaxLevel 
                                                        ? "bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_10px_#eab308]" 
                                                        : "bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_#3b82f6]",
                                                    isDecaying && "from-purple-600 to-purple-400 shadow-[0_0_10px_#a855f7]"
                                                )}
                                                style={{ width: `${isMaxLevel ? 100 : progress}%` }} 
                                            />
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] font-mono text-blue-300/40 font-bold uppercase">
                                            <span>Neural progress data</span>
                                            <span>{skill.xp_atual}/{skill.xp_para_proximo_nivel} XP</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            <button
                className="fixed bottom-8 right-6 w-20 h-20 bg-blue-600 border-4 border-blue-400 text-white shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all active:scale-90 active:bg-blue-500 flex items-center justify-center group z-40 rounded-[2rem]"
                style={{ bottom: 'calc(32px + env(safe-area-inset-bottom))', right: '24px' }}
                onClick={() => setShowAddDialog(true)}
            >
                <PlusCircle className="h-10 w-10 group-hover:rotate-90 transition-transform duration-500" />
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white/40 rounded-tl-lg" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-white/40 rounded-br-lg" />
            </button>

            {/* Add Skill Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-[95vw] bg-black/95 border-2 border-blue-500/30 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="p-6 border-b border-blue-500/20 bg-blue-950/20">
                        <DialogTitle className="text-white font-cinzel tracking-widest text-xl uppercase font-bold text-center flex items-center justify-center gap-3">
                            <PlusCircle className="h-6 w-6 text-blue-400 animate-pulse" /> NEW_ABILITY
                        </DialogTitle>
                        <DialogDescription className="text-blue-400/60 font-mono text-[10px] uppercase font-bold text-center mt-1">
                            SYNTHESIZE NEW SKILL PROTOCOL
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-bold ml-2">TARGET OBJECTIVE SOURCE</Label>
                            <Select onValueChange={(value) => setSelectedMetaId(value)} value={selectedMetaId ? String(selectedMetaId) : ''}>
                                <SelectTrigger className="w-full h-14 bg-blue-950/20 border-2 border-blue-900/30 rounded-2xl px-6 text-white font-mono focus:ring-blue-500/50 uppercase text-xs">
                                    <SelectValue placeholder="SELECT SOURCE DATA..." />
                                </SelectTrigger>
                                <SelectContent className="bg-black border-2 border-blue-500/30 rounded-2xl text-white font-mono text-xs uppercase">
                                    {metasWithoutSkills.length > 0 ? (
                                        metasWithoutSkills.map((meta: any) => (
                                            <SelectItem key={meta.id} value={String(meta.id)} className="focus:bg-blue-900/20 p-3 rounded-xl">{meta.nome}</SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>NO DATA SOURCES AVAILABLE</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="p-4 bg-blue-950/10 flex-col gap-2">
                        <button 
                            onClick={handleSaveNewSkill} 
                            disabled={isLoading || !selectedMetaId}
                            className="w-full py-4 bg-blue-600 text-white font-mono font-bold rounded-2xl shadow-lg border-2 border-blue-400 active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50"
                        >
                            {isLoading ? 'ANALYZING...' : 'INITIATE_SYNTHESIS'}
                        </button>
                        <button 
                            onClick={() => setShowAddDialog(false)}
                            className="w-full py-3 text-[10px] font-mono text-blue-400/60 uppercase font-bold tracking-widest hover:text-blue-400"
                        >
                            ABORT_OPERATION
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export const SkillsMobile = memo(SkillsMobileComponent);
