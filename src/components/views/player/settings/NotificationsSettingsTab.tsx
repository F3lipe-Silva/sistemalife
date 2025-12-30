"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { usePlayerNotifications } from '@/hooks/use-player-notifications';
import { useEffect, useState } from 'react';
import { LoaderCircle, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bell, BellOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const notificationsFormSchema = z.object({
    daily_briefing: z.boolean(),
    goal_completed: z.boolean(),
    level_up: z.boolean(),
    quiet_hours: z.object({
        enabled: z.boolean(),
        start: z.string(),
        end: z.string(),
    }),
});

export default function NotificationsSettingsTab() {
    const { profile, persistData } = usePlayerDataContext();
    const { 
        pushNotificationSupported, 
        pushNotificationEnabled, 
        enablePushNotifications, 
        disablePushNotifications 
    } = usePlayerNotifications(profile);
    const [isSaving, setIsSaving] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const [enablingPush, setEnablingPush] = useState(false);
    const { toast } = useToast();
    const isMobile = useIsMobile();

    const form = useForm<z.infer<typeof notificationsFormSchema>>({
        resolver: zodResolver(notificationsFormSchema),
        defaultValues: {
            daily_briefing: true,
            goal_completed: true,
            level_up: true,
            quiet_hours: {
                enabled: false,
                start: '22:00',
                end: '08:00',
            }
        },
    });

    useEffect(() => {
        if (profile?.user_settings?.notifications) {
            form.reset({
                daily_briefing: profile.user_settings.notifications.daily_briefing !== false,
                goal_completed: profile.user_settings.notifications.goal_completed !== false,
                level_up: profile.user_settings.notifications.level_up !== false,
                quiet_hours: {
                    enabled: profile.user_settings.notifications.quiet_hours?.enabled || false,
                    start: profile.user_settings.notifications.quiet_hours?.start || '22:00',
                    end: profile.user_settings.notifications.quiet_hours?.end || '08:00',
                }
            });
        }
    }, [profile, form]);

    const onSubmit = async (data: z.infer<typeof notificationsFormSchema>) => {
        setIsSaving(true);
        try {
            const updatedProfile = {
                ...profile,
                user_settings: {
                    ...profile.user_settings,
                    notifications: data
                }
            };
            
            await persistData('profile', updatedProfile);
            
            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 2000);
            
            toast({
                title: "Configurações atualizadas",
                description: "As suas preferências de notificação foram guardadas.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Não foi possível guardar as configurações. Por favor, tente novamente.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleEnablePushNotifications = async () => {
        setEnablingPush(true);
        try {
            const success = await enablePushNotifications();
            if (success) {
                toast({
                    title: "Notificações ativadas",
                    description: "As notificações push foram ativadas com sucesso.",
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Erro",
                    description: "Não foi possível ativar as notificações push. Por favor, verifique as permissões do seu navegador.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Ocorreu um erro ao ativar as notificações push.",
            });
        } finally {
            setEnablingPush(false);
        }
    };

    const handleDisablePushNotifications = async () => {
        try {
            const success = await disablePushNotifications();
            if (success) {
                toast({
                    title: "Notificações desativadas",
                    description: "As notificações push foram desativadas.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Ocorreu um erro ao desativar as notificações push.",
            });
        }
    };

    return (
        <div className={cn("space-y-6", isMobile && "space-y-4")}>
            <div className="bg-black/60 border border-blue-900/30 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500/50" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blue-500/50" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-blue-500/50" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500/50" />

                <div className="mb-6 border-b border-blue-900/30 pb-2">
                    <h3 className={cn("font-bold font-cinzel text-white uppercase tracking-widest flex items-center gap-2", isMobile ? "text-base" : "text-lg")}>
                        PUSH COMMUNICATION
                    </h3>
                    <p className={cn("font-mono text-blue-400/50 text-xs", isMobile ? "text-[10px]" : "")}>EXTERNAL ALERT CONFIGURATION</p>
                </div>

                <div className={cn("space-y-4", isMobile && "space-y-2")}>
                    {!pushNotificationSupported ? (
                        <div className={cn("bg-red-950/20 border border-red-500/30 p-4 flex items-start gap-3", isMobile ? "p-3" : "")}>
                            <AlertTitle className="text-red-500 font-mono text-xs uppercase tracking-widest">ERROR: UNSUPPORTED DEVICE</AlertTitle>
                            <AlertDescription className="text-red-400/70 font-mono text-xs">
                                HARDWARE/SOFTWARE INCOMPATIBLE. UPDATE REQUIRED.
                            </AlertDescription>
                        </div>
                    ) : (
                        <div className={cn("flex items-center justify-between gap-4 border border-blue-900/20 bg-blue-950/5 p-4", isMobile ? "flex-col items-start gap-2 p-3" : "flex-row")}>
                            <div className={cn("space-y-1", isMobile && "space-y-0")}>
                                <h4 className={cn("font-bold text-white font-mono uppercase tracking-wide", isMobile ? "text-xs" : "text-sm")}>PUSH ALERTS</h4>
                                <p className={cn("text-gray-500 font-mono text-xs", isMobile ? "text-[10px]" : "")}>
                                    {pushNotificationEnabled 
                                        ? "STATUS: ACTIVE" 
                                        : "STATUS: INACTIVE - ENABLE FOR REAL-TIME UPDATES"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {pushNotificationEnabled ? (
                                    <Button 
                                        variant="outline" 
                                        onClick={handleDisablePushNotifications}
                                        disabled={enablingPush}
                                        className={cn("bg-red-900/20 border-red-500/30 text-red-400 hover:bg-red-900/40 hover:text-white rounded-none font-mono text-xs uppercase tracking-widest h-8", isMobile ? "w-full" : "")}
                                    >
                                        <BellOff className={cn("mr-2", isMobile ? "h-3 w-3" : "h-3 w-3")} />
                                        DEACTIVATE
                                    </Button>
                                ) : (
                                    <Button 
                                        onClick={handleEnablePushNotifications}
                                        disabled={enablingPush}
                                        className={cn("bg-blue-600 hover:bg-blue-500 text-white rounded-none font-mono text-xs uppercase tracking-widest h-8", isMobile ? "w-full" : "")}
                                    >
                                        {enablingPush ? (
                                            <LoaderCircle className={cn("mr-2 animate-spin", isMobile ? "h-3 w-3" : "h-3 w-3")} />
                                        ) : (
                                            <Bell className={cn("mr-2", isMobile ? "h-3 w-3" : "h-3 w-3")} />
                                        )}
                                        ACTIVATE
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {pushNotificationEnabled && (
                        <div className={cn("bg-blue-950/10 border border-blue-500/20 p-4", isMobile ? "p-3" : "")}>
                            <div className="flex items-center gap-2 mb-2">
                                <Bell className={cn("h-4 w-4 text-blue-400", isMobile ? "h-3 w-3" : "")} />
                                <span className={cn("text-blue-400 font-bold font-mono text-xs uppercase tracking-widest", isMobile ? "text-[10px]" : "")}>ACTIVE CHANNELS</span>
                            </div>
                            <ul className={cn("list-none space-y-1 pl-6 border-l border-blue-500/20", isMobile ? "space-y-0.5" : "space-y-1")}>
                                {['MISSION COMPLETION', 'LEVEL UP', 'ACHIEVEMENT UNLOCKED', 'SKILL DECAY WARNING', 'STREAK BONUS'].map((item) => (
                                    <li key={item} className="text-[10px] font-mono text-gray-400 uppercase tracking-wide">
                                        &gt; {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-black/60 border border-blue-900/30 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500/50" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blue-500/50" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-blue-500/50" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500/50" />

                <div className="mb-6 border-b border-blue-900/30 pb-2">
                    <h3 className={cn("font-bold font-cinzel text-white uppercase tracking-widest flex items-center gap-2", isMobile ? "text-base" : "text-lg")}>
                        ALERT PREFERENCES
                    </h3>
                    <p className={cn("font-mono text-blue-400/50 text-xs", isMobile ? "text-[10px]" : "")}>CUSTOMIZE NOTIFICATION TYPES</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-6", isMobile && "space-y-4")}>
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="daily_briefing"
                                render={({ field }) => (
                                    <FormItem className={cn("flex items-center justify-between border border-blue-900/20 bg-blue-950/5 p-3", isMobile && "p-2")}>
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-xs font-mono text-blue-300 uppercase tracking-wide">DAILY BRIEFING</FormLabel>
                                            <FormDescription className="text-[10px] font-mono text-blue-500/50">Mission summary report.</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="data-[state=checked]:bg-blue-600"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="goal_completed"
                                render={({ field }) => (
                                    <FormItem className={cn("flex items-center justify-between border border-blue-900/20 bg-blue-950/5 p-3", isMobile && "p-2")}>
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-xs font-mono text-blue-300 uppercase tracking-wide">OBJECTIVE COMPLETED</FormLabel>
                                            <FormDescription className="text-[10px] font-mono text-blue-500/50">Target acquisition alert.</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="data-[state=checked]:bg-blue-600"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="level_up"
                                render={({ field }) => (
                                    <FormItem className={cn("flex items-center justify-between border border-blue-900/20 bg-blue-950/5 p-3", isMobile && "p-2")}>
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-xs font-mono text-blue-300 uppercase tracking-wide">LEVEL UP</FormLabel>
                                            <FormDescription className="text-[10px] font-mono text-blue-500/50">Rank advancement notification.</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="data-[state=checked]:bg-blue-600"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        <Separator className="bg-blue-900/30" />
                        
                        <div className={cn("space-y-4", isMobile && "space-y-2")}>
                            <div>
                                <h3 className={cn("font-bold text-white font-mono uppercase tracking-wide text-sm", isMobile ? "text-xs" : "")}>SILENT MODE</h3>
                                <p className={cn("text-gray-500 font-mono text-xs", isMobile ? "text-[10px]" : "")}>
                                    SUPPRESS NOTIFICATIONS DURING DESIGNATED HOURS.
                                </p>
                            </div>
                            
                            <FormField
                                control={form.control}
                                name="quiet_hours.enabled"
                                render={({ field }) => (
                                    <FormItem className={cn("flex items-center justify-between border border-blue-900/20 bg-blue-950/5 p-3", isMobile && "p-2")}>
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-xs font-mono text-blue-300 uppercase tracking-wide">ENABLE SILENT PROTOCOL</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="data-[state=checked]:bg-blue-600"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            
                            {form.watch("quiet_hours.enabled") && (
                                <div className={cn("grid gap-4 pl-4 border-l-2 border-blue-900/30", isMobile ? "grid-cols-1 gap-2" : "grid-cols-2")}>
                                    <FormField
                                        control={form.control}
                                        name="quiet_hours.start"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-mono text-gray-400 uppercase">START TIME</FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...field} className={cn("bg-black/40 border-blue-900/30 text-white font-mono text-xs h-8 rounded-none focus:ring-blue-500/50", isMobile ? "text-xs" : "")} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="quiet_hours.end"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-mono text-gray-400 uppercase">END TIME</FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...field} className={cn("bg-black/40 border-blue-900/30 text-white font-mono text-xs h-8 rounded-none focus:ring-blue-500/50", isMobile ? "text-xs" : "")} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-end pt-4 border-t border-blue-900/30">
                            <Button type="submit" disabled={isSaving} className={cn("bg-blue-600 hover:bg-blue-500 text-white font-mono uppercase tracking-widest rounded-none min-w-[150px]", isMobile ? "h-9 text-xs" : "h-10")}>
                                {isSaving ? (
                                    <>
                                        <LoaderCircle className={cn("mr-2 animate-spin", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                                        {isMobile ? "SAVING..." : "SAVING..."}
                                    </>
                                ) : justSaved ? (
                                    <>
                                        <Check className={cn("mr-2", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                                        {isMobile ? "SAVED" : "SAVED"}
                                    </>
                                ) : (
                                    isMobile ? "SAVE" : "SAVE CONFIG"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}