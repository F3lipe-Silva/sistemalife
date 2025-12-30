
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlayerDataContext } from "@/hooks/use-player-data";
import { KeySquare, Send, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const DungeonLobbyView = ({ onNavigateToSkills }: { onNavigateToSkills: () => void }) => {
    const { profile } = usePlayerDataContext();
    const crystalCount = profile?.dungeon_crystals || 0;

    return (
        <div className="h-full flex flex-col items-center justify-center text-center relative p-3 md:p-4">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,1)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 -z-10"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background -z-10"></div>

            <div className="relative mb-4 md:mb-6">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl md:blur-2xl animate-pulse"></div>
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-black border-2 border-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                    <KeySquare className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
                </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white font-cinzel tracking-wider mb-2 md:mb-3 uppercase">
                SKILL DUNGEON <span className="text-blue-500">GATE</span>
            </h2>
            <p className="text-blue-200/60 max-w-xl mx-auto mb-4 md:mb-6 font-mono text-[10px] md:text-xs tracking-wide px-4">
                SYSTEM WARNING: High-intensity training environments. Proceed with caution.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-3xl w-full">
                {/* Random Event Gate */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-red-500/10 blur group-hover:bg-red-500/20 transition-all"></div>
                    <Card className="relative bg-black/80 border border-red-500/30 group-hover:border-red-500/60 transition-colors">
                        <CardHeader className="p-3 md:p-4 pb-2">
                            <CardTitle className="text-center font-mono text-red-400 uppercase tracking-widest flex items-center justify-center gap-1.5 text-xs md:text-sm">
                                <ShieldAlert className="h-4 w-4" /> RED GATE
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 md:p-4 pt-0">
                            <CardDescription className="text-center font-mono text-[10px] md:text-xs text-red-200/50">
                                RANDOM EVENTS
                                <br/>
                                <span className="text-[9px] opacity-70">Mandatory summoning protocols</span>
                            </CardDescription>
                        </CardContent>
                    </Card>
                </div>

                {/* Key Gate */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-blue-500/10 blur group-hover:bg-blue-500/20 transition-all"></div>
                    <Card className="relative bg-black/80 border border-blue-500/30 group-hover:border-blue-500/60 transition-colors">
                        <CardHeader className="p-3 md:p-4 pb-2">
                            <CardTitle className="text-center font-mono text-blue-400 uppercase tracking-widest flex items-center justify-center gap-1.5 text-xs md:text-sm">
                                <KeySquare className="h-4 w-4" /> BLUE GATE
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 md:p-4 pt-0">
                             <CardDescription className="text-center font-mono text-[10px] md:text-xs text-blue-200/50 mb-2">
                                MANUAL ENTRY
                            </CardDescription>
                            <div className="p-2 bg-blue-950/30 border border-blue-500/20 text-center">
                                <p className="text-[9px] text-blue-400 uppercase tracking-widest mb-0.5">DUNGEON KEYS</p>
                                <p className="text-2xl md:text-3xl font-mono font-bold text-white">{crystalCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            
             <Button onClick={onNavigateToSkills} className="mt-4 md:mt-6 bg-blue-600 hover:bg-blue-500 text-white font-mono uppercase tracking-widest h-9 md:h-10 px-4 md:px-6 text-[10px] md:text-xs rounded-none border border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] transition-all">
                <Send className="mr-1.5 h-3 w-3 md:h-4 md:w-4" />
                SELECT & ENTER
            </Button>
        </div>
    );
};

export default DungeonLobbyView;
