import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Providers } from "./providers"
import { ChunkErrorRecovery } from "@/components/ChunkErrorRecovery"

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
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
