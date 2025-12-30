import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from '@/components/ui/progress';
import { Heart, Shield, Zap, Crown, Swords, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ProfileHeaderProps {
    profile: any;
    isMobile?: boolean;
}

const getProfileRank = (level: number) => {
    if (level <= 5) return { rank: 'E', title: 'Novato', color: 'text-gray-400', shadow: 'shadow-gray-500/50', border: 'border-gray-500' };
    if (level <= 10) return { rank: 'D', title: 'Iniciante', color: 'text-green-400', shadow: 'shadow-green-500/50', border: 'border-green-500' };
    if (level <= 20) return { rank: 'C', title: 'Experiente', color: 'text-blue-400', shadow: 'shadow-blue-500/50', border: 'border-blue-500' };
    if (level <= 30) return { rank: 'B', title: 'Elite', color: 'text-purple-400', shadow: 'shadow-purple-500/50', border: 'border-purple-500' };
    if (level <= 50) return { rank: 'A', title: 'Mestre', color: 'text-red-400', shadow: 'shadow-red-500/50', border: 'border-red-500' };
    if (level <= 70) return { rank: 'S', title: 'Grão-Mestre', color: 'text-yellow-400', shadow: 'shadow-yellow-500/50', border: 'border-yellow-500' };
    if (level <= 90) return { rank: 'SS', title: 'Herói', color: 'text-orange-400', shadow: 'shadow-orange-500/50', border: 'border-orange-500' };
    return { rank: 'SSS', title: 'Monarca', color: 'text-cyan-400', shadow: 'shadow-cyan-500/50', border: 'border-cyan-500' };
};

export const ProfileHeader = ({ profile, isMobile = false }: ProfileHeaderProps) => {
    const xpPercentage = (profile.xp / profile.xp_para_proximo_nivel) * 100;
    const maxHP = Math.floor(profile.estatisticas.constituicao / 5) * 100;
    const hpPercentage = ((profile.hp_atual || maxHP) / maxHP) * 100;
    const profileRank = getProfileRank(profile.nivel);

    return (
        <div className={cn(
            "relative p-1 rounded-sm overflow-hidden group",
            isMobile ? "" : "hover:scale-[1.01] transition-transform duration-300"
        )}>
            {/* System Border Effect */}
            <div className="absolute inset-0 border border-blue-900/40 bg-black/60 backdrop-blur-md" />
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-blue-500" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-blue-500" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-blue-500" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-blue-500" />

            <div className={cn(
                "relative z-10 flex gap-6 p-6",
                isMobile ? "flex-col p-4" : "flex-row items-stretch"
            )}>
                {/* Avatar Section - System ID Card Style */}
                <div className="relative flex-shrink-0 flex flex-col items-center">
                    <div className={cn(
                        "relative p-1 border-2 border-blue-500/30 bg-blue-950/20",
                        isMobile ? "w-24 h-24" : "w-32 h-32"
                    )}>
                         {/* Avatar Glow */}
                        <div className={cn("absolute inset-0 bg-blue-500/10 animate-pulse")} />
                        
                        <Avatar className="w-full h-full rounded-none">
                            <AvatarImage src={profile.avatar_url} alt={profile.nome_utilizador} className="object-cover" />
                            <AvatarFallback className="text-2xl rounded-none bg-black text-blue-400 font-mono">{profile.nome_utilizador?.[0]}</AvatarFallback>
                        </Avatar>

                        {/* Rank Overlay */}
                        <div className={cn(
                            "absolute -bottom-3 -right-3 w-10 h-10 flex items-center justify-center bg-black border-2 rotate-45 shadow-lg z-20",
                            profileRank.border, profileRank.shadow
                        )}>
                            <span className={cn(
                                "font-cinzel font-black -rotate-45 text-lg",
                                profileRank.color
                            )}>
                                {profileRank.rank}
                            </span>
                        </div>
                    </div>
                    
                    <div className="mt-4 text-center">
                        <Badge variant="outline" className="border-blue-500/50 text-blue-400 font-mono text-xs uppercase tracking-widest bg-blue-950/30">
                            Player ID
                        </Badge>
                    </div>
                </div>

                {/* Status Info Section */}
                <div className="flex-1 flex flex-col justify-between space-y-4">
                    {/* Name & Class Header */}
                    <div className="flex justify-between items-start border-b border-blue-800/30 pb-2">
                        <div>
                            <h2 className={cn(
                                "font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2",
                                isMobile ? "text-lg" : "text-2xl"
                            )}>
                                {profile.nome_utilizador}
                                <span className="text-xs text-blue-500/60 align-top ml-1">LV.{profile.nivel}</span>
                            </h2>
                            <p className={cn(
                                "font-medium flex items-center gap-2 uppercase tracking-widest",
                                profileRank.color,
                                isMobile ? "text-xs" : "text-sm"
                            )}>
                                <Swords className="h-3 w-3" />
                                {profileRank.title}
                            </p>
                        </div>
                        <div className="text-right hidden sm:block">
                            <div className="text-[10px] text-blue-400/60 font-mono">SYSTEM STATUS</div>
                            <div className="text-green-400 font-mono text-xs flex items-center justify-end gap-1">
                                ONLINE <Activity className="h-3 w-3 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Bars Grid */}
                    <div className="space-y-4">
                        {/* HP Bar */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest">HP (Saúde)</span>
                                <span className="font-mono text-xs text-red-300">
                                    {profile.hp_atual || maxHP} <span className="text-muted-foreground">/</span> {maxHP}
                                </span>
                            </div>
                            <div className="h-3 bg-red-950/30 border border-red-900/50 relative overflow-hidden group/bar">
                                <div 
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-900 via-red-600 to-red-500 transition-all duration-500 ease-out"
                                    style={{ width: `${hpPercentage}%` }}
                                >
                                    <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-20" />
                                </div>
                            </div>
                        </div>

                        {/* MP/XP Bar */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">XP (Experiência)</span>
                                <span className="font-mono text-xs text-blue-300">
                                    {profile.xp.toLocaleString()} <span className="text-muted-foreground">/</span> {profile.xp_para_proximo_nivel.toLocaleString()}
                                </span>
                            </div>
                            <div className="h-3 bg-blue-950/30 border border-blue-900/50 relative overflow-hidden group/bar">
                                <div 
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-900 via-blue-600 to-cyan-400 transition-all duration-500 ease-out"
                                    style={{ width: `${xpPercentage}%` }}
                                >
                                    <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-20" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="bg-blue-950/20 border border-blue-900/30 p-2 text-center">
                            <div className="text-[10px] text-blue-400/70 font-mono uppercase">Fatiga</div>
                            <div className="text-sm font-mono text-white">0%</div>
                        </div>
                        <div className="bg-blue-950/20 border border-blue-900/30 p-2 text-center">
                            <div className="text-[10px] text-blue-400/70 font-mono uppercase">Job</div>
                            <div className="text-sm font-mono text-white">None</div>
                        </div>
                         <div className="bg-blue-950/20 border border-blue-900/30 p-2 text-center">
                            <div className="text-[10px] text-blue-400/70 font-mono uppercase">Title</div>
                            <div className="text-sm font-mono text-white truncate px-1" title="Lobo Solitário">Lobo Solitário</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
