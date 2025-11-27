import React from 'react';
import { Flame, Gem, KeySquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatItem } from './StatItem';

interface ProfileResourcesProps {
    profile: any;
    isMobile?: boolean;
}

export const ProfileResources = ({ profile, isMobile = false }: ProfileResourcesProps) => {
    return (
        <div className={cn("gap-2", isMobile ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 lg:grid-cols-4 gap-2")}>
            <StatItem label="Nome" value={`${profile.primeiro_nome} ${profile.apelido}`} isMobile={isMobile} />
            <StatItem label="Streak" value={`${profile.streak_atual || 0} Dias`} icon={Flame} isMobile={isMobile} />
            <StatItem label="Fragmentos" value={profile.fragmentos || 0} icon={Gem} isMobile={isMobile} />
            <StatItem label="Cristais" value={profile.dungeon_crystals || 0} icon={KeySquare} isMobile={isMobile} />
        </div>
    );
};
