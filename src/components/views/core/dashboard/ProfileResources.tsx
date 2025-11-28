import React from 'react';
import { Flame, Gem, KeySquare, User, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatItem } from './StatItem';

interface ProfileResourcesProps {
    profile: any;
    isMobile?: boolean;
}

export const ProfileResources = ({ profile, isMobile = false }: ProfileResourcesProps) => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Coins className="h-5 w-5 text-accent" />
                </div>
                <div>
                    <h3 className="font-cinzel text-xl text-foreground">Centro de Recursos</h3>
                    <p className="text-sm text-muted-foreground">Gerencie seus ativos e informações</p>
                </div>
            </div>

            {/* Resources Grid - Enhanced */}
            <div className="grid gap-4 grid-cols-2">
                <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <StatItem
                        label="Nome Completo"
                        value={`${profile.primeiro_nome} ${profile.apelido}`}
                        icon={User}
                        isMobile={isMobile}
                    />
                </div>

                <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <StatItem
                        label="Sequência Atual"
                        value={`${profile.streak_atual || 0} dias`}
                        icon={Flame}
                        isMobile={isMobile}
                    />
                </div>

                <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <StatItem
                        label="Fragmentos"
                        value={profile.fragmentos || 0}
                        icon={Gem}
                        isMobile={isMobile}
                    />
                </div>

                <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <StatItem
                        label="Cristais Dungeon"
                        value={profile.dungeon_crystals || 0}
                        icon={KeySquare}
                        isMobile={isMobile}
                    />
                </div>
            </div>

            {/* Resource Summary */}
            <div className="pt-4 border-t border-border/30">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-lg font-bold text-yellow-400">{profile.fragmentos || 0}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Moeda</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-purple-400">{profile.dungeon_crystals || 0}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Premium</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-orange-400">{profile.streak_atual || 0}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Streak</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
