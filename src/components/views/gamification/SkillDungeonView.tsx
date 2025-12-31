"use client";

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, KeySquare, Sparkles, LoaderCircle, CheckCircle, Trophy } from 'lucide-react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


const SkillDungeonView = ({ onExit }: { onExit: () => void }) => {
    const { profile, skills, generateDungeonChallenge, completeDungeonChallenge, clearDungeonSession } = usePlayerDataContext();
    const [isLoading, setIsLoading] = useState(false);
    const [submission, setSubmission] = useState('');
    const { toast } = useToast();

    const dungeonSession = profile?.dungeon_session;
    const skill = useMemo(() => skills.find((s: any) => s.id === dungeonSession?.skillId), [skills, dungeonSession]);
    
    const handleGenerateChallenge = useCallback(async () => {
        if (!skill) return;
        setIsLoading(true);
        try {
            await generateDungeonChallenge();
            toast({ title: "Novo Desafio Gerado!", description: "O seu próximo desafio na masmorra está pronto."});
        } catch (error) {
            console.error("Error generating dungeon challenge:", error);
            toast({ variant: 'destructive', title: 'Erro de IA', description: 'Não foi possível gerar um novo desafio. Tente novamente.' });
        } finally {
            setIsLoading(false);
        }
    }, [skill, generateDungeonChallenge, toast]);

    const handleGiveUp = async () => {
        if (!dungeonSession?.challenge) return;
        await clearDungeonSession(false); // Pass false to not exit the view
        toast({ variant: 'destructive', title: 'Você Desistiu!', description: 'O desafio foi descartado. Você pode gerar um novo para esta sala.' });
    }

    const handleCompleteChallenge = async () => {
        if (!submission.trim()) {
            toast({ variant: 'destructive', title: 'Submissão Vazia', description: 'Você precisa de fornecer uma prova de conclusão.' });
            return;
        }
        setIsLoading(true);
        const success = await completeDungeonChallenge(submission);
        if (success) {
            setSubmission('');
        }
        setIsLoading(false);
    }

    if (!dungeonSession || !skill) {
        return (
            <div className="p-4 md:p-6 h-full flex flex-col items-center justify-center text-center">
                <p className="text-destructive text-lg">Erro: Sessão da masmorra inválida.</p>
                <Button onClick={onExit} className="mt-4">Voltar</Button>
            </div>
        );
    }
    
    const { roomLevel = 1, challenge } = dungeonSession;
    const currentRoom = Number(roomLevel);

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-shrink-0 p-3 md:p-4 pb-2 border-b border-primary/10">
                <Button onClick={() => clearDungeonSession(true)} variant="ghost" size="sm" className="mb-2 h-7 px-2 text-xs">
                    <ArrowLeft className="mr-1.5 h-3 w-3" />
                    Sair
                </Button>
                 <div className="text-center">
                    <div className="inline-block bg-primary/10 p-1.5 md:p-2 rounded-full border border-primary/20 mb-1.5">
                        <KeySquare className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <h1 className="text-lg md:text-xl font-bold text-primary font-cinzel tracking-wider">Masmorra: {skill.nome}</h1>
                    <p className="text-muted-foreground mt-0.5 text-[10px] md:text-xs">
                        Desafios práticos e focados
                    </p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-3 md:p-4 overflow-y-auto">
                {isLoading ? (
                     <div className="text-center">
                        <LoaderCircle className="h-10 w-10 md:h-12 md:w-12 text-primary animate-spin mx-auto mb-2"/>
                        <h2 className="text-base md:text-lg font-bold">Processando...</h2>
                    </div>
                ) : challenge ? (
                    <Card className="w-full max-w-2xl">
                        <CardHeader className="text-center p-3 md:p-4 pb-2">
                             <CardDescription className="text-xs md:text-sm">Sala {currentRoom}</CardDescription>
                            <CardTitle className="text-base md:text-lg">{challenge.challengeName}</CardTitle>
                             <span className="text-primary font-bold text-xs">+{challenge.xpReward} XP</span>
                        </CardHeader>
                        <CardContent className="space-y-3 p-3 md:p-4">
                            <p className="text-center text-muted-foreground text-xs md:text-sm">{challenge.challengeDescription}</p>
                             <div>
                                <Label htmlFor="challenge-submission" className="font-semibold text-muted-foreground text-xs">Prova de Conclusão</Label>
                                <Textarea
                                    id="challenge-submission"
                                    placeholder={challenge.successCriteria}
                                    className="mt-1.5 min-h-[80px] md:min-h-[100px] font-mono text-xs"
                                    value={submission}
                                    onChange={(e) => setSubmission(e.target.value)}
                                />
                             </div>
                        </CardContent>
                        <CardFooter className="flex-col sm:flex-row gap-2 p-3 md:p-4 pt-0">
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                     <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs h-8">Desistir</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Desistir do Desafio?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Isto irá gerar um novo desafio para esta sala.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleGiveUp}>Sim, Desistir</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                             <Button size="sm" className="w-full sm:w-auto text-xs h-8" onClick={handleCompleteChallenge} disabled={!submission.trim()}>Completar</Button>
                        </CardFooter>
                    </Card>
                ) : (
                    <div className="text-center">
                        <Trophy className="h-10 w-10 md:h-12 md:w-12 text-yellow-400 mx-auto mb-2" />
                        <h2 className="text-base md:text-lg font-bold">Sala {currentRoom - 1} Concluída!</h2>
                        <p className="text-muted-foreground mt-1 mb-3 text-xs md:text-sm">Pronto para o próximo desafio</p>
                        <Button size="sm" onClick={handleGenerateChallenge} className="h-8 text-xs">
                            <Sparkles className="mr-1.5 h-3 w-3" />
                            Sala {currentRoom}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SkillDungeonView;
