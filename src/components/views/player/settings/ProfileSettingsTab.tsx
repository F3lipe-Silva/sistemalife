
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { generateHunterAvatar } from '@/lib/ai-client';
import { LoaderCircle, Wand2, Check } from 'lucide-react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const getProfileRank = (level: number) => {
    if (level <= 5) return 'Novato (F)';
    if (level <= 10) return 'Iniciante (E)';
    if (level <= 20) return 'Adepto (D)';
    if (level <= 30) return 'Experiente (C)';
    if (level <= 40) return 'Perito (B)';
    if (level <= 50) return 'Mestre (A)';
    if (level <= 70) return 'Grão-Mestre (S)';
    if (level <= 90) return 'Herói (SS)';
    return 'Lendário (SSS)';
};

const profileFormSchema = z.object({
    primeiro_nome: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }).max(30),
    apelido: z.string().min(2, { message: "O apelido deve ter pelo menos 2 caracteres." }).max(30),
    genero: z.string().max(30).optional(),
    nacionalidade: z.string().max(50).optional(),
    avatar_url: z.string().url({ message: "Por favor, insira um URL válido." }).or(z.literal('')),
    privacy_settings: z.object({
        profile_visibility: z.enum(['public', 'private']),
        analytics_opt_in: z.boolean(),
    })
});

