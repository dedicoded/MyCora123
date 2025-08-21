import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import ChunkErrorRecovery from '@/components/ChunkErrorRecovery'
import ClientErrorBoundary from '@/components/client-error-boundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MyCora - Cannabis Rewards Platform',
  description: 'Earn rewards with every purchase using blockchain technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientErrorBoundary>
          <ChunkErrorRecovery>
            <Providers>
              {children}
            </Providers>
          </ChunkErrorRecovery>
        </ClientErrorBoundary>
      </body>
    </html>
  )
}