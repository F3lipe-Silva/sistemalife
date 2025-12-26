import React from 'react';
import { Flame, Gem, KeySquare, User, Coins, Box } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatItem } from './StatItem';

interface ProfileResourcesProps {
    profile: any;
    isMobile?: boolean;
}

export const ProfileResources = ({ profile, isMobile = false }: ProfileResourcesProps) => {
    return (
        <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-card/40 border border-border/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10">
                        <Gem className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Moeda</span>
                </div>
                <div className="text-xl font-bold text-foreground font-mono">
                    {profile.fragmentos?.toLocaleString() || 0}
                </div>
            </div>

            <div className="p-4 rounded-2xl bg-card/40 border border-border/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10">
                        <Box className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Itens</span>
                </div>
                <div className="text-xl font-bold text-foreground font-mono">
                    {profile.inventory?.length || 0}
                </div>
            </div>
        </div>
    );
};
