
'use client'

import { useEffect, useState } from 'react'

interface EnvStatusState {
  isReady: boolean
  missing: string[]
  loading: boolean
}

export function EnvStatus() {
  const [status, setStatus] = useState<EnvStatusState>({ 
    isReady: false, 
    missing: [], 
    loading: true 
  })

  useEffect(() => {
    const checkEnvironment = () => {
      const required = [
        'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
        'NEXT_PUBLIC_MCC_CONTRACT_ADDRESS', 
        'NEXT_PUBLIC_NETWORK'
      ]

      const missing = required.filter(key => !process.env[key])
      const isReady = missing.length === 0

      setStatus({ isReady, missing, loading: false })
    }

    checkEnvironment()
  }, [])

  if (status.loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
        Checking environment...
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {status.isReady ? (
        <>
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-green-600 dark:text-green-400">
            ✅ Environment Ready
          </span>
        </>
      ) : (
        <>
          <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          <span className="text-red-600 dark:text-red-400">
            ⚠️ Missing Configuration
          </span>
          {status.missing.length > 0 && (
            <details className="ml-2">
              <summary className="cursor-pointer text-xs opacity-70 hover:opacity-100">
                Show Details
              </summary>
              <div className="mt-1 text-xs opacity-70">
                Missing: {status.missing.join(', ')}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  )
}
