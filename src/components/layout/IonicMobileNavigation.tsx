import React, { useEffect, useState } from 'react';
import { IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/react';
import { home, flag, book, hardwareChip, key, menu, grid, notifications } from 'ionicons/icons';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { cn } from '@/lib/utils';

interface IonicMobileNavigationProps {
    onNavigate: (page: string) => void;
    onMenuOpen: () => void;
}

export const IonicMobileNavigation = ({ onNavigate, onMenuOpen }: IonicMobileNavigationProps) => {
    const { currentPage, profile, missions } = usePlayerDataContext();
    const [hapticFeedback, setHapticFeedback] = useState(false);

    // Trigger haptic feedback on navigation
    const handleNavigation = (page: string) => {
        if (navigator.vibrate) {
            navigator.vibrate(30); // Light haptic feedback
        }
        setHapticFeedback(true);
        onNavigate(page);

        // Reset haptic state
        setTimeout(() => setHapticFeedback(false), 100);
    };

    const handleMenuOpen = () => {
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        onMenuOpen();
    };

    // Calculate active mission count for badge
    const activeMissionCount = missions?.filter((m: any) =>
        !m.concluido && m.missoes_diarias?.some((d: any) => !d.concluido)
    ).length || 0;

    // Calculate unread notifications (placeholder logic)
    const unreadNotifications = 2; // This could be dynamic

    return (
        <IonTabBar
            className={cn(
                "fixed bottom-0 w-full z-50 border-t bg-background/95 backdrop-blur-xl shadow-2xl transition-all duration-300",
                "pb-safe",
                hapticFeedback && "scale-[0.98]"
            )}
            style={{
                borderTop: '1px solid hsl(var(--border) / 0.1)',
                boxShadow: '0 -4px 20px -4px rgba(0, 0, 0, 0.1), 0 -2px 8px -2px rgba(0, 0, 0, 0.05)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                background: 'hsl(var(--background) / 0.95)',
                backdropFilter: 'blur(20px)'
            }}
        >
            <IonTabButton
                tab="dashboard"
                selected={currentPage === 'dashboard'}
                onClick={() => handleNavigation('dashboard')}
                className="relative hover:bg-primary/5 transition-all duration-200"
                style={{
                    '--color-selected': 'hsl(var(--primary))',
                    '--color': 'hsl(var(--muted-foreground))'
                }}
            >
                <div className="relative">
                    <IonIcon icon={home} className="text-lg" />
                    {currentPage === 'dashboard' && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse" />
                    )}
                </div>
                <IonLabel className="text-[9px] font-semibold mt-1 tracking-wide">INÍCIO</IonLabel>
            </IonTabButton>

            <IonTabButton
                tab="missions"
                selected={currentPage === 'missions'}
                onClick={() => handleNavigation('missions')}
                className="relative hover:bg-primary/5 transition-all duration-200"
                style={{
                    '--color-selected': 'hsl(var(--primary))',
                    '--color': 'hsl(var(--muted-foreground))'
                }}
            >
                <div className="relative">
                    <IonIcon icon={flag} className="text-lg" />
                    {activeMissionCount > 0 && (
                        <IonBadge
                            color="danger"
                            className="absolute -top-2 -right-2 text-[9px] min-w-[16px] h-4 px-1"
                            style={{
                                fontSize: '9px',
                                minWidth: '16px',
                                height: '16px',
                                borderRadius: '8px'
                            }}
                        >
                            {activeMissionCount > 9 ? '9+' : activeMissionCount}
                        </IonBadge>
                    )}
                    {currentPage === 'missions' && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse" />
                    )}
                </div>
                <IonLabel className="text-[9px] font-semibold mt-1 tracking-wide">MISSÕES</IonLabel>
            </IonTabButton>

            <IonTabButton
                tab="metas"
                selected={currentPage === 'metas'}
                onClick={() => handleNavigation('metas')}
                className="relative hover:bg-primary/5 transition-all duration-200"
                style={{
                    '--color-selected': 'hsl(var(--primary))',
                    '--color': 'hsl(var(--muted-foreground))'
                }}
            >
                <div className="relative">
                    <IonIcon icon={book} className="text-lg" />
                    {currentPage === 'metas' && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse" />
                    )}
                </div>
                <IonLabel className="text-[9px] font-semibold mt-1 tracking-wide">METAS</IonLabel>
            </IonTabButton>

            <IonTabButton
                tab="dungeon"
                selected={currentPage === 'dungeon' || currentPage === 'tower'}
                onClick={() => handleNavigation('dungeon')}
                className="relative hover:bg-primary/5 transition-all duration-200"
                style={{
                    '--color-selected': 'hsl(var(--primary))',
                    '--color': 'hsl(var(--muted-foreground))'
                }}
            >
                <div className="relative">
                    <IonIcon icon={key} className="text-lg" />
                    {currentPage === 'dungeon' && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse" />
                    )}
                </div>
                <IonLabel className="text-[9px] font-semibold mt-1 tracking-wide">MASMO.</IonLabel>
            </IonTabButton>

            <IonTabButton
                tab="menu"
                onClick={handleMenuOpen}
                className="relative hover:bg-primary/5 transition-all duration-200"
                style={{
                    '--color-selected': 'hsl(var(--primary))',
                    '--color': 'hsl(var(--muted-foreground))'
                }}
            >
                <div className="relative">
                    <IonIcon icon={grid} className="text-lg" />
                    {unreadNotifications > 0 && (
                        <IonBadge
                            color="warning"
                            className="absolute -top-2 -right-2 text-[9px] min-w-[16px] h-4 px-1"
                            style={{
                                fontSize: '9px',
                                minWidth: '16px',
                                height: '16px',
                                borderRadius: '8px'
                            }}
                        >
                            {unreadNotifications}
                        </IonBadge>
                    )}
                </div>
                <IonLabel className="text-[9px] font-semibold mt-1 tracking-wide">MENU</IonLabel>
            </IonTabButton>
        </IonTabBar>
    );
};
