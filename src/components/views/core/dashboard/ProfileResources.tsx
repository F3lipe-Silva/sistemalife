import React from 'react';
import { Flame, Gem, KeySquare, User, Coins, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatItem } from './StatItem';

interface ProfileResourcesProps {
    profile: any;
    isMobile?: boolean;
}

const ResourceSlot = ({ label, value, icon: Icon, color, isMobile }: any) => (
    <div className="flex items-center justify-between bg-black/40 border border-white/10 p-3 rounded-sm group hover:border-blue-500/50 transition-colors">
        <div className="flex items-center gap-3">
             <div className={cn("p-2 rounded-sm bg-white/5", color)}>
                 <Icon className="h-4 w-4" />
             </div>
             <div className="flex flex-col">
                 <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{label}</span>
                 <span className="text-sm font-bold font-mono text-white group-hover:text-blue-400 transition-colors">{value}</span>
             </div>
        </div>
    </div>
);

export const ProfileResources = ({ profile, isMobile = false }: ProfileResourcesProps) => {
    return (
        <div className="space-y-4">
            {/* Main Resources Grid */}
            <div className="grid grid-cols-1 gap-2">
                <ResourceSlot
                    label="Nome Completo"
                    value={`${profile.primeiro_nome} ${profile.apelido}`}
                    icon={User}
                    color="text-blue-400"
                    isMobile={isMobile}
                />
                <ResourceSlot
                    label="Sequência Atual"
                    value={`${profile.streak_atual || 0} dias`}
                    icon={Flame}
                    color="text-orange-400"
                    isMobile={isMobile}
                />
            </div>

            {/* Currency Grid - Compact */}
            <div className="grid grid-cols-2 gap-2 mt-2">
                 <div className="bg-gradient-to-br from-yellow-900/20 to-black border border-yellow-700/30 p-2 rounded-sm text-center">
                    <Gem className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
                    <div className="text-xs font-mono font-bold text-yellow-400">{profile.fragmentos || 0}</div>
                    <div className="text-[9px] uppercase text-yellow-600/80 tracking-widest">Fragmentos</div>
                 </div>
                 
                 <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-700/30 p-2 rounded-sm text-center">
                    <KeySquare className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                    <div className="text-xs font-mono font-bold text-purple-400">{profile.dungeon_crystals || 0}</div>
                    <div className="text-[9px] uppercase text-purple-600/80 tracking-widest">Chaves</div>
                 </div>
            </div>
        </div>
    );
};
