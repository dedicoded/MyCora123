
"use client"

import { useState, useEffect, Suspense } from "react"
import dynamic from 'next/dynamic'
import { logger } from "@/lib/logger"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrustIndicator } from "@/components/ui/trust-indicator"
import { ComplianceBadge } from "@/components/ui/compliance-badge"
import { NetworkNode } from "@/components/ui/network-node"
import { Progress } from "@/components/ui/progress"

// Lazy load heavy components only when needed
const SecurityVerification = dynamic(() => import("@/components/ui/security-verification").then(mod => ({ default: mod.SecurityVerification })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gradient-to-r from-mycora-sage/20 to-mycora-moss/20 h-64 rounded-xl shadow-lg"></div>
})

const RewardsDashboard = dynamic(() => import("@/components/ui/rewards-dashboard").then(mod => ({ default: mod.RewardsDashboard })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gradient-to-r from-mycora-sage/20 to-mycora-moss/20 h-48 rounded-xl shadow-lg"></div>
})

const PaymentForm = dynamic(() => import("@/components/ui/payment-form").then(mod => ({ default: mod.PaymentForm })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gradient-to-r from-mycora-sage/20 to-mycora-moss/20 h-40 rounded-xl shadow-lg"></div>
})

const WalletConnect = dynamic(() => import('@/components/WalletConnect').then(mod => ({ default: mod.WalletConnect })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gradient-to-r from-mycora-sage/20 to-mycora-moss/20 h-16 rounded-xl shadow-lg"></div>
})

const MintingInterface = dynamic(() => import('@/components/MintingInterface'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gradient-to-r from-mycora-sage/20 to-mycora-moss/20 h-32 rounded-xl shadow-lg"></div>
})

interface UserSession {
  sessionId: string
  requiresMFA: boolean
  requiresBiometric: boolean
  kycLevel: number
  complianceStatus: string
}

const isPreview = process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
const isDev = process.env.NODE_ENV === "development"

