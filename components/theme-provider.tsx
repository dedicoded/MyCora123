"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return children with a neutral theme during SSR to prevent hydration mismatch
    return (
      <div suppressHydrationWarning>
        {children}
      </div>
    )
  }

  return (
    <NextThemesProvider 
      {...props}
      suppressHydrationWarning
    >
      {children}
    </NextThemesProvider>
  )
}