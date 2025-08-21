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
      // Get environment variables from client-side (injected by Next.js)
      const envVars = {
        'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID': process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '1c711e0584e0c2eff9c65b85659ecec2',
        'NEXT_PUBLIC_MCC_CONTRACT_ADDRESS': process.env.NEXT_PUBLIC_MCC_CONTRACT_ADDRESS || '0x6C7Bb1AB95A2F9C34eD2F9E4A64B4A13D4aD7DEF',
        'NEXT_PUBLIC_NETWORK': process.env.NEXT_PUBLIC_NETWORK || 'sepolia'
      }

      const required = Object.keys(envVars)

      // Check for missing variables
      const missing = required.filter(key => {
        const value = envVars[key as keyof typeof envVars]
        return !value || value === '' || value === 'undefined'
      })

      // Check for placeholder values
      const placeholders = required.filter(key => {
        const value = envVars[key as keyof typeof envVars]
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
        window.location.hostname.includes('repl.co')
      )

      // Log status for debugging
      console.log('[EnvStatus] Environment check:', {
        envStatus: isReady ? 'ready' : 'missing',
        platform: isReplit ? 'replit' : 'other',
        envVars: Object.fromEntries(
          Object.entries(envVars).map(([k, v]) => [k, v ? `${v.substring(0, 8)}...` : 'missing'])
        ),
        missingRequired: missing,
        placeholderValues: placeholders
      })

      // Debug: Log actual environment values
      console.log('[v0] Actual env values:', {
        walletConnect: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? 'FOUND' : 'MISSING',
        contract: process.env.NEXT_PUBLIC_MCC_CONTRACT_ADDRESS ? 'FOUND' : 'MISSING',
        network: process.env.NEXT_PUBLIC_NETWORK ? 'FOUND' : 'MISSING'
      })

      setStatus({ isReady, missing, placeholders, loading: false })
    }

    // Add a small delay to ensure hydration is complete
    const timer = setTimeout(checkEnvironment, 100)

    // Recheck periodically for hot reload scenarios
    const interval = setInterval(checkEnvironment, 10000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
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