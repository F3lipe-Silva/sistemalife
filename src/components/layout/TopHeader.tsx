import React from 'react';
import { Coins, Gem, Star, Sparkles, Search, Command, Activity, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TopHeaderProps {
    title: string;
    profile: any;
    isMobile: boolean;
    onOpenCommand?: () => void;
}

export const TopHeader = ({ title, profile, isMobile, onOpenCommand }: TopHeaderProps) => {
    if (!profile) return null;

    const ResourceBadge = ({ icon: Icon, value, color, label, border }: { icon: any; value: number | string; color: string; label: string; border: string }) => (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div 
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 transition-all duration-300 group cursor-default relative overflow-hidden",
                            "bg-black/40 border",
                            border,
                            isMobile ? "px-2 py-1" : "px-3 py-1.5"
                        )}
                    >
                        <div className={cn("absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity", color.replace('text-', 'bg-'))} />
                        <Icon className={cn(color, isMobile ? "h-3.5 w-3.5" : "h-4 w-4", "drop-shadow-[0_0_5px_currentColor]")} />
                        <span className={cn("font-bold font-mono tabular-nums text-white", isMobile ? "text-xs" : "text-sm")}>{value}</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent className="bg-black border border-blue-500/30 text-xs font-mono uppercase tracking-widest">
                    <p>{label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );

    return (
        <header className={cn(
            "border-b border-blue-900/30 bg-black/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-30",
            "shadow-[0_4px_20px_-10px_rgba(0,0,0,0.5)]",
            isMobile ? "h-14 px-4" : "h-16 px-6"
        )}>
            {/* Background Grid - Subtle */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            <div className="flex items-center gap-3 flex-1 min-w-0 relative z-10">
                {!isMobile && (
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink className="flex items-center gap-1.5 text-blue-500/50 hover:text-blue-400 transition-colors font-mono text-xs uppercase tracking-wider">
                                    <Activity className="h-3 w-3" />
                                    SYSTEM
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-blue-900/50" />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-cinzel font-black text-white tracking-[0.1em] text-lg uppercase drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">
                                    {title}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
                
                {isMobile && (
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500 animate-pulse" />
                        <h1 className="font-cinzel font-bold tracking-[0.1em] text-white text-base truncate uppercase">
                            {title}
                        </h1>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 relative z-10">
                {!isMobile && onOpenCommand && (
                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onOpenCommand}
                                    className="gap-2 text-blue-400/60 hover:text-white hover:bg-blue-900/20 border border-transparent hover:border-blue-500/30 rounded-sm transition-all"
                                >
                                    <Search className="h-4 w-4" />
                                    <span className="text-xs font-mono uppercase tracking-wide">SEARCH_DB</span>
                                    <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-blue-900/30 bg-blue-950/20 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex text-blue-300">
                                        <Command className="h-3 w-3" />K
                                    </kbd>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-black border border-blue-500/30 text-xs font-mono uppercase">
                                <p>INITIATE SEARCH PROTOCOL</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                
                <div className="flex items-center gap-2">
                    <ResourceBadge icon={Coins} value={profile.gold?.toLocaleString() || 0} color="text-yellow-400" border="border-yellow-900/50" label="GOLD CURRENCY" />
                    {!isMobile && <ResourceBadge icon={Gem} value={profile.gems || 0} color="text-cyan-400" border="border-cyan-900/50" label="MANA CRYSTALS" />}
                    <ResourceBadge icon={Star} value={`LV.${profile.level}`} color="text-purple-400" border="border-purple-900/50" label="PLAYER LEVEL" />
                </div>
            </div>
        </header>
    );
};
