import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const trustIndicatorVariants = cva(
  "inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 organic-card mycelial-glow",
  {
    variants: {
      level: {
        high: "trust-indicator-high text-white mycora-pulse bg-[var(--color-moss)] shadow-[0_0_15px_var(--color-glow)]",
        medium: "trust-indicator-medium text-white bg-[var(--color-earth)] shadow-[0_0_10px_var(--color-spore-gold)]",
        low: "trust-indicator-low text-foreground bg-[var(--color-root-brown)] shadow-[0_0_5px_rgba(139,92,246,0.4)]",
      },
      size: {
        sm: "h-6 w-6 text-xs",
        default: "h-8 w-8 text-sm",
        lg: "h-12 w-12 text-base",
      },
    },
    defaultVariants: {
      level: "medium",
      size: "default",
    },
  },
)

export interface TrustIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof trustIndicatorVariants> {
  score?: number
}

const TrustIndicator = React.forwardRef<HTMLDivElement, TrustIndicatorProps>(
  ({ className, level, size, score, ...props }, ref) => {
    // Auto-determine level based on score if provided
    const determinedLevel = score !== undefined ? (score >= 80 ? "high" : score >= 50 ? "medium" : "low") : level

    return (
      <div
        className={cn(trustIndicatorVariants({ level: determinedLevel, size, className }))}
        ref={ref}
        title={`Trust Score: ${score || "N/A"}`}
        {...props}
      >
        {score || "?"}
      </div>
    )
  },
)
TrustIndicator.displayName = "TrustIndicator"

export { TrustIndicator, trustIndicatorVariants }
