import React from 'react';
import { Bot, BookOpen, Target, Settings, LogOut, Clock, BarChart3, LayoutDashboard, Award, Store, Backpack, UserSquare, TowerControl, KeySquare, ScrollText, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { usePlayerDataContext } from '@/hooks/use-player-data';

interface SidebarProps {
    inSheet?: boolean;
    onNavigate?: (page: string) => void;
}

export const Sidebar = ({ inSheet = false, onNavigate }: SidebarProps) => {
    const { logout } = useAuth();
    const { currentPage, setCurrentPage } = usePlayerDataContext();

    const handleNav = (page: string) => {
        setCurrentPage(page);
        if (onNavigate) onNavigate(page);
    };

    const NavItem = ({ icon: Icon, label, page, className = "", highlight = false }: any) => (
        <button
            onClick={() => handleNav(page)}
            className={cn(
                'group w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden',
                currentPage === page 
                    ? 'bg-primary/15 text-primary font-semibold shadow-lg shadow-primary/10' 
                    : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
                highlight && currentPage !== page && 'border border-primary/20 hover:border-primary/40'
            )}
        >
            {/* Active indicator */}
            {currentPage === page && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_hsl(var(--primary))]" />
            )}
            
            {/* Icon with glow effect when active */}
            <div className={cn(
                "relative flex items-center justify-center transition-all duration-300",
                currentPage === page && "drop-shadow-[0_0_6px_hsl(var(--primary))]"
            )}>
                <Icon className={cn(
                    "h-5 w-5 transition-transform duration-300",
                    currentPage === page ? "scale-110" : "group-hover:scale-105"
                )} />
            </div>
            
            <span className={cn("font-medium tracking-wide", className)}>{label}</span>
            
            {/* Highlight sparkle for special items */}
            {highlight && (
                <Sparkles className="h-3 w-3 text-primary/60 ml-auto" />
            )}
        </button>
    );

    const SectionTitle = ({ children }: { children: React.ReactNode }) => (
        <div className="flex items-center gap-2 mb-3 mt-6 px-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
            <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.2em]">
                {children}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
        </div>
    );

    return (
        <div className="h-full flex flex-col py-4">
            {!inSheet && (
                <div className="px-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shadow-lg shadow-primary/20">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-cinzel text-2xl font-bold text-gradient tracking-widest">SISTEMA</span>
                    </div>
                </div>
            )}

            <div className="flex-grow overflow-y-auto space-y-1 px-2 scrollbar-hide">
                <SectionTitle>Principal</SectionTitle>
                <NavItem icon={LayoutDashboard} label="Dashboard" page="dashboard" />
                <NavItem icon={BookOpen} label="Metas" page="metas" />
                <NavItem icon={Target} label="Missões" page="missions" />

                <SectionTitle>Aventura</SectionTitle>
                <NavItem icon={TowerControl} label="Torre" page="tower" />
                <NavItem icon={KeySquare} label="Masmorra" page="dungeon" />

                <SectionTitle>Personagem</SectionTitle>
                <NavItem icon={BarChart3} label="Habilidades" page="skills" />
                <NavItem icon={UserSquare} label="Classe" page="class" />
                <NavItem icon={Clock} label="Rotina" page="routine" />
                <NavItem icon={Award} label="Conquistas" page="achievements" />

                <SectionTitle>Economia</SectionTitle>
                <NavItem icon={Store} label="Loja" page="shop" />
                <NavItem icon={Backpack} label="Inventário" page="inventory" />

                <SectionTitle>Sistema</SectionTitle>
                <NavItem icon={Bot} label="Arquiteto" page="ai-chat" className="font-cinzel font-bold tracking-wider" highlight />
                <NavItem icon={Settings} label="Configurações" page="settings" />
            </div>

            <div className="mt-auto px-2 pt-4 border-t border-border/30">
                <button
                    onClick={logout}
                    className="group w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
                >
                    <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    <span className="font-medium">Terminar Sessão</span>
                </button>
            </div>
        </div>
    );
};
