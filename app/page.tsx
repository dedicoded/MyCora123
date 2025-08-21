
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  const { isConnected, address } = useAccount()
  const [activeNode, setActiveNode] = useState(0)
  const [networkGrowth, setNetworkGrowth] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode(prev => (prev + 1) % 6)
      setNetworkGrowth(prev => Math.min(prev + 1, 100))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: "🌱",
      title: "Seed Investment",
      description: "Plant your capital in the growing cannabis innovation network",
      color: "from-green-400 to-emerald-600"
    },
    {
      icon: "🔗",
      title: "Trust Network",
      description: "Build verifiable connections through blockchain-verified transactions",
      color: "from-blue-400 to-cyan-600"
    },
    {
      icon: "🏆",
      title: "PuffPass Rewards",
      description: "Earn exclusive perks and access through network participation",
      color: "from-purple-400 to-pink-600"
    },
    {
      icon: "🔐",
      title: "Compliance First",
      description: "Fully regulated framework ensuring legal protection",
      color: "from-orange-400 to-red-600"
    },
    {
      icon: "💎",
      title: "Exclusive Access",
      description: "Unlock premium cannabis products and experiences",
      color: "from-yellow-400 to-orange-600"
    },
    {
      icon: "🌐",
      title: "Global Network",
      description: "Connect with innovators, investors, and industry leaders worldwide",
      color: "from-teal-400 to-blue-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-teal-950 overflow-hidden">
      {/* Animated Background Network */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 1200 800">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.circle
              key={i}
              cx={Math.random() * 1200}
              cy={Math.random() * 800}
              r={Math.random() * 3 + 1}
              fill="#10b981"
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.path
              key={`line-${i}`}
              d={`M${Math.random() * 1200},${Math.random() * 800} Q${Math.random() * 1200},${Math.random() * 800} ${Math.random() * 1200},${Math.random() * 800}`}
              stroke="#10b981"
              strokeWidth="1"
              fill="none"
              opacity="0.2"
              animate={{
                pathLength: [0, 1, 0],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-4xl">🍄</div>
            <div>
              <h1 className="text-2xl font-bold text-green-400">MyCora</h1>
              <p className="text-sm text-green-600">Mycelial Cannabis Network</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                const ready = mounted
                const connected = ready && account && chain

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      style: {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <Button 
                            onClick={openConnectModal}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transform hover:scale-105 transition-all duration-300"
                          >
                            🌱 Join Network
                          </Button>
                        )
                      }

                      return (
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-400">
                            Connected
                          </Badge>
                          <Button 
                            onClick={openAccountModal}
                            className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 hover:from-green-500/30 hover:to-emerald-600/30 text-green-400 border border-green-500/30"
                          >
                            {account.displayName}
                          </Button>
                        </div>
                      )
                    })()}
                  </div>
                )
              }}
            </ConnectButton.Custom>
          </motion.div>
        </header>

        {/* Hero Section */}
        <section className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <h2 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
              The Future of
            </h2>
            <h3 className="text-4xl md:text-6xl font-bold mb-8 text-white">
              Cannabis Innovation
            </h3>
            <p className="text-xl md:text-2xl text-green-300 max-w-4xl mx-auto leading-relaxed">
              MyCora creates a living network where cannabis entrepreneurs, investors, and enthusiasts 
              connect through blockchain-verified trust, exclusive rewards, and compliant innovation.
            </p>
          </motion.div>

          <motion.div
            className="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 text-lg rounded-xl font-medium transform hover:scale-105 transition-all duration-300">
              🚀 Start Growing
            </Button>
            <Button variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10 px-8 py-4 text-lg rounded-xl">
              📚 Learn More
            </Button>
          </motion.div>
        </section>

        {/* Network Growth Visualization */}
        <section className="mb-20">
          <motion.div
            className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-lg rounded-3xl p-8 border border-green-500/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <h3 className="text-3xl font-bold text-center text-green-400 mb-8">
              🌐 Living Network Growth
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{networkGrowth}%</div>
                <div className="text-green-400">Network Expansion</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">2,847</div>
                <div className="text-green-400">Active Nodes</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">$12.5M</div>
                <div className="text-green-400">Total Value Locked</div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group"
            >
              <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-lg border-green-500/20 p-6 h-full hover:border-green-400/40 transition-all duration-300">
                <div className={`text-4xl mb-4 p-3 rounded-xl bg-gradient-to-r ${feature.color} w-fit`}>
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-green-300 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </section>

        {/* PuffPass Showcase */}
        {isConnected && (
          <motion.section
            className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-lg rounded-3xl p-8 border border-purple-500/20 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.8 }}
          >
            <h3 className="text-3xl font-bold text-purple-400 mb-6">
              🎫 Your PuffPass Awaits
            </h3>
            <p className="text-purple-300 text-lg mb-8 max-w-2xl mx-auto">
              Connected wallets can mint exclusive PuffPass tokens for premium cannabis experiences and rewards.
            </p>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-4 text-lg rounded-xl font-medium transform hover:scale-105 transition-all duration-300">
              🌿 Mint PuffPass
            </Button>
          </motion.section>
        )}
      </div>
    </div>
  )
}
