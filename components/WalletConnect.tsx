"use client"

import { useAccount, useBalance, useConnect, useDisconnect } from "../app/providers"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Wallet Connection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <Button onClick={connect} className="w-full">
            Connect Wallet
          </Button>
        ) : (
          <Button onClick={disconnect} variant="outline" className="w-full bg-transparent">
            Disconnect
          </Button>
        )}

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
