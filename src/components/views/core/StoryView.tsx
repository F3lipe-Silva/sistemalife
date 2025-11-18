"use client";

import { memo, useEffect, useRef, useState } from 'react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Swords, Heart, Skull, Sparkles, Settings2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

const GenreIcon = ({ genre }: { genre: string }) => {
    const lowerGenre = genre.toLowerCase();
    if (lowerGenre.includes('ação') || lowerGenre.includes('combate')) return <Swords className="h-4 w-4" />;
    if (lowerGenre.includes('romance') || lowerGenre.includes('amor')) return <Heart className="h-4 w-4" />;
    if (lowerGenre.includes('terror') || lowerGenre.includes('horror')) return <Skull className="h-4 w-4" />;
    if (lowerGenre.includes('magia') || lowerGenre.includes('fantasia')) return <Sparkles className="h-4 w-4" />;
    return <BookOpen className="h-4 w-4" />;
};

const StoryViewComponent = () => {
    const { profile, handleMakeStoryChoice, updateStoryPreferences, resetStory } = usePlayerDataContext();
    const isMobile = useIsMobile();
    const scrollRef = useRef<HTMLDivElement>(null);
    
    const [isNSFW, setIsNSFW] = useState(profile?.story_state?.preferences?.allowNSFW ?? false);
    const [preferredGenre, setPreferredGenre] = useState<string>(profile?.story_state?.preferences?.preferredGenre ?? "");

    const storyState = profile?.story_state;
    const segments = storyState?.segments || [];
    const isGenerating = storyState?.isGenerating || false;
    const canMakeChoice = storyState?.canMakeChoice ?? false;

    useEffect(() => {
        setIsNSFW(storyState?.preferences?.allowNSFW ?? false);
        setPreferredGenre(storyState?.preferences?.preferredGenre ?? "");
    }, [storyState?.preferences?.allowNSFW, storyState?.preferences?.preferredGenre]);

    const handleNSFWChange = (value: boolean) => {
        setIsNSFW(value);
        updateStoryPreferences({ allowNSFW: value });
    };

    const handleGenreChange = (value: string) => {
        setPreferredGenre(value);
        updateStoryPreferences({ preferredGenre: value || undefined });
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [segments.length, isGenerating]);

    if (!profile) return null;

    if (segments.length === 0 && !isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6 animate-in fade-in duration-700">
                <div className="bg-primary/10 p-6 rounded-full">
                    <BookOpen className="h-16 w-16 text-primary" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold font-cinzel text-primary">Sua Lenda Começa Agora</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        O Sistema está pronto para narrar a sua jornada. Suas missões, conquistas e escolhas moldarão uma história única.
                    </p>
                </div>
                
                <div className="flex flex-col gap-4 w-full max-w-xs bg-card/50 p-4 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="nsfw-mode" className="flex items-center gap-2 cursor-pointer">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold">Modo Sem Censura</span>
                        </Label>
                        <input 
                            id="nsfw-mode"
                            type="checkbox" 
                            checked={isNSFW} 
                            onChange={(e) => handleNSFWChange(e.target.checked)}
                            className="h-4 w-4 accent-primary"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Gênero Inicial (Opcional)</Label>
                        <select 
                            className="w-full p-2 rounded-md bg-background border border-input text-sm"
                            value={preferredGenre}
                            onChange={(e) => handleGenreChange(e.target.value)}
                        >
                            <option value="">O Sistema Decide</option>
                            <option value="Ação e Aventura">Ação e Aventura</option>
                            <option value="Fantasia Sombria">Fantasia Sombria</option>
                            <option value="Mistério e Suspense">Mistério e Suspense</option>
                            <option value="Terror">Terror</option>
                            <option value="Romance">Romance</option>
                            <option value="Drama Psicológico">Drama Psicológico</option>
                            <option value="Cyberpunk">Cyberpunk</option>
                        </select>
                    </div>
                </div>

                <div className="max-w-md p-4 rounded-lg border border-dashed border-primary/40 bg-background/50">
                    <p className="text-sm text-muted-foreground">
                        Complete qualquer missão diária ou épica para desbloquear o primeiro capítulo da sua lenda. As escolhas aparecem automaticamente assim que uma missão é concluída.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("h-full flex flex-col", isMobile ? "p-2" : "p-6")}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className={cn("font-cinzel font-bold text-primary tracking-wider", isMobile ? "text-2xl" : "text-4xl")}>
                        CRÓNICAS DO CAÇADOR
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Arco Atual: <span className="text-foreground font-semibold">{storyState?.currentArc || "O Início"}</span>
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Badge variant={canMakeChoice ? "default" : "secondary"} className="flex items-center gap-2 text-xs font-semibold">
                        {canMakeChoice ? (
                            <>
                                <Sparkles className="h-4 w-4" />
                                Escolhas liberadas
                            </>
                        ) : (
                            <>
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                Complete uma missão
                            </>
                        )}
                    </Badge>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Settings2 className="h-5 w-5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4 space-y-4" align="end">
                            <h4 className="font-medium leading-none mb-2">Configurações da Narrativa</h4>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="nsfw-toggle" className="flex flex-col space-y-1">
                                    <span>Modo Sem Censura</span>
                                    <span className="font-normal text-xs text-muted-foreground">Permite conteúdo adulto e violento.</span>
                                </Label>
                                <input 
                                    id="nsfw-toggle"
                                    type="checkbox" 
                                    checked={isNSFW} 
                                    onChange={(e) => handleNSFWChange(e.target.checked)}
                                    className="h-4 w-4 accent-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Gênero Preferido (Próximo Capítulo)</Label>
                                <select 
                                    className="w-full p-2 rounded-md bg-background border border-input text-sm"
                                    value={preferredGenre}
                                    onChange={(e) => handleGenreChange(e.target.value)}
                                >
                                    <option value="">O Sistema Decide</option>
                                    <option value="Ação e Aventura">Ação e Aventura</option>
                                    <option value="Fantasia Sombria">Fantasia Sombria</option>
                                    <option value="Mistério e Suspense">Mistério e Suspense</option>
                                    <option value="Terror">Terror</option>
                                    <option value="Romance">Romance</option>
                                    <option value="Drama Psicológico">Drama Psicológico</option>
                                    <option value="Cyberpunk">Cyberpunk</option>
                                </select>
                            </div>
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={resetStory}
                                className="w-full mt-4"
                            >
                                Resetar História
                            </Button>
                        </PopoverContent>
                    </Popover>

                </div>
            </div>

            <ScrollArea className="flex-1 pr-4">
                <div className="space-y-8 pb-8">
                    {segments.map((segment: any, index: number) => {
                        const isLast = index === segments.length - 1;
                        const hasChoice = !!segment.selectedChoiceId;
                        const choicesLocked = !canMakeChoice;

                        return (
                            <div key={segment.id} className={cn("animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100", isLast ? "mb-4" : "")}>
                                <div className="flex items-center gap-2 mb-2 opacity-70">
                                    <Badge variant="outline" className="text-xs font-mono">
                                        {format(parseISO(segment.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                        <GenreIcon genre={segment.genre} />
                                        {segment.genre}
                                    </Badge>
                                </div>

                                <Card className={cn(
                                    "border-l-4 shadow-md transition-all duration-500",
                                    isLast ? "border-l-primary bg-card/90 ring-1 ring-primary/20" : "border-l-muted bg-card/50 opacity-80 hover:opacity-100"
                                )}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className={cn("font-cinzel", isLast ? "text-2xl text-primary" : "text-xl")}>
                                            {segment.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="prose dark:prose-invert max-w-none leading-relaxed text-foreground/90 whitespace-pre-line font-serif text-lg">
                                            {segment.content}
                                        </div>
                                    </CardContent>
                                    
                                    {/* Choices Section */}
                                    {(isLast || hasChoice) && (
                                        <CardFooter className="flex flex-col gap-3 pt-4 border-t bg-black/20">
                                            {hasChoice ? (
                                                <div className="w-full p-4 rounded-md bg-primary/10 border border-primary/20">
                                                    <p className="text-sm text-muted-foreground mb-1 font-mono uppercase tracking-wider">Escolha Feita</p>
                                                    <p className="font-semibold text-primary italic">
                                                        "{segment.choices.find((c: any) => c.id === segment.selectedChoiceId)?.text}"
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="w-full space-y-3">
                                                    <p className="text-sm font-bold text-center text-muted-foreground uppercase tracking-widest mb-2">
                                                        {choicesLocked ? 'Complete uma missão para decidir' : 'O Destino Aguarda...'}
                                                    </p>
                                                    {choicesLocked && (
                                                        <div className="w-full rounded-md border border-yellow-500/40 bg-yellow-500/10 p-3 text-xs text-yellow-100">
                                                            Ao concluir uma missão, as escolhas deste capítulo serão desbloqueadas automaticamente.
                                                        </div>
                                                    )}
                                                    <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                                                        {segment.choices.map((choice: any) => (
                                                            <Button
                                                                key={choice.id}
                                                                variant="outline"
                                                                className="h-auto py-4 px-6 text-left justify-start whitespace-normal hover:bg-primary hover:text-primary-foreground border-primary/30 transition-all group"
                                                                onClick={() => handleMakeStoryChoice(choice.id)}
                                                                disabled={isGenerating || choicesLocked}
                                                            >
                                                                <span className="font-semibold group-hover:translate-x-1 transition-transform">
                                                                    {choice.text}
                                                                </span>
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </CardFooter>
                                    )}
                                </Card>
                            </div>
                        );
                    })}

                    {isGenerating && (
                        <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-pulse" ref={scrollRef}>
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                                <Loader2 className="h-12 w-12 text-primary animate-spin relative z-10" />
                            </div>
                            <p className="text-primary font-cinzel text-lg animate-pulse">O Sistema está a escrever o destino...</p>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>
        </div>
    );
};

export const StoryView = memo(StoryViewComponent);
