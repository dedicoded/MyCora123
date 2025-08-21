
'use client'

import dynamic from 'next/dynamic'

const ChunkErrorRecovery = dynamic(
  () => import('@/components/ChunkErrorRecovery').then(mod => ({ default: mod.ChunkErrorRecovery })),
  { ssr: false }
)

export default ChunkErrorRecovery
