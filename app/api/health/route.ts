import { NextResponse } from "next/server"

export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      database: "connected", // Update based on actual DB connection
      ipfs: process.env.WEB3_STORAGE_TOKEN ? "configured" : "not_configured",
      blockchain: "available",
    },
  }

  return NextResponse.json(health)
}
