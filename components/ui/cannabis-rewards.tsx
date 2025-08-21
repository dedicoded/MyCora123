
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { OrganicCard, OrganicCardContent, OrganicCardHeader, OrganicCardTitle } from "@/components/ui/organic-card"
import { cn } from "@/lib/utils"

interface CannabisRewardsProps {
  userPoints: number
  tier: "green" | "gold" | "black"
  className?: string
}

const rewards = [
  {
    id: "discount_10",
    name: "10% Off Next Purchase",
    description: "Save on your next dispensary visit",
    points: 500,
    icon: "🌿",
    type: "discount",
    value: "$5-20 savings",
  },
  {
    id: "free_delivery",
    name: "Free Delivery",
    description: "Skip delivery fees on your order",
    points: 750,
    icon: "🚚",
    type: "service",
    value: "$5-15 savings",
  },
  {
    id: "premium_strain",
    name: "Premium Strain Access",
    description: "Early access to limited drops",
    points: 1000,
    icon: "✨",
    type: "access",
    value: "Exclusive",
  },
  {
    id: "gift_card",
    name: "$25 Merchant Credit",
    description: "Use at any verified dispensary",
    points: 2500,
    icon: "💳",
    type: "credit",
    value: "$25 value",
  },
  {
    id: "vip_experience",
    name: "VIP Budtender Session",
    description: "1-on-1 consultation with expert",
    points: 3500,
    icon: "👑",
    type: "experience",
    value: "$50 value",
  },
  {
    id: "premium_upgrade",
    name: "Black PuffPass Upgrade",
    description: "Unlock highest tier benefits",
    points: 5000,
    icon: "🖤",
    type: "upgrade",
    value: "Tier unlock",
  },
]

const tierInfo = {
  green: { name: "Green PuffPass", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-950/20" },
  gold: { name: "Gold PuffPass", color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-950/20" },
  black: { name: "Black PuffPass", color: "text-gray-800 dark:text-gray-200", bgColor: "bg-gray-50 dark:bg-gray-950/20" },
}

export function CannabisRewards({ userPoints, tier, className }: CannabisRewardsProps) {
  const [selectedReward, setSelectedReward] = React.useState<string | null>(null)
  const currentTier = tierInfo[tier]
  
  const handleRedeem = (rewardId: string, pointsCost: number) => {
    if (userPoints >= pointsCost) {
      setSelectedReward(rewardId)
      // Here you would call your redemption API
      console.log(`Redeeming reward ${rewardId} for ${pointsCost} points`)
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Tier Status */}
      <OrganicCard className={cn("border-2", currentTier.bgColor)}>
        <OrganicCardHeader className="text-center">
          <OrganicCardTitle className={cn("flex items-center justify-center gap-2", currentTier.color)}>
            🌿 {currentTier.name}
          </OrganicCardTitle>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{userPoints.toLocaleString()} points</p>
            <div className="flex items-center gap-2">
              <Progress value={Math.min((userPoints / 5000) * 100, 100)} className="flex-1" />
              <span className="text-sm text-muted-foreground">
                {tier === "black" ? "Max tier" : `${5000 - userPoints} to next tier`}
              </span>
            </div>
          </div>
        </OrganicCardHeader>
      </OrganicCard>

      {/* Available Rewards */}
      <OrganicCard>
        <OrganicCardHeader>
          <OrganicCardTitle>🎁 Cannabis Rewards</OrganicCardTitle>
          <p className="text-sm text-muted-foreground">
            Redeem your points for exclusive cannabis perks
          </p>
        </OrganicCardHeader>
        <OrganicCardContent>
          <div className="grid gap-4">
            {rewards.map((reward) => {
              const canAfford = userPoints >= reward.points
              const isSelected = selectedReward === reward.id
              
              return (
                <div
                  key={reward.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border transition-all",
                    canAfford ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20" : "border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950/20",
                    isSelected && "ring-2 ring-green-500"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{reward.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-medium">{reward.name}</h3>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {reward.value}
                        </Badge>
                        <Badge variant={canAfford ? "default" : "secondary"} className="text-xs">
                          {reward.points.toLocaleString()} pts
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    disabled={!canAfford}
                    onClick={() => handleRedeem(reward.id, reward.points)}
                    className={cn(
                      "ml-4",
                      canAfford ? "bg-green-600 hover:bg-green-700 text-white" : ""
                    )}
                  >
                    {canAfford ? "Redeem" : "Need More"}
                  </Button>
                </div>
              )
            })}
          </div>
        </OrganicCardContent>
      </OrganicCard>

      {/* Closed Loop Reminder */}
      <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
        <p className="text-sm text-orange-700 dark:text-orange-300">
          🔒 <strong>Closed Loop System:</strong> Points are non-withdrawable and can only be used for rewards within the MyCora cannabis network. Only verified dispensaries and admins can process withdrawals.
        </p>
      </div>
    </div>
  )
}
