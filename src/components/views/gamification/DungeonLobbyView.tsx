
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
        <div className="flex flex-col items-center justify-center h-full text-center p-4 relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,1)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 -z-10"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background -z-10"></div>

            <div className="relative mb-8">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative w-24 h-24 rounded-full bg-black border-2 border-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                    <KeySquare className="w-12 h-12 text-blue-400" />
                </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white font-cinzel tracking-[0.15em] mb-4 uppercase drop-shadow-md">
                SKILL DUNGEON <span className="text-blue-500">GATE</span>
            </h2>
            <p className="text-blue-200/60 max-w-xl mx-auto mb-10 font-mono text-sm tracking-wide">
                SYSTEM WARNING: Dungeons are high-intensity training environments designed to accelerate skill mastery. Proceed with caution.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                {/* Random Event Gate */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-red-500/10 rounded-lg blur-lg group-hover:bg-red-500/20 transition-all duration-500"></div>
                    <Card className="relative bg-black/80 border border-red-500/30 group-hover:border-red-500/60 transition-colors">
                        <CardHeader>
                            <CardTitle className="text-center font-mono text-red-400 uppercase tracking-widest flex items-center justify-center gap-2">
                                <ShieldAlert className="h-5 w-5" /> RED GATE
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-center font-mono text-xs text-red-200/50">
                                RANDOM DUNGEON EVENTS
                                <br/>
                                <span className="text-[10px] opacity-70">System may initiate mandatory summoning protocols.</span>
                            </CardDescription>
                        </CardContent>
                    </Card>
                </div>

                {/* Key Gate */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-blue-500/10 rounded-lg blur-lg group-hover:bg-blue-500/20 transition-all duration-500"></div>
                    <Card className="relative bg-black/80 border border-blue-500/30 group-hover:border-blue-500/60 transition-colors">
                        <CardHeader>
                            <CardTitle className="text-center font-mono text-blue-400 uppercase tracking-widest flex items-center justify-center gap-2">
                                <KeySquare className="h-5 w-5" /> BLUE GATE
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             <CardDescription className="text-center font-mono text-xs text-blue-200/50 mb-4">
                                MANUAL ENTRY PROTOCOL
                            </CardDescription>
                            <div className="p-3 bg-blue-950/30 border border-blue-500/20 text-center">
                                <p className="text-[10px] text-blue-400 uppercase tracking-widest mb-1">DUNGEON KEYS</p>
                                <p className="text-3xl font-mono font-bold text-white">{crystalCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            
             <Button onClick={onNavigateToSkills} className="mt-10 bg-blue-600 hover:bg-blue-500 text-white font-mono uppercase tracking-widest h-12 px-8 rounded-none border border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] transition-all">
                <Send className="mr-2 h-4 w-4" />
                SELECT SKILL & ENTER
            </Button>
        </div>
    );
};

export default DungeonLobbyView;
