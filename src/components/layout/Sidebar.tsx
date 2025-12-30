import React from 'react';
import { Bot, BookOpen, Target, Settings, LogOut, Clock, BarChart3, LayoutDashboard, Award, Store, Backpack, UserSquare, TowerControl, KeySquare, ScrollText, Sparkles, ChevronLeft, ChevronRight, Hexagon, Activity } from 'lucide-react';
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
        const isActive = currentPage === page;
        
        const button = (
            <button
                onClick={() => handleNav(page)}
                className={cn(
                    'group relative flex items-center transition-all duration-300 overflow-hidden rounded-sm',
                    collapsed ? 'justify-center w-10 h-10 mx-auto mb-2' : 'w-full space-x-3 px-4 py-3 mx-2 mb-1 max-w-[calc(100%-16px)]',
                    isActive 
                        ? 'bg-blue-900/30 text-blue-100 shadow-[inset_0_0_10px_rgba(59,130,246,0.2)]' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-white',
                    highlight && !isActive && 'border border-blue-500/30 text-blue-300'
                )}
            >
                {/* Active Indicator Line */}
                {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                )}
                
                {/* Icon */}
                <div className={cn(
                    "relative flex items-center justify-center transition-all duration-300",
                    isActive ? "text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" : "group-hover:text-white"
                )}>
                    <Icon className={cn(
                        "transition-transform duration-300",
                        isActive ? "scale-110" : "group-hover:scale-105",
                        collapsed ? "h-5 w-5" : "h-4 w-4"
                    )} />
                </div>
                
                {!collapsed && (
                    <span className={cn(
                        "font-mono text-xs uppercase tracking-wider whitespace-nowrap overflow-hidden transition-all duration-300", 
                        className,
                        isActive ? "font-bold text-white" : ""
                    )}>{label}</span>
                )}
                
                {/* Highlight Effect */}
                {isActive && !collapsed && (
                    <div className="absolute right-2 opacity-50">
                        <Activity className="h-3 w-3 text-blue-500 animate-pulse" />
                    </div>
                )}
            </button>
        );

        if (tooltip && (collapsed || !inSheet)) {
            return (
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {button}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-black border border-blue-500/50 text-blue-100 font-mono text-xs uppercase tracking-wider" sideOffset={10}>
                            <p>{collapsed ? label : tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return button;
    };

    const SectionTitle = ({ children }: { children: React.ReactNode }) => {
        if (collapsed) return <div className="h-px w-6 mx-auto bg-blue-900/30 my-4" />;
        
        return (
            <div className="flex items-center gap-2 mb-2 mt-6 px-4 animate-in fade-in duration-300">
                <div className="h-1 w-1 bg-blue-500 rounded-full" />
                <span className="text-[10px] font-bold text-blue-500/50 font-mono uppercase tracking-[0.2em] whitespace-nowrap">
                    {children}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-blue-900/30 to-transparent" />
            </div>
        );
    };

    return (
        <div className={cn(
            "h-full flex flex-col py-4 transition-all duration-300 bg-black/95 backdrop-blur-md relative border-r border-blue-900/30", 
            collapsed ? "px-0" : "px-0"
        )}>
            {/* Background Tech Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            {!inSheet && (
                <div className={cn("mb-6 flex items-center transition-all duration-300 border-b border-blue-900/30 pb-4 mx-4", collapsed ? "justify-center px-0 mx-2" : "justify-between")}>
                    <div className={cn("flex items-center gap-3 transition-all duration-300", collapsed ? "justify-center" : "")}>
                        <div className={cn(
                            "flex items-center justify-center transition-all duration-300 relative",
                            collapsed ? "w-8 h-8" : "w-8 h-8"
                        )}>
                            <Hexagon className="h-8 w-8 text-blue-600 absolute opacity-50 animate-pulse-slow" />
                            <Sparkles className="h-4 w-4 text-blue-400 relative z-10" />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col">
                                <span className="font-cinzel text-lg font-black text-white tracking-[0.2em] leading-none">
                                    SYSTEM
                                </span>
                                <span className="text-[8px] font-mono text-blue-500 uppercase tracking-widest leading-none">
                                    INTERFACE V.2.0
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {!collapsed && onToggleCollapse && (
                         <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="h-6 w-6 text-blue-500/50 hover:text-blue-400 hover:bg-blue-900/20">
                            <ChevronLeft className="h-4 w-4" />
                         </Button>
                    )}
                </div>
            )}
            
            {collapsed && !inSheet && onToggleCollapse && (
                <div className="mb-4 flex justify-center pb-4 border-b border-blue-900/30 mx-2">
                     <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="h-6 w-6 text-blue-500/50 hover:text-blue-400 hover:bg-blue-900/20">
                        <ChevronRight className="h-4 w-4" />
                     </Button>
                </div>
            )}

            <div className={cn("flex-grow overflow-y-auto space-y-1 scrollbar-hide relative z-10", collapsed ? "px-0" : "")}>
                <SectionTitle>MAIN</SectionTitle>
                <NavItem icon={LayoutDashboard} label="DASHBOARD" page="dashboard" tooltip="Overview" />
                <NavItem icon={BookOpen} label="OBJECTIVES" page="metas" tooltip="Goals" />
                <NavItem icon={Target} label="QUESTS" page="missions" tooltip="Missions" />

                <SectionTitle>COMBAT</SectionTitle>
                <NavItem icon={TowerControl} label="DEMON CASTLE" page="tower" tooltip="Tower" />
                <NavItem icon={KeySquare} label="DUNGEONS" page="dungeon" tooltip="Dungeons" />

                <SectionTitle>PLAYER</SectionTitle>
                <NavItem icon={BarChart3} label="ABILITIES" page="skills" tooltip="Skills" />
                <NavItem icon={UserSquare} label="CLASS" page="class" tooltip="Class" />
                <NavItem icon={Clock} label="ROUTINE" page="routine" tooltip="Routine" />
                <NavItem icon={Award} label="ACHIEVEMENTS" page="achievements" tooltip="Awards" />

                <SectionTitle>MARKET</SectionTitle>
                <NavItem icon={Store} label="SHOP" page="shop" tooltip="Shop" />
                <NavItem icon={Backpack} label="INVENTORY" page="inventory" tooltip="Inventory" />

                <SectionTitle>CORE</SectionTitle>
                <NavItem icon={Bot} label="ARCHITECT" page="ai-chat" className="text-blue-300 font-bold" highlight tooltip="AI Chat" />
                <NavItem icon={Settings} label="CONFIG" page="settings" tooltip="Settings" />
            </div>

            <div className={cn("mt-auto pt-4 border-t border-blue-900/30 mx-4", collapsed ? "mx-2 px-0" : "")}>
                <button
                    onClick={logout}
                    className={cn(
                        "group flex items-center rounded-sm text-red-400/70 hover:bg-red-950/20 hover:text-red-400 transition-all duration-300 w-full",
                        collapsed ? "justify-center w-10 h-10 mx-auto" : "space-x-3 px-4 py-2"
                    )}
                >
                    <LogOut className={cn(
                        "transition-transform duration-300 group-hover:scale-110", 
                        collapsed ? "h-5 w-5" : "h-4 w-4"
                    )} />
                    {!collapsed && <span className="font-mono text-xs uppercase tracking-widest">LOGOUT</span>}
                </button>
            </div>
        </div>
    );
};
