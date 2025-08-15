"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount, useBalance } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({
    address: address,
  })

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
                Balance: {Number.parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
