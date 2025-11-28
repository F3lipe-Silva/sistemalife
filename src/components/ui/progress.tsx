"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { 
    variant?: 'default' | 'gradient' | 'glow';
    showValue?: boolean;
  }
>(({ className, value, variant = 'default', showValue = false, ...props }, ref) => {
  const variants = {
    default: "bg-secondary",
    gradient: "bg-gradient-to-r from-secondary to-secondary/50",
    glow: "bg-secondary shadow-inner",
  }
  
  const indicatorVariants = {
    default: "bg-primary",
    gradient: "bg-gradient-to-r from-primary via-primary/90 to-accent",
    glow: "bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.5)]",
  }
  
  return (
    <div className="relative">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-3 w-full overflow-hidden rounded-full",
          variants[variant],
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all duration-500 ease-out rounded-full",
            indicatorVariants[variant]
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
      {showValue && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+8px)] text-xs font-medium text-muted-foreground">
          {Math.round(value || 0)}%
        </span>
      )}
    </div>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
