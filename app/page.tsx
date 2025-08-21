"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FiatOnRamp } from "@/components/ui/fiat-onramp"
import { CannabisRewards } from "@/components/ui/cannabis-rewards"

export default function HomePage() {
  const [activeView, setActiveView] = useState<'home' | 'onramp' | 'rewards'>('home')
  const [userPoints, setUserPoints] = useState(1847)

  // Enhanced PuffPass Data with more realistic progression
  const puffPassData = {
    tier: "Gold",
    points: userPoints,
    nextTierPoints: 2500,
    nextTier: "Platinum",
    availableRewards: [
      { name: "$10 Gift Card", points: 1000, type: "gift_card", available: userPoints >= 1000 },
      { name: "Premium Upgrade", points: 1500, type: "upgrade", available: userPoints >= 1500 },
      { name: "Instant Payout", points: 2000, type: "payout", available: userPoints >= 2000 },
      { name: "VIP Access", points: 2500, type: "vip", available: userPoints >= 2500 }
    ],
    recentEarning: "+45 points from dispensary visit",
    monthlyEarnings: 320,
    totalLifetime: 4720
  }

  const progressPercentage = (puffPassData.points / puffPassData.nextTierPoints) * 100

  const handleOnRampPurchase = async (data: any) => {
    // Simulate adding points to user account
    const netPoints = Math.floor((data.amount * 100) - (data.amount * 100 * 0.03)) // Assuming 3% avg fee
    setUserPoints(prev => prev + netPoints)
    console.log('Points added:', netPoints)
  }

  const renderStunningPuffPassCard = () => (
    <div className="relative group">
      {/* Magical glow background */}
      <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-green-600 to-yellow-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-700 animate-pulse"></div>

      {/* Main card */}
      <Card className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-none shadow-2xl overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-32 h-32 bg-gradient-to-br from-green-400 to-transparent rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-transparent rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <CardHeader className="relative pb-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Enhanced tier badge */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur-md opacity-50"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                  <div className="text-xl font-bold text-yellow-900">👑</div>
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  PuffPass {puffPassData.tier}
                </CardTitle>
                <p className="text-sm text-gray-300 font-medium">{puffPassData.recentEarning}</p>
              </div>
            </div>

            {/* Animated points display */}
            <div className="text-right">
              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-none px-4 py-2 text-lg font-bold shadow-lg">
                {puffPassData.points.toLocaleString()} pts
              </Badge>
              <div className="text-xs text-gray-400 mt-1">+{puffPassData.monthlyEarnings} this month</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative text-white space-y-6">
          {/* Enhanced progress section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-300">Progress to {puffPassData.nextTier}</span>
              <span className="text-sm font-bold text-white">{puffPassData.points}/{puffPassData.nextTierPoints}</span>
            </div>

            {/* Stunning progress bar */}
            <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-700"></div>
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 via-green-600 to-yellow-400 rounded-full shadow-lg transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
              {/* Animated shimmer effect */}
              <div
                className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"
                style={{
                  left: `${Math.min(progressPercentage - 10, 90)}%`,
                  animationDuration: '2s'
                }}
              />
            </div>

            <div className="text-xs text-gray-400">
              {(puffPassData.nextTierPoints - puffPassData.points).toLocaleString()} points to unlock {puffPassData.nextTier} benefits
            </div>
          </div>

          {/* Available rewards preview */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-300">Quick Rewards:</p>
            <div className="grid grid-cols-2 gap-2">
              {puffPassData.availableRewards.slice(0, 2).map((reward, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg border transition-all duration-300 ${
                    reward.available
                      ? 'bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/40 hover:border-green-500 cursor-pointer'
                      : 'bg-slate-800/50 border-slate-600 opacity-50'
                  }`}
                >
                  <div className="text-xs font-medium text-white">{reward.name}</div>
                  <div className="text-xs text-gray-400">{reward.points.toLocaleString()} pts</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setActiveView('onramp')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              💳 Add Points
            </Button>
            <Button
              onClick={() => setActiveView('rewards')}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              🎁 Redeem
            </Button>
          </div>

          {/* Lifetime stats */}
          <div className="pt-2 border-t border-slate-700">
            <div className="text-xs text-gray-400 text-center">
              Lifetime Earned: <span className="text-white font-medium">{puffPassData.totalLifetime.toLocaleString()} points</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderHeroSection = () => (
    <div className="text-center mb-20 relative">
      {/* Magical background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/4 w-32 h-32 bg-green-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-20 right-1/4 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-10 left-1/3 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="mb-12">
        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight bg-gradient-to-r from-green-600 via-green-500 to-yellow-500 bg-clip-text text-transparent">
          🌿 PuffPass Rewards
        </h1>
        <p className="text-2xl md:text-3xl text-gray-600 dark:text-gray-300 mb-12 font-medium">
          Earn at dispensaries • Pay like CashApp • Redeem like Starbucks
        </p>
      </div>

      <div className="max-w-lg mx-auto mb-12">
        {renderStunningPuffPassCard()}
      </div>
    </div>
  )

  if (activeView === 'onramp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setActiveView('home')}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
          </div>

          <FiatOnRamp onPurchase={handleOnRampPurchase} />
        </div>
      </div>
    )
  }

  if (activeView === 'rewards') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setActiveView('home')}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
          </div>

          <CannabisRewards
            userPoints={puffPassData.points}
            tier="gold"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {renderHeroSection()}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <Card className="text-center border-green-200 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">150k+</div>
              <div className="text-sm text-gray-600">Active PuffPass Users</div>
            </CardContent>
          </Card>

          <Card className="text-center border-yellow-200 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-yellow-600 mb-2">$2.4M+</div>
              <div className="text-sm text-gray-600">Points Redeemed</div>
            </CardContent>
          </Card>

          <Card className="text-center border-blue-200 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-sm text-gray-600">Partner Dispensaries</div>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-8">How PuffPass Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">💳 Load Points</h3>
              <p className="text-gray-600">Add money to your PuffPass using cards, Apple Pay, or bank transfer</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">🌿 Earn & Spend</h3>
              <p className="text-gray-600">Pay at dispensaries and earn bonus points with every purchase</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">🎁 Redeem Rewards</h3>
              <p className="text-gray-600">Use points for discounts, free delivery, and exclusive cannabis perks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}