"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrustIndicator } from "@/components/ui/trust-indicator"
import { InstantRewards } from "@/components/ui/instant-rewards"

interface RewardStatus {
  points: string
  tier: string
  tierName: string
  perks: string
  nextTierRequirement: string
}

export function RewardsDashboard({ customerEmail }: { customerEmail: string }) {
  const [status, setStatus] = useState<RewardStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRewardStatus()
  }, [customerEmail])

  const fetchRewardStatus = async () => {
    try {
      const response = await fetch("/api/rewards/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerEmail }),
      })

      const data = await response.json()
      setStatus(data.status)
    } catch (error) {
      console.error("Failed to fetch reward status:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading your PuffPass status...</div>
  }

  if (!status) {
    return <div>Unable to load reward status</div>
  }

  const tierColors = {
    "0": "bg-slate-500",
    "1": "bg-green-500",
    "2": "bg-yellow-500",
    "3": "bg-black",
  }

  const progressPercentage =
    status.nextTierRequirement === "0"
      ? 100
      : (Number.parseInt(status.points) /
          (Number.parseInt(status.points) + Number.parseInt(status.nextTierRequirement))) *
        100

  return (
    <div className="space-y-6">
      <Card className="border-mycora-sage/20 bg-gradient-to-br from-mycora-earth/5 to-mycora-sage/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-mycora-earth">My Rewards</CardTitle>
            <TrustIndicator level="verified" />
          </div>
          <CardDescription>Earn points like Five Star • Redeem like Starbucks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div
              className={`w-16 h-16 rounded-full ${tierColors[status.tier]} flex items-center justify-center text-white font-bold`}
            >
              {status.tier === "0" ? "?" : status.tierName.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-mycora-earth">{status.tierName || "Ready to Earn"}</h3>
              <p className="text-mycora-sage">{status.perks || "Make your first purchase to unlock rewards!"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Next Tier</span>
              <span>{status.points} purchases</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            {status.nextTierRequirement !== "0" && (
              <p className="text-sm text-mycora-sage">
                {status.nextTierRequirement} more purchases to unlock the next tier!
              </p>
            )}
          </div>

          {/* Quick Actions - CashApp Style */}
          <div className="flex gap-3 pt-4 pb-2">
            <button className="flex-1 bg-mycora-sage/10 hover:bg-mycora-sage/20 rounded-lg px-4 py-2 text-sm font-medium text-mycora-earth transition-colors">
              💳 Pay & Earn
            </button>
            <button className="flex-1 bg-mycora-sage/10 hover:bg-mycora-sage/20 rounded-lg px-4 py-2 text-sm font-medium text-mycora-earth transition-colors">
              🎁 Redeem
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <Badge variant={status.tier >= "1" ? "default" : "outline"} className="bg-green-100 text-green-800">Green ⭐</Badge>
              <p className="text-xs mt-1">3 visits</p>
            </div>
            <div className="text-center">
              <Badge variant={status.tier >= "2" ? "default" : "outline"} className="bg-yellow-100 text-yellow-800">Gold ⭐⭐</Badge>
              <p className="text-xs mt-1">10 visits</p>
            </div>
            <div className="text-center">
              <Badge variant={status.tier >= "3" ? "default" : "outline"} className="bg-black text-white">VIP ⭐⭐⭐</Badge>
              <p className="text-xs mt-1">25 visits</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instant Rewards - Starbucks Style */}
      <Card className="border-mycora-sage/20 bg-gradient-to-br from-mycora-earth/5 to-mycora-sage/5">
        <CardHeader>
          <CardTitle className="text-mycora-earth">Redeem Rewards</CardTitle>
          <CardDescription>Tap to claim • Instant gratification</CardDescription>
        </CardHeader>
        <CardContent>
          <InstantRewards userPoints={parseInt(status?.points || "0")} />
        </CardContent>
      </Card>
    </div>
  )
}
