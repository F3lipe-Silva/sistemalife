import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from '@/components/ui/progress';
import { Heart, Shield, Zap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileHeaderProps {
    profile: any;
    isMobile?: boolean;
}

const getProfileRank = (level: number) => {
    if (level <= 5) return { rank: 'F', title: 'Novato', color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/30' };
    if (level <= 10) return { rank: 'E', title: 'Iniciante', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' };
    if (level <= 20) return { rank: 'D', title: 'Adepto', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' };
    if (level <= 30) return { rank: 'C', title: 'Experiente', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' };
    if (level <= 40) return { rank: 'B', title: 'Perito', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' };
    if (level <= 50) return { rank: 'A', title: 'Mestre', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' };
    if (level <= 70) return { rank: 'S', title: 'Grão-Mestre', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' };
    if (level <= 90) return { rank: 'SS', title: 'Herói', color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30' };
    return { rank: 'SSS', title: 'Lendário', color: 'text-pink-400', bg: 'bg-pink-500/20', border: 'border-pink-500/30' };
};

export const ProfileHeader = ({ profile, isMobile = false }: ProfileHeaderProps) => {
    const xpPercentage = (profile.xp / profile.xp_para_proximo_nivel) * 100;
    const maxHP = Math.floor(profile.estatisticas.constituicao / 5) * 100;
    const hpPercentage = ((profile.hp_atual || maxHP) / maxHP) * 100;
    const profileRank = getProfileRank(profile.nivel);

    return (
        <div className={cn(
            "flex gap-4 p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/30",
            isMobile ? "flex-row items-start" : "flex-row items-center gap-6 p-6"
        )}>
            {/* Avatar Section */}
            <div className="relative flex-shrink-0">
                <div className={cn(
                    "relative rounded-xl overflow-hidden shadow-2xl",
                    "border-2 border-primary/30",
                    "bg-gradient-to-br from-primary/20 via-transparent to-accent/20",
                    isMobile ? "w-24 h-28" : "w-32 h-40"
                )}>
                    <Avatar className="w-full h-full rounded-none">
                        <AvatarImage src={profile.avatar_url} alt={profile.nome_utilizador} className="object-cover" />
                        <AvatarFallback className="text-2xl rounded-none">{profile.nome_utilizador?.[0]}</AvatarFallback>
                    </Avatar>
                    
                    {/* Rank Badge Overlay */}
                    <div className={cn(
                        "absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-t-lg",
                        "font-bold text-sm shadow-lg backdrop-blur-sm",
                        profileRank.bg, profileRank.color, profileRank.border, "border"
                    )}>
                        <span className="drop-shadow-lg">{profileRank.rank}</span>
                    </div>
                </div>
                
                {/* Level Badge */}
                <div className={cn(
                    "absolute -top-2 -right-2 flex items-center justify-center",
                    "w-8 h-8 rounded-full bg-primary shadow-lg shadow-primary/30",
                    "text-xs font-bold text-primary-foreground",
                    "border-2 border-background"
                )}>
                    {profile.nivel}
                </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 min-w-0 space-y-3">
                {/* Name and Title */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h2 className={cn(
                            "font-bold text-foreground truncate",
                            isMobile ? "text-lg" : "text-2xl"
                        )}>
                            {profile.nome_utilizador}
                        </h2>
                        <Crown className={cn("h-4 w-4", profileRank.color)} />
                    </div>
                    <p className={cn(
                        "font-medium flex items-center gap-1.5",
                        profileRank.color,
                        isMobile ? "text-sm" : "text-base"
                    )}>
                        <Shield className="h-3.5 w-3.5" />
                        {profileRank.title}
                    </p>
                </div>

                {/* Stats Bars */}
                <div className="space-y-3">
                    {/* XP Bar */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <span className={cn(
                                "flex items-center gap-1.5 font-medium text-muted-foreground",
                                isMobile ? "text-xs" : "text-sm"
                            )}>
                                <Zap className={cn("text-primary", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                                Experiência
                            </span>
                            <span className={cn(
                                "font-mono font-medium text-foreground",
                                isMobile ? "text-xs" : "text-sm"
                            )}>
                                {profile.xp.toLocaleString()} / {profile.xp_para_proximo_nivel.toLocaleString()}
                            </span>
                        </div>
                        <Progress 
                            value={xpPercentage} 
                            variant="gradient"
                            className={cn("bg-primary/10", isMobile ? "h-2.5" : "h-3")} 
                        />
                    </div>

                    {/* HP Bar */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <span className={cn(
                                "flex items-center gap-1.5 font-medium text-muted-foreground",
                                isMobile ? "text-xs" : "text-sm"
                            )}>
                                <Heart className={cn("text-red-500", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                                Vida
                            </span>
                            <span className={cn(
                                "font-mono font-medium text-foreground",
                                isMobile ? "text-xs" : "text-sm"
                            )}>
                                {profile.hp_atual || maxHP} / {maxHP}
                            </span>
                        </div>
                        <Progress 
                            value={hpPercentage} 
                            className={cn(
                                "bg-red-500/10 [&>div>div]:bg-gradient-to-r [&>div>div]:from-red-500 [&>div>div]:to-red-400",
                                isMobile ? "h-2.5" : "h-3"
                            )} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
