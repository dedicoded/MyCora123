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

export const config = getDefaultConfig({
  ...getAppInfo(),
  projectId: walletConnectProjectId || "demo",
  chains: network === "mainnet" ? [mainnet] : [sepolia],
  ssr: true,
})

export function WalletConnect() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({
    address: address,
  })

  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

  // Configure allowed origins for WalletConnect
  const metadata = {
    name: 'MyCora',
    description: 'MyCora Blockchain Platform',
    url: 'https://10ef237c-4d90-4026-9a06-cb1b3ee43a3b-00-1aqa1lbeqtan0.worf.replit.dev',
    icons: ['https://10ef237c-4d90-4026-9a06-cb1b3ee43a3b-00-1aqa1lbeqtan0.worf.replit.dev/placeholder-logo.svg']
  };


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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Wallet Connection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ConnectButton />

        {isConnected && address && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
            {balance && (
              <p className="text-sm">
                Balance: {balance.formatted} {balance.symbol}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}