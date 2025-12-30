"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, LoaderCircle, Sparkles, TrendingUp, Target, Activity, ShieldCheck, Zap } from 'lucide-react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo, useState, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { generateAnalyticsInsights } from '@/ai/flows/generate-analytics-insights';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const iconMap = {
    TrendingUp,
    Target,
    Activity,
    BarChart,
    Sparkles,
    Zap,
    ShieldCheck,
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-sm border border-border p-2 rounded-md shadow-lg">
        <p className="font-bold text-foreground">{label}</p>
        <p className="text-sm text-primary">{`Contagem: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};


export default function AnalyticsTab() {
    const { metas, missions, isDataLoaded } = usePlayerDataContext();
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);
    const [insights, setInsights] = useState<any[]>([]);
    const { toast } = useToast();
    const isMobile = useIsMobile();

    const goalsByCategory = useMemo(() => {
        if (!metas || metas.length === 0) return [];
        
        const categoryCount = metas.reduce((acc: { [key: string]: number }, meta: { categoria: string }) => {
            const category = meta.categoria || "Sem Categoria";
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(categoryCount).map(([name, count]) => ({ name, count }));

    }, [metas]);
    
    const weeklyProductivity = useMemo(() => {
        if (!missions || missions.length === 0) return [];
        
        const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), i));
        
        const data = last7Days.map(date => {
            const dateString = date.toISOString().split('T')[0];
            const count = missions
                .flatMap((m: { missoes_diarias: any[]; }) => m.missoes_diarias || [])
                .filter((dm: { concluido: any; completed_at: string | number | Date; }) => dm.concluido && dm.completed_at?.toString().startsWith(dateString))
                .length;
            
            return {
                name: format(date, 'EEE', { locale: ptBR }), // Ex: 'seg', 'ter'
                fullName: format(date, 'dd/MM', { locale: ptBR }),
                count: count
            };
        }).reverse();
        
        return data;

    }, [missions]);
    
    const handleGenerateInsights = useCallback(async () => {
        setIsLoadingInsights(true);
        setInsights([]);
        try {
            const result = await generateAnalyticsInsights({
                metas: JSON.stringify(metas),
                missions: JSON.stringify(missions),
            });
            setInsights(result.insights);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro na Análise',
                description: 'Não foi possível gerar os insights. Tente novamente mais tarde.'
            });
        } finally {
            setIsLoadingInsights(false);
        }
    }, [metas, missions, toast]);


    if (!isDataLoaded) {
        return (
             <Card className={isMobile ? "p-2" : ""}>
                <CardHeader className={cn(isMobile ? "p-3" : "p-6")}>
                    <CardTitle className={isMobile ? "text-lg" : ""}>Analytics Pessoais</CardTitle>
                    <CardDescription className={isMobile ? "text-xs" : ""}>
                       A carregar dados para análise...
                    </CardDescription>
                </CardHeader>
                <CardContent className={isMobile ? "p-3" : ""}>
                     <div className={cn(
                        "flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed border-border rounded-lg",
                        isMobile ? "h-32 p-4" : "h-64 p-8"
                     )}>
                        <LoaderCircle className={cn("mb-4 animate-spin", isMobile ? "h-8 w-8" : "h-16 w-16")} />
                    </div>
                </CardContent>
            </Card>
        )
    }

    const ProductivityTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
        if (active && payload && payload.length) {
            const fullDateLabel = weeklyProductivity.find(d => d.name === label)?.fullName;
            return (
            <div className="bg-black/90 border border-blue-500/50 p-2 shadow-lg">
                <p className="font-bold text-white font-mono uppercase">{fullDateLabel}</p>
                <p className="text-xs text-blue-400 font-mono">{`COMPLETED: ${payload[0].value}`}</p>
            </div>
            );
        }
        return null;
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
                        PERFORMANCE ANALYTICS
                    </h3>
                    <p className={cn("font-mono text-blue-400/50 text-xs", isMobile ? "text-[10px]" : "")}>DATA VISUALIZATION & INSIGHTS</p>
                </div>

                <div className={cn("space-y-6", isMobile && "space-y-4")}>
                     <div className={cn("bg-blue-950/10 border border-blue-900/20 relative overflow-hidden", isMobile ? "p-3" : "p-6")}>
                        <div className="flex items-center justify-between mb-4 border-b border-blue-900/20 pb-2">
                            <CardTitle className={cn("font-mono text-blue-300 uppercase tracking-widest flex items-center gap-2", isMobile ? "text-xs" : "text-sm")}>
                                <Sparkles className="h-4 w-4 text-purple-400" /> ORACLE INSIGHTS
                            </CardTitle>
                        </div>
                        
                         {isLoadingInsights ? (
                             <div className={cn(
                                "flex flex-col items-center justify-center text-center text-muted-foreground border border-blue-900/20 border-dashed bg-black/20",
                                isMobile ? "h-32 p-4 text-xs" : "h-48 p-4"
                             )}>
                                <LoaderCircle className={cn("mb-4 animate-spin text-purple-500", isMobile ? "h-6 w-6" : "h-12 w-12")}/>
                                <p className="font-mono text-purple-400/60 uppercase tracking-widest text-xs">CONSULTING ORACLE...</p>
                            </div>
                         ) : insights.length > 0 ? (
                            <div className={cn("space-y-4", isMobile && "space-y-2")}>
                                {insights.map((insight: any, index) => {
                                    const Icon = iconMap[insight.icon as keyof typeof iconMap] || Sparkles;
                                    return (
                                        <div key={index} className={cn("border-l-2 border-purple-500 bg-purple-950/10 p-4", isMobile ? "p-3" : "")}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Icon className={cn("text-purple-400", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                                                <h4 className={cn("text-purple-300 font-bold font-mono uppercase text-xs", isMobile ? "text-[10px]" : "")}>{insight.title}</h4>
                                            </div>
                                            <p className={cn("text-purple-200/80 font-mono text-xs leading-relaxed", isMobile ? "text-[10px]" : "")}>{insight.description}</p>
                                            <p className={cn("font-bold text-white mt-2 font-mono text-xs border-t border-purple-500/20 pt-2", isMobile && "mt-1")}>
                                                Suggestion: {insight.suggestion}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                         ) : (
                            <div className={cn(
                                "flex flex-col items-center justify-center text-center border border-blue-900/20 border-dashed bg-black/20",
                                isMobile ? "h-32 p-4 text-xs" : "h-48 p-4"
                            )}>
                                <p className="mb-4 font-mono text-blue-400/60 uppercase text-xs">{isMobile ? "AWAITING INPUT" : "INITIATE ANALYSIS PROTOCOL"}</p>
                                 <Button onClick={handleGenerateInsights} disabled={isLoadingInsights} className={cn("bg-purple-600 hover:bg-purple-500 text-white rounded-none font-mono text-xs uppercase tracking-widest h-8", isMobile ? "text-[10px]" : "")}>
                                    <Sparkles className={cn("mr-2", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                                    CONSULT ORACLE
                                </Button>
                            </div>
                         )}
                    </div>

                     <div className={cn("bg-blue-950/10 border border-blue-900/20", isMobile ? "p-3" : "p-6")}>
                        <div className="mb-4 border-b border-blue-900/20 pb-2">
                            <CardTitle className={cn("font-mono text-blue-300 uppercase tracking-widest", isMobile ? "text-xs" : "text-sm")}>WEEKLY EFFICIENCY</CardTitle>
                        </div>
                        {weeklyProductivity.length > 0 ? (
                             <div style={{ width: '100%', height: isMobile ? 200 : 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={weeklyProductivity} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" vertical={false} />
                                        <XAxis dataKey="name" stroke="#60a5fa" fontSize={isMobile ? 10 : 12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#60a5fa" fontSize={isMobile ? 10 : 12} tickLine={false} axisLine={false} allowDecimals={false} width={isMobile ? 20 : 30} />
                                        <Tooltip content={<ProductivityTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}/>
                                        <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className={cn(
                                "flex flex-col items-center justify-center text-center text-blue-500/30 border border-blue-900/20 border-dashed bg-black/20",
                                isMobile ? "h-32 p-4 text-xs" : "h-48 p-4"
                            )}>
                                <p className="font-mono uppercase tracking-widest">NO DATA</p>
                            </div>
                        )}
                    </div>

                    <div className={cn("bg-blue-950/10 border border-blue-900/20", isMobile ? "p-3" : "p-6")}>
                        <div className="mb-4 border-b border-blue-900/20 pb-2">
                            <CardTitle className={cn("font-mono text-blue-300 uppercase tracking-widest", isMobile ? "text-xs" : "text-sm")}>OBJECTIVE DISTRIBUTION</CardTitle>
                        </div>
                        {goalsByCategory.length > 0 ? (
                             <div style={{ width: '100%', height: isMobile ? 200 : 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={goalsByCategory} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" horizontal={false} />
                                        <XAxis type="number" stroke="#60a5fa" fontSize={isMobile ? 10 : 12} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <YAxis type="category" dataKey="name" stroke="#93c5fd" fontSize={isMobile ? 10 : 12} tickLine={false} axisLine={false} width={isMobile ? 80 : 150} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}/>
                                        <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className={cn(
                                "flex flex-col items-center justify-center text-center text-blue-500/30 border border-blue-900/20 border-dashed bg-black/20",
                                isMobile ? "h-32 p-4 text-xs" : "h-48 p-4"
                            )}>
                                <p className="font-mono uppercase tracking-widest">NO OBJECTIVES FOUND</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}