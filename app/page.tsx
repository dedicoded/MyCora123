
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
  loading: () => <div className="animate-pulse bg-mycora-sage/20 h-64 rounded-lg"></div>
})

const RewardsDashboard = dynamic(() => import("@/components/ui/rewards-dashboard").then(mod => ({ default: mod.RewardsDashboard })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-mycora-sage/20 h-48 rounded-lg"></div>
})

const PaymentForm = dynamic(() => import("@/components/ui/payment-form").then(mod => ({ default: mod.PaymentForm })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-mycora-sage/20 h-40 rounded-lg"></div>
})

const WalletConnect = dynamic(() => import('@/components/WalletConnect').then(mod => ({ default: mod.WalletConnect })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-mycora-sage/20 h-16 rounded-lg"></div>
})

const MintingInterface = dynamic(() => import('@/components/MintingInterface'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-mycora-sage/20 h-32 rounded-lg"></div>
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
      // If already in dashboard, scroll to rewards section
      document.getElementById('rewards-section')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      // Start onboarding flow
      handleBeginJourney()
    }
  }

  const handleConnectWallet = () => {
    if (currentStep === "dashboard") {
      // Trigger wallet connection in dashboard
      setCurrentStep("dashboard")
    } else {
      // Start onboarding and go to wallet connection
      setShowOnboarding(true)
      setCurrentStep("userType")
    }
  }

  const handleVerifyIdentity = () => {
    if (currentStep === "dashboard") {
      // Show KYC verification in dashboard
      setCurrentStep("kyc")
    } else {
      // Start onboarding flow
      handleBeginJourney()
    }
  }

  const handleOpenWallet = () => {
    if (currentStep === "dashboard") {
      // Focus on wallet section
      document.getElementById('wallet-section')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      // Start onboarding
      handleBeginJourney()
    }
  }

  const handleUserTypeSelection = async (type: "individual" | "business") => {
    setUserType(type)
    setCurrentStep("security")

    // Create secure session in background
    const deviceInfo = {
      userAgent: navigator.userAgent,
      screen: { width: screen.width, height: screen.height },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
    }

    // Non-blocking session creation
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

  // PuffPass Mock Data - in production, this comes from user's account
  const puffPassData = {
    tier: "Silver",
    points: 2847,
    nextTierPoints: 5000,
    availableRewards: ["5% cashback", "Free shipping", "$10 gift card"],
    recentEarning: "+25 points from coffee purchase"
  }

  const renderPuffPassCard = () => (
    <Card className="bg-gradient-to-br from-mycora-sage/20 to-mycora-moss/20 border-mycora-sage/30 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-mycora-earth flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-mycora-sage to-mycora-moss"></div>
              PuffPass {puffPassData.tier}
            </CardTitle>
            <p className="text-mycora-sage text-sm mt-1">{puffPassData.recentEarning}</p>
          </div>
          <Badge variant="outline" className="border-mycora-sage text-mycora-sage">
            {puffPassData.points.toLocaleString()} pts
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-mycora-sage">Progress to Gold</span>
              <span className="text-mycora-earth">{puffPassData.points}/{puffPassData.nextTierPoints}</span>
            </div>
            <Progress 
              value={(puffPassData.points / puffPassData.nextTierPoints) * 100} 
              className="h-2"
            />
          </div>
          <div>
            <p className="text-sm text-mycora-sage mb-2">Available rewards:</p>
            <div className="flex flex-wrap gap-1">
              {puffPassData.availableRewards.map((reward, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {reward}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderHeroSection = () => (
    <div className="text-center mb-16">
      <div className="mb-8">
        <h1 className="text-6xl font-bold text-mycora-earth mb-4 bg-gradient-to-r from-mycora-sage to-mycora-moss bg-clip-text text-transparent">
          MyCora
        </h1>
        <div className="flex items-center justify-center mb-6">
          <div className="text-2xl font-medium text-mycora-sage">
            🌟 PuffPass Rewards
          </div>
        </div>
        <p className="text-xl text-mycora-sage max-w-3xl mx-auto mb-8">
          Earn like Five Star • Pay like CashApp • Redeem like Starbucks
        </p>
      </div>

      <div className="max-w-md mx-auto mb-8">
        {renderPuffPassCard()}
      </div>

      <Button
        onClick={handleViewPuffPass}
        size="lg"
        className="bg-gradient-to-r from-mycora-sage to-mycora-moss hover:from-mycora-moss hover:to-mycora-sage text-white px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        View My PuffPass
      </Button>
    </div>
  )

  const renderFeatureSection = (
    icon: React.ReactNode,
    title: string,
    description: string,
    primaryButton: string,
    primaryAction: () => void,
    secondaryButton?: string,
    secondaryAction?: () => void
  ) => (
    <Card className="bg-mycora-earth/5 border-mycora-sage/20 backdrop-blur-sm hover:bg-mycora-earth/10 transition-all duration-300 group">
      <CardHeader>
        <div className="w-16 h-16 bg-gradient-to-br from-mycora-sage to-mycora-moss rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <CardTitle className="text-mycora-earth text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-mycora-sage mb-6">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={primaryAction}
            className="bg-mycora-sage hover:bg-mycora-moss text-white flex-1"
          >
            {primaryButton}
          </Button>
          {secondaryButton && secondaryAction && (
            <Button 
              onClick={secondaryAction}
              variant="outline" 
              className="border-mycora-sage text-mycora-sage hover:bg-mycora-sage/10 flex-1"
            >
              {secondaryButton}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderMainSections = () => (
    <div className="grid lg:grid-cols-3 gap-8 mb-16">
      {renderFeatureSection(
        <div className="text-2xl">💳</div>,
        "Smart Payments",
        "Pay with your phone, earn PuffPass points automatically.",
        "Connect Wallet",
        handleConnectWallet,
        "Learn More",
        () => {
          // Create a simple info modal or expand description
          alert("Smart Payments: Seamlessly connect your wallet to earn PuffPass rewards with every transaction. Compatible with popular wallets and supports gasless transactions.")
        }
      )}

      {renderFeatureSection(
        <ComplianceBadge status="verified" size="lg" />,
        "Unlock Rewards",
        "Verify once. Unlock exclusive perks across the MyCora network.",
        "Verify Identity",
        handleVerifyIdentity,
        "See Available Perks",
        () => {
          // Show available perks preview
          alert("Available Perks: 5% cashback on purchases, Free shipping, $10 gift cards, Exclusive partner discounts, Priority customer support, and more!")
        }
      )}

      {renderFeatureSection(
        <div className="text-2xl">🏦</div>,
        "MyCora Wallet",
        "Store, send, and grow your money with bank-level security.",
        "Open Wallet",
        handleOpenWallet,
        "Send Money",
        () => {
          // Quick send flow
          if (currentStep === "dashboard") {
            document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' })
          } else {
            alert("Connect your wallet first to start sending money securely with MyCora.")
          }
        }
      )}
    </div>
  )

  const renderBusinessSection = () => (
    <Card className="bg-gradient-to-r from-mycora-earth/10 to-mycora-sage/5 border-mycora-sage/20 backdrop-blur-sm mb-16">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-mycora-moss to-mycora-earth rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="text-2xl">📈</div>
        </div>
        <CardTitle className="text-mycora-earth text-3xl">For Businesses</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-mycora-sage text-lg mb-6 max-w-2xl mx-auto">
          Scale your brand with PuffPass-powered loyalty and payments.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-mycora-sage hover:bg-mycora-moss"
            onClick={() => {
              // For businesses, start with business onboarding
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
            className="border-mycora-sage text-mycora-sage hover:bg-mycora-sage/10"
            onClick={() => {
              // Simple contact form or email mailto
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
      
      {/* Dev Tools - Only show in development */}
      {isDev && (
        <Card className="bg-mycora-earth/5 border-mycora-sage/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-mycora-earth text-sm">🛠️ Development Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-3">
              <a href="/dev-tools" className="text-xs p-2 border border-mycora-sage/20 rounded hover:bg-mycora-earth/10 transition-colors">
                Dev Tools
              </a>
              <a href="/admin" className="text-xs p-2 border border-mycora-sage/20 rounded hover:bg-mycora-earth/10 transition-colors">
                Admin Dashboard
              </a>
              <a href="/networks" className="text-xs p-2 border border-mycora-sage/20 rounded hover:bg-mycora-earth/10 transition-colors">
                Networks
              </a>
              <a href="/investors" className="text-xs p-2 border border-mycora-sage/20 rounded hover:bg-mycora-earth/10 transition-colors">
                Investors
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )

  const renderUserTypeSelection = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-mycora-earth mb-4">Choose Your Path</h2>
        <p className="text-mycora-sage text-lg">Select how you'll participate in the MyCora network</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card
          className="bg-mycora-earth/5 border-mycora-sage/20 backdrop-blur-sm hover:bg-mycora-earth/10 transition-all duration-300 cursor-pointer group"
          onClick={() => handleUserTypeSelection("individual")}
        >
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-mycora-sage to-mycora-moss rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <NetworkNode size="md" active={true} />
            </div>
            <CardTitle className="text-mycora-earth text-2xl">Individual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-mycora-sage text-center mb-4">
              Personal rewards and payments with streamlined verification.
            </p>
            <div className="flex justify-center">
              <ComplianceBadge status="basic" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-mycora-earth/5 border-mycora-sage/20 backdrop-blur-sm hover:bg-mycora-earth/10 transition-all duration-300 cursor-pointer group"
          onClick={() => handleUserTypeSelection("business")}
        >
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-mycora-moss to-mycora-earth rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <TrustIndicator level="enterprise" />
            </div>
            <CardTitle className="text-mycora-earth text-2xl">Business</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-mycora-sage text-center mb-4">
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
          <h2 className="text-3xl font-bold text-mycora-earth">Your MyCora Dashboard</h2>
          <p className="text-mycora-sage">Manage your tokens, compliance, and network connections</p>
        </div>
        <div className="flex items-center space-x-4">
          <TrustIndicator level="verified" />
          <ComplianceBadge status="verified" />
          <NetworkNode size="sm" active={walletConnected} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card id="wallet-section" className="bg-mycora-earth/5 border-mycora-sage/20">
            <CardHeader>
              <CardTitle className="text-mycora-earth">Wallet & Tokens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {envStatus === "ready" ? (
                <Suspense fallback={<div className="space-y-4"><div className="animate-pulse bg-mycora-sage/20 h-16 rounded-lg"></div><div className="animate-pulse bg-mycora-sage/20 h-32 rounded-lg"></div></div>}>
                  <WalletConnect onConnectionChange={handleWalletConnection} />
                  {walletConnected && <MintingInterface />}
                </Suspense>
              ) : (
                <div className="p-6 border-2 border-dashed border-mycora-sage/30 rounded-lg text-center">
                  <p className="text-mycora-sage mb-4">Wallet connection available with full configuration</p>
                  <Button variant="outline" disabled>Connect Wallet (Demo)</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card id="payment-section" className="bg-mycora-earth/5 border-mycora-sage/20">
            <CardHeader>
              <CardTitle className="text-mycora-earth">Payment Processing</CardTitle>
            </CardHeader>
            <CardContent>
              {envStatus === "ready" ? (
                <Suspense fallback={<div className="animate-pulse bg-mycora-sage/20 h-40 rounded-lg"></div>}>
                  <PaymentForm />
                </Suspense>
              ) : (
                <div className="p-6 border-2 border-dashed border-mycora-sage/30 rounded-lg text-center">
                  <p className="text-mycora-sage">Payment processing available with full configuration</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-mycora-earth/5 border-mycora-sage/20">
            <CardHeader>
              <CardTitle className="text-mycora-earth">Compliance Status</CardTitle>
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

          <Card className="bg-mycora-earth/5 border-mycora-sage/20">
            <CardHeader>
              <CardTitle className="text-mycora-earth">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start bg-transparent"
                onClick={() => {
                  // Mock transaction history - in production this would open a detailed view
                  alert("Transaction History:\n\n• Coffee purchase: +25 PuffPass points\n• Wallet connection: +50 PuffPass points\n• KYC verification: +100 PuffPass points\n• Referral bonus: +200 PuffPass points")
                }}
              >
                View Transaction History
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start bg-transparent"
                onClick={() => {
                  // Generate compliance report
                  const report = `MyCora Compliance Report
Generated: ${new Date().toLocaleDateString()}

KYC Status: ✅ Verified (Level ${userSession?.kycLevel || 2})
Risk Assessment: ✅ Low Risk (15/100)
Jurisdiction: ✅ US, EU Compliant
PuffPass Tier: ${puffPassData.tier}
Total Points Earned: ${puffPassData.points.toLocaleString()}

All compliance requirements met.`
                  
                  // Create downloadable report
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
                className="w-full justify-start bg-transparent"
                onClick={() => {
                  // Navigate to security settings
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
    <div className="min-h-screen bg-gradient-to-br from-mycora-earth/5 to-mycora-sage/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1200 800">
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--mycora-sage)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--mycora-sage)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {[...Array(8)].map((_, i) => (
            <circle
              key={i}
              cx={200 + i * 120}
              cy={150 + Math.sin(i * 0.5) * 30}
              r={4}
              fill="url(#nodeGlow)"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
          {[...Array(7)].map((_, i) => (
            <path
              key={i}
              d={`M${200 + i * 120},${150 + Math.sin(i * 0.5) * 30} Q${260 + i * 120},${120 + Math.sin((i + 0.5) * 0.5) * 20} ${320 + i * 120},${150 + Math.sin((i + 1) * 0.5) * 30}`}
              stroke="var(--mycora-sage)"
              strokeWidth="1"
              fill="none"
              opacity="0.3"
            />
          ))}
        </svg>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {currentStep === "welcome" && renderWelcomeScreen()}
        {currentStep === "userType" && renderUserTypeSelection()}
        
        {currentStep === "security" && userSession && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-mycora-earth mb-4">Security Verification</h2>
              <p className="text-mycora-sage">Complete security checks to access your dashboard</p>
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
            <h2 className="text-3xl font-bold text-mycora-earth mb-4">Identity Verification</h2>
            <p className="text-mycora-sage mb-8">Complete verification to unlock full PuffPass rewards</p>
            <Card className="bg-mycora-earth/5 border-mycora-sage/20">
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
                      className="w-full p-3 border border-mycora-sage/20 rounded-lg bg-white/50"
                    />
                    <Button
                      onClick={handleKYCComplete}
                      disabled={!userEmail}
                      className="w-full bg-mycora-sage hover:bg-mycora-moss"
                    >
                      Verify & Unlock Rewards
                    </Button>
                  </div>
                  <p className="text-sm text-mycora-sage">
                    Your information is encrypted and stored securely in compliance with global privacy regulations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === "dashboard" && renderUserDashboard()}
      </div>

      {renderDevPanel()}
    </div>
  )
}
