
'use client'

import { useEffect, useState } from 'react'

export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

// Helper component for wrapping client-only content
export function ClientOnly({ children, fallback = null }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  const isClient = useIsClient()
  
  if (!isClient) {
    return fallback
  }

  return children
}

export default useIsClient
