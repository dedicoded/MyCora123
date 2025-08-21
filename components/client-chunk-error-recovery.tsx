
'use client'

import { ChunkErrorRecovery } from '@/components/ChunkErrorRecovery'
import { ReactNode } from 'react'

interface ChunkErrorRecoveryProps {
  children: ReactNode
}

function ClientChunkErrorRecovery({ children }: ChunkErrorRecoveryProps) {
  return (
    <ChunkErrorRecovery>
      {children}
    </ChunkErrorRecovery>
  )
}

// Export both named and default to handle any import style
export { ClientChunkErrorRecovery }
export default ClientChunkErrorRecovery
