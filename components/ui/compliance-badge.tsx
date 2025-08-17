import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const complianceBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200",
  {
    variants: {
      status: {
        pass: "compliance-pass bg-primary/10 border border-primary/20",
        warning: "compliance-warning bg-secondary/10 border border-secondary/20",
        fail: "compliance-fail bg-destructive/10 border border-destructive/20",
        pending: "bg-muted text-muted-foreground border border-border",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-3 py-1 text-sm",
        lg: "px-4 py-2 text-base",
      },
    },
    defaultVariants: {
      status: "pending",
      size: "default",
    },
  },
)

export interface ComplianceBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof complianceBadgeVariants> {
  jurisdiction?: string
  lastUpdated?: string
}

const ComplianceBadge = React.forwardRef<HTMLDivElement, ComplianceBadgeProps>(
  ({ className, status, size, jurisdiction, lastUpdated, children, ...props }, ref) => {
    const statusText = {
      pass: "Compliant",
      warning: "Review Required",
      fail: "Non-Compliant",
      pending: "Pending Review",
    }

    const statusIcon = {
      pass: "✓",
      warning: "⚠",
      fail: "✗",
      pending: "⏳",
    }

    return (
      <div
        className={cn(complianceBadgeVariants({ status, size, className }))}
        ref={ref}
        title={`${jurisdiction ? `${jurisdiction}: ` : ""}${statusText[status || "pending"]}${lastUpdated ? ` (Updated: ${lastUpdated})` : ""}`}
        {...props}
      >
        <span className="flex-shrink-0">{statusIcon[status || "pending"]}</span>
        <span>{children || statusText[status || "pending"]}</span>
        {jurisdiction && <span className="text-xs opacity-75">({jurisdiction})</span>}
      </div>
    )
  },
)
ComplianceBadge.displayName = "ComplianceBadge"

export { ComplianceBadge, complianceBadgeVariants }
