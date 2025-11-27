import React from 'react';
import { Bot, BookOpen, Target, Settings, LogOut, Clock, BarChart3, LayoutDashboard, Award, Store, Backpack, UserSquare, TowerControl, KeySquare, ScrollText } from 'lucide-react';
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

    const NavItem = ({ icon: Icon, label, page, className = "" }: any) => (
        <button
            onClick={() => handleNav(page)}
            className={cn(
                'w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors duration-200',
                currentPage === page ? 'bg-primary/20 text-primary font-bold' : 'text-gray-400 hover:bg-secondary hover:text-white'
            )}
        >
            <Icon className="h-5 w-5" />
            <span className={cn("font-medium", className)}>{label}</span>
        </button>
    );

    return (
        <div className="h-full flex flex-col py-4">
            {!inSheet && <div className="font-cinzel text-3xl font-bold text-primary text-center mb-8 tracking-widest px-4">SISTEMA</div>}

            <div className="flex-grow overflow-y-auto space-y-1 px-2 scrollbar-hide">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-2 px-4">Principal</div>
                <NavItem icon={LayoutDashboard} label="Dashboard" page="dashboard" />
                <NavItem icon={BookOpen} label="Metas" page="metas" />
                <NavItem icon={Target} label="Missões" page="missions" />
                <NavItem icon={ScrollText} label="História" page="story" />

                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4 px-4">Aventura</div>
                <NavItem icon={TowerControl} label="Torre" page="tower" />
                <NavItem icon={KeySquare} label="Masmorra" page="dungeon" />

                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4 px-4">Personagem</div>
                <NavItem icon={BarChart3} label="Habilidades" page="skills" />
                <NavItem icon={UserSquare} label="Classe" page="class" />
                <NavItem icon={Clock} label="Rotina" page="routine" />
                <NavItem icon={Award} label="Conquistas" page="achievements" />

                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4 px-4">Economia</div>
                <NavItem icon={Store} label="Loja" page="shop" />
                <NavItem icon={Backpack} label="Inventário" page="inventory" />

                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4 px-4">Sistema</div>
                <NavItem icon={Bot} label="Arquiteto" page="ai-chat" className="font-cinzel font-bold tracking-wider" />
                <NavItem icon={Settings} label="Configurações" page="settings" />
            </div>

            <div className="mt-auto px-2 pt-4 border-t border-border/50">
                <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-gray-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Terminar Sessão</span>
                </button>
            </div>
        </div>
    );
};
