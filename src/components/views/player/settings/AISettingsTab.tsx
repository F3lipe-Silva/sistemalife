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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useIsMobile } from '@/hooks/use-mobile';

const themeColors = [
    { name: 'Ciano (Padrão)', value: '198 90% 55%' },
    { name: 'Púrpura', value: '262 84% 59%' },
    { name: 'Verde Esmeralda', value: '142 71% 45%' },
    { name: 'Laranja Ardente', value: '25 95% 53%' },
    { name: 'Rosa Elétrico', value: '330 81% 60%' },
    { name: 'Amarelo Dourado', value: '45 93% 47%' },
];

const aiSettingsFormSchema = z.object({
    mission_view_style: z.enum(['inline', 'popup']),
    ai_personality: z.enum(['balanced', 'mentor', 'strategist', 'friendly']),
    theme_accent_color: z.string(),
    reduce_motion: z.boolean(),
    layout_density: z.enum(['compact', 'default', 'comfortable']),
});

export default function AISettingsTab() {
    const { profile, persistData, isDataLoaded } = usePlayerDataContext();
    const [isSaving, setIsSaving] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const { toast } = useToast();
    const isMobile = useIsMobile();

    const form = useForm<z.infer<typeof aiSettingsFormSchema>>({
        resolver: zodResolver(aiSettingsFormSchema),
        defaultValues: {
            mission_view_style: 'inline',
            ai_personality: 'balanced',
            theme_accent_color: '198 90% 55%',
            reduce_motion: false,
            layout_density: 'default',
        },
    });

    useEffect(() => {
        if (profile?.user_settings) {
            form.reset({
                mission_view_style: profile.user_settings.mission_view_style || 'inline',
                ai_personality: profile.user_settings.ai_personality || 'balanced',
                theme_accent_color: profile.user_settings.theme_accent_color || '198 90% 55%',
                reduce_motion: profile.user_settings.reduce_motion || false,
                layout_density: profile.user_settings.layout_density || 'default',
            });
        }
    }, [profile, form, isDataLoaded]);
    
    useEffect(() => {
        const subscription = form.watch((value, { name, type }) => {
            if (name === 'theme_accent_color' && value.theme_accent_color) {
                document.documentElement.style.setProperty('--theme-accent-color', value.theme_accent_color);
            }
             if (name === 'reduce_motion') {
                document.body.classList.toggle('reduce-motion', !!value.reduce_motion);
            }
        });
        return () => subscription.unsubscribe();
    }, [form]);

    const onSubmit = async (data: z.infer<typeof aiSettingsFormSchema>) => {
        setIsSaving(true);
        try {
            const updatedProfile = {
                ...profile,
                user_settings: {
                    ...profile.user_settings,
                    ...data,
                }
            };
            await persistData('profile', updatedProfile);
            toast({
                title: "Preferências Atualizadas!",
                description: "As suas preferências de IA e interface foram salvas.",
            });
            form.reset(data); // Re-sync form state
            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 2000);
        } catch (error) {
            console.error("Erro ao salvar preferências:", error);
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
                            INTERFACE & AI PROTOCOLS
                        </h3>
                        <p className={cn("font-mono text-blue-400/50 text-xs", isMobile ? "text-[10px]" : "")}>CUSTOMIZE SYSTEM INTERACTION</p>
                    </div>

                    <div className={cn("space-y-8", isMobile && "space-y-6")}>
                        <FormField
                            control={form.control}
                            name="theme_accent_color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-mono text-blue-400 uppercase tracking-widest">VISUAL THEME OVERRIDE</FormLabel>
                                    <FormDescription className="text-[10px] font-mono text-blue-500/50">
                                        SELECT SYSTEM ACCENT COLOR.
                                    </FormDescription>
                                    <div className={cn("grid gap-4 pt-2", isMobile ? "grid-cols-3 gap-2" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-6")}>
                                        {themeColors.map((color) => (
                                            <div key={color.value} className="group">
                                                <button
                                                    type="button"
                                                    onClick={() => field.onChange(color.value)}
                                                    className={cn(
                                                        "w-full aspect-square flex items-center justify-center transition-all duration-300 relative overflow-hidden border-2",
                                                        field.value === color.value 
                                                            ? "border-white shadow-[0_0_15px_currentColor]" 
                                                            : "border-white/10 hover:border-white/50"
                                                    )}
                                                    style={{ color: `hsl(${color.value})`, borderColor: field.value === color.value ? `hsl(${color.value})` : undefined }}
                                                >
                                                    <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: `hsl(${color.value})` }} />
                                                    {field.value === color.value && <Check className="text-white mix-blend-screen h-6 w-6 relative z-10" />}
                                                </button>
                                                <p className={cn("text-center mt-2 text-[9px] font-mono uppercase tracking-wider text-gray-500 group-hover:text-white transition-colors", isMobile ? "mt-1" : "")}>{color.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator className="bg-blue-900/30" />
                        
                         <FormField
                            control={form.control}
                            name="layout_density"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel className="text-xs font-mono text-blue-400 uppercase tracking-widest">INTERFACE DENSITY</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                    className={cn("grid gap-4 pt-2", isMobile ? "grid-cols-1 gap-2" : "grid-cols-3")}
                                    >
                                        {['compact', 'default', 'comfortable'].map((density) => (
                                            <FormItem key={density} className="flex items-center space-x-0 space-y-0">
                                                <FormControl>
                                                    <div className={cn(
                                                        "flex w-full items-center justify-center border transition-all duration-200 cursor-pointer relative overflow-hidden group h-12",
                                                        field.value === density 
                                                            ? "border-blue-500 bg-blue-950/30 text-white" 
                                                            : "border-blue-900/30 bg-black/40 text-gray-500 hover:border-blue-500/50 hover:text-gray-300"
                                                    )} onClick={() => field.onChange(density)}>
                                                        <RadioGroupItem value={density} id={`density-${density}`} className="sr-only"/>
                                                        <div className={cn("absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity")} />
                                                        {field.value === density && <div className="absolute left-0 top-0 h-full w-1 bg-blue-500" />}
                                                        <FormLabel htmlFor={`density-${density}`} className={cn("font-mono text-xs uppercase tracking-widest cursor-pointer relative z-10")}>
                                                            {density.toUpperCase()}
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

                         <FormField
                            control={form.control}
                            name="ai_personality"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-mono text-blue-400 uppercase tracking-widest">ARCHITECT PERSONALITY MATRIX</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-black/40 border-blue-900/30 text-white font-mono text-xs h-10 rounded-none focus:ring-blue-500/50">
                                                <SelectValue placeholder="SELECT PERSONALITY MODULE" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-black border-blue-500/30 text-white font-mono text-xs">
                                            <SelectItem value="balanced">BALANCED (DEFAULT)</SelectItem>
                                            <SelectItem value="mentor">WISE MENTOR</SelectItem>
                                            <SelectItem value="strategist">COLD STRATEGIST</SelectItem>
                                            <SelectItem value="friendly">ALLIED PARTNER</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription className="text-[10px] font-mono text-blue-500/50">
                                        ADJUST SYSTEM COMMUNICATION STYLE.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <Separator className="bg-blue-900/30" />

                        <div className="grid grid-cols-1 gap-4">
                            <FormField
                                control={form.control}
                                name="mission_view_style"
                                render={({ field }) => (
                                    <FormItem className={cn("flex items-center justify-between border border-blue-900/20 bg-blue-950/5 p-4", isMobile && "p-3")}>
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-sm font-mono text-blue-300 uppercase">POP-UP QUEST DETAILS</FormLabel>
                                            <FormDescription className="text-[10px] font-mono text-blue-500/50">
                                                OPEN QUEST INTEL IN DEDICATED WINDOW.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value === 'popup'}
                                                onCheckedChange={(checked) => field.onChange(checked ? 'popup' : 'inline')}
                                                className="data-[state=checked]:bg-blue-600"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="reduce_motion"
                                render={({ field }) => (
                                    <FormItem className={cn("flex items-center justify-between border border-blue-900/20 bg-blue-950/5 p-4", isMobile && "p-3")}>
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-sm font-mono text-blue-300 uppercase">REDUCE VISUAL EFFECTS</FormLabel>
                                            <FormDescription className="text-[10px] font-mono text-blue-500/50">
                                                MINIMIZE SYSTEM ANIMATIONS FOR PERFORMANCE.
                                            </FormDescription>
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
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-blue-900/30">
                    <Button type="submit" disabled={isSaving || !form.formState.isDirty || justSaved} className={cn("bg-blue-600 hover:bg-blue-500 text-white font-mono uppercase tracking-widest rounded-none min-w-[150px]", isMobile ? "h-9 text-xs" : "h-10")}>
                         {isSaving ? <LoaderCircle className="animate-spin mr-2 h-4 w-4" /> : justSaved ? <Check className="mr-2 h-4 w-4" /> : "APPLY SETTINGS"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}