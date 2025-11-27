import React from 'react';
import { ShieldAlert, Zap, Clock } from 'lucide-react';
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
        <Card className={cn("bg-gradient-to-br from-purple-900/40 to-red-900/40 border-purple-500/60 animate-in fade-in-50 duration-500 shadow-lg hover:shadow-xl transition-shadow",
            isMobile ? "mt-4" : "mt-3")}>
            <CardHeader className={isMobile ? "p-3" : "p-4"}>
                <div className={cn("items-center gap-3", isMobile ? "flex" : "flex items-center gap-3")}>
                    <ShieldAlert className={isMobile ? "h-6 w-6 text-purple-400" : "h-5 w-5 text-purple-400"} />
                    <div>
                        <CardTitle className={cn("text-purple-300", isMobile ? "text-base" : "text-lg")}>{event.name}</CardTitle>
                        <CardDescription className={isMobile ? "text-xs" : "text-sm"}>{event.description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className={cn("space-y-3", isMobile ? "p-3" : "p-4 space-y-2")}>
                <div>
                    <div className={cn("justify-between mb-1", isMobile ? "flex text-xs text-muted-foreground" : "flex justify-between text-sm text-muted-foreground mb-1")}>
                        <span>Progresso Global</span>
                        <span>{event.progress.toLocaleString()} / {event.goal.target.toLocaleString()}</span>
                    </div>
                    <Progress value={progressPercentage} className={cn("bg-purple-400/20 [&>div]:bg-purple-500", isMobile ? "h-2" : "h-3")} />
                </div>
                <div className={cn("gap-2", isMobile ? "grid grid-cols-2" : "grid grid-cols-2 gap-2")}>
                    <div className={cn("rounded-md", isMobile ? "bg-background/30 p-1" : "bg-background/30 p-2")}>
                        <p className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-xs text-muted-foreground")}>Sua Contribuição</p>
                        <p className={cn("font-bold flex items-center justify-center gap-2", isMobile ? "text-base" : "text-lg font-bold flex items-center justify-center gap-2")}>
                            <Zap className={isMobile ? "h-3 w-3 text-yellow-400" : "h-4 w-4 text-yellow-400"} />
                            {userContribution}
                        </p>
                    </div>
                    <div className={cn("rounded-md", isMobile ? "bg-background/30 p-1" : "bg-background/30 p-2")}>
                        <p className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-xs text-muted-foreground")}>Tempo Restante</p>
                        <p className={cn("font-bold flex items-center justify-center gap-2", isMobile ? "text-base" : "text-lg font-bold flex items-center justify-center gap-2")}>
                            <Clock className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
                            {timeLeft.replace('em ', '')}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
