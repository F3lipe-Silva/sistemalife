import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from '@/components/ui/progress';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileHeaderProps {
    profile: any;
    isMobile?: boolean;
}

const getProfileRank = (level: number) => {
    if (level <= 5) return { rank: 'F', title: 'Novato' };
    if (level <= 10) return { rank: 'E', title: 'Iniciante' };
    if (level <= 20) return { rank: 'D', title: 'Adepto' };
    if (level <= 30) return { rank: 'C', title: 'Experiente' };
    if (level <= 40) return { rank: 'B', 'title': 'Perito' };
    if (level <= 50) return { rank: 'A', title: 'Mestre' };
    if (level <= 70) return { rank: 'S', title: 'Grão-Mestre' };
    if (level <= 90) return { rank: 'SS', title: 'Herói' };
    return { rank: 'SSS', title: 'Lendário' };
};

export const ProfileHeader = ({ profile, isMobile = false }: ProfileHeaderProps) => {
    const xpPercentage = (profile.xp / profile.xp_para_proximo_nivel) * 100;
    const maxHP = Math.floor(profile.estatisticas.constituicao / 5) * 100;
    const hpPercentage = ((profile.hp_atual || maxHP) / maxHP) * 100;
    const profileRank = getProfileRank(profile.nivel);

    return (
        <div className={cn("flex items-center gap-3", isMobile ? "flex-row items-center" : "sm:flex-row items-center gap-4")}>
            <div className={cn("border-2 border-primary/50 flex items-center justify-center bg-gradient-to-br from-secondary/50 to-secondary/20 p-1 flex-shrink-0 shadow-lg",
                isMobile ? "w-28 h-28 rounded-md" : "w-full max-w-[120px] sm:max-w-[150px] aspect-[4/5]")}>
                <Avatar className={cn("rounded-md w-full h-full object-cover")}>
                    <AvatarImage src={profile.avatar_url} alt={profile.nome_utilizador} />
                    <AvatarFallback>{profile.nome_utilizador?.[0]}</AvatarFallback>
                </Avatar>
            </div>
            <div className={cn("w-full text-left", isMobile ? "ml-3" : "sm:text-left")}>
                <p className={cn("font-bold tracking-widest text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>RANK {profileRank.rank}</p>
                <p className={cn("font-bold text-foreground", isMobile ? "text-lg" : "text-2xl")}>{profile.nome_utilizador}</p>
                <p className={cn("text-primary", isMobile ? "text-sm" : "text-base")}>{profileRank.title}</p>

                <div className={cn("mt-2 space-y-2", isMobile ? "space-y-2" : "space-y-3")}>
                    <div>
                        <div className={cn("flex justify-between mb-1", isMobile ? "text-sm" : "text-sm text-muted-foreground")}>
                            <span>Nível {profile.nivel}</span>
                            <span className="font-mono">{profile.xp} / {profile.xp_para_proximo_nivel} XP</span>
                        </div>
                        <Progress value={xpPercentage} className={cn("bg-primary/20 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-primary/80 shadow-inner", isMobile ? "h-3" : "h-4")} />
                    </div>
                    <div>
                        <div className={cn("flex justify-between mb-1", isMobile ? "text-sm" : "text-sm text-muted-foreground")}>
                            <span className="flex items-center gap-1.5"><Heart className={cn("text-red-500", isMobile ? "h-4 w-4" : "h-4 w-4")} /> Vida</span>
                            <span className="font-mono">{profile.hp_atual || maxHP} / {maxHP} HP</span>
                        </div>
                        <Progress value={hpPercentage} className={cn("bg-red-500/20 [&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-red-400 shadow-inner", isMobile ? "h-3" : "h-4")} />
                    </div>
                </div>
            </div>
        </div>
    );
};
