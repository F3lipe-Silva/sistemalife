"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Award, X, Gem, Plus, Link, Trash2, Save, CalendarPlus, Wand2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Card, CardContent, CardHeader } from "../../../ui/card";
import { Progress } from "../../../ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";


// Type definitions
interface SubTask {
  name: string;
  target: number;
  unit: string;
  current: number;
}

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
  concluido?: boolean;
  tipo?: string;
  subTasks: SubTask[];
  learningResources?: string[];
}

interface RankedMission {
  id: string | number;
  nome: string;
  descricao: string;
  xp_conclusao: number;
  fragmentos_conclusao: number;
  concluido?: boolean;
  tipo?: string;
  subTasks: SubTask[];
  learningResources?: string[];
}

interface ContributionState {
  open: boolean;
  subTask: SubTask | null;
  amount: number;
}

interface SubTaskCreatorProps {
  subTasks: SubTask[];
  onSubTasksChange: (subTasks: SubTask[]) => void;
}

interface MissionDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mission: Mission | null;
  isManual: boolean;
  onContribute: (subTask: SubTask, amount: number, mission: Mission) => void;
  onSave: (mission: Mission) => void;
  onDelete: (missionId: string | number) => void;
  onAdjustDifficulty: (mission: Mission, feedback: 'too_easy' | 'too_hard') => void;
}

