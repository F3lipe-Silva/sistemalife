import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from '@/components/ui/progress';
import { Heart, Shield, Zap } from 'lucide-react';
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
    const profileRank = getProfileRank(profile.nivel);
    const xpPercentage = (profile.xp / profile.xp_para_proximo_nivel) * 100;
    const maxHP = Math.floor((profile.estatisticas?.constituicao || 5) / 5) * 100;
    const hpPercentage = ((profile.hp_atual || maxHP) / maxHP) * 100;

    if (isMobile) {
        return (
            <div
                className="relative flex flex-col gap-4 p-6 rounded-3xl bg-card/80 backdrop-blur-xl border border-border/10 shadow-md3-2 overflow-hidden"
                role="region"
                aria-labelledby="profile-name"
            >
                <div
                    className="absolute top-0 right-0 w-32 h-32 bg-primary/8 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"
                    aria-hidden="true"
                />
                <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-md3-2 ring-2 ring-primary/20 hover:ring-primary/30 transition-all duration-200">
                            <Avatar className="w-full h-full rounded-none">
                                <AvatarImage
                                    src={profile.avatar_url}
                                    alt={`Avatar de ${profile.nome_utilizador}`}
                                    className="object-cover"
                                />
                                <AvatarFallback className="text-xl rounded-none font-cinzel">
                                    {profile.nome_utilizador?.[0]}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="absolute -top-1 -right-1 flex items-center justify-center w-8 h-8 rounded-full bg-primary shadow-md3-2 border-2 border-background text-xs font-bold text-primary-foreground">
                            {profile.nivel}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2
                            id="profile-name"
                            className="font-bold text-foreground truncate font-cinzel text-lg mb-1 leading-tight"
                        >
                            {profile.nome_utilizador}
                        </h2>
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border shadow-sm transition-all duration-200",
                                profileRank.bg, profileRank.color, profileRank.border
                            )}>
                                RANK {profileRank.rank}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">
                            {profileRank.title}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mt-2">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-red-400 uppercase tracking-wide flex items-center gap-1.5">
                                <Heart className="h-3 w-3 fill-red-400" aria-hidden="true" />
                                Vitalidade
                            </span>
                            <span className="text-sm font-mono font-bold text-red-300">
                                {profile.hp_atual || maxHP} / {maxHP}
                            </span>
                        </div>
                        <Progress
                            value={hpPercentage}
                            className="h-2.5 bg-red-950/30 [&>div]:bg-gradient-to-r [&>div]:from-red-600 [&>div]:to-red-400 rounded-full"
                            aria-label={`Vitalidade: ${hpPercentage.toFixed(0)}%`}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1.5">
                                <Zap className="h-3 w-3 fill-primary" aria-hidden="true" />
                                Energia
                            </span>
                            <span className="text-sm font-mono font-bold text-blue-300">
                                {Math.floor(xpPercentage)}%
                            </span>
                        </div>
                        <Progress
                            value={xpPercentage}
                            className="h-2.5 bg-blue-950/30 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-cyan-400 rounded-full"
                            aria-label={`Energia: ${Math.floor(xpPercentage)}%`}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // DESKTOP VERSION (AS IT WAS BEFORE)
    return (
        <div className="flex items-center gap-8 p-8 rounded-3xl bg-card/50 backdrop-blur-md border border-border/30 shadow-xl">
            <div className="relative flex-shrink-0">
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-primary/20">
                    <Avatar className="w-full h-full rounded-none">
                        <AvatarImage src={profile.avatar_url} alt={profile.nome_utilizador} className="object-cover" />
                        <AvatarFallback className="text-2xl rounded-none">{profile.nome_utilizador?.[0]}</AvatarFallback>
                    </Avatar>
                </div>
                <div className="absolute -top-2 -right-2 flex items-center justify-center w-10 h-10 rounded-full bg-primary shadow-lg border-2 border-background text-xs font-bold text-primary-foreground">
                    {profile.nivel}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-bold text-3xl text-foreground truncate font-cinzel tracking-wider">
                        {profile.nome_utilizador}
                    </h2>
                    <div className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border", profileRank.bg, profileRank.color, profileRank.border)}>
                        {profileRank.rank}-RANK
                    </div>
                </div>
                
                <p className="text-sm text-muted-foreground flex items-center gap-2 mb-6 uppercase tracking-[0.2em] font-medium">
                    <Shield className={cn("h-4 w-4", profileRank.color)} />
                    {profileRank.title}
                </p>

                <div className="flex gap-8">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Fragmentos Coletados</span>
                        <span className="text-xl font-bold text-amber-400 font-mono tracking-tight">{profile.fragmentos?.toLocaleString() || 0}</span>
                    </div>
                    <div className="w-px h-10 bg-border/50" />
                    <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Missões Concluídas</span>
                        <span className="text-xl font-bold text-primary font-mono tracking-tight">{profile.missoes_concluidas_total || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};