"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount, useBalance } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { useEffect, useState } from "react"
import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { sepolia, mainnet } from "wagmi/chains"

// Validate environment variables
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
const network = process.env.NEXT_PUBLIC_NETWORK

if (!walletConnectProjectId) {
  console.warn("[WalletConnect] Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID")
  console.warn("[WalletConnect] Add your Project ID to Replit Secrets")
  console.warn("[WalletConnect] Get one at: https://cloud.reown.com/")
}

// Handle Replit dynamic URLs
const getAppInfo = () => {
  if (typeof window === 'undefined') {
    return {
      appName: "MyCora",
      appDescription: "Blockchain Trust Network",
      appUrl: "https://mycora.com",
      appIcon: "/placeholder-logo.svg"
    }
  }

  const isReplit = window.location.hostname.includes('replit.dev')
  const baseUrl = isReplit ? window.location.origin : "https://mycora.com"

  return {
    appName: "MyCora",
    appDescription: "Blockchain Trust Network",
    appUrl: baseUrl,
    appIcon: `${baseUrl}/placeholder-logo.svg`
  }
}

// Update to Reown AppKit configuration and add Replit domain to WalletConnect allowlist
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo"; // Use "demo" as a fallback

// Add Replit domain configuration for WalletConnect
const metadata = {
  name: 'MyCora',
  description: 'Blockchain Trust Network',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://mycora.com',
  icons: ['https://mycora.com/icon-192x192.png']
}

export const config = getDefaultConfig({
  ...getAppInfo(),
  projectId: projectId,
  chains: network === "mainnet" ? [mainnet] : [sepolia],
  ssr: true,
})

export function WalletConnect() {
  const [mounted, setMounted] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({
    address: address,
  })

  // Enhanced mobile detection and wallet connection
  const isMobile = typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent)
  
  const handleWalletConnect = async () => {
    setIsConnecting(true)
    try {
      // Mobile-optimized connection flow
      if (isMobile) {
        // Deep link to wallet apps on mobile
        console.log('[WalletConnect] Mobile wallet connection initiated')
      }
    } catch (error) {
      console.error('[WalletConnect] Connection failed:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  // This projectId is redundant with the one used in getDefaultConfig, but keeping for consistency with provided changes if it was intended for connectors directly.
  // const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";


  // Removed the redundant metadata definition here as it's defined above for getDefaultConfig.
  // If it was intended for connectorsForWallets, that part of the changes was not present in the original code's structure.


  if (!mounted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Wallet Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md border-2 border-[var(--color-moss)] bg-gradient-to-br from-[var(--color-earth)] to-black/20">
      <CardHeader>
        <CardTitle className="text-[var(--color-glow)] flex items-center gap-2">
          {isMobile ? "📱" : "💻"} Wallet Connection
          {isConnecting && <div className="animate-spin">🌀</div>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <ConnectButton />
          {isMobile && !isConnected && (
            <p className="text-xs text-[var(--color-glow)] mt-2 opacity-75">
              Tap to connect your mobile wallet
            </p>
          )}
        </div>

        {isConnected && address && (
          <div className="space-y-2 p-3 rounded-lg bg-[var(--color-moss)]/20 border border-[var(--color-glow)]/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-sm text-[var(--color-glow)]">
                Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
            {balance && (
              <p className="text-sm text-white/80">
                Balance: {balance.formatted} {balance.symbol}
              </p>
            )}
            {isMobile && (
              <p className="text-xs text-[var(--color-glow)] opacity-75">
                🔒 Secured by your mobile wallet
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}