import { kv } from "@vercel/kv"

export class CacheService {
  static async getCachedStats() {
    const cached = await kv.get("admin-stats")
    if (cached) return cached

    const stats = await this.fetchFreshStats()
    await kv.set("admin-stats", stats, { ex: 300 }) // Cache for 5 minutes
    return stats
  }

  static async getCachedUserData(userId: string) {
    const cached = await kv.get(`user:${userId}`)
    if (cached) return cached

    const userData = await this.fetchUserData(userId)
    await kv.set(`user:${userId}`, userData, { ex: 600 }) // Cache for 10 minutes
    return userData
  }

  static async invalidateUserCache(userId: string) {
    await kv.del(`user:${userId}`)
  }

  static async invalidateStatsCache() {
    await kv.del("admin-stats")
  }

  private static async fetchFreshStats() {
    return {
      totalUsers: Math.floor(Math.random() * 10000),
      activeUsers: Math.floor(Math.random() * 5000),
      totalTransactions: Math.floor(Math.random() * 50000),
      totalVolume: Math.floor(Math.random() * 1000000),
      pendingKYC: Math.floor(Math.random() * 100),
      riskAlerts: Math.floor(Math.random() * 20),
    }
  }

  private static async fetchUserData(userId: string) {
    return {
      id: userId,
      email: `user${userId.slice(0, 8)}@example.com`,
      role: "user",
      kycStatus: "approved",
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    }
  }
}
