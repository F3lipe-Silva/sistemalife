import React from 'react';
import { LayoutDashboard, Target, BookOpen, KeySquare, Menu as MenuIcon } from 'lucide-react';
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
                className="relative flex flex-col items-center justify-center min-w-[64px] h-full gap-1 group transition-all duration-200 active:scale-95"
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
            >
                {/* MD3 Navigation Bar Item with State Layer */}
                <div className={cn(
                    "relative flex items-center justify-center w-16 h-8 rounded-full transition-all duration-300",
                    "before:absolute before:inset-0 before:rounded-full before:transition-all before:duration-300",
                    isActive 
                        ? "bg-primary/15 before:bg-primary/10" 
                        : "before:bg-transparent group-hover:before:bg-surface-variant/40 group-active:before:bg-surface-variant/60"
                )}>
                    <Icon className={cn(
                        "h-6 w-6 transition-all duration-300 relative z-10",
                        isActive 
                            ? "text-primary scale-110" 
                            : "text-on-surface-variant group-hover:text-foreground group-hover:scale-105"
                    )} />
                </div>

                {/* MD3 Label with proper typography */}
                <span className={cn(
                    "text-xs font-medium tracking-wide transition-all duration-300",
                    isActive 
                        ? "text-primary font-semibold" 
                        : "text-on-surface-variant/80 group-hover:text-foreground"
                )}>
                    {label}
                </span>

                {/* MD3 Active Indicator */}
                {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full animate-scale-in" />
                )}
            </button>
        );
    };

    return (
        <nav 
            className="fixed bottom-0 left-0 right-0 bg-surface-container/98 backdrop-blur-xl border-t border-border/10 pb-safe z-40 md:hidden shadow-[0_-2px_16px_rgba(0,0,0,0.08)]"
            aria-label="Main navigation"
        >
            <div className="flex justify-around items-center h-20 px-2 w-full max-w-screen-sm mx-auto">
                <NavButton 
                    icon={LayoutDashboard} 
                    label="Início" 
                    page="dashboard" 
                    isActive={currentPage === 'dashboard'} 
                />
                <NavButton 
                    icon={Target} 
                    label="Missões" 
                    page="missions" 
                    isActive={currentPage === 'missions'} 
                />
                <NavButton 
                    icon={BookOpen} 
                    label="Metas" 
                    page="metas" 
                    isActive={currentPage === 'metas'} 
                />
                <NavButton 
                    icon={KeySquare} 
                    label="Masmorra" 
                    page="dungeon" 
                    isActive={currentPage === 'dungeon'} 
                />

                {/* More Menu - MD3 Navigation Drawer trigger */}
                <Sheet open={isSheetOpen} onOpenChange={onSheetOpenChange}>
                    <SheetTrigger asChild>
                        <button
                            className="relative flex flex-col items-center justify-center min-w-[64px] h-full gap-1 group transition-all duration-200 active:scale-95"
                            aria-label="Open menu"
                        >
                            <div className={cn(
                                "relative flex items-center justify-center w-16 h-8 rounded-full transition-all duration-300",
                                "before:absolute before:inset-0 before:rounded-full before:transition-all before:duration-300",
                                isSheetOpen 
                                    ? "bg-primary/15 before:bg-primary/10" 
                                    : "before:bg-transparent group-hover:before:bg-surface-variant/40 group-active:before:bg-surface-variant/60"
                            )}>
                                <MenuIcon className={cn(
                                    "h-6 w-6 transition-all duration-300 relative z-10",
                                    isSheetOpen 
                                        ? "text-primary scale-110" 
                                        : "text-on-surface-variant group-hover:text-foreground group-hover:scale-105"
                                )} />
                            </div>
                            <span className={cn(
                                "text-xs font-medium tracking-wide transition-all duration-300",
                                isSheetOpen 
                                    ? "text-primary font-semibold" 
                                    : "text-on-surface-variant/80 group-hover:text-foreground"
                            )}>
                                Menu
                            </span>
                            {isSheetOpen && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full animate-scale-in" />
                            )}
                        </button>
                    </SheetTrigger>
                    
                    {/* MD3 Bottom Sheet with proper elevation */}
                    <SheetContent 
                        side="bottom" 
                        className="h-[92vh] rounded-t-3xl px-0 bg-surface-container border-t-0 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
                    >
                        <SheetHeader className="px-6 pb-4 pt-6 text-left border-b border-border/10">
                            <SheetTitle className="font-cinzel text-2xl text-gradient tracking-wider flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <MenuIcon className="h-5 w-5 text-primary" />
                                </div>
                                MENU DO SISTEMA
                            </SheetTitle>
                            <SheetDescription className="text-muted-foreground/70 text-sm mt-2">
                                Acesse todas as funcionalidades do sistema
                            </SheetDescription>
                        </SheetHeader>
                        <div className="h-full overflow-y-auto pb-24 pt-2">
                            <Sidebar inSheet={true} onNavigate={(page) => handleNavigate(page)} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
};
