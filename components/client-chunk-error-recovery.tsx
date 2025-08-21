
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function ChunkErrorRecovery() {
  const [hasChunkError, setHasChunkError] = useState(false)

  useEffect(() => {
    const handleChunkError = (event: any) => {
      if (event.message?.includes('Loading chunk') || event.message?.includes('ChunkLoadError')) {
        console.log('[ChunkError] Detected chunk loading error, enabling recovery mode')
        setHasChunkError(true)
      }
    }

    window.addEventListener('error', handleChunkError)
    return () => window.removeEventListener('error', handleChunkError)
  }, [])

  const handleRecovery = () => {
    console.log('[ChunkError] Attempting recovery via page reload')
    window.location.reload()
  }

  if (!hasChunkError) return null

  return (
    <div className="fixed bottom-4 right-4 bg-orange-500 text-white p-4 rounded-lg shadow-lg z-50">
      <h4 className="font-semibold">Connection Issue Detected</h4>
      <p className="text-sm mt-1">There was a problem loading part of the application.</p>
      <Button onClick={handleRecovery} className="mt-2 bg-white text-orange-500 hover:bg-gray-100">
        Reload Page
      </Button>
    </div>
  )
}

export default ChunkErrorRecovery

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Loading Issue Detected
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Some resources failed to load properly.</p>
            </div>
            <div className="mt-4">
              <Button 
                onClick={handleRecovery}
                size="sm"
                variant="outline"
                className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
