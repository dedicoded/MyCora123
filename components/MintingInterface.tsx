"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

export function MintingInterface() {
  const { address, isConnected } = useAccount()
  const [amount, setAmount] = useState("")
  const [tokenType, setTokenType] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleMint = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first")
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          amount: Number.parseInt(amount),
          tokenType,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Minting error:", error)
      setResult({ error: "Failed to mint tokens" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Mint Tokens</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tokenType">Token Type</Label>
          <Select value={tokenType} onValueChange={setTokenType}>
            <SelectTrigger>
              <SelectValue placeholder="Select token type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="security">Security Token</SelectItem>
              <SelectItem value="utility">Utility Token</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to mint"
          />
        </div>

        <Button onClick={handleMint} disabled={!isConnected || !amount || !tokenType || isLoading} className="w-full">
          {isLoading ? "Minting..." : "Mint Tokens"}
        </Button>

        {result && (
          <div className="mt-4 p-3 rounded-md bg-muted">
            <pre className="text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
