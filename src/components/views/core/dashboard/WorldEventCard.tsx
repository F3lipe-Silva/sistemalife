import React from 'react';
import { ShieldAlert, Zap, Clock, Users, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WorldEventCardProps {
    event: any;
    userContribution: number;
    isMobile?: boolean;
}

export const WorldEventCard = ({ event, userContribution, isMobile = false }: WorldEventCardProps) => {
    if (!event || !event.isActive) return null;

    const progressPercentage = (event.progress / event.goal.target) * 100;
    const endDate = parseISO(event.endDate);
    const timeLeft = formatDistanceToNow(endDate, { locale: ptBR, addSuffix: true });

    return (
        <Card className={cn(
            "bg-gradient-to-br from-purple-900/40 to-red-900/40 border-purple-500/60",
            "animate-in fade-in-50 duration-500 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]",
            "backdrop-blur-sm"
        )}>
    return (
        <Card className={cn(
            "bg-gradient-to-br from-purple-900/50 via-red-900/30 to-orange-900/50 border-purple-500/50",
            "animate-in fade-in-50 duration-700 shadow-2xl hover:shadow-purple-500/20 transition-all hover:scale-[1.02]",
            "backdrop-blur-md relative overflow-hidden"
        )}>
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl" />
            </div>

            <CardHeader className="p-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <ShieldAlert className="h-8 w-8 text-purple-400 animate-pulse" />
                        <div className="absolute -inset-1 bg-purple-400/20 rounded-full blur-sm animate-pulse" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-purple-200 text-2xl font-cinzel mb-2">Evento Mundial Ativo</CardTitle>
                        <CardDescription className="text-purple-300/80 text-base leading-relaxed">
                            {event.description}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-8 space-y-8 relative z-10">
                {/* Progress Section - Enhanced */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Target className="h-5 w-5 text-purple-400" />
                            <span className="text-base font-semibold text-foreground">Progresso da Comunidade</span>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-mono font-bold text-purple-300">
                                {event.progress.toLocaleString()} / {event.goal.target.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Progress
                            value={progressPercentage}
                            className="bg-purple-400/20 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-red-500 h-4"
                        />
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Meta coletiva</span>
                            <span className="text-2xl font-bold text-purple-300">{progressPercentage.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid - Enhanced */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-2xl p-6 text-center border border-yellow-500/20">
                        <div className="flex items-center justify-center mb-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                <Zap className="h-5 w-5 text-yellow-400" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 font-medium">Sua Contribuição</p>
                        <p className="text-3xl font-bold text-yellow-400">
                            {userContribution}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">pontos</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-2xl p-6 text-center border border-orange-500/20">
                        <div className="flex items-center justify-center mb-3">
                            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-orange-400" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 font-medium">Tempo Restante</p>
                        <p className="text-2xl font-bold text-orange-400">
                            {timeLeft.replace('em ', '')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">até o fim</p>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="pt-4 border-t border-purple-500/20">
                    <div className="flex items-center justify-center gap-3">
                        <Users className="h-5 w-5 text-purple-400" />
                        <span className="text-sm text-muted-foreground">Evento comunitário • Todos podem contribuir</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
        </Card>
    )
}
