
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Reward {
  id: string
  title: string
  points: number
  emoji: string
  available: boolean
}

const mockRewards: Reward[] = [
  { id: "1", title: "Free Coffee", points: 125, emoji: "☕", available: true },
  { id: "2", title: "10% Off", points: 50, emoji: "🎯", available: true },
  { id: "3", title: "Free Delivery", points: 75, emoji: "🚚", available: false },
  { id: "4", title: "$5 Gift Card", points: 250, emoji: "💳", available: false },
]

export function InstantRewards({ userPoints = 89 }: { userPoints?: number }) {
  const [claiming, setClaiming] = useState<string | null>(null)
  const [claimed, setClaimed] = useState<Set<string>>(new Set())

  const handleClaim = async (rewardId: string) => {
    setClaiming(rewardId)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200))
    setClaimed(prev => new Set([...prev, rewardId]))
    setClaiming(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-mycora-earth">Available Rewards</h3>
        <div className="text-sm text-mycora-sage">
          <span className="font-semibold text-mycora-earth">{userPoints} points</span> available
        </div>
      </div>
      
      <div className="grid gap-3">
        {mockRewards.map((reward) => {
          const canClaim = reward.available && userPoints >= reward.points && !claimed.has(reward.id)
          const isClaiming = claiming === reward.id
          const isClaimed = claimed.has(reward.id)
          
          return (
            <Card 
              key={reward.id} 
              className={`transition-all duration-200 ${
                canClaim 
                  ? 'border-mycora-sage bg-mycora-sage/5 hover:bg-mycora-sage/10' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{reward.emoji}</div>
                    <div>
                      <div className="font-medium text-mycora-earth">{reward.title}</div>
                      <div className="text-sm text-mycora-sage">{reward.points} points</div>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    disabled={!canClaim || isClaiming}
                    onClick={() => handleClaim(reward.id)}
                    className={
                      isClaimed
                        ? "bg-green-500 hover:bg-green-500 text-white"
                        : canClaim
                        ? "bg-mycora-sage hover:bg-mycora-moss text-white"
                        : "bg-gray-300 text-gray-500"
                    }
                  >
                    {isClaiming ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Claiming...</span>
                      </div>
                    ) : isClaimed ? (
                      "✅ Claimed"
                    ) : canClaim ? (
                      "Claim Now"
                    ) : (
                      `Need ${reward.points - userPoints} more`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
