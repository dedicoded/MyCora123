"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrustIndicator } from "@/components/ui/trust-indicator"
import { ComplianceBadge } from "@/components/ui/compliance-badge"
import { NetworkNode } from "@/components/ui/network-node"

interface AdminStats {
  totalUsers: number
  pendingKyc: number
  activePayments: number
  complianceAlerts: number
  rewardsTiers: { [key: string]: number }
}

interface User {
  id: string
  email: string
  kycStatus: "pending" | "approved" | "rejected"
  riskScore: number
  totalPayments: number
  rewardTier: string
  lastActivity: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("overview")

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      // Fetch admin statistics
      const statsResponse = await fetch("/api/admin/stats")
      const statsData = await statsResponse.json()
      setStats(statsData)

      // Fetch user data
      const usersResponse = await fetch("/api/admin/users")
      const usersData = await usersResponse.json()
      setUsers(usersData.users || [])
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleKycAction = async (userId: string, action: "approve" | "reject") => {
    try {
      await fetch("/api/admin/kyc-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      })
      fetchAdminData() // Refresh data
    } catch (error) {
      console.error("KYC action failed:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mycora-earth/5 to-mycora-sage/5 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-mycora-sage/20 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-mycora-sage/20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mycora-earth/5 to-mycora-sage/5 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-mycora-earth">MyCora Admin Dashboard</h1>
            <p className="text-mycora-sage">Comprehensive platform management and oversight</p>
          </div>
          <div className="flex items-center space-x-4">
            <TrustIndicator level="admin" />
            <NetworkNode size="sm" active={true} />
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-mycora-sage/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-mycora-sage">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-mycora-earth">{stats.totalUsers}</div>
                <ComplianceBadge status="active" size="sm" />
              </CardContent>
            </Card>

            <Card className="border-mycora-sage/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-mycora-sage">Pending KYC</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{stats.pendingKyc}</div>
                <ComplianceBadge status="pending" size="sm" />
              </CardContent>
            </Card>

            <Card className="border-mycora-sage/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-mycora-sage">Active Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.activePayments}</div>
                <ComplianceBadge status="verified" size="sm" />
              </CardContent>
            </Card>

            <Card className="border-mycora-sage/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-mycora-sage">Compliance Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.complianceAlerts}</div>
                <ComplianceBadge status="flagged" size="sm" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-mycora-sage/20">
                <CardHeader>
                  <CardTitle className="text-mycora-earth">System Health</CardTitle>
                  <CardDescription>Real-time platform monitoring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Smart Contracts</span>
                    <ComplianceBadge status="verified" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Compliance Engine</span>
                    <ComplianceBadge status="active" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Payment Processor</span>
                    <ComplianceBadge status="verified" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>IPFS Storage</span>
                    <ComplianceBadge status="active" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-mycora-sage/20">
                <CardHeader>
                  <CardTitle className="text-mycora-earth">Recent Activity</CardTitle>
                  <CardDescription>Latest platform events</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <NetworkNode size="xs" active={true} />
                    <span className="text-sm">New user registration: user@example.com</span>
                    <Badge variant="outline">2m ago</Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <NetworkNode size="xs" active={false} />
                    <span className="text-sm">KYC approved for: investor@company.com</span>
                    <Badge variant="outline">5m ago</Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <NetworkNode size="xs" active={true} />
                    <span className="text-sm">Payment processed: $50,000</span>
                    <Badge variant="outline">12m ago</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="border-mycora-sage/20">
              <CardHeader>
                <CardTitle className="text-mycora-earth">User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border border-mycora-sage/20 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <NetworkNode size="sm" active={user.kycStatus === "approved"} />
                        <div>
                          <p className="font-medium text-mycora-earth">{user.email}</p>
                          <p className="text-sm text-mycora-sage">Risk Score: {user.riskScore}/100</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <ComplianceBadge status={user.kycStatus} />
                        <Badge variant="outline">{user.rewardTier}</Badge>
                        {user.kycStatus === "pending" && (
                          <div className="space-x-2">
                            <Button size="sm" onClick={() => handleKycAction(user.id, "approve")}>
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleKycAction(user.id, "reject")}>
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card className="border-mycora-sage/20">
              <CardHeader>
                <CardTitle className="text-mycora-earth">Compliance Monitoring</CardTitle>
                <CardDescription>Real-time compliance and risk assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border border-mycora-sage/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">98.5%</div>
                    <div className="text-sm text-mycora-sage">Compliance Rate</div>
                  </div>
                  <div className="text-center p-4 border border-mycora-sage/20 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">12</div>
                    <div className="text-sm text-mycora-sage">Pending Reviews</div>
                  </div>
                  <div className="text-center p-4 border border-mycora-sage/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">3</div>
                    <div className="text-sm text-mycora-sage">High Risk Alerts</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card className="border-mycora-sage/20">
              <CardHeader>
                <CardTitle className="text-mycora-earth">Payment Processing</CardTitle>
                <CardDescription>Monitor and manage payment flows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border border-mycora-sage/20 rounded-lg">
                      <div className="text-xl font-bold text-mycora-earth">$2.4M</div>
                      <div className="text-sm text-mycora-sage">Total Volume</div>
                    </div>
                    <div className="text-center p-4 border border-mycora-sage/20 rounded-lg">
                      <div className="text-xl font-bold text-green-600">156</div>
                      <div className="text-sm text-mycora-sage">Completed</div>
                    </div>
                    <div className="text-center p-4 border border-mycora-sage/20 rounded-lg">
                      <div className="text-xl font-bold text-amber-600">23</div>
                      <div className="text-sm text-mycora-sage">In Escrow</div>
                    </div>
                    <div className="text-center p-4 border border-mycora-sage/20 rounded-lg">
                      <div className="text-xl font-bold text-red-600">2</div>
                      <div className="text-sm text-mycora-sage">Failed</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <Card className="border-mycora-sage/20">
              <CardHeader>
                <CardTitle className="text-mycora-earth">Rewards Administration</CardTitle>
                <CardDescription>Manage PuffPass and loyalty programs</CardDescription>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border border-green-500/20 rounded-lg">
                      <div className="text-xl font-bold text-green-600">{stats.rewardsTiers.green || 0}</div>
                      <div className="text-sm text-mycora-sage">Green Pass Holders</div>
                    </div>
                    <div className="text-center p-4 border border-yellow-500/20 rounded-lg">
                      <div className="text-xl font-bold text-yellow-600">{stats.rewardsTiers.gold || 0}</div>
                      <div className="text-sm text-mycora-sage">Gold Pass Holders</div>
                    </div>
                    <div className="text-center p-4 border border-black/20 rounded-lg">
                      <div className="text-xl font-bold text-black">{stats.rewardsTiers.black || 0}</div>
                      <div className="text-sm text-mycora-sage">Black Pass Holders</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
