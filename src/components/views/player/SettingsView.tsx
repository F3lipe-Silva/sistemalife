"use client";

import { memo } from 'react';
import { User, Bot, AlertTriangle, Bell, Database, PieChart, Gamepad2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSettingsTab from './settings/ProfileSettingsTab';
import AISettingsTab from './settings/AISettingsTab';
import DangerZoneTab from './settings/DangerZoneTab';
import NotificationsSettingsTab from './settings/NotificationsSettingsTab';
import DataBackupTab from './settings/DataBackupTab';
import AnalyticsTab from './settings/AnalyticsTab';
import GamificationSettingsTab from './settings/GamificationSettingsTab';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const SettingsViewComponent = () => {
    const isMobile = useIsMobile();
    
    return (
        <div className={cn("h-full overflow-y-auto bg-gradient-to-br from-primary/5 via-secondary/5 to-background", isMobile ? "p-2" : "p-4 md:p-8")}>
            <div className={cn("mb-4 animate-in fade-in slide-in-from-top-2 duration-500", isMobile ? "mb-4" : "mb-8")}>
                <h1 className={cn("font-bold text-primary font-cinzel tracking-wider bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent", isMobile ? "text-2xl" : "text-3xl")}>Ficha de Caçador</h1>
                <p className={cn("text-muted-foreground max-w-3xl", isMobile ? "mt-1 text-sm" : "mt-2")}>
                    Edite os seus dados, personalize a experiência e gira a sua conta no Sistema.
                </p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className={cn("grid w-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 shadow-lg", isMobile ? "grid-cols-7 gap-0.5 mb-2 p-1" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 mb-6 gap-2 p-2")}>
                    <TabsTrigger value="profile" className={cn("transition-all duration-300 hover:scale-[1.02] hover:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-secondary/50 data-[state=inactive]:text-muted-foreground", isMobile ? "text-[8px] py-1 px-0.5" : "")}>
                        <User className={cn("transition-transform duration-200 group-hover:scale-110", isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2")} />
                        {isMobile ? "Perfil" : "Perfil"}
                    </TabsTrigger>
                    <TabsTrigger value="ai" className={cn("transition-all duration-300 hover:scale-[1.02] hover:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-secondary/50 data-[state=inactive]:text-muted-foreground", isMobile ? "text-[8px] py-1 px-0.5" : "")}>
                         <Bot className={cn("transition-transform duration-200 group-hover:scale-110", isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2")} />
                        {isMobile ? "IA" : "IA & Interface"}
                    </TabsTrigger>
                     <TabsTrigger value="gamification" className={cn("transition-all duration-300 hover:scale-[1.02] hover:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-secondary/50 data-[state=inactive]:text-muted-foreground", isMobile ? "text-[8px] py-1 px-0.5" : "")}>
                         <Gamepad2 className={cn("transition-transform duration-200 group-hover:scale-110", isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2")} />
                        {isMobile ? "Game" : "Gamificação"}
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className={cn("transition-all duration-300 hover:scale-[1.02] hover:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-secondary/50 data-[state=inactive]:text-muted-foreground", isMobile ? "text-[8px] py-1 px-0.5" : "")}>
                         <Bell className={cn("transition-transform duration-200 group-hover:scale-110", isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2")} />
                        {isMobile ? "Notif" : "Notificações"}
                    </TabsTrigger>
                    <TabsTrigger value="data_backup" className={cn("transition-all duration-300 hover:scale-[1.02] hover:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-secondary/50 data-[state=inactive]:text-muted-foreground", isMobile ? "text-[8px] py-1 px-0.5" : "")}>
                         <Database className={cn("transition-transform duration-200 group-hover:scale-110", isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2")} />
                        {isMobile ? "Dados" : "Dados & Integrações"}
                    </TabsTrigger>
                     <TabsTrigger value="analytics" className={cn("transition-all duration-300 hover:scale-[1.02] hover:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-secondary/50 data-[state=inactive]:text-muted-foreground", isMobile ? "text-[8px] py-1 px-0.5" : "")}>
                         <PieChart className={cn("transition-transform duration-200 group-hover:scale-110", isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2")} />
                        {isMobile ? "Anal" : "Analytics"}
                    </TabsTrigger>
                    <TabsTrigger value="danger_zone" className={cn("text-red-500 data-[state=active]:text-red-500 data-[state=active]:bg-red-500/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-md data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-red-500/10 data-[state=inactive]:text-red-400/70", isMobile ? "text-[8px] py-1 px-0.5" : "")}>
                         <AlertTriangle className={cn("transition-transform duration-200 group-hover:scale-110", isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2")} />
                        {isMobile ? "Perigo" : "Zona de Perigo"}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <ProfileSettingsTab />
                </TabsContent>

                <TabsContent value="ai">
                    <AISettingsTab />
                </TabsContent>
                
                 <TabsContent value="gamification">
                    <GamificationSettingsTab />
                </TabsContent>

                <TabsContent value="notifications">
                    <NotificationsSettingsTab />
                </TabsContent>

                <TabsContent value="data_backup">
                    <DataBackupTab />
                </TabsContent>
                
                <TabsContent value="analytics">
                    <AnalyticsTab />
                </TabsContent>
                
                <TabsContent value="danger_zone">
                    <DangerZoneTab />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export const SettingsView = memo(SettingsViewComponent);
