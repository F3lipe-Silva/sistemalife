"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { LoaderCircle } from 'lucide-react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export default function DangerZoneTab() {
    const { handleFullReset } = usePlayerDataContext();
    const [isResetting, setIsResetting] = useState(false);
    const isMobile = useIsMobile();

    const onReset = async () => {
        setIsResetting(true);
        await handleFullReset();
        // A página deve recarregar ou redirecionar após o reset, o que é tratado no contexto.
        // Não é necessário setar `isResetting` para false aqui.
    };

    return (
        <div className={cn("bg-red-950/10 border border-red-500/30 p-6 relative overflow-hidden", isMobile ? "p-4" : "")}>
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-500/50" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-red-500/50" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-red-500/50" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-500/50" />

            <div className="mb-6 border-b border-red-900/30 pb-2">
                <h3 className={cn("font-bold font-cinzel text-red-500 uppercase tracking-widest flex items-center gap-2", isMobile ? "text-base" : "text-lg")}>
                    DANGER ZONE
                </h3>
                <p className={cn("font-mono text-red-400/50 text-xs", isMobile ? "text-[10px]" : "")}>IRREVERSIBLE ACTIONS</p>
            </div>

            <div className={cn(
                "flex items-start justify-between gap-4 border border-red-500/20 bg-red-950/20 p-4",
                isMobile ? "flex-col p-3 gap-3" : "flex-row"
            )}>
                <div className={isMobile ? "space-y-1" : ""}>
                    <p className={cn("font-bold text-red-400 font-mono uppercase tracking-wide", isMobile ? "text-sm" : "")}>SYSTEM RESET</p>
                    <p className={cn("text-red-300/60 font-mono text-xs", isMobile ? "text-[10px]" : "text-xs")}>PERMANENTLY DELETE ALL USER DATA.</p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isResetting} className={cn("bg-red-600 hover:bg-red-500 text-white rounded-none font-mono text-xs uppercase tracking-widest h-9 shadow-[0_0_15px_rgba(220,38,38,0.4)]", isMobile ? "w-full" : "w-auto")}>
                            {isResetting ? <LoaderCircle className={cn("animate-spin mr-2", isMobile ? "h-3 w-3" : "")} /> : (isMobile ? "RESET" : "INITIATE RESET")}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-black/95 border-2 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.4)]">
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(220,38,38,0.05)_10px,rgba(220,38,38,0.05)_20px)] pointer-events-none" />
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-red-500 font-mono uppercase tracking-widest text-xl animate-pulse">CRITICAL WARNING</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400 font-mono text-xs">
                                This action is irreversible. All user data, including profile, objectives, missions, and abilities, will be permanently erased. System recovery will be impossible.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className={isMobile ? "flex-col gap-2" : ""}>
                            <AlertDialogCancel className="bg-transparent border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 rounded-none font-mono text-xs uppercase tracking-widest">
                                ABORT SEQUENCE
                            </AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={onReset} 
                                className={cn(
                                    "bg-red-600 hover:bg-red-500 text-white rounded-none font-mono text-xs uppercase tracking-widest border border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.6)]",
                                    isMobile ? "h-9" : ""
                                )}
                            >
                                CONFIRM DESTRUCTION
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}