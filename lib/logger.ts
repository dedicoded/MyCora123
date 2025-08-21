
export const logger = {
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[MyCora]', ...args)
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[MyCora]', ...args)
    }
  },
  error: (...args: any[]) => {
    console.error('[MyCora]', ...args)
  },
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG) {
      console.debug('[MyCora Debug]', ...args)
    }
  }
}

// Suppress noisy third-party logs in development
if (process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn
  console.warn = (...args) => {
    const message = args.join(' ')
    // Filter out known noisy warnings
    if (
      message.includes('Lit is in dev mode') ||
      message.includes('allowedDevOrigins') ||
      message.includes('project ID is configured')
    ) {
      return
    }
    originalWarn.apply(console, args)
  }
}
