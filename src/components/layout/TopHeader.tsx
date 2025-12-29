import React from 'react';
import { Coins, Gem, Star, Sparkles, Search, Command } from 'lucide-react';
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

    const ResourceBadge = ({ icon: Icon, value, color, label }: { icon: any; value: number | string; color: string; label: string }) => (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div 
                        className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 cursor-default",
                            "bg-secondary/50 backdrop-blur-sm border border-border/30 hover:border-border/50",
                            isMobile ? "px-2 py-1" : "px-3 py-1.5"
                        )}
                    >
                        <Icon className={cn(color, isMobile ? "h-3.5 w-3.5" : "h-4 w-4", "drop-shadow-sm")} />
                        <span className={cn("font-bold tabular-nums", isMobile ? "text-xs" : "text-sm")}>{value}</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );

    return (
        <header className={cn(
            "border-b border-border/30 bg-card/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30",
            "shadow-lg shadow-black/5",
            isMobile ? "h-14 px-4" : "h-16 px-6"
        )}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {!isMobile && (
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                                    <Sparkles className="h-4 w-4" />
                                    SystemLife
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-cinzel font-bold text-gradient">
                                    {title}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
                
                {isMobile && (
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h1 className="font-cinzel font-bold tracking-wider text-gradient text-base truncate">
                            {title}
                        </h1>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                {!isMobile && onOpenCommand && (
                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onOpenCommand}
                                    className="gap-2 text-muted-foreground hover:text-foreground"
                                >
                                    <Search className="h-4 w-4" />
                                    <span className="text-xs">Buscar</span>
                                    <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                                        <Command className="h-3 w-3" />K
                                    </kbd>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Abrir busca rápida (Ctrl+K)</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                
                <ResourceBadge icon={Coins} value={profile.gold?.toLocaleString() || 0} color="text-yellow-400" label="Ouro" />
                {!isMobile && <ResourceBadge icon={Gem} value={profile.gems || 0} color="text-cyan-400" label="Cristais" />}
                <ResourceBadge icon={Star} value={`Lv.${profile.level}`} color="text-purple-400" label="Nível" />
            </div>
        </header>
    );
};
