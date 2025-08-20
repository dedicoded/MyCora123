import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Providers } from "./providers"
import dynamic from 'next/dynamic'
import { EnvStatus } from '@/components/ui/env-status'

const ChunkErrorRecovery = dynamic(() => import('@/components/ChunkErrorRecovery').then(mod => ({ default: mod.ChunkErrorRecovery })), {
  ssr: false
})

export const metadata: Metadata = {
  title: "MyCora - Blockchain Trust Network",
  description:
    "The comprehensive blockchain platform for security tokens, compliance management, and decentralized finance solutions.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ChunkErrorRecovery />
        <div className="fixed top-4 right-4 z-50">
          <EnvStatus />
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}