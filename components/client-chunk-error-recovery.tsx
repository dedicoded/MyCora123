'use client'

import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

const ChunkErrorRecoveryComponent = dynamic(
  () => import('@/components/ChunkErrorRecovery').then(mod => ({ default: mod.ChunkErrorRecovery })),
  { ssr: false }
)

interface ChunkErrorRecoveryProps {
  children: ReactNode
}

export default function ChunkErrorRecovery({ children }: ChunkErrorRecoveryProps) {
  return (
    <ChunkErrorRecoveryComponent>
      {children}
    </ChunkErrorRecoveryComponent>
  )
}