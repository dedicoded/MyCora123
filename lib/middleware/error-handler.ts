import { type NextRequest, NextResponse } from "next/server"

export function withErrorHandler(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      return await handler(req)
    } catch (error) {
      console.error("[MyCora API Error]:", error)

      if (error instanceof ValidationError) {
        return NextResponse.json({ error: "Validation failed", details: error.details }, { status: 400 })
      }

      if (error instanceof AuthenticationError) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }

      if (error instanceof AuthorizationError) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
      }

      // Generic error handling
      return NextResponse.json(
        {
          error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
        },
        { status: 500 },
      )
    }
  }
}

export class ValidationError extends Error {
  constructor(public details: any) {
    super("Validation Error")
    this.name = "ValidationError"
  }
}

export class AuthenticationError extends Error {
  constructor() {
    super("Authentication Error")
    this.name = "AuthenticationError"
  }
}

export class AuthorizationError extends Error {
  constructor() {
    super("Authorization Error")
    this.name = "AuthorizationError"
  }
}
