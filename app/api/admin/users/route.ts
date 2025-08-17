import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock user data - in production this would come from database
    const users = [
      {
        id: "1",
        email: "investor@company.com",
        kycStatus: "approved" as const,
        riskScore: 15,
        totalPayments: 5,
        rewardTier: "Gold Pass",
        lastActivity: "2024-01-15T10:30:00Z",
      },
      {
        id: "2",
        email: "user@example.com",
        kycStatus: "pending" as const,
        riskScore: 45,
        totalPayments: 0,
        rewardTier: "No Pass",
        lastActivity: "2024-01-15T09:15:00Z",
      },
      {
        id: "3",
        email: "premium@client.com",
        kycStatus: "approved" as const,
        riskScore: 8,
        totalPayments: 25,
        rewardTier: "Black Pass",
        lastActivity: "2024-01-15T11:45:00Z",
      },
    ]

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
