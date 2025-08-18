import { z } from "zod"

export const KYCRequestSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(["approve", "reject", "request_documents"]),
  reason: z.string().optional(),
})

export const RiskAssessmentSchema = z.object({
  userId: z.string().uuid(),
  transactionAmount: z.number().positive().optional(),
  jurisdiction: z.string().length(2).optional(),
  transactionType: z.enum(["deposit", "withdrawal", "transfer"]).optional(),
})

export const UserManagementSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(["suspend", "activate", "delete", "update_role"]),
  role: z.enum(["user", "business", "admin"]).optional(),
  reason: z.string().min(10).optional(),
})

export const PaymentProcessingSchema = z.object({
  paymentId: z.string().uuid(),
  action: z.enum(["approve", "reject", "refund"]),
  amount: z.number().positive().optional(),
  reason: z.string().optional(),
})
