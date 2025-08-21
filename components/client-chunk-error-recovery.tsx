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