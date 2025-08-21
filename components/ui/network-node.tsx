
'use client'

import { useState } from 'react'
import { clsx } from 'clsx'

interface NetworkNodeProps {
  id: string
  label: string
  x: number
  y: number
  active?: boolean
  onClick?: () => void
}

export function NetworkNode({ id, label, x, y, active = false, onClick }: NetworkNodeProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    onClick?.()
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return (
    <button
      type="button"
      className={clsx(
        "relative inline-flex items-center justify-center cursor-pointer bg-transparent border-0 p-0",
        "transition-all duration-300 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      )}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={`Network node: ${label}`}
    >
      <div
        className={clsx(
          "relative w-12 h-12 rounded-full border-2 transition-all duration-300 organic-card mycora-grow",
          active
            ? "bg-[var(--color-moss)] border-[var(--color-spore-gold)] shadow-[0_0_20px_var(--color-glow)] mycelial-glow"
            : "bg-[var(--color-earth)] border-[var(--color-root-brown)]",
          isHovered && "scale-110 shadow-[0_0_25px_var(--color-network-purple)]"
        )}
      >
        <div
          className={clsx(
            "absolute inset-2 rounded-full transition-all duration-300",
            active
              ? "bg-[var(--color-spore-gold)] animate-pulse shadow-inner"
              : "bg-[var(--color-moss)] opacity-60"
          )}
        />
      </div>
      
      <span
        className={clsx(
          "absolute -bottom-6 left-1/2 transform -translate-x-1/2",
          "text-xs font-medium whitespace-nowrap",
          active ? "text-green-400" : "text-gray-400"
        )}
      >
        {label}
      </span>
    </button>
  )
}
