
interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, any>
}

interface UserSession {
  sessionId: string
  userId?: string
  startTime: number
  lastActivity: number
  pageViews: number
  actions: Array<{
    type: string
    timestamp: number
    data?: any
  }>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private sessions = new Map<string, UserSession>()
  private alerts: Array<{
    type: string
    message: string
    timestamp: number
    severity: 'low' | 'medium' | 'high' | 'critical'
  }> = []

  // Track Web Vitals
  trackWebVital(name: string, value: number, metadata?: Record<string, any>) {
    this.addMetric(name, value, metadata)
    
    // Alert on poor performance
    const thresholds = {
      CLS: 0.1,
      FID: 100,
      LCP: 2500,
      FCP: 1800,
      TTFB: 600
    }

    const threshold = thresholds[name as keyof typeof thresholds]
    if (threshold && value > threshold) {
      this.addAlert('performance', `Poor ${name}: ${value}${name === 'CLS' ? '' : 'ms'}`, 'medium')
    }
  }

  // Track API performance
  trackAPICall(endpoint: string, duration: number, status: number, error?: string) {
    this.addMetric('api_call_duration', duration, {
      endpoint,
      status,
      error: error || null
    })

    // Alert on slow APIs
    if (duration > 5000) {
      this.addAlert('api', `Slow API call to ${endpoint}: ${duration}ms`, 'medium')
    }

    // Alert on errors
    if (status >= 500) {
      this.addAlert('api', `API error on ${endpoint}: ${status}`, 'high')
    }
  }

  // Track blockchain interactions
  trackBlockchainTransaction(type: string, duration: number, success: boolean, gasUsed?: number) {
    this.addMetric('blockchain_transaction', duration, {
      type,
      success,
      gasUsed: gasUsed || null
    })

    if (!success) {
      this.addAlert('blockchain', `Failed ${type} transaction`, 'high')
    }

    if (gasUsed && gasUsed > 1000000) {
      this.addAlert('blockchain', `High gas usage in ${type}: ${gasUsed}`, 'medium')
    }
  }

  // Track user sessions
  startSession(sessionId: string, userId?: string) {
    this.sessions.set(sessionId, {
      sessionId,
      userId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 1,
      actions: []
    })
  }

  updateSession(sessionId: string, action: { type: string; data?: any }) {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.lastActivity = Date.now()
      session.actions.push({
        type: action.type,
        timestamp: Date.now(),
        data: action.data
      })

      // Track page views
      if (action.type === 'page_view') {
        session.pageViews++
      }
    }
  }

  // Analytics aggregation
  getAnalytics(timeframe: 'hour' | 'day' | 'week' = 'hour') {
    const now = Date.now()
    const timeframes = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000
    }
    
    const cutoff = now - timeframes[timeframe]
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff)
    const activeSessions = Array.from(this.sessions.values())
      .filter(s => s.lastActivity > cutoff)

    return {
      // Performance metrics
      averagePageLoad: this.calculateAverage(recentMetrics, 'LCP'),
      totalPageViews: activeSessions.reduce((sum, s) => sum + s.pageViews, 0),
      uniqueUsers: new Set(activeSessions.map(s => s.userId).filter(Boolean)).size,
      
      // API metrics
      averageAPIResponse: this.calculateAverage(recentMetrics, 'api_call_duration'),
      apiErrorRate: this.calculateErrorRate(recentMetrics),
      
      // Blockchain metrics
      blockchainSuccessRate: this.calculateBlockchainSuccessRate(recentMetrics),
      averageGasUsage: this.calculateAverageGasUsage(recentMetrics),
      
      // User engagement
      averageSessionDuration: this.calculateAverageSessionDuration(activeSessions),
      bounceRate: this.calculateBounceRate(activeSessions),
      
      // Alerts
      activeAlerts: this.alerts.filter(a => a.timestamp > cutoff),
      criticalIssues: this.alerts.filter(a => a.severity === 'critical' && a.timestamp > cutoff).length
    }
  }

  private addMetric(name: string, value: number, metadata?: Record<string, any>) {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      metadata
    })

    // Keep only last 10k metrics
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-10000)
    }
  }

  private addAlert(type: string, message: string, severity: 'low' | 'medium' | 'high' | 'critical') {
    this.alerts.push({
      type,
      message,
      timestamp: Date.now(),
      severity
    })

    // Keep only last 1k alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000)
    }

    // Log critical alerts immediately
    if (severity === 'critical') {
      console.error(`🚨 CRITICAL ALERT: ${message}`)
    }
  }

  private calculateAverage(metrics: PerformanceMetric[], name: string): number {
    const filtered = metrics.filter(m => m.name === name)
    return filtered.length > 0 
      ? filtered.reduce((sum, m) => sum + m.value, 0) / filtered.length 
      : 0
  }

  private calculateErrorRate(metrics: PerformanceMetric[]): number {
    const apiCalls = metrics.filter(m => m.name === 'api_call_duration')
    const errors = apiCalls.filter(m => m.metadata?.status >= 400)
    return apiCalls.length > 0 ? (errors.length / apiCalls.length) * 100 : 0
  }

  private calculateBlockchainSuccessRate(metrics: PerformanceMetric[]): number {
    const transactions = metrics.filter(m => m.name === 'blockchain_transaction')
    const successful = transactions.filter(m => m.metadata?.success === true)
    return transactions.length > 0 ? (successful.length / transactions.length) * 100 : 0
  }

  private calculateAverageGasUsage(metrics: PerformanceMetric[]): number {
    const transactions = metrics.filter(m => 
      m.name === 'blockchain_transaction' && m.metadata?.gasUsed
    )
    return transactions.length > 0
      ? transactions.reduce((sum, m) => sum + (m.metadata?.gasUsed || 0), 0) / transactions.length
      : 0
  }

  private calculateAverageSessionDuration(sessions: UserSession[]): number {
    const durations = sessions.map(s => s.lastActivity - s.startTime)
    return durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0
  }

  private calculateBounceRate(sessions: UserSession[]): number {
    const bounced = sessions.filter(s => s.pageViews === 1 && s.actions.length <= 1)
    return sessions.length > 0 ? (bounced.length / sessions.length) * 100 : 0
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Auto-cleanup old data
setInterval(() => {
  const now = Date.now()
  const weekAgo = now - (7 * 24 * 60 * 60 * 1000)
  
  // Clean old sessions
  for (const [sessionId, session] of performanceMonitor['sessions'].entries()) {
    if (session.lastActivity < weekAgo) {
      performanceMonitor['sessions'].delete(sessionId)
    }
  }
}, 60 * 60 * 1000) // Clean every hour
