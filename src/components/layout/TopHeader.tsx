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
                "flex items-center gap-1.5 rounded-full transition-all duration-200 active:scale-95",
                "bg-surface-container/80 backdrop-blur-sm border border-border/20",
                isMobile ? "px-2.5 py-1.5 min-w-[56px]" : "px-3 py-2"
            )}
            title={label}
            role="status"
            aria-label={`${label}: ${value}`}
        >
            <Icon className={cn(color, isMobile ? "h-3.5 w-3.5" : "h-4 w-4", "drop-shadow-sm shrink-0")} />
            <span className={cn("font-bold tabular-nums", isMobile ? "text-[11px]" : "text-sm")}>{value}</span>
        </div>
    );

    return (
        <header 
            className={cn(
                "border-b border-border/20 bg-surface/95 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30 pt-safe",
                "shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
                isMobile ? "h-14 px-4 gap-2" : "h-16 px-6 gap-4"
            )}
            role="banner"
        >
            <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className={cn(
                    "flex items-center justify-center rounded-xl bg-primary/10 shrink-0",
                    isMobile ? "w-8 h-8" : "w-10 h-10"
                )}>
                    <Sparkles className={cn("text-primary", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                </div>
                <h1 className={cn(
                    "font-cinzel font-bold tracking-wide text-gradient truncate",
                    isMobile ? "text-sm" : "text-lg"
                )}>
                    {title}
                </h1>
            </div>

            <div className={cn(
                "flex items-center shrink-0",
                isMobile ? "gap-1.5" : "gap-2"
            )}>
                <ResourceBadge 
                    icon={Coins} 
                    value={isMobile && profile.gold >= 1000 
                        ? `${(profile.gold / 1000).toFixed(1)}k` 
                        : profile.gold?.toLocaleString() || 0
                    } 
                    color="text-yellow-400" 
                    label="Ouro" 
                />
                <ResourceBadge 
                    icon={Gem} 
                    value={profile.gems || 0} 
                    color="text-cyan-400" 
                    label="Cristais" 
                />
                {!isMobile && (
                    <ResourceBadge 
                        icon={Star} 
                        value={`Lv.${profile.level}`} 
                        color="text-purple-400" 
                        label="Nível" 
                    />
                )}
            </div>
        </header>
    );
};
