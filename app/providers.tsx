"use client"

import React, { useEffect } from "react"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { ThemeProvider } from "next-themes"
import { config } from "../components/WalletConnect"

const queryClient = new QueryClient()

function EnvironmentValidator() {
  useEffect(() => {
    // Only run client-side after hydration
    const required = [
      'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
      'NEXT_PUBLIC_MCC_CONTRACT_ADDRESS',
      'NEXT_PUBLIC_NETWORK'
    ]

    const missing = required.filter(key => {
      const value = process.env[key]
      return !value || value === '' || value === 'undefined'
    })

    if (missing.length > 0) {
      console.warn('[v0] Missing critical environment variables:', missing)
    } else {
      console.log('[v0] ✅ All environment variables loaded successfully')
    }
  }, [])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <EnvironmentValidator />
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  )
}