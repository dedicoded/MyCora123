'use client'

import React, { useEffect, useState } from 'react'

export function ChunkErrorRecovery({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [lastError, setLastError] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
    const MAX_RETRIES = 3
    const RETRY_DELAY = 1000

    const handleChunkError = (event: ErrorEvent) => {
      const { message } = event

      // Handle ChunkLoadError specifically
      if (message?.includes('ChunkLoadError') || 
          message?.includes('Loading chunk') ||
          message?.includes('timeout:') ||
          message?.includes('Failed to fetch')) {

        console.warn('[ChunkError] Chunk load failure detected:', message)
        setLastError(message)

        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1)
          console.warn(`[ChunkError] Retrying... (${retryCount + 1}/${MAX_RETRIES})`)

          setTimeout(() => {
            window.location.reload()
          }, RETRY_DELAY * (retryCount + 1))
        } else {
          console.error('[ChunkError] Max retries reached, forcing reload')
          window.location.href = window.location.pathname
        }
        return
      }

      // Handle other chunk-related errors
      if (message?.includes('chunk') || message?.includes('import()')) {
        console.warn('[ChunkError] General chunk error:', message)
        window.location.reload()
        return
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason

      if (error?.message?.includes('ChunkLoadError') || 
          error?.message?.includes('Loading chunk') ||
          error?.message?.includes('timeout:') ||
          error?.name === 'ChunkLoadError') {

        console.warn('[ChunkError] Unhandled chunk rejection:', error)
        event.preventDefault()

        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1)
          setTimeout(() => {
            window.location.reload()
          }, RETRY_DELAY)
        } else {
          window.location.href = window.location.pathname
        }
      }
    }

    // Prevent hydration mismatch errors from cascading
    const handleReactError = (event: any) => {
      if (event.detail?.error?.message?.includes('Hydration') ||
          event.detail?.error?.message?.includes('server HTML was replaced')) {
        console.warn('[ChunkError] Hydration mismatch detected, clearing cache')

        // Clear any stale state
        if (typeof Storage !== 'undefined') {
          sessionStorage.clear()
          localStorage.removeItem('nextjs-cache')
        }

        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    }

    // Add error listeners
    window.addEventListener('error', handleChunkError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('react-error', handleReactError)

    // Monitor for stale chunks on route changes
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function(...args) {
      setTimeout(() => {
        if (document.querySelector('script[src*="_next/static/chunks"]')) {
          console.log('[ChunkError] Route change detected, validating chunks')
        }
      }, 100)
      return originalPushState.apply(this, args)
    }

    history.replaceState = function(...args) {
      setTimeout(() => {
        if (document.querySelector('script[src*="_next/static/chunks"]')) {
          console.log('[ChunkError] Route replace detected, validating chunks')
        }
      }, 100)
      return originalReplaceState.apply(this, args)
    }

    // Cleanup
    return () => {
      window.removeEventListener('error', handleChunkError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('react-error', handleReactError)
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [retryCount])

  // Show recovery status during retries
  if (retryCount > 0 && retryCount < 3) {
    return (
      <div className="fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-md z-50">
        Recovering from chunk error... ({retryCount}/3)
      </div>
    )
  }

  if (!isClient) {
    return <div className="chunk-error-boundary">{children}</div>
  }

  return (
    <div className="chunk-error-boundary">
      {children}
    </div>
  )
}