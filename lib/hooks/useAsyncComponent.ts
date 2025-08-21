
'use client'

import { useState, useEffect } from 'react'

interface AsyncComponentOptions {
  loadingDelay?: number
  errorRetryDelay?: number
  maxRetries?: number
}

export function useAsyncComponent<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = [],
  options: AsyncComponentOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const { loadingDelay = 0, errorRetryDelay = 1000, maxRetries = 3 } = options

  const executeAsync = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (loadingDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, loadingDelay))
      }

      const result = await asyncFunction()
      setData(result)
      setRetryCount(0)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      
      // Auto-retry logic
      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          executeAsync()
        }, errorRetryDelay * (retryCount + 1))
      }
    } finally {
      setLoading(false)
    }
  }

  const retry = () => {
    setRetryCount(0)
    executeAsync()
  }

  useEffect(() => {
    executeAsync()
  }, dependencies)

  return {
    data,
    loading,
    error,
    retry,
    retryCount,
    canRetry: retryCount < maxRetries
  }
}

export default useAsyncComponent
