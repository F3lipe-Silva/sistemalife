import React from 'react';
import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

interface StatItemProps {
    label: string;
    value: string | number;
    icon?: React.ComponentType<SVGProps<SVGSVGElement>> | null;
    isMobile?: boolean;
}

export const StatItem = ({ label, value, icon: Icon = null, isMobile = false }: StatItemProps) => (
    <div className={cn("rounded-lg border border-border/50 transition-all duration-200 hover:shadow-md",
        isMobile ? "bg-secondary/60 p-3 touch-manipulation" : "bg-secondary/50 p-3")}>
        <span className={cn("flex items-center gap-3", isMobile ? "text-sm text-muted-foreground" : "text-sm text-muted-foreground")}>
            {Icon && <Icon className={isMobile ? "h-4 w-4" : "h-4 w-4"} />}
            {label}
        </span>
        <p className={cn("font-bold text-foreground mt-1", isMobile ? "text-lg" : "text-lg")}>{value}</p>
    </div>
);
