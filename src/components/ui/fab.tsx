import * as React from "react";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

export interface FabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  label?: string;
  variant?: "primary" | "secondary" | "surface" | "tertiary";
  size?: "default" | "small" | "large";
  extended?: boolean;
}

const Fab = React.forwardRef<HTMLButtonElement, FabProps>(
  ({ className, icon: Icon, label, variant = "primary", size = "default", extended = false, children, ...props }, ref) => {
    const isExtended = extended || !!label;

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "active:scale-95 shadow-md3-3 hover:shadow-md3-4 active:shadow-md3-2",
          
          // Variant styles
          variant === "primary" && "bg-primary text-on-primary hover:bg-primary/90",
          variant === "secondary" && "bg-secondary text-on-secondary hover:bg-secondary/90",
          variant === "surface" && "bg-surface-container-high text-primary hover:bg-surface-container-highest",
          variant === "tertiary" && "bg-tertiary text-on-tertiary hover:bg-tertiary/90",
          
          // Size styles
          !isExtended && size === "small" && "h-10 w-10 rounded-xl",
          !isExtended && size === "default" && "h-14 w-14 rounded-2xl",
          !isExtended && size === "large" && "h-24 w-24 rounded-[28px]",
          
          // Extended FAB styles
          isExtended && size === "small" && "h-10 px-4 gap-2 rounded-xl",
          isExtended && size === "default" && "h-14 px-6 gap-3 rounded-2xl",
          isExtended && size === "large" && "h-16 px-8 gap-4 rounded-[28px]",
          
          className
        )}
        {...props}
      >
        {Icon && (
          <Icon 
            className={cn(
              size === "small" && "h-5 w-5",
              size === "default" && "h-6 w-6",
              size === "large" && "h-8 w-8"
            )} 
          />
        )}
        {children}
        {label && (
          <span className={cn(
            "font-semibold tracking-wide",
            size === "small" && "text-sm",
            size === "default" && "text-base",
            size === "large" && "text-lg"
          )}>
            {label}
          </span>
        )}
      </button>
    );
  }
);

Fab.displayName = "Fab";

export { Fab };
