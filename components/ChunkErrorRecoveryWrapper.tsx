
'use client'

import dynamic from 'next/dynamic'

const ChunkErrorRecovery = dynamic(() => import('@/components/client-chunk-error-recovery'), {
  ssr: false
})

export default function ChunkErrorRecoveryWrapper({ children }: { children: React.ReactNode }) {
  return <ChunkErrorRecovery>{children}</ChunkErrorRecovery>
}