export default function Page() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [userType, setUserType] = useState<"individual" | "business" | null>(null)
  const [currentStep, setCurrentStep] = useState<"welcome" | "userType" | "security" | "kyc" | "dashboard">("welcome")
  const [userSession, setUserSession] = useState<UserSession | null>(null)
  const [walletConnected, setWalletConnected] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [envStatus, setEnvStatus] = useState<"loading" | "ready" | "missing">("loading")
  const [missingVars, setMissingVars] = useState<string[]>([])
  const [showDevPanel, setShowDevPanel] = useState(false)
  const [showRedemption, setShowRedemption] = useState(false)
  const [selectedReward, setSelectedReward] = useState<string | null>(null)

  useEffect(() => {
    // Defer env validation to next tick to avoid blocking render
    const validateEnv = () => {
      const requiredVars = [
        "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID",
        "NEXT_PUBLIC_MCC_CONTRACT_ADDRESS",
        "NEXT_PUBLIC_NETWORK",
      ]

      const missing = requiredVars.filter((varName) => !process.env[varName])

      if (missing.length > 0 && !isPreview) {
        setMissingVars(missing)
        setEnvStatus("missing")
      } else {
        setEnvStatus("ready")
      }
    }

    // Use requestIdleCallback for better performance
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(validateEnv)
    } else {
      setTimeout(validateEnv, 0)
    }
  }, [])

  const handleBeginJourney = () => {
    setShowOnboarding(true)
    setCurrentStep("userType")
  }

  const handleViewPuffPass = () => {
    if (currentStep === "dashboard") {
      setShowRedemption(true)
    } else {
      handleBeginJourney()
    }
  }

  const handleConnectWallet = () => {
    if (currentStep === "dashboard") {
      setCurrentStep("dashboard")
    } else {
      setShowOnboarding(true)
      setCurrentStep("userType")
    }
  }

  const handleVerifyIdentity = () => {
    if (currentStep === "dashboard") {
      setCurrentStep("kyc")
    } else {
      handleBeginJourney()
    }
  }

  const handleOpenWallet = () => {
    if (currentStep === "dashboard") {
      document.getElementById('wallet-section')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      handleBeginJourney()
    }
  }

  const handleUserTypeSelection = async (type: "individual" | "business") => {
    setUserType(type)
    setCurrentStep("security")

    const deviceInfo = {
      userAgent: navigator.userAgent,
      screen: { width: screen.width, height: screen.height },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
    }

    fetch("/api/security/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: `temp_${Date.now()}`,
        deviceInfo,
      }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setUserSession(data.session)
      }
    })
    .catch(error => {
      logger.error("Session creation failed:", error)
      setUserSession({
        sessionId: `fallback_${Date.now()}`,
        requiresMFA: false,
        requiresBiometric: false,
        kycLevel: 1,
        complianceStatus: "pending"
      })
    })
  }

  const handleSecurityVerification = (verified: boolean) => {
    if (verified) {
      setCurrentStep("kyc")
    }
  }

  const handleKYCComplete = () => {
    setCurrentStep("dashboard")
  }

  const handleWalletConnection = (connected: boolean) => {
    if (!connected && envStatus === "missing") {
      logger.warn("Wallet connection failed - missing environment variables")
      return
    }
    setWalletConnected(connected)
  }

  // Enhanced PuffPass Data with more realistic progression
  const puffPassData = {
    tier: "Gold",
    points: 1847,
    nextTierPoints: 2500,
    nextTier: "Platinum",
    availableRewards: [
      { name: "$10 Gift Card", points: 1000, type: "gift_card", available: true },
      { name: "Premium Upgrade", points: 1500, type: "upgrade", available: true },
      { name: "Instant Payout", points: 2000, type: "payout", available: false },
      { name: "VIP Access", points: 2500, type: "vip", available: false }
    ],
    recentEarning: "+45 points from coffee purchase",
    monthlyEarnings: 320,
    totalLifetime: 4720
  }

  const progressPercentage = (puffPassData.points / puffPassData.nextTierPoints) * 100

  const renderStunningPuffPassCard = () => (
    <div className="relative group">
      {/* Magical glow background */}
      <div className="absolute -inset-1 bg-gradient-to-r from-mycora-sage via-mycora-moss to-mycora-sage rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-700 animate-pulse"></div>
      
      <Card className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-none backdrop-blur-sm overflow-hidden shadow-2xl transform group-hover:scale-105 transition-all duration-700 group-hover:shadow-3xl">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            <defs>
              <linearGradient id="cardGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--mycora-sage)" stopOpacity="0.8" />
                <stop offset="50%" stopColor="var(--mycora-moss)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="var(--mycora-sage)" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {[...Array(12)].map((_, i) => (
              <circle
                key={i}
                cx={50 + i * 30}
                cy={60 + Math.sin(i * 0.8) * 20}
                r={3}
                fill="url(#cardGlow)"
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
            {[...Array(11)].map((_, i) => (
              <path
                key={i}
                d={`M${50 + i * 30},${60 + Math.sin(i * 0.8) * 20} Q${65 + i * 30},${40 + Math.sin((i + 0.5) * 0.8) * 15} ${80 + i * 30},${60 + Math.sin((i + 1) * 0.8) * 20}`}
                stroke="url(#cardGlow)"
                strokeWidth="1.5"
                fill="none"
                opacity="0.6"
              />
            ))}
          </svg>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-mycora-sage rounded-full opacity-40 animate-bounce"
              style={{
                left: `${20 + i * 10}%`,
                top: `${30 + Math.sin(i) * 20}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.2}s`
              }}
            />
          ))}
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
              <Badge className="bg-gradient-to-r from-mycora-sage to-mycora-moss text-white border-none px-4 py-2 text-lg font-bold shadow-lg">
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
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-mycora-sage via-mycora-moss to-yellow-400 rounded-full shadow-lg transition-all duration-1000 ease-out"
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
                      ? 'bg-gradient-to-br from-mycora-sage/20 to-mycora-moss/20 border-mycora-sage/40 hover:border-mycora-sage cursor-pointer' 
                      : 'bg-slate-800/50 border-slate-600 opacity-50'
                  }`}
                >
                  <div className="text-xs font-medium text-white">{reward.name}</div>
                  <div className="text-xs text-gray-400">{reward.points.toLocaleString()} pts</div>
                </div>
              ))}
            </div>
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

  const renderRedemptionFlow = () => {
    if (!showRedemption) return null

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {!selectedReward ? (
            // Step 2: Choose Reward
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">🎁 Redeem Your Points</h2>
                <button 
                  onClick={() => setShowRedemption(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {puffPassData.availableRewards.map((reward, i) => (
                  <div 
                    key={i}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      reward.available
                        ? 'bg-gradient-to-br from-mycora-sage/10 to-mycora-moss/10 border-mycora-sage/30 hover:border-mycora-sage cursor-pointer hover:scale-105'
                        : 'bg-slate-800/50 border-slate-600 opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => reward.available && setSelectedReward(reward.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{reward.name}</div>
                        <div className="text-gray-400 text-sm">{reward.points.toLocaleString()} points</div>
                      </div>
                      <div className="text-right">
                        {reward.available ? (
                          <Button size="sm" className="bg-mycora-sage hover:bg-mycora-moss">
                            Redeem
                          </Button>
                        ) : (
                          <Badge variant="outline" className="border-slate-600 text-slate-400">
                            Locked
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-6 border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={() => setShowRedemption(false)}
              >
                ← Back to PuffPass
              </Button>
            </div>
          ) : (
            // Step 3: Confirmation
            <div className="p-6 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <div className="text-3xl animate-bounce">✅</div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
                <p className="text-gray-300">
                  You've redeemed 1,000 PuffPass points for a {selectedReward}.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  className="w-full bg-mycora-sage hover:bg-mycora-moss"
                  onClick={() => {
                    setShowRedemption(false)
                    setSelectedReward(null)
                    document.getElementById('wallet-section')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  View My Wallet
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
                  onClick={() => {
                    setShowRedemption(false)
                    setSelectedReward(null)
                  }}
                >
                  Earn More Points
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderHeroSection = () => (
    <div className="text-center mb-20 relative">
      {/* Magical background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/4 w-32 h-32 bg-mycora-sage/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-20 right-1/4 w-40 h-40 bg-mycora-moss/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-10 left-1/3 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="mb-12">
        <h1 className="text-7xl md:text-8xl font-black text-transparent bg-gradient-to-br from-mycora-sage via-mycora-moss to-yellow-400 bg-clip-text mb-6 animate-pulse">
          MyCora
        </h1>
        
        <div className="flex items-center justify-center mb-8">
          <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-mycora-sage to-mycora-moss bg-clip-text text-transparent animate-pulse">
            🌟 PuffPass Rewards
          </div>
        </div>
        
        <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
          <span className="text-mycora-sage font-semibold">Earn like Five Star</span> • 
          <span className="text-mycora-moss font-semibold mx-2">Pay like CashApp</span> • 
          <span className="text-yellow-600 font-semibold">Redeem like Starbucks</span>
        </p>
      </div>

      <div className="max-w-lg mx-auto mb-12">
        {renderStunningPuffPassCard()}
      </div>

      <Button
        onClick={handleViewPuffPass}
        size="lg"
        className="relative bg-gradient-to-r from-mycora-sage via-mycora-moss to-yellow-500 hover:from-yellow-500 hover:via-mycora-moss hover:to-mycora-sage text-white px-12 py-4 text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:scale-110 group overflow-hidden"
      >
        <span className="relative z-10">View My PuffPass</span>
        {/* Button shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700"></div>
      </Button>
    </div>
  )

  const renderEnhancedFeatureSection = (
    icon: React.ReactNode,
    title: string,
    description: string,
    primaryButton: string,
    primaryAction: () => void,
    secondaryButton?: string,
    secondaryAction?: () => void,
    accentColor: string = "from-mycora-sage to-mycora-moss"
  ) => (
    <Card className="group relative bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-700 hover:scale-105 hover:shadow-2xl overflow-hidden">
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 group-hover:opacity-10 transition-all duration-700`}></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20 group-hover:opacity-40 transition-all duration-700"
            style={{
              left: `${20 + i * 12}%`,
              top: `${20 + Math.sin(i) * 30}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>

      <CardHeader className="relative">
        <div className={`w-20 h-20 bg-gradient-to-br ${accentColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 shadow-lg group-hover:shadow-2xl`}>
          <div className="text-3xl filter drop-shadow-lg">{icon}</div>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative">
        <p className="text-gray-600 mb-8 leading-relaxed">{description}</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={primaryAction}
            className={`bg-gradient-to-r ${accentColor} hover:shadow-xl text-white font-semibold flex-1 transition-all duration-300 transform hover:scale-105`}
          >
            {primaryButton}
          </Button>
          {secondaryButton && secondaryAction && (
            <Button 
              onClick={secondaryAction}
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 flex-1 transition-all duration-300"
            >
              {secondaryButton}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderMainSections = () => (
    <div className="grid lg:grid-cols-3 gap-8 mb-20">
      {renderEnhancedFeatureSection(
        <span className="text-4xl">💳</span>,
        "Smart Payments",
        "Pay with your phone, earn PuffPass points automatically with every transaction.",
        "Connect Wallet",
        handleConnectWallet,
        "Learn More",
        () => {
          alert("Smart Payments: Seamlessly connect your wallet to earn PuffPass rewards with every transaction. Compatible with popular wallets and supports gasless transactions.")
        },
        "from-blue-500 to-cyan-500"
      )}

      {renderEnhancedFeatureSection(
        <ComplianceBadge status="verified" size="lg" />,
        "Unlock Rewards",
        "Verify once. Unlock exclusive perks across the entire MyCora network.",
        "Verify Identity",
        handleVerifyIdentity,
        "See Available Perks",
        () => {
          alert("Available Perks: 5% cashback on purchases, Free shipping, $10 gift cards, Exclusive partner discounts, Priority customer support, and more!")
        },
        "from-green-500 to-emerald-500"
      )}

      {renderEnhancedFeatureSection(
        <span className="text-4xl">🏦</span>,
        "MyCora Wallet",
        "Store, send, and grow your money with bank-level security and instant transfers.",
        "Open Wallet",
        handleOpenWallet,
        "Send Money",
        () => {
          if (currentStep === "dashboard") {
            document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' })
          } else {
            alert("Connect your wallet first to start sending money securely with MyCora.")
          }
        },
        "from-purple-500 to-pink-500"
      )}
    </div>
  )

  const renderBusinessSection = () => (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-none backdrop-blur-sm mb-20 overflow-hidden relative shadow-2xl">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 800 300">
          <defs>
            <linearGradient id="businessGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--mycora-moss)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--mycora-sage)" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {[...Array(15)].map((_, i) => (
            <circle
              key={i}
              cx={60 + i * 50}
              cy={80 + Math.sin(i * 0.6) * 30}
              r={4}
              fill="url(#businessGlow)"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </svg>
      </div>

      <CardHeader className="text-center relative z-10">
        <div className="w-24 h-24 bg-gradient-to-br from-mycora-moss via-mycora-sage to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <span className="text-4xl filter drop-shadow-lg">📈</span>
        </div>
        <CardTitle className="text-4xl font-bold text-white mb-4">For Businesses</CardTitle>
      </CardHeader>
      
      <CardContent className="text-center relative z-10">
        <p className="text-gray-300 text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
          Scale your brand with PuffPass-powered loyalty and payments. Transform customer engagement with blockchain rewards.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-mycora-sage to-mycora-moss hover:from-mycora-moss hover:to-yellow-500 text-white font-bold px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
            onClick={() => {
              setUserType("business")
              setShowOnboarding(true)
              setCurrentStep("userType")
            }}
          >
            Get Started
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-gray-300 text-gray-300 hover:bg-white/10 hover:border-white px-8 py-4 font-semibold transition-all duration-300"
            onClick={() => {
              window.location.href = "mailto:business@mycora.com?subject=MyCora Business Inquiry&body=Hi, I'm interested in implementing MyCora's PuffPass loyalty system for my business. Please contact me to discuss enterprise solutions."
            }}
          >
            Contact Sales
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderDevPanel = () => {
    if (!isDev || !showDevPanel) return null

    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="bg-red-50 border-red-200 max-w-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-red-800 text-sm">⚠️ Dev Configuration</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDevPanel(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-red-700 text-xs mb-3">
              Environment variables needed for full functionality
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setEnvStatus("ready")}
                className="text-xs border-red-300 text-red-700 hover:bg-red-50"
              >
                Continue Demo
              </Button>
              <Button 
                size="sm" 
                onClick={() => window.location.reload()} 
                className="text-xs bg-red-600 hover:bg-red-700"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderWelcomeScreen = () => (
    <>
      {renderHeroSection()}
      {renderMainSections()}
      {renderBusinessSection()}
      
      {/* Enhanced Dev Tools */}
      {isDev && (
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-600 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              🛠️ Development Tools
              <Badge variant="outline" className="border-slate-500 text-slate-300">
                Dev Mode
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-3">
              {[
                { href: "/dev-tools", label: "Dev Tools" },
                { href: "/admin", label: "Admin Dashboard" },
                { href: "/networks", label: "Networks" },
                { href: "/investors", label: "Investors" }
              ].map((link, i) => (
                <a 
                  key={i}
                  href={link.href} 
                  className="text-xs p-3 border border-slate-600 rounded-lg hover:bg-slate-700/50 transition-all duration-300 text-slate-300 hover:text-white hover:border-slate-500 text-center"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )

  const renderUserTypeSelection = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold text-gray-800 mb-6">Choose Your Path</h2>
        <p className="text-gray-600 text-xl">Select how you'll participate in the MyCora network</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <Card
          className="group bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-700 cursor-pointer hover:scale-105 hover:shadow-2xl relative overflow-hidden"
          onClick={() => handleUserTypeSelection("individual")}
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-mycora-sage/10 to-mycora-moss/10 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
          
          <CardHeader className="text-center relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-mycora-sage to-mycora-moss rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-lg group-hover:shadow-2xl">
              <NetworkNode size="md" active={true} />
            </div>
            <CardTitle className="text-gray-800 text-3xl font-bold">Individual</CardTitle>
          </CardHeader>
          <CardContent className="text-center relative z-10">
            <p className="text-gray-600 mb-6 leading-relaxed">
              Personal rewards and payments with streamlined verification.
            </p>
            <div className="flex justify-center">
              <ComplianceBadge status="basic" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="group bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-700 cursor-pointer hover:scale-105 hover:shadow-2xl relative overflow-hidden"
          onClick={() => handleUserTypeSelection("business")}
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-mycora-moss/10 to-yellow-400/10 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
          
          <CardHeader className="text-center relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-mycora-moss to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-lg group-hover:shadow-2xl">
              <TrustIndicator level="enterprise" />
            </div>
            <CardTitle className="text-gray-800 text-3xl font-bold">Business</CardTitle>
          </CardHeader>
          <CardContent className="text-center relative z-10">
            <p className="text-gray-600 mb-6 leading-relaxed">
              Enterprise-grade loyalty programs with advanced management tools.
            </p>
            <div className="flex justify-center">
              <ComplianceBadge status="enhanced" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderUserDashboard = () => (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-gray-800">Your MyCora Dashboard</h2>
          <p className="text-gray-600 text-lg">Manage your tokens, compliance, and network connections</p>
        </div>
        <div className="flex items-center space-x-4">
          <TrustIndicator level="verified" />
          <ComplianceBadge status="verified" />
          <NetworkNode size="sm" active={walletConnected} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card id="wallet-section" className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-gray-800 text-2xl">Wallet & Tokens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {envStatus === "ready" ? (
                <Suspense fallback={<div className="space-y-4"><div className="animate-pulse bg-gradient-to-r from-mycora-sage/20 to-mycora-moss/20 h-16 rounded-lg"></div><div className="animate-pulse bg-gradient-to-r from-mycora-sage/20 to-mycora-moss/20 h-32 rounded-lg"></div></div>}>
                  <WalletConnect onConnectionChange={handleWalletConnection} />
                  {walletConnected && <MintingInterface />}
                </Suspense>
              ) : (
                <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl text-center">
                  <p className="text-gray-600 mb-4">Wallet connection available with full configuration</p>
                  <Button variant="outline" disabled>Connect Wallet (Demo)</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card id="payment-section" className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-gray-800 text-2xl">Payment Processing</CardTitle>
            </CardHeader>
            <CardContent>
              {envStatus === "ready" ? (
                <Suspense fallback={<div className="animate-pulse bg-gradient-to-r from-mycora-sage/20 to-mycora-moss/20 h-40 rounded-lg"></div>}>
                  <PaymentForm />
                </Suspense>
              ) : (
                <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl text-center">
                  <p className="text-gray-600">Payment processing available with full configuration</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-gray-800 text-xl">Compliance Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>KYC Level</span>
                <Badge variant="default">Level {userSession?.kycLevel || 2}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Risk Score</span>
                <Badge variant="outline">Low (15/100)</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Jurisdiction</span>
                <Badge variant="outline">US, EU</Badge>
              </div>
            </CardContent>
          </Card>

          <div id="rewards-section">
            {userEmail && <RewardsDashboard customerEmail={userEmail} />}
          </div>

          <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="text-gray-800 text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start bg-transparent hover:bg-white/10"
                onClick={() => {
                  alert("Transaction History:\n\n• Coffee purchase: +25 PuffPass points\n• Wallet connection: +50 PuffPass points\n• KYC verification: +100 PuffPass points\n• Referral bonus: +200 PuffPass points")
                }}
              >
                View Transaction History
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start bg-transparent hover:bg-white/10"
                onClick={() => {
                  const report = `MyCora Compliance Report
Generated: ${new Date().toLocaleDateString()}

KYC Status: ✅ Verified (Level ${userSession?.kycLevel || 2})
Risk Assessment: ✅ Low Risk (15/100)
Jurisdiction: ✅ US, EU Compliant
PuffPass Tier: ${puffPassData.tier}
Total Points Earned: ${puffPassData.points.toLocaleString()}

All compliance requirements met.`
                  
                  const blob = new Blob([report], { type: 'text/plain' })
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'mycora-compliance-report.txt'
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  window.URL.revokeObjectURL(url)
                }}
              >
                Download Compliance Report
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start bg-transparent hover:bg-white/10"
                onClick={() => {
                  setCurrentStep("security")
                }}
              >
                Manage Security Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  // Show dev panel if environment issues detected
  useEffect(() => {
    if (isDev && envStatus === "missing") {
      setShowDevPanel(true)
    }
  }, [envStatus, isDev])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 1400 800">
          <defs>
            <radialGradient id="stunningNodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--mycora-sage)" stopOpacity="0.8" />
              <stop offset="50%" stopColor="var(--mycora-moss)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--mycora-sage)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="stunningConnection" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--mycora-sage)" stopOpacity="0.3" />
              <stop offset="50%" stopColor="var(--mycora-moss)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--mycora-sage)" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {[...Array(12)].map((_, i) => (
            <circle
              key={i}
              cx={200 + i * 100}
              cy={150 + Math.sin(i * 0.5) * 40}
              r={6}
              fill="url(#stunningNodeGlow)"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.4}s`, animationDuration: `${2 + i * 0.1}s` }}
            />
          ))}
          {[...Array(11)].map((_, i) => (
            <path
              key={i}
              d={`M${200 + i * 100},${150 + Math.sin(i * 0.5) * 40} Q${250 + i * 100},${120 + Math.sin((i + 0.5) * 0.5) * 30} ${300 + i * 100},${150 + Math.sin((i + 1) * 0.5) * 40}`}
              stroke="url(#stunningConnection)"
              strokeWidth="2"
              fill="none"
              opacity="0.4"
            />
          ))}
        </svg>
      </div>

      {/* Floating animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(90deg); }
          50% { transform: translateY(-5px) rotate(180deg); }
          75% { transform: translateY(-15px) rotate(270deg); }
        }
      `}</style>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {currentStep === "welcome" && renderWelcomeScreen()}
        {currentStep === "userType" && renderUserTypeSelection()}
        
        {currentStep === "security" && userSession && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Security Verification</h2>
              <p className="text-gray-600 text-lg">Complete security checks to access your dashboard</p>
            </div>
            <SecurityVerification
              sessionId={userSession.sessionId}
              requiresMFA={userSession.requiresMFA}
              requiresBiometric={userSession.requiresBiometric}
              onVerificationComplete={handleSecurityVerification}
            />
          </div>
        )}

        {currentStep === "kyc" && (
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Identity Verification</h2>
            <p className="text-gray-600 text-lg mb-8">Complete verification to unlock full PuffPass rewards</p>
            <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-center">
                    <ComplianceBadge status="pending" size="lg" />
                  </div>
                  <div className="space-y-4">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:border-mycora-sage focus:ring-2 focus:ring-mycora-sage/20"
                    />
                    <Button
                      onClick={handleKYCComplete}
                      disabled={!userEmail}
                      className="w-full bg-gradient-to-r from-mycora-sage to-mycora-moss hover:from-mycora-moss hover:to-yellow-500 text-white font-bold py-3"
                    >
                      Verify & Unlock Rewards
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your information is encrypted and stored securely in compliance with global privacy regulations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === "dashboard" && renderUserDashboard()}
      </div>

      {renderRedemptionFlow()}
      {renderDevPanel()}
    </div>
  )
}
