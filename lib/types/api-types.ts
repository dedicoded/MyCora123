
// Shared API types for type safety across frontend and backend
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface TokenMintRequest {
  address: string
  amount: string
  tokenType: 'security' | 'utility'
}

export interface TokenMintResponse {
  transactionHash: string
  tokenAddress: string
  amount: string
  recipient: string
}

export interface PaymentRequest {
  amount: string
  currency: 'USD' | 'MCC'
  recipient: string
  description?: string
}

export interface PaymentResponse {
  paymentId: string
  status: 'pending' | 'completed' | 'failed'
  transactionHash?: string
  estimatedGas?: string
}

export interface ComplianceCheckRequest {
  address: string
  jurisdiction: string
  transactionAmount?: string
}

export interface ComplianceCheckResponse {
  compliant: boolean
  riskLevel: 'low' | 'medium' | 'high'
  restrictions?: string[]
  kycRequired: boolean
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  services: {
    database: 'healthy' | 'degraded' | 'unhealthy'
    blockchain: 'healthy' | 'degraded' | 'unhealthy'
    ipfs: 'healthy' | 'degraded' | 'unhealthy'
    compliance: 'healthy' | 'degraded' | 'unhealthy'
  }
  features: {
    minting: boolean
    gaslessTransactions: boolean
    compliance: boolean
    ipfsStorage: boolean
  }
}
