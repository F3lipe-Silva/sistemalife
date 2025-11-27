import React from 'react';
import { Coins, Gem, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopHeaderProps {
    title: string;
    profile: any;
    isMobile: boolean;
}

export const TopHeader = ({ title, profile, isMobile }: TopHeaderProps) => {
    if (!profile) return null;

    return (
        <header className={cn(
            "border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-between sticky top-0 z-30",
            isMobile ? "h-12 px-3" : "h-16 px-4"
        )}>
            <div className="flex items-center gap-3">
                {isMobile ? (
                    <div className="md:hidden">
                        <span className="font-cinzel font-bold text-base text-primary tracking-wider">{title}</span>
                    </div>
                ) : (
                    <h1 className="font-cinzel font-bold text-xl text-primary tracking-wider">{title}</h1>
                )}
            </div>

            <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-yellow-500" title="Ouro">
                    <Coins className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                    <span className="font-bold text-sm">{profile.gold}</span>
                </div>
                <div className="flex items-center gap-1 text-blue-400" title="Cristais">
                    <Gem className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                    <span className="font-bold text-sm">{profile.gems || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-purple-400" title="Nível">
                    <Star className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                    <span className="font-bold text-sm">Lvl {profile.level}</span>
                </div>
            </div>
        </header>
    );
};
