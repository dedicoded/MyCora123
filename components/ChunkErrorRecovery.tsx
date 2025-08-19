
'use client'

import { useEffect } from 'react'

export function ChunkErrorRecovery() {
  useEffect(() => {
    const handleChunkError = (event: ErrorEvent) => {
      const { message } = event
      
      // Handle ChunkLoadError specifically
      if (message?.includes('ChunkLoadError') || message?.includes('Loading chunk')) {
        console.warn('[ChunkError] Reloading page due to chunk load failure:', message)
        window.location.reload()
        return
      }
      
      // Handle other chunk-related errors
      if (message?.includes('chunk') || message?.includes('import()')) {
        console.warn('[ChunkError] Reloading page due to chunk error:', message)
        window.location.reload()
        return
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason
      
      if (error?.message?.includes('ChunkLoadError') || 
          error?.message?.includes('Loading chunk') ||
          error?.name === 'ChunkLoadError') {
        console.warn('[ChunkError] Reloading page due to unhandled chunk rejection:', error)
        event.preventDefault()
        window.location.reload()
      }
    }

    // Add error listeners
    window.addEventListener('error', handleChunkError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // Cleanup
    return () => {
      window.removeEventListener('error', handleChunkError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}
