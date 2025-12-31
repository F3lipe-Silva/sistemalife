"use client";

import React, { useState } from 'react';
import { IonTabBar, IonTabButton, IonLabel, IonBadge } from '@ionic/react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { cn } from '@/lib/utils';
import { 
    LayoutDashboard, Target, BookOpen, Skull, Grid, 
    Bell, Zap, Swords, Box, Sparkles 
} from 'lucide-react';

interface IonicMobileNavigationProps {
    onNavigate: (page: string) => void;
    onMenuOpen: () => void;
}

export const IonicMobileNavigation = ({ onNavigate, onMenuOpen }: IonicMobileNavigationProps) => {
    const { currentPage, missions } = usePlayerDataContext();
    const [lastTab, setLastTab] = useState(currentPage);

    const triggerHapticFeedback = (type: 'light' | 'medium' = 'light') => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(type === 'light' ? 30 : 60);
        }
    };

    const handleNavigation = (page: string) => {
        if (page === currentPage) return;
        triggerHapticFeedback('light');
        onNavigate(page);
        setLastTab(page);
    };

    const handleMenuOpen = () => {
        triggerHapticFeedback('medium');
        onMenuOpen();
    };

    // Filtro de missões ativas
    const activeMissionCount = missions?.filter((m: any) =>
        !m.concluido && m.missoes_diarias?.some((d: any) => !d.concluido)
    ).length || 0;

    const navItems = [
        { id: 'dashboard', label: 'INÍCIO', icon: LayoutDashboard },
        { id: 'missions', label: 'MISSÕES', icon: Swords, badge: activeMissionCount },
        { id: 'metas', label: 'METAS', icon: Target },
        { id: 'tower-lobby', label: 'MASMO.', icon: Skull },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            {/* Top Border Glow */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent shadow-[0_-2px_10px_rgba(59,130,246,0.3)]" />
            
            <IonTabBar
                className="bg-black/95 backdrop-blur-2xl border-none h-[80px] pb-safe"
                style={{
                    '--background': 'transparent',
                    '--border-top': 'none',
                }}
            >
                {navItems.map((item) => {
                    const isActive = currentPage === item.id || (item.id === 'tower-lobby' && (currentPage === 'tower' || currentPage === 'dungeon'));
                    const Icon = item.icon;

                    return (
                        <IonTabButton
                            key={item.id}
                            tab={item.id}
                            onClick={() => handleNavigation(item.id)}
                            className={cn(
                                "relative transition-all duration-300 ease-out overflow-visible bg-transparent",
                                isActive ? "opacity-100" : "opacity-40 grayscale"
                            )}
                        >
                            <div className="relative flex flex-col items-center justify-center h-full w-full py-2">
                                {/* MD3 Active Indicator Pill */}
                                <div className={cn(
                                    "absolute top-1 w-12 h-8 rounded-full transition-all duration-300 -z-10",
                                    isActive ? "bg-blue-600/30 scale-100 opacity-100" : "bg-transparent scale-50 opacity-0"
                                )} />

                                {/* Icon with HUD Style */}
                                <div className={cn(
                                    "relative transition-all duration-300",
                                    isActive ? "text-blue-400 -translate-y-1" : "text-white"
                                )}>
                                    <Icon className={cn("h-6 w-6 transition-all", isActive && "drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]")} />
                                    
                                    {/* Badge Style System */}
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border-2 border-black animate-pulse shadow-[0_0_5px_rgba(220,38,38,0.5)]">
                                            {item.badge}
                                        </div>
                                    )}
                                </div>

                                <IonLabel className={cn(
                                    "text-[9px] font-mono font-bold tracking-[0.15em] mt-1.5 transition-all duration-300 uppercase",
                                    isActive ? "text-blue-400 opacity-100" : "text-white/60 opacity-100"
                                )}>
                                    {item.label}
                                </IonLabel>
                            </div>
                        </IonTabButton>
                    );
                })}

                {/* Separate Menu Button */}
                <IonTabButton
                    tab="menu"
                    onClick={handleMenuOpen}
                    className="relative transition-all duration-300 bg-transparent opacity-60 hover:opacity-100"
                >
                    <div className="flex flex-col items-center justify-center h-full w-full py-2">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-center group active:bg-blue-500/20 transition-all">
                            <Grid className="h-5 w-5 text-blue-400 group-active:scale-90" />
                        </div>
                        <IonLabel className="text-[9px] font-mono font-bold tracking-[0.15em] mt-1 text-blue-400/60 uppercase">
                            MENU
                        </IonLabel>
                    </div>
                </IonTabButton>
            </IonTabBar>
        </div>
    );
};