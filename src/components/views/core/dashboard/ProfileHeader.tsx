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
    const profileRank = getProfileRank(profile.nivel);

    return (
        <div className={cn(
            "flex items-center gap-4 p-4 rounded-3xl bg-gradient-to-r from-card/60 to-secondary/20 backdrop-blur-md border border-border/30 shadow-xl",
            isMobile ? "p-3" : "p-6 gap-8"
        )}>
            {/* Avatar Section */}
            <div className="relative flex-shrink-0">
                <div className={cn(
                    "relative rounded-2xl overflow-hidden shadow-2xl ring-2 ring-primary/20",
                    isMobile ? "w-20 h-20" : "w-28 h-28"
                )}>
                    <Avatar className="w-full h-full rounded-none">
                        <AvatarImage src={profile.avatar_url} alt={profile.nome_utilizador} className="object-cover" />
                        <AvatarFallback className="text-xl rounded-none">{profile.nome_utilizador?.[0]}</AvatarFallback>
                    </Avatar>
                </div>
                
                {/* Level Badge */}
                <div className={cn(
                    "absolute -top-2 -right-2 flex items-center justify-center",
                    "w-7 h-7 rounded-full bg-primary shadow-lg shadow-primary/30",
                    "text-[10px] font-bold text-primary-foreground",
                    "border-2 border-background"
                )}>
                    {profile.nivel}
                </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h2 className={cn(
                        "font-bold text-foreground truncate font-cinzel tracking-wider",
                        isMobile ? "text-base" : "text-xl"
                    )}>
                        {profile.nome_utilizador}
                    </h2>
                    <div className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter border",
                        profileRank.bg, profileRank.color, profileRank.border
                    )}>
                        {profileRank.rank}-RANK
                    </div>
                </div>
                
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3 uppercase tracking-widest font-medium">
                    <Shield className={cn("h-3 w-3", profileRank.color)} />
                    {profileRank.title}
                </p>

                <div className="flex gap-4">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Fragmentos</span>
                        <span className="text-sm font-bold text-amber-400 font-mono">{profile.fragmentos?.toLocaleString() || 0}</span>
                    </div>
                    <div className="w-px h-8 bg-border/50" />
                    <div className="flex flex-col">
                        <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Concluídas</span>
                        <span className="text-sm font-bold text-primary font-mono">{profile.missoes_concluidas_total || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
