
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { EnvStatus } from '@/components/ui/env-status'
import ChunkErrorRecovery from '@/components/ChunkErrorRecovery'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "MyCora - Blockchain Trust Network",
  description: "Secure, compliant blockchain infrastructure for real-world adoption",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ChunkErrorRecovery>
          <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            <div className="fixed top-4 right-4 z-50">
              <EnvStatus />
            </div>
            <Providers>
              {children}
            </Providers>
          </div>
        </ChunkErrorRecovery>
      </body>
    </html>
  )
}
