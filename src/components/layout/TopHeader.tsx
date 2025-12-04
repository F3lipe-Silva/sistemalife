import React from 'react';
import { Coins, Gem, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopHeaderProps {
    title: string;
    profile: any;
    isMobile: boolean;
}

export const TopHeader = ({ title, profile, isMobile }: TopHeaderProps) => {
    if (!profile) return null;

    const ResourceBadge = ({ icon: Icon, value, color, label }: { icon: any; value: number | string; color: string; label: string }) => (
        <div 
            className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 hover:scale-105",
                "bg-secondary/50 backdrop-blur-sm border border-border/30",
                isMobile ? "px-2 py-1" : "px-3 py-1.5"
            )}
            title={label}
        >
            <Icon className={cn(color, isMobile ? "h-3.5 w-3.5" : "h-4 w-4", "drop-shadow-sm")} />
            <span className={cn("font-bold tabular-nums", isMobile ? "text-xs" : "text-sm")}>{value}</span>
        </div>
    );

    return (
        <header className={cn(
            "border-b border-border/30 bg-card/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30 pt-safe",
            "shadow-lg shadow-black/5",
            isMobile ? "h-14 px-4" : "h-16 px-6"
        )}>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <Sparkles className={cn("text-primary", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                    <h1 className={cn(
                        "font-cinzel font-bold tracking-wider text-gradient",
                        isMobile ? "text-base" : "text-xl"
                    )}>
                        {title}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <ResourceBadge icon={Coins} value={profile.gold?.toLocaleString() || 0} color="text-yellow-400" label="Ouro" />
                <ResourceBadge icon={Gem} value={profile.gems || 0} color="text-cyan-400" label="Cristais" />
                <ResourceBadge icon={Star} value={`Lv.${profile.level}`} color="text-purple-400" label="Nível" />
            </div>
        </header>
    );
};
