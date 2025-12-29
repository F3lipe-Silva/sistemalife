import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      {Icon && (
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center animate-scale-in">
            <Icon className="h-10 w-10 text-primary/70" />
          </div>
          <div className="absolute -inset-2 bg-primary/5 rounded-3xl blur-xl animate-pulse" />
        </div>
      )}
      
      <h3 className="font-cinzel text-xl md:text-2xl font-bold text-foreground mb-2 tracking-wide">
        {title}
      </h3>
      
      {description && (
        <p className="text-muted-foreground max-w-md mb-6 text-sm md:text-base">
          {description}
        </p>
      )}
      
      {action && (
        <Button
          onClick={action.onClick}
          variant="glow"
          size="lg"
          className="group"
        >
          {action.label}
          <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </Button>
      )}
    </div>
  )
}
