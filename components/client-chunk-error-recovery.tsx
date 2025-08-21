
'use client'

import { ChunkErrorRecovery } from '@/components/ChunkErrorRecovery'
import { ReactNode } from 'react'

interface ChunkErrorRecoveryProps {
  children: ReactNode
}

export default function ClientChunkErrorRecovery({ children }: ChunkErrorRecoveryProps) {
  return (
    <ChunkErrorRecovery>
      {children}
    </ChunkErrorRecovery>
  )
}
