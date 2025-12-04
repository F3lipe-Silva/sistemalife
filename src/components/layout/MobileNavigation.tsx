import React, { useState } from 'react';
import { LayoutDashboard, ScrollText, Target, BookOpen, TowerControl, KeySquare, Menu as MenuIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { usePlayerDataContext } from '@/hooks/use-player-data';

interface MobileNavigationProps {
    onNavigate: (page: string) => void;
    isSheetOpen: boolean;
    onSheetOpenChange: (open: boolean) => void;
}

export const MobileNavigation = ({ onNavigate, isSheetOpen, onSheetOpenChange }: MobileNavigationProps) => {
    const { currentPage } = usePlayerDataContext();

    const handleNavigate = (page: string) => {
        onNavigate(page);
        onSheetOpenChange(false);
    };

    const NavButton = ({ icon: Icon, label, page, isActive }: {
        icon: React.ComponentType<{ className?: string }>,
        label: string,
        page: string,
        isActive?: boolean
    }) => {
        return (
            <button
                onClick={() => handleNavigate(page)}
                className={cn(
                    'relative flex flex-col items-center justify-center p-2.5 rounded-xl transition-all duration-300 flex-1 group',
                    isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                )}
            >
                {/* Background glow for active state */}
                {isActive && (
                    <div className="absolute inset-0 bg-primary/15 rounded-xl blur-sm" />
                )}
                
                {/* Icon container */}
                <div className={cn(
                    "relative z-10 p-2 rounded-lg transition-all duration-300",
                    isActive 
                        ? "bg-primary/20 scale-110" 
                        : "group-hover:bg-secondary/50 group-hover:scale-105"
                )}>
                    <Icon className={cn(
                        "h-5 w-5 transition-all duration-300",
                        isActive && "drop-shadow-[0_0_8px_hsl(var(--primary))]"
                    )} />
                </div>
                
                {/* Label */}
                <span className={cn(
                    "text-[10px] font-medium mt-1 transition-all duration-300",
                    isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                )}>
                    {label}
                </span>
                
                {/* Active indicator dot */}
                {isActive && (
                    <div className="absolute -bottom-0.5 w-1 h-1 bg-primary rounded-full animate-pulse" />
                )}
            </button>
        );
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/30 pb-safe pt-2 px-2 z-40 md:hidden shadow-[0_-8px_30px_-5px_rgba(0,0,0,0.4)]">
            <div className="flex justify-around items-center max-w-md mx-auto h-[60px] pb-1">
                <NavButton icon={LayoutDashboard} label="Início" page="dashboard" isActive={currentPage === 'dashboard'} />
                <NavButton icon={Target} label="Missões" page="missions" isActive={currentPage === 'missions'} />
                <NavButton icon={BookOpen} label="Metas" page="metas" isActive={currentPage === 'metas'} />
                <NavButton icon={TowerControl} label="Torre" page="tower" isActive={currentPage === 'tower'} />
                <NavButton icon={KeySquare} label="Masmorra" page="dungeon" isActive={currentPage === 'dungeon'} />

                {/* More Menu */}
                <Sheet open={isSheetOpen} onOpenChange={onSheetOpenChange}>
                    <SheetTrigger asChild>
                        <button
                            className={cn(
                                'relative flex flex-col items-center justify-center p-2.5 rounded-xl transition-all duration-300 group',
                                isSheetOpen
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {isSheetOpen && (
                                <div className="absolute inset-0 bg-primary/15 rounded-xl blur-sm" />
                            )}
                            <div className={cn(
                                "relative z-10 p-2 rounded-lg transition-all duration-300",
                                isSheetOpen 
                                    ? "bg-primary/20 scale-110" 
                                    : "group-hover:bg-secondary/50 group-hover:scale-105"
                            )}>
                                <MenuIcon className={cn(
                                    "h-5 w-5 transition-all duration-300",
                                    isSheetOpen && "drop-shadow-[0_0_8px_hsl(var(--primary))]"
                                )} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium mt-1 transition-all duration-300",
                                isSheetOpen ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                            )}>
                                Menu
                            </span>
                            {isSheetOpen && (
                                <div className="absolute -bottom-0.5 w-1 h-1 bg-primary rounded-full animate-pulse" />
                            )}
                        </button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="md:h-[85vh] h-[92vh] rounded-t-[24px] px-0 bg-card/95 backdrop-blur-xl border-t-2 border-primary/20">
                        <SheetHeader className="px-6 mb-4 text-left">
                            <SheetTitle className="font-cinzel text-2xl text-gradient tracking-wider flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                    <MenuIcon className="h-4 w-4 text-primary" />
                                </div>
                                MENU DO SISTEMA
                            </SheetTitle>
                            <SheetDescription className="text-muted-foreground/80">Acesse todas as funcionalidades do sistema.</SheetDescription>
                        </SheetHeader>
                        <div className="h-full overflow-y-auto pb-20">
                            <Sidebar inSheet={true} onNavigate={(page) => handleNavigate(page)} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
};
