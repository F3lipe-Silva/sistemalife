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
                    'flex flex-col items-center justify-center p-3 md:p-2 rounded-xl transition-all duration-200 flex-1',
                    isActive
                        ? 'text-primary bg-primary/10 scale-105'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
            >
                <Icon className={cn("h-6 w-6 mb-1", isActive && "fill-current")} />
                <span className="text-[10px] font-medium">{label}</span>
            </button>
        );
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border/50 pb-safe pt-2 px-4 z-40 md:hidden shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.3)]">
            <div className="flex justify-around items-center max-w-md mx-auto">
                <NavButton icon={LayoutDashboard} label="Início" page="dashboard" isActive={currentPage === 'dashboard'} />
                <NavButton icon={ScrollText} label="História" page="story" isActive={currentPage === 'story'} />
                <NavButton icon={Target} label="Missões" page="missions" isActive={currentPage === 'missions'} />
                <NavButton icon={BookOpen} label="Metas" page="metas" isActive={currentPage === 'metas'} />
                <NavButton icon={TowerControl} label="Torre" page="tower" isActive={currentPage === 'tower'} />
                <NavButton icon={KeySquare} label="Masmorra" page="dungeon" isActive={currentPage === 'dungeon'} />

                {/* More Menu */}
                <Sheet open={isSheetOpen} onOpenChange={onSheetOpenChange}>
                    <SheetTrigger asChild>
                        <button
                            className={cn(
                                'flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200',
                                isSheetOpen
                                    ? 'text-primary bg-primary/10'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                            )}
                        >
                            <MenuIcon className="h-6 w-6 mb-1" />
                            <span className="text-[10px] font-medium">Menu</span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="md:h-[85vh] h-[92vh] rounded-t-[20px] px-0">
                        <SheetHeader className="px-6 mb-4 text-left">
                            <SheetTitle className="font-cinzel text-2xl text-primary tracking-wider">MENU DO SISTEMA</SheetTitle>
                            <SheetDescription>Acesse todas as funcionalidades do sistema.</SheetDescription>
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
