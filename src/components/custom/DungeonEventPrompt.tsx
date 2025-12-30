
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Swords, Check, X, KeySquare, ShieldAlert } from 'lucide-react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { cn } from '@/lib/utils';

export const DungeonEventPrompt = () => {
    const { profile, skills, acceptDungeonEvent, declineDungeonEvent } = usePlayerDataContext();
    const [isVisible, setIsVisible] = useState(false);
    const [skillName, setSkillName] = useState('');

    const activeEvent = profile?.active_dungeon_event;

    useEffect(() => {
        if (activeEvent && activeEvent.skillId) {
            const skill = skills.find((s: { id: string | number; nome: string }) => s.id === activeEvent.skillId);
            if (skill) {
                setSkillName(skill.nome);
                setIsVisible(true);
            }
        } else {
            setIsVisible(false);
        }
    }, [activeEvent, skills]);
    
    if (!isVisible || !activeEvent) {
        return null;
    }

    return (
        <Dialog open={true} onOpenChange={() => {}}>
            <DialogContent 
                className="max-w-md w-full bg-red-950/90 backdrop-blur-md border-2 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)] text-white p-0 overflow-hidden sm:rounded-none"
                hideCloseButton={true}
            >
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.2)_10px,rgba(0,0,0,0.2)_20px)] pointer-events-none" />
                
                <DialogHeader className="text-center items-center pt-8 pb-4 relative z-10">
                    <DialogTitle className="sr-only">Dungeon Invite</DialogTitle>
                    <div className="w-20 h-20 rounded-full bg-red-600/20 flex items-center justify-center mb-4 border-4 border-red-600 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.6)]">
                        <ShieldAlert className="w-10 h-10 text-red-500" />
                    </div>
                    <p className="text-3xl font-black font-cinzel text-red-500 uppercase tracking-widest drop-shadow-md animate-pulse">EMERGENCY QUEST</p>
                    <p className="text-red-400 font-mono text-xs tracking-[0.2em] uppercase mt-1">A GATE HAS OPENED</p>
                </DialogHeader>

                <div className="px-6 py-4 text-center relative z-10">
                    <DialogDescription className="text-red-200/80 text-sm font-mono leading-relaxed bg-black/40 p-4 border border-red-500/30">
                        System has detected a dimensional fracture linked to:
                        <br/>
                        <strong className="text-white text-lg block mt-2 uppercase tracking-wide">{skillName}</strong>
                    </DialogDescription>
                    <p className="text-[10px] text-red-500/60 mt-2 font-mono uppercase">FAILURE TO ACCEPT MAY RESULT IN PENALTY</p>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-0 mt-4 border-t-2 border-red-600">
                    <Button 
                        variant="ghost" 
                        onClick={declineDungeonEvent} 
                        className="w-full sm:w-1/2 h-14 rounded-none bg-black/60 hover:bg-red-950/50 text-gray-400 hover:text-white font-mono uppercase tracking-widest border-r border-red-600/30"
                    >
                        IGNORE
                    </Button>
                    <Button 
                        onClick={acceptDungeonEvent} 
                        className="w-full sm:w-1/2 h-14 rounded-none bg-red-700 hover:bg-red-600 text-white font-mono font-bold uppercase tracking-widest shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                    >
                        ENTER GATE
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
