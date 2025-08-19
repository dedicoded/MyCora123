import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const networkNodeVariants = cva(
  "relative rounded-full border-2 transition-all duration-500 cursor-pointer mycora-grow hover:scale-110",
  {
    variants: {
      status: {
        active: "bg-primary border-primary shadow-lg shadow-primary/30 mycora-pulse",
        connected: "bg-secondary border-secondary shadow-md shadow-secondary/20",
        inactive: "bg-muted border-border shadow-sm",
        pending: "bg-background border-dashed border-muted-foreground/50",
      },
      size: {
        sm: "h-8 w-8",
        default: "h-12 w-12",
        lg: "h-16 w-16",
        xl: "h-20 w-20",
      },
    },
    defaultVariants: {
      status: "inactive",
      size: "default",
    },
  },
)

export interface NetworkNodeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof networkNodeVariants> {
  label?: string
  connections?: number
  trustScore?: number
}

const NetworkNode = React.forwardRef<HTMLDivElement, NetworkNodeProps>(
  ({ className, status, size, label, connections, trustScore, ...props }, ref) => {
    return (
      <div className="relative inline-flex flex-col items-center gap-2">
        <div
          className={cn(networkNodeVariants({ status, size, className }))}
          ref={ref}
          title={`${label || "Network Node"}${trustScore ? ` (Trust: ${trustScore})` : ""}${connections ? ` - ${connections} connections` : ""}`}
          {...props}
        >
          {/* Inner glow effect */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/20 to-transparent" />

          {/* Connection indicator */}
          {connections && connections > 0 && (
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-xs flex items-center justify-center text-accent-foreground font-bold">
              {connections > 9 ? "9+" : connections}
            </div>
          )}
        </div>

        {/* Node label */}
        {label && (
          <span className="text-xs font-medium text-muted-foreground text-center max-w-20 truncate">{label}</span>
        )}
      </div>
    )
  },
)
NetworkNode.displayName = "NetworkNode"

export { NetworkNode, networkNodeVariants }