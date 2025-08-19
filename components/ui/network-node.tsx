
"use client"

import clsx from "clsx"

interface NetworkNodeProps {
  size?: "sm" | "md" | "lg"
  active?: boolean
  label?: string
  onClick?: () => void
  className?: string
}

export function NetworkNode({ 
  size = "md", 
  active = false, 
  label, 
  onClick, 
  className 
}: NetworkNodeProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4", 
    lg: "w-6 h-6"
  }

  return (
    <div className={clsx("flex items-center", className)}>
      <button
        type="button"
        className={clsx(
          "relative inline-flex items-center justify-center cursor-pointer bg-transparent border-0 p-0"
        )}
        onClick={onClick}
        data-active={active ? "true" : undefined}
        aria-pressed={active}
        disabled={!onClick}
      >
        <div
          className={clsx(
            "rounded-full border-2 transition-all duration-300",
            sizeClasses[size],
            active 
              ? "bg-mycora-sage border-mycora-sage shadow-lg shadow-mycora-sage/30" 
              : "bg-mycora-earth/20 border-mycora-sage/40 hover:border-mycora-sage"
          )}
        >
          {active && (
            <div 
              className={clsx(
                "absolute inset-0 rounded-full animate-ping",
                "bg-mycora-sage/60"
              )}
            />
          )}
        </div>
      </button>
      {label && (
        <span className="ml-2 text-sm text-mycora-earth">
          {label}
        </span>
      )}
    </div>
  )
}
