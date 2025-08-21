'use client'

import { useEffect, useState } from 'react'

interface EnvStatusState {
  isReady: boolean
  missing: string[]
  placeholders: string[]
  loading: boolean
}

export function EnvStatus() {
  const [status, setStatus] = useState<EnvStatusState>({ 
    isReady: false, 
    missing: [], 
    placeholders: [],
    loading: true 
  })

  useEffect(() => {
    const checkEnvironment = () => {
      const required = [
        'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
        'NEXT_PUBLIC_MCC_CONTRACT_ADDRESS', 
        'NEXT_PUBLIC_NETWORK'
      ]

      // Check for missing variables
      const missing = required.filter(key => {
        const value = process.env[key]
        return !value || value === '' || value === 'undefined'
      })

      // Check for placeholder values
      const placeholders = required.filter(key => {
        const value = process.env[key]
        return value && (
          value.includes('your_') || 
          value.includes('YOUR_') ||
          value === '0x0000000000000000000000000000000000000000' ||
          value === 'placeholder' ||
          value === 'PLACEHOLDER'
        )
      })

      const isReady = missing.length === 0 && placeholders.length === 0

      // Detect hosting platform
      const isReplit = typeof window !== 'undefined' && (
        window.location.hostname.includes('replit') || 
        process.env.REPLIT_DB_URL ||
        process.env.REPL_ID
      )

      // Log status for debugging
      console.log('[v0] Environment status:', {
        envStatus: isReady ? 'ready' : 'missing',
        platform: isReplit ? 'replit' : 'other',
        missingRequired: missing,
        missingOptional: placeholders
      })

      setStatus({ isReady, missing, placeholders, loading: false })
    }

    // Initial check
    checkEnvironment()

    // Recheck periodically for hot reload scenarios
    const interval = setInterval(checkEnvironment, 5000)
    return () => clearInterval(interval)
  }, [])

  if (status.loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
        Checking environment...
      </div>
    )
  }

  const hasIssues = status.missing.length > 0 || status.placeholders.length > 0

  return (
    <div className="flex items-center gap-2 text-sm">
      {!hasIssues ? (
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
          {hasIssues && (
            <details className="ml-2">
              <summary className="cursor-pointer text-xs opacity-70 hover:opacity-100">
                Show Details
              </summary>
              <div className="mt-1 space-y-1 text-xs opacity-70">
                {status.missing.length > 0 && (
                  <div>Missing: {status.missing.join(', ')}</div>
                )}
                {status.placeholders.length > 0 && (
                  <div>Placeholders: {status.placeholders.join(', ')}</div>
                )}
                <div className="text-blue-400 mt-2">
                  💡 Fix: Click the lock icon (🔒) in Replit sidebar → Add secrets
                </div>
              </div>
            </details>
          )}
        </>
      )}
    </div>
  )
}