export default function ProfileSettingsTab() {
    const { profile, persistData } = usePlayerDataContext();
    const [isSaving, setIsSaving] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
    const { toast } = useToast();
    const isMobile = useIsMobile();

    const form = useForm<z.infer<typeof profileFormSchema>>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            primeiro_nome: '',
            apelido: '',
            genero: '',
            nacionalidade: '',
            avatar_url: '',
            privacy_settings: {
                profile_visibility: 'public',
                analytics_opt_in: true,
            }
        },
    });

    useEffect(() => {
        if (profile) {
            form.reset({
                primeiro_nome: profile.primeiro_nome || '',
                apelido: profile.apelido || '',
                genero: profile.genero || 'Não especificado',
                nacionalidade: profile.nacionalidade || 'Não especificada',
                avatar_url: profile.avatar_url || '',
                privacy_settings: {
                    profile_visibility: profile.user_settings?.privacy_settings?.profile_visibility || 'public',
                    analytics_opt_in: profile.user_settings?.privacy_settings?.analytics_opt_in !== false,
                }
            });
        }
    }, [profile, form]);

    const onSubmit = async (data: z.infer<typeof profileFormSchema>) => {
        setIsSaving(true);
        try {
             const updatedProfile = {
                ...profile,
                primeiro_nome: data.primeiro_nome,
                apelido: data.apelido,
                genero: data.genero,
                nacionalidade: data.nacionalidade,
                avatar_url: data.avatar_url,
                user_settings: {
                    ...profile.user_settings,
                    privacy_settings: data.privacy_settings,
                }
            };
            await persistData('profile', updatedProfile);

            toast({
                title: "Perfil Atualizado!",
                description: "Os seus dados foram alterados com sucesso.",
            });
            form.reset(data); // Re-sync form state
            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 2000);
        } catch (error) {
            console.error("Erro ao salvar perfil:", error);
            toast({
                variant: "destructive",
                title: "Erro ao Salvar",
                description: "Não foi possível atualizar o seu perfil. Tente novamente.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleGenerateAvatar = async () => {
        setIsGeneratingAvatar(true);
        try {
            const stats = Object.entries(profile.estatisticas)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 2)
                .map(([key]) => key);

            const result = await generateHunterAvatar({
                level: profile.nivel,
                rank: getProfileRank(profile.nivel),
                gender: form.getValues('genero'),
                topStats: stats,
            });

            if (result.avatarDataUri) {
                form.setValue('avatar_url', result.avatarDataUri, { shouldDirty: true });
                toast({
                    title: "Avatar Gerado!",
                    description: "Um novo avatar foi criado para si. Não se esqueça de salvar as alterações."
                });
            }
        } catch (error) {
            console.error("Erro ao gerar avatar:", error);
            toast({
                variant: "destructive",
                title: "Falha na Geração",
                description: "Não foi possível gerar um avatar. Tente novamente mais tarde.",
            });
        } finally {
            setIsGeneratingAvatar(false);
        }
    }

    const watchedAvatarUrl = form.watch('avatar_url');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-6", isMobile ? "space-y-4" : "space-y-8")}>
                <div className="bg-black/60 border border-blue-900/30 p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500/50" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blue-500/50" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-blue-500/50" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500/50" />

                    <div className="mb-6 border-b border-blue-900/30 pb-2">
                        <h3 className={cn("font-bold font-cinzel text-white uppercase tracking-widest flex items-center gap-2", isMobile ? "text-base" : "text-lg")}>
                            <span className="text-blue-500">ID</span> IDENTIFICATION DATA
                        </h3>
                        <p className={cn("font-mono text-blue-400/50 text-xs", isMobile ? "text-[10px]" : "")}>UPDATE PLAYER CREDENTIALS</p>
                    </div>

                    <div className={cn("grid gap-8", isMobile ? "grid-cols-1 gap-6" : "grid-cols-1 md:grid-cols-3")}>
                        {/* Avatar Section */}
                        <div className={cn("flex flex-col items-center gap-4", isMobile ? "" : "md:col-span-1")}>
                            <div className={cn("w-full border-2 border-blue-500/30 bg-blue-950/10 relative p-1", isMobile ? "max-w-[140px] aspect-[4/5]" : "max-w-[200px] aspect-[4/5]")}>
                                <div className="absolute top-0 left-0 w-full h-full border border-blue-500/10 pointer-events-none" />
                                <Avatar className="w-full h-full rounded-none">
                                    <AvatarImage src={watchedAvatarUrl} alt={form.getValues('primeiro_nome')} className="object-cover" />
                                    <AvatarFallback className="bg-blue-950 rounded-none text-blue-400 text-4xl font-cinzel">
                                        {form.getValues('primeiro_nome')?.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                {isGeneratingAvatar && (
                                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center border border-blue-500/50">
                                        <LoaderCircle className={cn("text-blue-500 animate-spin mb-2", isMobile ? "h-6 w-6" : "h-8 w-8")} />
                                        <span className="text-[10px] font-mono text-blue-400 animate-pulse">GENERATING...</span>
                                    </div>
                                )}
                            </div>
                            <Button type="button" onClick={handleGenerateAvatar} disabled={isGeneratingAvatar} className={cn("w-full bg-blue-900/20 hover:bg-blue-900/40 border border-blue-500/30 text-blue-300 font-mono text-xs uppercase tracking-widest rounded-none", isMobile ? "max-w-[140px] h-8" : "max-w-[200px]")}>
                                <Wand2 className={cn("mr-2", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                                {isGeneratingAvatar ? "PROCESSING" : "AI GENERATION"}
                            </Button>
                            
                            <FormField
                                control={form.control}
                                name="avatar_url"
                                render={({ field }) => (
                                    <FormItem className={cn("w-full", isMobile ? "max-w-[140px]" : "max-w-[200px]")}>
                                        <FormLabel className="text-[10px] font-mono text-blue-500/70 uppercase">IMAGE SOURCE URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="HTTPS://..." {...field} className={cn("h-8 bg-black/40 border-blue-900/30 text-blue-100 font-mono text-xs rounded-none focus-visible:ring-blue-500/50", isMobile ? "text-[10px]" : "")} />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-mono text-red-400" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Fields Section */}
                        <div className={cn("grid gap-5", isMobile ? "gap-4" : "md:col-span-2 grid-cols-1 sm:grid-cols-2 content-start")}>
                            <FormField
                                control={form.control}
                                name="primeiro_nome"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-mono text-blue-400 uppercase tracking-widest">FIRST NAME</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ENTER NAME" {...field} className="bg-black/40 border-blue-900/30 text-white font-mono rounded-none focus-visible:ring-blue-500/50 h-10" />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-mono text-red-400" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="apelido"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-mono text-blue-400 uppercase tracking-widest">CODENAME</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ENTER ALIAS" {...field} className="bg-black/40 border-blue-900/30 text-white font-mono rounded-none focus-visible:ring-blue-500/50 h-10" />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-mono text-red-400" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="genero"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-mono text-blue-400 uppercase tracking-widest">GENDER</FormLabel>
                                        <FormControl>
                                            <Input placeholder="UNSPECIFIED" {...field} className="bg-black/40 border-blue-900/30 text-white font-mono rounded-none focus-visible:ring-blue-500/50 h-10" />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-mono text-red-400" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="nacionalidade"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-mono text-blue-400 uppercase tracking-widest">ORIGIN</FormLabel>
                                        <FormControl>
                                            <Input placeholder="UNKNOWN" {...field} className="bg-black/40 border-blue-900/30 text-white font-mono rounded-none focus-visible:ring-blue-500/50 h-10" />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-mono text-red-400" />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                 <div className="bg-black/60 border border-blue-900/30 p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500/50" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blue-500/50" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-blue-500/50" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500/50" />

                    <div className="mb-4 border-b border-blue-900/30 pb-2">
                        <h3 className={cn("font-bold font-cinzel text-white uppercase tracking-widest", isMobile ? "text-base" : "text-lg")}>PRIVACY PROTOCOLS</h3>
                        <CardDescription className={cn("font-mono text-blue-400/50 text-xs mt-1", isMobile ? "text-[10px]" : "")}>CONFIGURE DATA VISIBILITY PARAMETERS</CardDescription>
                    </div>
                    
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="privacy_settings.profile_visibility"
                            render={({ field }) => (
                                <FormItem className={cn("flex items-center justify-between p-3 border border-blue-900/20 bg-blue-950/5", isMobile ? "p-2" : "")}>
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-sm font-mono text-blue-300 uppercase">PUBLIC PROFILE</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value === 'public'}
                                            onCheckedChange={(checked) => field.onChange(checked ? 'public' : 'private')}
                                            className="data-[state=checked]:bg-blue-600"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="privacy_settings.analytics_opt_in"
                            render={({ field }) => (
                                <FormItem className={cn("flex items-center justify-between p-3 border border-blue-900/20 bg-blue-950/5", isMobile ? "p-2" : "")}>
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-sm font-mono text-blue-300 uppercase">SYSTEM DATA ANALYSIS</FormLabel>
                                        <FormDescription className="text-[10px] font-mono text-blue-500/50">
                                           ALLOW SYSTEM OPTIMIZATION BASED ON PERFORMANCE.
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


                <div className="flex justify-end pt-4 border-t border-blue-900/30">
                     <Button type="submit" disabled={isSaving || !form.formState.isDirty || justSaved} className={cn("bg-blue-600 hover:bg-blue-500 text-white font-mono uppercase tracking-widest rounded-none min-w-[150px]", isMobile ? "h-9 text-xs" : "h-10")}>
                        {isSaving ? <LoaderCircle className="animate-spin mr-2 h-4 w-4" /> : justSaved ? <Check className="mr-2 h-4 w-4" /> : "SAVE CHANGES"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
