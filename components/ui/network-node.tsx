
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
          "relative w-12 h-12 rounded-full border-2 transition-all duration-300",
          active
            ? "bg-green-500 border-green-400 shadow-lg shadow-green-500/50"
            : "bg-gray-600 border-gray-500",
          isHovered && "scale-110 shadow-xl"
        )}
      >
        <div
          className={clsx(
            "absolute inset-2 rounded-full transition-all duration-300",
            active
              ? "bg-green-300 animate-pulse"
              : "bg-gray-400"
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
