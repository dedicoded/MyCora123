
import { NextRequest } from 'next/server'
import crypto from 'crypto'

interface SecurityConfig {
  maxRequestsPerMinute: number
  maxRequestsPerHour: number
  allowedOrigins: string[]
  ipWhitelist?: string[]
  apiKeyRequired: boolean
}

interface RateLimitEntry {
  count: number
  resetTime: number
  blocked: boolean
}

class SecurityEngine {
  private rateLimitMap = new Map<string, RateLimitEntry>()
  private blockedIPs = new Set<string>()
  private securityEvents: Array<{
    timestamp: number
    type: string
    ip: string
    details: any
  }> = []

  private defaultConfig: SecurityConfig = {
    maxRequestsPerMinute: 60,
    maxRequestsPerHour: 1000,
    allowedOrigins: [
      process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:5000',
      'https://*.replit.dev',
      'https://*.repl.co'
    ],
    apiKeyRequired: false
  }

  validateRequest(request: NextRequest, config?: Partial<SecurityConfig>): {
    allowed: boolean
    reason?: string
    remainingRequests?: number
  } {
    const mergedConfig = { ...this.defaultConfig, ...config }
    const ip = this.getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Check IP blocklist
    if (this.blockedIPs.has(ip)) {
      this.logSecurityEvent('BLOCKED_IP_ACCESS', ip, { userAgent })
      return { allowed: false, reason: 'IP blocked due to suspicious activity' }
    }

    // Rate limiting
    const rateLimitResult = this.checkRateLimit(ip, mergedConfig)
    if (!rateLimitResult.allowed) {
      this.logSecurityEvent('RATE_LIMIT_EXCEEDED', ip, { 
        userAgent, 
        requestCount: rateLimitResult.currentCount 
      })
      return {
        allowed: false,
        reason: 'Rate limit exceeded',
        remainingRequests: 0
      }
    }

    // Origin validation
    const origin = request.headers.get('origin')
    if (origin && !this.isOriginAllowed(origin, mergedConfig.allowedOrigins)) {
      this.logSecurityEvent('INVALID_ORIGIN', ip, { origin, userAgent })
      return { allowed: false, reason: 'Invalid origin' }
    }

    // API Key validation (if required)
    if (mergedConfig.apiKeyRequired) {
      const apiKey = request.headers.get('x-api-key')
      if (!this.validateApiKey(apiKey)) {
        this.logSecurityEvent('INVALID_API_KEY', ip, { userAgent })
        return { allowed: false, reason: 'Invalid or missing API key' }
      }
    }

    return {
      allowed: true,
      remainingRequests: rateLimitResult.remaining
    }
  }

  private getClientIP(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const remoteAddr = request.headers.get('remote-addr')

    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim()
    }
    
    return realIP || remoteAddr || 'unknown'
  }

  private checkRateLimit(ip: string, config: SecurityConfig): {
    allowed: boolean
    remaining: number
    currentCount: number
  } {
    const now = Date.now()
    const windowStart = now - (60 * 1000) // 1 minute window
    
    let entry = this.rateLimitMap.get(ip)
    
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 1,
        resetTime: now + (60 * 1000),
        blocked: false
      }
      this.rateLimitMap.set(ip, entry)
      return {
        allowed: true,
        remaining: config.maxRequestsPerMinute - 1,
        currentCount: 1
      }
    }

    entry.count++
    
    if (entry.count > config.maxRequestsPerMinute) {
      entry.blocked = true
      // Auto-block aggressive IPs
      if (entry.count > config.maxRequestsPerMinute * 3) {
        this.blockedIPs.add(ip)
        setTimeout(() => this.blockedIPs.delete(ip), 24 * 60 * 60 * 1000) // 24h block
      }
      return {
        allowed: false,
        remaining: 0,
        currentCount: entry.count
      }
    }

    return {
      allowed: true,
      remaining: config.maxRequestsPerMinute - entry.count,
      currentCount: entry.count
    }
  }

  private isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
    return allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace(/\*/g, '.*')
        return new RegExp(pattern).test(origin)
      }
      return origin === allowed
    })
  }

  private validateApiKey(apiKey: string | null): boolean {
    if (!apiKey) return false
    
    const validKeys = [
      process.env.ADMIN_API_KEY,
      process.env.FRONTEND_API_KEY,
      process.env.MOBILE_API_KEY
    ].filter(Boolean)

    return validKeys.includes(apiKey)
  }

  private logSecurityEvent(type: string, ip: string, details: any) {
    this.securityEvents.push({
      timestamp: Date.now(),
      type,
      ip,
      details
    })

    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`🚨 Security Event: ${type}`, { ip, details })
    }
  }

  getSecurityStats() {
    const now = Date.now()
    const lastHour = now - (60 * 60 * 1000)
    
    const recentEvents = this.securityEvents.filter(event => event.timestamp > lastHour)
    const eventsByType = recentEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalActiveRateLimits: this.rateLimitMap.size,
      blockedIPs: this.blockedIPs.size,
      recentEvents: recentEvents.length,
      eventsByType,
      topOffendingIPs: this.getTopOffendingIPs(recentEvents)
    }
  }

  private getTopOffendingIPs(events: typeof this.securityEvents): Array<{ip: string, count: number}> {
    const ipCounts = events.reduce((acc, event) => {
      acc[event.ip] = (acc[event.ip] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(ipCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }))
  }

  // Cleanup old entries periodically
  cleanup() {
    const now = Date.now()
    
    // Clean expired rate limit entries
    for (const [ip, entry] of this.rateLimitMap.entries()) {
      if (entry.resetTime < now) {
        this.rateLimitMap.delete(ip)
      }
    }

    // Clean old security events (older than 24h)
    const dayAgo = now - (24 * 60 * 60 * 1000)
    this.securityEvents = this.securityEvents.filter(event => event.timestamp > dayAgo)
  }
}

export const securityEngine = new SecurityEngine()

// Export the default configuration for external use
export const defaultSecurityConfig = {
  maxRequestsPerMinute: 60,
  maxRequestsPerHour: 1000,
  allowedOrigins: [
    process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:5000',
    'https://*.replit.dev',
    'https://*.repl.co'
  ],
  apiKeyRequired: false
}

// Auto-cleanup every 5 minutes
setInterval(() => securityEngine.cleanup(), 5 * 60 * 1000)
