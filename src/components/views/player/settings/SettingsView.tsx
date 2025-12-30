
"use client";

import { memo } from 'react';
import { User, Bot, AlertTriangle, Bell, Database, PieChart, Gamepad2, Link, Settings as SettingsIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSettingsTab from './ProfileSettingsTab';
import AISettingsTab from './AISettingsTab';
import DangerZoneTab from './DangerZoneTab';
import NotificationsSettingsTab from './NotificationsSettingsTab';
import DataBackupTab from './DataBackupTab';
import AnalyticsTab from './AnalyticsTab';
import GamificationSettingsTab from './GamificationSettingsTab';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const SettingsViewComponent = () => {
    const isMobile = useIsMobile();
    
    return (
        <div className={cn("h-full overflow-y-auto relative", isMobile ? "p-2" : "p-4 md:p-8")}>
             <div className="absolute inset-0 bg-grid-cyan-400/10 [mask-image:linear-gradient(to_bottom,white_5%,transparent_80%)] -z-10"></div>

            <div className={cn("mb-8 flex items-center gap-4 border-b border-blue-900/30 pb-4")}>
                <div className="p-3 bg-blue-900/10 border border-blue-500/30">
                    <SettingsIcon className="h-8 w-8 text-blue-400 animate-spin-slow" />
                </div>
                <div>
                    <h1 className={cn("font-black text-white font-cinzel tracking-[0.1em] uppercase drop-shadow-md", isMobile ? "text-2xl" : "text-3xl")}>
                        SYSTEM CONFIGURATION
                    </h1>
                    <p className={cn("text-blue-400/60 font-mono text-xs tracking-widest uppercase mt-1")}>
                        USER PREFERENCES & DATA MANAGEMENT
                    </p>
                </div>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className={cn("bg-black/60 border border-blue-900/30 p-1 mb-6 flex flex-wrap h-auto gap-1", isMobile ? "justify-start" : "")}>
                    <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-mono uppercase text-xs">
                        <User className={cn("mr-2 h-4 w-4")} />
                        PROFILE
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-mono uppercase text-xs">
                         <Bot className={cn("mr-2 h-4 w-4")} />
                        INTERFACE & AI
                    </TabsTrigger>
                     <TabsTrigger value="gamification" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-mono uppercase text-xs">
                         <Gamepad2 className={cn("mr-2 h-4 w-4")} />
                        GAMEPLAY
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-mono uppercase text-xs">
                         <Bell className={cn("mr-2 h-4 w-4")} />
                        ALERTS
                    </TabsTrigger>
                    <TabsTrigger value="data_backup" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-mono uppercase text-xs">
                         <Database className={cn("mr-2 h-4 w-4")} />
                        DATA
                    </TabsTrigger>
                     <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-mono uppercase text-xs">
                         <PieChart className={cn("mr-2 h-4 w-4")} />
                        ANALYTICS
                    </TabsTrigger>
                    <TabsTrigger value="danger_zone" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-red-500 font-mono uppercase text-xs border border-transparent data-[state=active]:border-red-500">
                         <AlertTriangle className={cn("mr-2 h-4 w-4")} />
                        DANGER ZONE
                    </TabsTrigger>
                </TabsList>

                <div className="bg-black/40 border border-blue-900/20 p-6 relative">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500/30" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blue-500/30" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-blue-500/30" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500/30" />

                    <TabsContent value="profile" className="mt-0">
                        <ProfileSettingsTab />
                    </TabsContent>

                    <TabsContent value="ai" className="mt-0">
                        <AISettingsTab />
                    </TabsContent>
                    
                     <TabsContent value="gamification" className="mt-0">
                        <GamificationSettingsTab />
                    </TabsContent>

                    <TabsContent value="notifications" className="mt-0">
                        <NotificationsSettingsTab />
                    </TabsContent>

                    <TabsContent value="data_backup" className="mt-0">
                        <DataBackupTab />
                    </TabsContent>
                    
                    <TabsContent value="analytics" className="mt-0">
                        <AnalyticsTab />
                    </TabsContent>
                    
                    <TabsContent value="danger_zone" className="mt-0">
                        <DangerZoneTab />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

export const SettingsView = memo(SettingsViewComponent);