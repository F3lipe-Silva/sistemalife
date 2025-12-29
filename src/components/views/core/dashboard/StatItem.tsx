import React from 'react';
import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface StatItemProps {
    label: string;
    value: string | number;
    icon?: React.ComponentType<SVGProps<SVGSVGElement>> | null;
    isMobile?: boolean;
    description?: string;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
}

export const StatItem = ({ 
    label, 
    value, 
    icon: Icon = null, 
    isMobile = false,
    description,
    trend,
    trendValue
}: StatItemProps) => {
    const content = (
        <div className={cn(
            "rounded-lg border border-border/50 transition-all duration-200",
            isMobile ? "bg-secondary/60 p-3 touch-manipulation" : "bg-secondary/50 p-3 hover:shadow-lg hover:scale-[1.02] hover:border-primary/30 cursor-pointer"
        )}>
            <span className={cn("flex items-center gap-2", isMobile ? "text-sm text-muted-foreground" : "text-sm text-muted-foreground")}>
                {Icon && <Icon className={isMobile ? "h-4 w-4" : "h-4 w-4"} />}
                {label}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
                <p className={cn("font-bold text-foreground", isMobile ? "text-lg" : "text-lg")}>{value}</p>
                {trend && trendValue && (
                    <span className={cn(
                        "text-xs font-medium",
                        trend === 'up' && "text-green-400",
                        trend === 'down' && "text-red-400",
                        trend === 'stable' && "text-muted-foreground"
                    )}>
                        {trend === 'up' && '↑ '}
                        {trend === 'down' && '↓ '}
                        {trendValue}
                    </span>
                )}
            </div>
        </div>
    );

    if (isMobile || !description) {
        return content;
    }

    return (
        <HoverCard openDelay={200}>
            <HoverCardTrigger asChild>
                {content}
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon className="h-5 w-5 text-primary" />}
                        <h4 className="text-sm font-semibold">{label}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{description}</p>
                    {trend && trendValue && (
                        <div className={cn(
                            "text-xs font-medium flex items-center gap-1 mt-2",
                            trend === 'up' && "text-green-400",
                            trend === 'down' && "text-red-400",
                            trend === 'stable' && "text-muted-foreground"
                        )}>
                            <span>Tendência:</span>
                            <span>
                                {trend === 'up' && '↑ '}
                                {trend === 'down' && '↓ '}
                                {trend === 'stable' && '→ '}
                                {trendValue}
                            </span>
                        </div>
                    )}
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};
