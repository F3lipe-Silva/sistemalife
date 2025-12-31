"use client";

import React, { memo, useRef } from 'react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { cn } from '@/lib/utils';
import { 
    Settings, User, Bot, AlertTriangle, Bell, Database, 
    PieChart, Gamepad2, ChevronRight, Cpu, LogOut 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSettingsTab from './ProfileSettingsTab';
import AISettingsTab from './AISettingsTab';
import DangerZoneTab from './DangerZoneTab';
import NotificationsSettingsTab from './NotificationsSettingsTab';
import DataBackupTab from './DataBackupTab';
import AnalyticsTab from './AnalyticsTab';
import GamificationSettingsTab from './GamificationSettingsTab';
import { useAuth } from '@/hooks/use-auth';

const SettingsMobileComponent = () => {
    const { profile } = usePlayerDataContext();
    const { logout } = useAuth();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            const patterns = { light: 50, medium: 100, heavy: 200 };
            navigator.vibrate(patterns[type]);
        }
    };

    if (!profile) return null;

    return (
        <div className="h-screen bg-black overflow-hidden flex flex-col max-w-full relative font-mono">
            <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-[0.03] pointer-events-none z-50" />
            
            <header className="bg-black/90 backdrop-blur-2xl border-b border-blue-500/20 flex-shrink-0 z-40" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
                <div className="flex items-center justify-between bg-blue-950/40 border-b border-blue-900/30 py-2.5 px-4">
                    <div className="flex items-center gap-3">
                        <Settings className="h-4 w-4 text-blue-400 animate-spin-slow" />
                        <span className="font-mono text-[10px] text-blue-300 uppercase tracking-[0.2em] font-bold">
                            SYSTEM_CONFIG: <span className="text-white">v1.0.8-STABLE</span>
                        </span>
                    </div>
                    <button onClick={logout} className="text-red-500 p-1 active:scale-90 transition-transform">
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>

                <div className="px-4 py-5">
                    <h1 className="font-cinzel text-white tracking-widest text-2xl font-bold drop-shadow-[0_0_12px_rgba(59,130,246,0.6)] uppercase">
                        CORE <span className="text-blue-400">SETTINGS</span>
                    </h1>
                    <p className="text-blue-300/60 text-[10px] tracking-[0.15em] mt-1 font-bold uppercase">
                        HARDWARE_CALIBRATION_UNIT
                    </p>
                </div>
            </header>

            <main className="flex-1 overflow-hidden flex flex-col bg-black relative">
                <Tabs defaultValue="profile" className="w-full h-full flex flex-col" onValueChange={() => triggerHapticFeedback('light')}>
                    {/* Horizontal Scrollable Tabs List - MD3 Practice */}
                    <div className="bg-blue-950/20 border-b border-blue-500/10 overflow-x-auto shrink-0 w-full">
                        <TabsList className="bg-transparent h-16 flex items-center px-4 gap-3 min-w-max justify-start">
                            <TabsTrigger value="profile" className="rounded-2xl px-5 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs font-bold uppercase tracking-widest border border-blue-500/10 transition-all">
                                <User className="mr-2 h-4 w-4" /> PROFILE
                            </TabsTrigger>
                            <TabsTrigger value="ai" className="rounded-2xl px-5 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs font-bold uppercase tracking-widest border border-blue-500/10 transition-all">
                                <Bot className="mr-2 h-4 w-4" /> INTERFACE
                            </TabsTrigger>
                            <TabsTrigger value="gamification" className="rounded-2xl px-5 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs font-bold uppercase tracking-widest border border-blue-500/10 transition-all">
                                <Gamepad2 className="mr-2 h-4 w-4" /> GAMEPLAY
                            </TabsTrigger>
                            <TabsTrigger value="notifications" className="rounded-2xl px-5 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs font-bold uppercase tracking-widest border border-blue-500/10 transition-all">
                                <Bell className="mr-2 h-4 w-4" /> ALERTS
                            </TabsTrigger>
                            <TabsTrigger value="data_backup" className="rounded-2xl px-5 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs font-bold uppercase tracking-widest border border-blue-500/10 transition-all">
                                <Database className="mr-2 h-4 w-4" /> DATA
                            </TabsTrigger>
                            <TabsTrigger value="danger_zone" className="rounded-2xl px-5 py-3 data-[state=active]:bg-red-600 data-[state=active]:text-white text-red-500 text-xs font-bold uppercase tracking-widest border border-red-500/20 transition-all">
                                <AlertTriangle className="mr-2 h-4 w-4" /> DANGER
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-6 pb-32">
                        <div className="animate-fade-in relative">
                            {/* HUD Corners */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500/30" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blue-500/30" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-blue-500/30" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500/30" />

                            <TabsContent value="profile" className="mt-0 focus-visible:ring-0">
                                <ProfileSettingsTab />
                            </TabsContent>

                            <TabsContent value="ai" className="mt-0 focus-visible:ring-0">
                                <AISettingsTab />
                            </TabsContent>
                            
                            <TabsContent value="gamification" className="mt-0 focus-visible:ring-0">
                                <GamificationSettingsTab />
                            </TabsContent>

                            <TabsContent value="notifications" className="mt-0 focus-visible:ring-0">
                                <NotificationsSettingsTab />
                            </TabsContent>

                            <TabsContent value="data_backup" className="mt-0 focus-visible:ring-0">
                                <DataBackupTab />
                            </TabsContent>
                            
                            <TabsContent value="danger_zone" className="mt-0 focus-visible:ring-0">
                                <DangerZoneTab />
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>
            </main>
        </div>
    );
};

export const SettingsMobile = memo(SettingsMobileComponent);