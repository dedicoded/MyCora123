"use client"

import { useState } from "react"
import { WalletConnect } from "@/components/WalletConnect"
import { MintingInterface } from "@/components/MintingInterface"
import { SecurityVerification } from "@/components/ui/security-verification"
import { RewardsDashboard } from "@/components/ui/rewards-dashboard"
import { PaymentForm } from "@/components/ui/payment-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrustIndicator } from "@/components/ui/trust-indicator"
import { ComplianceBadge } from "@/components/ui/compliance-badge"
import { NetworkNode } from "@/components/ui/network-node"

interface UserSession {
  sessionId: string
  requiresMFA: boolean
  requiresBiometric: boolean
  kycLevel: number
  complianceStatus: string
}

export default function Page() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [userType, setUserType] = useState<"individual" | "business" | null>(null)
  const [currentStep, setCurrentStep] = useState<"welcome" | "userType" | "security" | "kyc" | "dashboard">("welcome")
  const [userSession, setUserSession] = useState<UserSession | null>(null)
  const [walletConnected, setWalletConnected] = useState(false)
  const [userEmail, setUserEmail] = useState("")

  const handleBeginJourney = () => {
    setShowOnboarding(true)
    setCurrentStep("userType")
  }

  const handleUserTypeSelection = async (type: "individual" | "business") => {
    setUserType(type)

    // Create secure session
    const deviceInfo = {
      userAgent: navigator.userAgent,
      screen: { width: screen.width, height: screen.height },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
    }

    try {
      const response = await fetch("/api/security/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: `temp_${Date.now()}`,
          deviceInfo,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setUserSession(data.session)
        setCurrentStep("security")
      }
    } catch (error) {
      console.error("Session creation failed:", error)
    }
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
    setWalletConnected(connected)
  }

  const renderWelcomeScreen = () => (
    <>
      <div className="text-center mb-16">
        <div className="mb-8">
          <div className="inline-block p-4 rounded-full bg-mycora-sage/20 mb-6">
            <NetworkNode size="lg" active={true} />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-mycora-earth mb-6 bg-gradient-to-r from-mycora-sage to-mycora-moss bg-clip-text text-transparent">
          Welcome to MyCora
        </h1>
        <p className="text-xl text-mycora-sage max-w-3xl mx-auto mb-8">
          The comprehensive blockchain platform for security tokens, compliance management, and decentralized finance
          solutions. Join the mycelial network where trust grows organically.
        </p>
        <div className="flex items-center justify-center space-x-4 mb-8">
          <TrustIndicator level="platform" />
          <ComplianceBadge status="verified" />
          <Badge variant="outline" className="border-mycora-sage text-mycora-sage">
            Enterprise Ready
          </Badge>
        </div>
        <Button
          onClick={handleBeginJourney}
          className="bg-gradient-to-r from-mycora-sage to-mycora-moss hover:from-mycora-moss hover:to-mycora-sage text-white px-12 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Begin Your Journey
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <Card className="bg-mycora-earth/5 border-mycora-sage/20 backdrop-blur-sm hover:bg-mycora-earth/10 transition-all duration-300 group">
          <CardHeader>
            <div className="w-16 h-16 bg-gradient-to-br from-mycora-sage to-mycora-moss rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <NetworkNode size="sm" active={true} />
            </div>
            <CardTitle className="text-mycora-earth">Security Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-mycora-sage">
              Issue and manage compliant security tokens with built-in regulatory features and automated compliance.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-mycora-earth/5 border-mycora-sage/20 backdrop-blur-sm hover:bg-mycora-earth/10 transition-all duration-300 group">
          <CardHeader>
            <div className="w-16 h-16 bg-gradient-to-br from-mycora-moss to-mycora-sage rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ComplianceBadge status="verified" size="lg" />
            </div>
            <CardTitle className="text-mycora-earth">Compliance Engine</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-mycora-sage">
              Automated KYC/AML checks, risk assessment, and regulatory reporting for global markets.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-mycora-earth/5 border-mycora-sage/20 backdrop-blur-sm hover:bg-mycora-earth/10 transition-all duration-300 group">
          <CardHeader>
            <div className="w-16 h-16 bg-gradient-to-br from-mycora-sage to-mycora-earth rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrustIndicator level="secure" />
            </div>
            <CardTitle className="text-mycora-earth">DeFi Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-mycora-sage">
              Connect to decentralized finance protocols with institutional-grade security and compliance.
            </p>
          </CardContent>
        </Card>
      </div>
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
              Personal investment and token management with streamlined compliance for individual users.
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
              Enterprise-grade token operations with advanced compliance, reporting, and management tools.
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
        {/* Wallet & Token Management */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-mycora-earth/5 border-mycora-sage/20">
            <CardHeader>
              <CardTitle className="text-mycora-earth">Wallet & Tokens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <WalletConnect onConnectionChange={handleWalletConnection} />
              {walletConnected && <MintingInterface />}
            </CardContent>
          </Card>

          <Card className="bg-mycora-earth/5 border-mycora-sage/20">
            <CardHeader>
              <CardTitle className="text-mycora-earth">Payment Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentForm />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
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

          {userEmail && <RewardsDashboard customerEmail={userEmail} />}

          <Card className="bg-mycora-earth/5 border-mycora-sage/20">
            <CardHeader>
              <CardTitle className="text-mycora-earth">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                View Transaction History
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Download Compliance Report
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Manage Security Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-mycora-earth/5 to-mycora-sage/5 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1200 800">
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--mycora-sage)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--mycora-sage)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Mycelial network nodes */}
          {[...Array(8)].map((_, i) => (
            <circle
              key={i}
              cx={200 + i * 120}
              cy={150 + Math.sin(i) * 50}
              r={3 + Math.random() * 3}
              fill="url(#nodeGlow)"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
          {/* Connection lines */}
          {[...Array(7)].map((_, i) => (
            <path
              key={i}
              d={`M${200 + i * 120},${150 + Math.sin(i) * 50} Q${260 + i * 120},${120 + Math.sin(i + 0.5) * 30} ${320 + i * 120},${150 + Math.sin(i + 1) * 50}`}
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
            <p className="text-mycora-sage mb-8">Complete KYC verification to unlock full platform features</p>
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
                      Complete KYC Verification
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

        {process.env.NODE_ENV === "development" && currentStep === "welcome" && (
          <Card className="bg-mycora-earth/5 border-mycora-sage/20 backdrop-blur-sm mb-16">
            <CardHeader>
              <CardTitle className="text-mycora-earth">🛠️ Development Network</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-mycora-sage mb-6">
                Access development tools and testing utilities for the MyCora platform.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <a
                  href="/dev-tools"
                  className="block p-4 border border-mycora-sage/20 rounded-lg hover:border-mycora-sage hover:bg-mycora-earth/10 transition-all duration-300 group"
                >
                  <div className="font-semibold text-mycora-earth group-hover:text-mycora-sage">Dev Tools</div>
                  <div className="text-sm text-mycora-sage">Development utilities</div>
                </a>
                <a
                  href="/admin"
                  className="block p-4 border border-mycora-sage/20 rounded-lg hover:border-mycora-sage hover:bg-mycora-earth/10 transition-all duration-300 group"
                >
                  <div className="font-semibold text-mycora-earth group-hover:text-mycora-sage">Admin Dashboard</div>
                  <div className="text-sm text-mycora-sage">Platform management</div>
                </a>
                <div className="p-4 border border-mycora-sage/20 rounded-lg bg-mycora-earth/5">
                  <div className="font-semibold text-mycora-earth">API Testing</div>
                  <div className="text-sm text-mycora-sage">Endpoint validation</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "welcome" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/networks"
              className="block p-6 bg-mycora-earth/5 border border-mycora-sage/20 rounded-lg hover:bg-mycora-earth/10 hover:border-mycora-sage transition-all duration-300 group backdrop-blur-sm"
            >
              <div className="font-semibold text-mycora-earth group-hover:text-mycora-sage">Networks</div>
              <div className="text-sm text-mycora-sage">Blockchain networks</div>
            </a>
            <a
              href="/investors"
              className="block p-6 bg-mycora-earth/5 border border-mycora-sage/20 rounded-lg hover:bg-mycora-earth/10 hover:border-mycora-sage transition-all duration-300 group backdrop-blur-sm"
            >
              <div className="font-semibold text-mycora-earth group-hover:text-mycora-sage">Investors</div>
              <div className="text-sm text-mycora-sage">Investment management</div>
            </a>
            <a
              href="/admin"
              className="block p-6 bg-mycora-earth/5 border border-mycora-sage/20 rounded-lg hover:bg-mycora-earth/10 hover:border-mycora-sage transition-all duration-300 group backdrop-blur-sm"
            >
              <div className="font-semibold text-mycora-earth group-hover:text-mycora-sage">Admin</div>
              <div className="text-sm text-mycora-sage">Platform administration</div>
            </a>
            <a
              href="/onboarding"
              className="block p-6 bg-mycora-earth/5 border border-mycora-sage/20 rounded-lg hover:bg-mycora-earth/10 hover:border-mycora-sage transition-all duration-300 group backdrop-blur-sm"
            >
              <div className="font-semibold text-mycora-earth group-hover:text-mycora-sage">Onboarding</div>
              <div className="text-sm text-mycora-sage">Getting started guide</div>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
