"use client"

import { useState } from "react"
import { WalletConnect } from "@/components/WalletConnect"
import { MintingInterface } from "@/components/MintingInterface"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Page() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [userType, setUserType] = useState<"individual" | "business" | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 1200 800">
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Mycelial network nodes */}
          <circle cx="200" cy="150" r="4" fill="url(#nodeGlow)" className="animate-pulse" />
          <circle
            cx="400"
            cy="200"
            r="3"
            fill="url(#nodeGlow)"
            className="animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
          <circle
            cx="600"
            cy="180"
            r="5"
            fill="url(#nodeGlow)"
            className="animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <circle
            cx="800"
            cy="250"
            r="3"
            fill="url(#nodeGlow)"
            className="animate-pulse"
            style={{ animationDelay: "1.5s" }}
          />
          <circle
            cx="1000"
            cy="200"
            r="4"
            fill="url(#nodeGlow)"
            className="animate-pulse"
            style={{ animationDelay: "2s" }}
          />

          {/* Connection lines */}
          <path d="M200,150 Q300,120 400,200" stroke="#8b5cf6" strokeWidth="1" fill="none" opacity="0.3" />
          <path d="M400,200 Q500,160 600,180" stroke="#8b5cf6" strokeWidth="1" fill="none" opacity="0.3" />
          <path d="M600,180 Q700,200 800,250" stroke="#8b5cf6" strokeWidth="1" fill="none" opacity="0.3" />
          <path d="M800,250 Q900,220 1000,200" stroke="#8b5cf6" strokeWidth="1" fill="none" opacity="0.3" />
        </svg>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {!showOnboarding ? (
          <>
            <div className="text-center mb-16">
              <div className="mb-8">
                <div className="inline-block p-4 rounded-full bg-purple-500/20 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                    🌱
                  </div>
                </div>
              </div>
              <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Welcome to the Network
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
                You are a spore. Ready to root into the trust network? Join the mycelial ecosystem where blockchain
                meets organic growth.
              </p>
              <Button
                onClick={() => setShowOnboarding(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Begin Your Journey
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 group">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    🔒
                  </div>
                  <CardTitle className="text-white">Security Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">
                    Issue and manage compliant security tokens with built-in regulatory features. Grow your trust roots.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 group">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    ⚖️
                  </div>
                  <CardTitle className="text-white">Trust Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">
                    Automated compliance checks and regulatory reporting. Watch your network connections flourish.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 group">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    🌐
                  </div>
                  <CardTitle className="text-white">DeFi Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">
                    Connect to decentralized finance protocols. Pollinate the network with institutional-grade security.
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">Root Yourself in the Network</h2>
                <p className="text-slate-300 text-lg">Choose your path and connect to begin growing</p>
              </div>

              {!userType ? (
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  <Card
                    className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 cursor-pointer group"
                    onClick={() => setUserType("individual")}
                  >
                    <CardHeader className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        🧑
                      </div>
                      <CardTitle className="text-white text-2xl">Individual</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-center">
                        I'm here to grow ideas and contribute to the trust network as an individual innovator.
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 cursor-pointer group"
                    onClick={() => setUserType("business")}
                  >
                    <CardHeader className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        🏢
                      </div>
                      <CardTitle className="text-white text-2xl">Business</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-center">
                        We're here to cultivate trust and manage compliant token operations at scale.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h3>
                    <p className="text-slate-300 mb-6">Connect your wallet to begin growing in the network.</p>
                    <WalletConnect />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Mint Your Tokens</h3>
                    <p className="text-slate-300 mb-6">Create your first tokens and establish your presence.</p>
                    <MintingInterface />
                  </div>
                </div>
              )}

              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowOnboarding(false)
                    setUserType(null)
                  }}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Back to Network View
                </Button>
              </div>
            </div>
          </>
        )}

        {process.env.NODE_ENV === "development" && !showOnboarding && (
          <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-sm mb-16">
            <CardHeader>
              <CardTitle className="text-white">🛠️ Development Mycelium</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-6">
                Access the underground development network - tools for cultivating and testing MyCora features.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <a
                  href="/dev-tools"
                  className="block p-4 border border-slate-600 rounded-lg hover:border-purple-400 hover:bg-slate-800/50 transition-all duration-300 group"
                >
                  <div className="font-semibold text-white group-hover:text-purple-300">Dev Tools Network</div>
                  <div className="text-sm text-slate-400">Comprehensive development utilities</div>
                </a>
                <a
                  href="/dev"
                  className="block p-4 border border-slate-600 rounded-lg hover:border-purple-400 hover:bg-slate-800/50 transition-all duration-300 group"
                >
                  <div className="font-semibold text-white group-hover:text-purple-300">Dev Console</div>
                  <div className="text-sm text-slate-400">Advanced debugging spores</div>
                </a>
                <div className="p-4 border border-slate-600 rounded-lg bg-slate-800/30">
                  <div className="font-semibold text-slate-300">Quick Growth</div>
                  <div className="text-sm text-slate-400">Development shortcuts</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!showOnboarding && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/networks"
              className="block p-6 bg-slate-800/30 border border-slate-700 rounded-lg hover:bg-slate-800/50 hover:border-purple-400 transition-all duration-300 group backdrop-blur-sm"
            >
              <div className="font-semibold text-white group-hover:text-purple-300">Networks</div>
              <div className="text-sm text-slate-400">Blockchain root systems</div>
            </a>
            <a
              href="/investors"
              className="block p-6 bg-slate-800/30 border border-slate-700 rounded-lg hover:bg-slate-800/50 hover:border-purple-400 transition-all duration-300 group backdrop-blur-sm"
            >
              <div className="font-semibold text-white group-hover:text-purple-300">Investors</div>
              <div className="text-sm text-slate-400">Network cultivators</div>
            </a>
            <a
              href="/admin"
              className="block p-6 bg-slate-800/30 border border-slate-700 rounded-lg hover:bg-slate-800/50 hover:border-purple-400 transition-all duration-300 group backdrop-blur-sm"
            >
              <div className="font-semibold text-white group-hover:text-purple-300">Admin</div>
              <div className="text-sm text-slate-400">Network management</div>
            </a>
            <a
              href="/onboarding"
              className="block p-6 bg-slate-800/30 border border-slate-700 rounded-lg hover:bg-slate-800/50 hover:border-purple-400 transition-all duration-300 group backdrop-blur-sm"
            >
              <div className="font-semibold text-white group-hover:text-purple-300">Onboarding</div>
              <div className="text-sm text-slate-400">Growth guide</div>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
