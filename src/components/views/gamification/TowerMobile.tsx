"use client";

import React, { memo, useRef, useState } from 'react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { cn } from '@/lib/utils';
import { Skull, Swords, Zap, Star, Trophy, Flame, Sparkles, Menu, ChevronRight, Map, ShieldAlert, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { generateTowerChallenge } from '@/ai/flows/generate-tower-challenge';

const TowerMobileComponent = () => {
    const { profile, missions, metas, skills, persistData, setCurrentPage } = usePlayerDataContext();
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);

    const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            const patterns = { light: 50, medium: 100, heavy: 200 };
            navigator.vibrate(patterns[type]);
        }
    };

    const handleEnterTower = async () => {
        if (isGenerating) return;
        
        triggerHapticFeedback('heavy');
        setIsGenerating(true);

        try {
            const floor = profile.tower_floor || 1;
            
            // Buscar a missão diária ativa de maior prioridade (ou a primeira disponível)
            const activeMissions = missions.flatMap((m: any) => m.missoes_diarias || [])
                                          .filter((d: any) => !d.concluido);
            
            const baseMission = activeMissions.length > 0 
                ? JSON.stringify(activeMissions[0]) 
                : "Nenhuma missão diária ativa encontrada.";

            // 1. Gerar o desafio via IA intensificando a missão base
            const challenge = await generateTowerChallenge({
                floorNumber: floor,
                userProfile: JSON.stringify(profile),
                userSkills: JSON.stringify(skills),
                activeGoals: JSON.stringify(metas.filter((m: any) => !m.concluida)),
                currentActiveMission: baseMission
            });

            // 2. Transformar o desafio em uma Missão de Demon Castle
            const newDemonCastleMission = {
                id: `tower_${floor}_${Date.now()}`,
                nome: `ANDAR ${floor}: ${challenge.title}`,
                descricao: challenge.description,
                concluido: false,
                rank: floor > 10 ? 'S' : floor > 5 ? 'A' : 'B',
                level_requirement: floor,
                meta_associada: 'DEMON CASTLE',
                total_missoes_diarias: 1,
                ultima_missao_concluida_em: null,
                tipo: 'demon_castle',
                is_epic: true,
                missoes_diarias: [{
                    id: Date.now() + 1,
                    nome: "Prova de Ascensão",
                    descricao: challenge.description,
                    xp_conclusao: challenge.rewards.xp,
                    fragmentos_conclusao: challenge.rewards.fragments,
                    concluido: false,
                    tipo: 'diaria',
                    subTasks: challenge.requirements.map(req => ({
                        name: req.value.toString(),
                        target: req.target,
                        unit: req.type.replace('_', ' '),
                        current: 0
                    }))
                }]
            };

            // 3. Persistir no banco de dados
            await persistData('missions', [...missions, newDemonCastleMission]);
            
            toast({ 
                title: "DESAFIO GERADO", 
                description: `A missão do ${floor}º andar foi adicionada ao seu Quest Log.`,
                variant: "destructive"
            });

            // Opcional: Redirecionar para as missões para ver o desafio
            setTimeout(() => setCurrentPage('missions'), 1500);

        } catch (error) {
            console.error("Erro ao gerar andar da torre:", error);
            toast({ 
                variant: 'destructive', 
                title: "FALHA NO SISTEMA", 
                description: "Não foi possível sincronizar com o Demon Castle." 
            });
        } finally {
            setIsGenerating(false);
        }
    };

    if (!profile) return null;

    return (
        <div className="h-screen bg-black overflow-hidden flex flex-col max-w-full relative">
            <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-[0.03] pointer-events-none z-50" />
            
            <header className="bg-black/90 backdrop-blur-2xl border-b border-red-500/20 flex-shrink-0 z-40 pt-safe">
                <div className="flex items-center justify-between bg-red-950/40 border-b border-red-900/30 py-2.5 px-4">
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="h-4 w-4 text-red-500 animate-pulse" />
                        <span className="font-mono text-[10px] text-red-300 uppercase tracking-[0.2em] font-bold">
                            RESTRICTED_ZONE: <span className="text-white">DEMON_CASTLE</span>
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between px-4 py-5 flex-shrink-0">
                    <div>
                        <h1 className="font-cinzel text-white tracking-widest text-2xl font-bold drop-shadow-[0_0_12px_rgba(220,38,38,0.6)] uppercase">
                            DESTINY <span className="text-red-500">TOWER</span>
                        </h1>
                        <p className="text-red-300/60 font-mono text-[10px] tracking-[0.15em] mt-1 font-bold uppercase">
                            ASCENSION_PROTOCOL_ACTIVE
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCurrentPage('dungeon')}
                            className="text-purple-400 p-3 rounded-2xl border-2 border-purple-500/20 bg-purple-500/5 transition-all shadow-lg"
                        >
                            <Skull className="h-7 w-7" />
                        </button>
                        <button className="text-red-400 p-3 rounded-2xl border-2 border-red-500/20 bg-red-500/5 transition-all shadow-lg">
                            <Map className="h-7 w-7" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-6 pb-32 bg-black relative">
                <div className="flex flex-col gap-8 animate-fade-in items-center">
                    
                    {/* Tower Visualization - MD3 Style Floor Container */}
                    <div className="w-full space-y-4">
                        {[5, 4, 3, 2, 1].map((floor) => {
                            const isCurrentFloor = floor === (profile.tower_floor || 1);
                            const isLocked = floor > (profile.tower_floor || 1);
                            const isAlreadyGenerated = missions.some(m => m.id === `tower_${floor}_` || m.nome.startsWith(`ANDAR ${floor}`));
                            
                            return (
                                <div 
                                    key={floor}
                                    className={cn(
                                        "relative border-2 rounded-[2.5rem] transition-all duration-500 p-6 overflow-hidden",
                                        isCurrentFloor 
                                            ? "border-red-500 bg-red-950/20 shadow-[0_0_25px_rgba(220,38,38,0.2)] scale-105 z-10" 
                                            : isLocked 
                                                ? "border-white/5 bg-white/5 opacity-40 grayscale" 
                                                : "border-green-500/30 bg-green-950/5 opacity-60"
                                    )}
                                    onClick={() => isCurrentFloor && triggerHapticFeedback('heavy')}
                                >
                                    <div className="flex justify-between items-center relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl border-2 flex items-center justify-center font-cinzel font-black text-xl",
                                                isCurrentFloor ? "bg-red-500 border-red-400 text-white" : "bg-black border-white/10 text-white/40"
                                            )}>
                                                {floor}
                                            </div>
                                            <div>
                                                <h3 className="font-mono font-bold text-sm text-white uppercase tracking-widest">
                                                    {isLocked ? "ENCRYPTED_FLOOR" : `FLOOR_00${floor}`}
                                                </h3>
                                                <p className="text-[10px] font-mono text-red-200/40 uppercase font-bold tracking-tighter">
                                                    {isCurrentFloor ? "READY_FOR_ENGAGEMENT" : isLocked ? "PATH_UNAVAILABLE" : "AREA_CLEARED"}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {isCurrentFloor ? (
                                            <button 
                                                onClick={handleEnterTower}
                                                disabled={isGenerating}
                                                className="bg-red-600 hover:bg-red-500 text-white font-mono text-[10px] font-bold px-4 py-2 rounded-xl border-2 border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse active:scale-90 transition-all disabled:opacity-50"
                                            >
                                                {isGenerating ? <Loader2 className="animate-spin h-4 w-4" /> : "ENTER"}
                                            </button>
                                        ) : isLocked ? (
                                            <Skull className="h-6 w-6 text-white/10" />
                                        ) : (
                                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 font-bold uppercase tracking-tighter">Verified</Badge>
                                        )}
                                    </div>
                                    
                                    {isCurrentFloor && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 animate-shimmer" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                </div>
            </main>
        </div>
    );
};

export const TowerMobile = memo(TowerMobileComponent);
