"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { useEffect, useState } from 'react';
import { LoaderCircle, Check } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const gamificationFormSchema = z.object({
    progress_feedback_intensity: z.enum(['subtle', 'default', 'celebratory']),
});

export default function GamificationSettingsTab() {
    const { profile, persistData, isDataLoaded } = usePlayerDataContext();
    const [isSaving, setIsSaving] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const { toast } = useToast();
    const isMobile = useIsMobile();

    const form = useForm<z.infer<typeof gamificationFormSchema>>({
        resolver: zodResolver(gamificationFormSchema),
        defaultValues: {
            progress_feedback_intensity: 'default',
        },
    });

    useEffect(() => {
        if (profile?.user_settings?.gamification) {
            form.reset({
                progress_feedback_intensity: profile.user_settings.gamification.progress_feedback_intensity || 'default',
            });
        }
    }, [profile, form, isDataLoaded]);

    const onSubmit = async (data: z.infer<typeof gamificationFormSchema>) => {
        setIsSaving(true);
        try {
            const updatedProfile = {
                ...profile,
                user_settings: {
                    ...profile.user_settings,
                    gamification: {
                        ...profile.user_settings?.gamification,
                        ...data,
                    }
                }
            };
            await persistData('profile', updatedProfile);
            toast({
                title: "Preferências de Gamificação Salvas!",
                description: "As suas personalizações foram guardadas com sucesso.",
            });
            form.reset(data);
            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 2000);
        } catch (error) {
            console.error("Erro ao salvar preferências de gamificação:", error);
            toast({
                variant: "destructive",
                title: "Erro ao Salvar",
                description: "Não foi possível atualizar as suas preferências.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-6", isMobile && "space-y-4")}>
                <div className="bg-black/60 border border-blue-900/30 p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500/50" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blue-500/50" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-blue-500/50" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500/50" />

                    <div className="mb-6 border-b border-blue-900/30 pb-2">
                        <h3 className={cn("font-bold font-cinzel text-white uppercase tracking-widest flex items-center gap-2", isMobile ? "text-base" : "text-lg")}>
                            GAMEPLAY DYNAMICS
                        </h3>
                        <p className={cn("font-mono text-blue-400/50 text-xs", isMobile ? "text-[10px]" : "")}>ADJUST REWARD SYSTEMS</p>
                    </div>

                    <div className={cn("space-y-6", isMobile && "space-y-4")}>
                       <FormField
                            control={form.control}
                            name="progress_feedback_intensity"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel className="text-xs font-mono text-blue-400 uppercase tracking-widest">FEEDBACK INTENSITY LEVEL</FormLabel>
                                <FormDescription className="text-[10px] font-mono text-blue-500/50">
                                    CALIBRATE SYSTEM RESPONSE TO USER ACHIEVEMENTS.
                                </FormDescription>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                    className={cn("grid gap-4 pt-2", isMobile ? "grid-cols-1 gap-2" : "grid-cols-1 sm:grid-cols-3")}
                                    >
                                        {['subtle', 'default', 'celebratory'].map((intensity) => (
                                            <FormItem key={intensity} className="flex items-center space-x-0 space-y-0">
                                                <FormControl>
                                                    <div className={cn(
                                                        "flex w-full items-center justify-center border transition-all duration-200 cursor-pointer relative overflow-hidden group h-12",
                                                        field.value === intensity
                                                            ? "border-blue-500 bg-blue-950/30 text-white" 
                                                            : "border-blue-900/30 bg-black/40 text-gray-500 hover:border-blue-500/50 hover:text-gray-300"
                                                    )} onClick={() => field.onChange(intensity)}>
                                                        <RadioGroupItem value={intensity} id={`intensity-${intensity}`} className="sr-only"/>
                                                        <div className={cn("absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity")} />
                                                        {field.value === intensity && <div className="absolute left-0 top-0 h-full w-1 bg-blue-500" />}
                                                        <FormLabel htmlFor={`intensity-${intensity}`} className={cn("font-mono text-xs uppercase tracking-widest cursor-pointer relative z-10")}>
                                                            {intensity.toUpperCase()}
                                                        </FormLabel>
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <Separator className="bg-blue-900/30" />
                         <div className={cn(
                            "flex flex-col items-center justify-center text-center border-2 border-dashed border-blue-900/30 bg-blue-950/5 rounded-none",
                            isMobile ? "h-32 p-4" : "h-48 p-8"
                         )}>
                            <p className={cn("font-bold text-blue-400 font-mono text-xs uppercase tracking-widest", isMobile ? "text-[10px]" : "text-sm")}>ADDITIONAL MODULES LOCKED</p>
                            <p className={cn("mt-1 text-blue-500/40 font-mono text-xs", isMobile ? "text-[10px]" : "")}>
                                SYSTEM UPDATE IN PROGRESS. BADGES & TITLES COMING SOON.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-blue-900/30">
                    <Button type="submit" disabled={isSaving || !form.formState.isDirty || justSaved} className={cn("bg-blue-600 hover:bg-blue-500 text-white font-mono uppercase tracking-widest rounded-none min-w-[150px]", isMobile ? "h-9 text-xs" : "h-10")}>
                         {isSaving ? <LoaderCircle className="animate-spin mr-2 h-4 w-4" /> : justSaved ? <Check className="mr-2 h-4 w-4" /> : "UPDATE SYSTEM"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}