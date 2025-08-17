import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const organicCardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md mycora-grow",
  {
    variants: {
      variant: {
        default: "border-border",
        network: "mycora-network-bg border-primary/20 shadow-primary/10",
        trust: "border-primary/30 bg-gradient-to-br from-card to-primary/5",
        compliance: "border-secondary/30 bg-gradient-to-br from-card to-secondary/5",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface OrganicCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof organicCardVariants> {
  glowEffect?: boolean
}

const OrganicCard = React.forwardRef<HTMLDivElement, OrganicCardProps>(
  ({ className, variant, size, glowEffect, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          organicCardVariants({ variant, size }),
          glowEffect && "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  },
)
OrganicCard.displayName = "OrganicCard"

const OrganicCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props} />
  ),
)
OrganicCardHeader.displayName = "OrganicCardHeader"

const OrganicCardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight text-primary", className)}
      {...props}
    />
  ),
)
OrganicCardTitle.displayName = "OrganicCardTitle"

const OrganicCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
)
OrganicCardDescription.displayName = "OrganicCardDescription"

const OrganicCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("", className)} {...props} />,
)
OrganicCardContent.displayName = "OrganicCardContent"

const OrganicCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center pt-4", className)} {...props} />,
)
OrganicCardFooter.displayName = "OrganicCardFooter"

export {
  OrganicCard,
  OrganicCardHeader,
  OrganicCardFooter,
  OrganicCardTitle,
  OrganicCardDescription,
  OrganicCardContent,
  organicCardVariants,
}
