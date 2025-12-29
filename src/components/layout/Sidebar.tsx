import React from 'react';
import { Bot, BookOpen, Target, Settings, LogOut, Clock, BarChart3, LayoutDashboard, Award, Store, Backpack, UserSquare, TowerControl, KeySquare, ScrollText, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';

interface SidebarProps {
    inSheet?: boolean;
    onNavigate?: (page: string) => void;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
}

export const Sidebar = ({ inSheet = false, onNavigate, collapsed = false, onToggleCollapse }: SidebarProps) => {
    const { logout } = useAuth();
    const { currentPage, setCurrentPage } = usePlayerDataContext();

    const handleNav = (page: string) => {
        setCurrentPage(page);
        if (onNavigate) onNavigate(page);
    };

    const NavItem = ({ icon: Icon, label, page, className = "", highlight = false, tooltip }: any) => {
        const button = (
            <button
                onClick={() => handleNav(page)}
                className={cn(
                    'group flex items-center rounded-xl transition-all duration-300 relative overflow-hidden',
                    collapsed ? 'justify-center w-12 h-12 mx-auto' : 'w-full space-x-3 px-4 py-3',
                    currentPage === page 
                        ? 'bg-primary/15 text-primary font-semibold shadow-lg shadow-primary/10' 
                        : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
                    highlight && currentPage !== page && 'border border-primary/20 hover:border-primary/40'
                )}
            >
                {/* Active indicator */}
                {currentPage === page && !collapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_hsl(var(--primary))]" />
                )}
                
                {/* Icon with glow effect when active */}
                <div className={cn(
                    "relative flex items-center justify-center transition-all duration-300",
                    currentPage === page && "drop-shadow-[0_0_6px_hsl(var(--primary))]"
                )}>
                    <Icon className={cn(
                        "transition-transform duration-300",
                        currentPage === page ? "scale-110" : "group-hover:scale-105",
                        collapsed ? "h-6 w-6" : "h-5 w-5"
                    )} />
                </div>
                
                {!collapsed && (
                    <span className={cn("font-medium tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300", className)}>{label}</span>
                )}
                
                {/* Highlight sparkle for special items */}
                {highlight && !collapsed && (
                    <Sparkles className="h-3 w-3 text-primary/60 ml-auto" />
                )}

                {/* Collapsed Active Indicator Dot */}
                {currentPage === page && collapsed && (
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_5px_hsl(var(--primary))]" />
                )}
            </button>
        );

        // Always show tooltip when collapsed, or if specifically requested
        if (tooltip && (collapsed || !inSheet)) {
            return (
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {button}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-semibold" sideOffset={10}>
                            <p>{collapsed ? label : tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return button;
    };

    const SectionTitle = ({ children }: { children: React.ReactNode }) => {
        if (collapsed) return <div className="h-px w-8 mx-auto bg-border/50 my-4" />;
        
        return (
            <div className="flex items-center gap-2 mb-3 mt-6 px-4 animate-in fade-in duration-300">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.2em] whitespace-nowrap">
                    {children}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
            </div>
        );
    };

    return (
        <div className={cn("h-full flex flex-col py-4 transition-all duration-300", collapsed ? "px-2" : "px-0")}>
            {!inSheet && (
                <div className={cn("mb-8 flex items-center transition-all duration-300", collapsed ? "justify-center px-0" : "px-4 justify-between")}>
                    <div className={cn("flex items-center gap-3 transition-all duration-300", collapsed ? "justify-center" : "")}>
                        <div className={cn(
                            "rounded-xl bg-primary/20 flex items-center justify-center shadow-lg shadow-primary/20 transition-all duration-300",
                            collapsed ? "w-10 h-10" : "w-10 h-10"
                        )}>
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        {!collapsed && (
                            <span className="font-cinzel text-2xl font-bold text-gradient tracking-widest animate-in fade-in slide-in-from-left-2 duration-300">
                                SISTEMA
                            </span>
                        )}
                    </div>
                    
                    {!collapsed && onToggleCollapse && (
                         <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <ChevronLeft className="h-4 w-4" />
                         </Button>
                    )}
                </div>
            )}
            
            {/* Collapsed Toggle Button (Centered when collapsed) */}
            {collapsed && !inSheet && onToggleCollapse && (
                <div className="mb-4 flex justify-center">
                     <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <ChevronRight className="h-4 w-4" />
                     </Button>
                </div>
            )}

            <div className={cn("flex-grow overflow-y-auto space-y-1 scrollbar-hide", collapsed ? "px-0 items-center flex flex-col" : "px-2")}>
                <SectionTitle>Principal</SectionTitle>
                <NavItem icon={LayoutDashboard} label="Dashboard" page="dashboard" tooltip="Visão geral" />
                <NavItem icon={BookOpen} label="Metas" page="metas" tooltip="Metas" />
                <NavItem icon={Target} label="Missões" page="missions" tooltip="Missões" />

                <SectionTitle>Aventura</SectionTitle>
                <NavItem icon={TowerControl} label="Torre" page="tower" tooltip="Torre do Destino" />
                <NavItem icon={KeySquare} label="Masmorra" page="dungeon" tooltip="Masmorra" />

                <SectionTitle>Personagem</SectionTitle>
                <NavItem icon={BarChart3} label="Habilidades" page="skills" tooltip="Habilidades" />
                <NavItem icon={UserSquare} label="Classe" page="class" tooltip="Classe" />
                <NavItem icon={Clock} label="Rotina" page="routine" tooltip="Rotina" />
                <NavItem icon={Award} label="Conquistas" page="achievements" tooltip="Conquistas" />

                <SectionTitle>Economia</SectionTitle>
                <NavItem icon={Store} label="Loja" page="shop" tooltip="Loja" />
                <NavItem icon={Backpack} label="Inventário" page="inventory" tooltip="Inventário" />

                <SectionTitle>Sistema</SectionTitle>
                <NavItem icon={Bot} label="Arquiteto" page="ai-chat" className="font-cinzel font-bold tracking-wider" highlight tooltip="Arquiteto IA" />
                <NavItem icon={Settings} label="Configurações" page="settings" tooltip="Configurações" />
            </div>

            <div className={cn("mt-auto pt-4 border-t border-border/30", collapsed ? "px-0" : "px-2")}>
                <button
                    onClick={logout}
                    className={cn(
                        "group flex items-center rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-all duration-300",
                        collapsed ? "justify-center w-12 h-12 mx-auto" : "w-full space-x-3 px-4 py-3"
                    )}
                >
                    <LogOut className={cn(
                        "transition-transform duration-300 group-hover:scale-110", 
                        collapsed ? "h-6 w-6" : "h-5 w-5"
                    )} />
                    {!collapsed && <span className="font-medium">Terminar Sessão</span>}
                </button>
            </div>
        </div>
    );
};