const SubTaskCreator: React.FC<SubTaskCreatorProps> = ({ subTasks, onSubTasksChange }) => {
    const [name, setName] = useState('');
    const [target, setTarget] = useState(1);
    const [unit, setUnit] = useState('');

    const handleAdd = () => {
        if (!name.trim()) return;
        const newSubTask = { name, target: Number(target), unit, current: 0 };
        onSubTasksChange([...subTasks, newSubTask]);
        setName('');
        setTarget(1);
        setUnit('');
    };

    const handleRemove = (index: number) => {
        onSubTasksChange(subTasks.filter((_: SubTask, i: number) => i !== index));
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                {subTasks.map((task: SubTask, index: number) => (
                    <div key={index} className="flex items-center gap-2 bg-secondary/30 p-2 rounded-md border border-border/20">
                        <p className="flex-grow text-sm text-foreground break-words">{task.name} ({task.target} {task.unit})</p>
                        <Button size="icon" variant="ghost" onClick={() => handleRemove(index)} className="h-6 w-6 text-red-500 hover:bg-red-500/20 flex-shrink-0">
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-2 p-3 border-t border-border bg-secondary/10 rounded-md">
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome da sub-tarefa" className="w-full"/>
                <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                    <Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="Unidade (ex: páginas, km)" className="w-full"/>
                    <Input value={target} onChange={e => setTarget(Number(e.target.value))} type="number" placeholder="Meta" className="w-20"/>
                    <Button onClick={handleAdd} size="sm" className="flex-shrink-0"><Plus className="h-4 w-4"/></Button>
                </div>
            </div>
        </div>
    );
};


export const MissionDetailsDialog: React.FC<MissionDetailsDialogProps> = ({ isOpen, onClose, mission, isManual, onContribute, onSave, onDelete, onAdjustDifficulty }) => {
  const [editedMission, setEditedMission] = useState<Mission | null>(null);
  const [contributionState, setContributionState] = useState<ContributionState>({ open: false, subTask: null, amount: 1 });
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (mission) {
      // Convert the mission to the Mission type for internal use
      const convertedMission: Mission = {
        ...mission,
        id: mission.id,
        nome: mission.nome,
        descricao: mission.descricao,
        xp_conclusao: 'xp_conclusao' in mission ? mission.xp_conclusao : 0,
        fragmentos_conclusao: 'fragmentos_conclusao' in mission ? mission.fragmentos_conclusao : 0,
        concluido: 'concluido' in mission ? mission.concluido : undefined,
        tipo: 'tipo' in mission ? mission.tipo : ('missoes_diarias' in mission ? 'epica' : 'diaria'),
        subTasks: mission.subTasks || [],
        learningResources: 'learningResources' in mission ? mission.learningResources : undefined,
        isManual: 'isManual' in mission ? mission.isManual : undefined,
      };
      setEditedMission(convertedMission);
    } else {
      setEditedMission({ nome: '', descricao: '', xp_conclusao: 20, fragmentos_conclusao: 5, subTasks: [] });
    }
  }, [mission]);

  if (!isOpen || !editedMission) return null;

  const isEditing = !!editedMission.id;

  const handleContribute = async () => {
    if (!contributionState.subTask || !mission) return;
    
    onContribute(contributionState.subTask, contributionState.amount, mission);

    // Only close the contribution dialog, not the main one
    setContributionState({ open: false, subTask: null, amount: 1 });
  }

  const handleSave = () => {
    if (editedMission) {
      onSave(editedMission);
    }
  }

  const handleDelete = () => {
    if (editedMission?.id) {
        onDelete(editedMission.id);
    }
  }

  const handleInputChange = (field: keyof Mission, value: string) => {
    setEditedMission(prev => prev ? ({ ...prev, [field]: value }) : null);
  };
   const handleNumericInputChange = (field: keyof Mission, value: string) => {
    setEditedMission(prev => prev ? ({ ...prev, [field]: Number(value) }) : null);
  };

  const handleSubTasksChange = (newSubTasks: SubTask[]) => {
    setEditedMission(prev => prev ? ({ ...prev, subTasks: newSubTasks }) : null);
  };
  
  const handleAddToCalendar = () => {
    // This is a simulation. A real implementation would check for actual OAuth connection.
    const isConnected = true; // Let's simulate being connected.
    if (isConnected) {
        toast({
            title: "Missão Adicionada ao Calendário!",
            description: `A missão "${editedMission.nome}" foi sincronizada com o seu Google Calendar. (Simulação)`,
        });
    } else {
        toast({
            variant: "destructive",
            title: "Conexão Necessária",
            description: "Por favor, conecte a sua conta Google nas Configurações > Dados & Backup para usar esta funcionalidade."
        });
    }
  }

  const renderViewMode = () => (
    <>
        <div className="border-b border-blue-900/50 bg-blue-950/20 px-6 py-4">
            <div className="flex items-center gap-2 mb-1">
                <span className="bg-blue-600 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 uppercase tracking-widest">
                    {editedMission.tipo === 'diaria' ? 'DAILY QUEST' : 'QUEST INFO'}
                </span>
                {editedMission.concluido && (
                    <span className="bg-green-600 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 uppercase tracking-widest">COMPLETE</span>
                )}
            </div>
            <DialogTitle className="text-xl md:text-2xl font-black font-cinzel text-white uppercase tracking-widest drop-shadow-md">
                {editedMission.nome}
            </DialogTitle>
        </div>

        <div className="px-6 py-6 space-y-6">
            {/* Description */}
            <div className="bg-black/40 border border-blue-900/30 p-4 relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500/50" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500/50" />
                <p className="text-blue-100/80 font-mono text-sm leading-relaxed">
                    {editedMission.descricao}
                </p>
            </div>

            {/* Rewards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-950/10 border border-blue-500/20 p-3 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-blue-500 font-mono uppercase tracking-widest mb-1">REWARD: XP</span>
                    <div className="flex items-center gap-2 text-blue-300">
                        <Award className="h-4 w-4"/>
                        <span className="font-mono font-bold text-lg">{editedMission.xp_conclusao}</span>
                    </div>
                </div>
                <div className="bg-yellow-950/10 border border-yellow-500/20 p-3 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-yellow-500 font-mono uppercase tracking-widest mb-1">REWARD: ITEMS</span>
                    <div className="flex items-center gap-2 text-yellow-300">
                        <Gem className="h-4 w-4"/>
                        <span className="font-mono font-bold text-lg">{editedMission.fragmentos_conclusao}</span>
                    </div>
                </div>
            </div>

            {/* Objectives */}
            <div>
                <h4 className="font-mono font-bold text-blue-400 text-xs uppercase tracking-widest mb-3 border-b border-blue-900/30 pb-1">
                    QUEST OBJECTIVES
                </h4>
                <div className="space-y-2">
                    {(editedMission.subTasks || []).map((task: SubTask, index: number) => {
                        const isTaskCompleted = (task.current || 0) >= task.target;
                        const progress = Math.min(100, ((task.current || 0) / task.target) * 100);
                        
                        return (
                             <div key={index} className="group relative bg-black/60 border border-blue-900/30 p-2 overflow-hidden">
                                {/* Progress Bar Background */}
                                <div 
                                    className="absolute inset-y-0 left-0 bg-blue-900/20 pointer-events-none transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                                
                                <div className="flex items-center justify-between gap-3 relative z-10">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={cn("w-4 h-4 border flex items-center justify-center transition-colors", isTaskCompleted ? "bg-blue-500 border-blue-500" : "border-blue-500/50")}>
                                            {isTaskCompleted && <span className="text-black text-[10px] font-bold">✓</span>}
                                        </div>
                                        <p className={cn("font-mono text-sm uppercase truncate", isTaskCompleted ? "text-blue-500 line-through" : "text-gray-300")}>
                                            {task.name}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-blue-400">
                                            {task.current || 0} <span className="text-blue-500/30">/</span> {task.target} <span className="text-[10px] text-gray-500">{task.unit}</span>
                                        </span>
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-6 w-6 text-blue-400 hover:bg-blue-500 hover:text-black rounded-none" 
                                            onClick={() => setContributionState({ open: true, subTask: task, amount: 1 })}
                                            disabled={isTaskCompleted}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
          
           {editedMission.learningResources && editedMission.learningResources.length > 0 && (
            <div>
                <h5 className="font-mono font-bold text-blue-400 text-xs uppercase tracking-widest mb-3 border-b border-blue-900/30 pb-1">
                    INTEL
                </h5>
                <div className="space-y-2">
                    {editedMission.learningResources.map((link: string, index: number) => (
                        <a href={link} target="_blank" rel="noopener noreferrer" key={index} 
                           className="flex items-center gap-2 text-blue-300 hover:text-white text-xs p-2 bg-blue-950/20 border border-blue-900/30 hover:border-blue-500/50 transition-colors font-mono">
                            <Link className="h-3 w-3 flex-shrink-0"/>
                            <span className="truncate">{link}</span>
                        </a>
                    ))}
                </div>
            </div>
        )}
        </div>
        
        <DialogFooter className="px-6 pb-6 pt-2 gap-3 sm:gap-0 flex-col sm:flex-row bg-black/40 border-t border-blue-900/30">
             <Button onClick={() => onAdjustDifficulty(mission!, 'too_hard')} variant="outline" className="text-red-400 border-red-900/50 bg-red-950/10 hover:bg-red-900/30 hover:text-red-300 hover:border-red-500/50 rounded-none font-mono text-xs uppercase tracking-wider sm:mr-auto">REPORT DIFFICULTY</Button>
             <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-500 text-white rounded-none font-mono text-xs uppercase tracking-widest px-8">CLOSE WINDOW</Button>
        </DialogFooter>
    </>
  );

  const renderEditMode = () => (
     <>
        <div className="border-b border-blue-900/50 bg-blue-950/20 px-6 py-4">
            <DialogTitle className="text-lg md:text-xl font-bold font-cinzel text-white uppercase tracking-widest">
                {isEditing ? "EDIT QUEST PARAMETERS" : "INITIALIZE NEW QUEST"}
            </DialogTitle>
            <DialogDescription className="text-xs font-mono text-blue-400/60 uppercase tracking-wide mt-1">
                MANUAL OVERRIDE PROTOCOL
            </DialogDescription>
        </div>

        <div className="px-6 py-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
             <div className="space-y-2">
                <Label htmlFor="manual-mission-name" className="text-xs font-mono text-blue-400 uppercase tracking-widest">QUEST TITLE</Label>
                <Input id="manual-mission-name" value={editedMission.nome} onChange={e => handleInputChange('nome', e.target.value)} className="bg-black/40 border-blue-900/50 text-white font-mono rounded-none focus-visible:ring-blue-500/50" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="manual-mission-desc" className="text-xs font-mono text-blue-400 uppercase tracking-widest">DESCRIPTION</Label>
                <Textarea id="manual-mission-desc" value={editedMission.descricao} onChange={e => handleInputChange('descricao', e.target.value)} className="bg-black/40 border-blue-900/50 text-white font-mono rounded-none focus-visible:ring-blue-500/50 resize-none" rows={3} />
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="manual-mission-xp" className="text-xs font-mono text-blue-400 uppercase tracking-widest">XP REWARD</Label>
                    <Input id="manual-mission-xp" type="number" value={editedMission.xp_conclusao} onChange={e => handleNumericInputChange('xp_conclusao', e.target.value)} className="bg-black/40 border-blue-900/50 text-white font-mono rounded-none" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="manual-mission-fragments" className="text-xs font-mono text-blue-400 uppercase tracking-widest">ITEM REWARD</Label>
                    <Input id="manual-mission-fragments" type="number" value={editedMission.fragmentos_conclusao} onChange={e => handleNumericInputChange('fragmentos_conclusao', e.target.value)} className="bg-black/40 border-blue-900/50 text-white font-mono rounded-none" />
                </div>
            </div>
             <div className="space-y-2 pt-2 border-t border-blue-900/30">
                <Label className="text-xs font-mono text-blue-400 uppercase tracking-widest">OBJECTIVES</Label>
                <SubTaskCreator subTasks={editedMission.subTasks} onSubTasksChange={handleSubTasksChange} />
             </div>
        </div>
        <DialogFooter className="px-6 pb-6 pt-4 gap-3 bg-black/40 border-t border-blue-900/30 flex-col sm:flex-row">
            {isEditing && (
                 <Button variant="destructive" onClick={handleDelete} className="w-full sm:w-auto mr-auto bg-red-900/20 border border-red-500/50 text-red-500 hover:bg-red-900/40 rounded-none font-mono text-xs uppercase tracking-widest">
                    DELETE QUEST
                </Button>
            )}
             <Button variant="outline" onClick={onClose} className="w-full sm:w-auto border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 rounded-none font-mono text-xs uppercase tracking-widest">CANCEL</Button>
            <Button onClick={handleSave} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white rounded-none font-mono text-xs uppercase tracking-widest">SAVE DATA</Button>
        </DialogFooter>
     </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
            "bg-black/95 border-2 border-blue-500/50 text-white p-0 shadow-[0_0_30px_rgba(37,99,235,0.3)] backdrop-blur-xl overflow-hidden",
            isMobile 
                ? "w-screen h-[100dvh] max-w-none rounded-none border-x-0 border-b-0 border-t-0" 
                : "max-w-2xl w-full mx-4 sm:rounded-none"
        )}
        hideCloseButton={true}
      >
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-400 z-20" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-blue-400 z-20" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-400 z-20" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-400 z-20" />
        
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 p-1 text-blue-500/50 hover:text-blue-400 hover:bg-blue-900/20 z-30 transition-colors">
            <X className="h-5 w-5" />
        </button>

        <div className="max-h-[90vh] overflow-y-auto">
            {isManual ? renderEditMode() : renderViewMode()}
        </div>

         <Dialog open={contributionState.open} onOpenChange={(isOpen) => setContributionState(prev => ({...prev, open: isOpen}))}>
            <DialogContent className="bg-black/95 border border-blue-500/50 text-white sm:rounded-none max-w-sm">
                <DialogHeader>
                    <DialogTitle className="font-cinzel text-lg text-blue-400 uppercase tracking-widest">LOG PROGRESS</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <p className="text-sm font-mono text-gray-300">Target: <span className="text-white font-bold">{contributionState.subTask?.name}</span></p>
                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-xs font-mono text-blue-500 uppercase">AMOUNT</Label>
                        <Input 
                            id="amount" 
                            type="number" 
                            placeholder="0" 
                            min="1" 
                            className="bg-blue-950/20 border-blue-900/50 text-white font-mono rounded-none h-10 text-lg"
                            onChange={e => setContributionState(prev => ({...prev, amount: Number(e.target.value)}))}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setContributionState({open: false, subTask: null, amount: 1})} className="border-gray-700 text-gray-400 hover:bg-gray-800 rounded-none font-mono text-xs">CANCEL</Button>
                    <Button onClick={handleContribute} className="bg-blue-600 hover:bg-blue-500 text-white rounded-none font-mono text-xs uppercase tracking-widest">CONFIRM</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};
