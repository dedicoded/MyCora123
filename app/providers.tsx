"use client"

import React from "react"
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from "wagmi/chains"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import "@rainbow-me/rainbowkit/styles.css"

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "1c711e0584ef1a9b8f4e34aa99c21658"

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  console.warn("[v0] Using fallback WalletConnect Project ID. Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID for production.")
}

const config = getDefaultConfig({
  appName: "MyCora",
  projectId: projectId || "demo-project-id", // Use demo ID if not configured
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  ssr: true,
  // Fix storage configuration for SSR compatibility
  storage: typeof window !== 'undefined' ? 
    window.localStorage : 
    undefined,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries to prevent excessive error logging
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
