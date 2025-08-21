
interface ReownApiConfig {
  projectId: string
  baseUrl?: string
}

interface TokenBalance {
  address: string
  symbol: string
  name: string
  balance: string
  decimals: number
  price?: number
}

interface TransactionHistory {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  status: 'success' | 'failed'
  gasUsed: string
}

export class ReownBlockchainAPI {
  private config: ReownApiConfig
  private baseUrl: string

  constructor(config: ReownApiConfig) {
    this.config = config
    this.baseUrl = config.baseUrl || 'https://api.reown.com/v1'
  }

  async getPortfolio(address: string, chainId: string): Promise<TokenBalance[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/portfolio/${address}?chainId=${chainId}&projectId=${this.config.projectId}`
      )
      
      if (!response.ok) {
        throw new Error(`Portfolio API error: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.balances || []
    } catch (error) {
      console.error('[ReownAPI] Portfolio fetch failed:', error)
      return []
    }
  }

  async getTransactionHistory(address: string, chainId: string): Promise<TransactionHistory[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/history/${address}?chainId=${chainId}&projectId=${this.config.projectId}&limit=50`
      )
      
      if (!response.ok) {
        throw new Error(`History API error: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.transactions || []
    } catch (error) {
      console.error('[ReownAPI] History fetch failed:', error)
      return []
    }
  }

  async getTokenPrice(contractAddress: string, chainId: string): Promise<number | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/convert/token-price?contractAddress=${contractAddress}&chainId=${chainId}&projectId=${this.config.projectId}`
      )
      
      if (!response.ok) {
        throw new Error(`Price API error: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.price || null
    } catch (error) {
      console.error('[ReownAPI] Price fetch failed:', error)
      return null
    }
  }

  async validateTransaction(txHash: string, chainId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/transaction/${txHash}?chainId=${chainId}&projectId=${this.config.projectId}`
      )
      
      if (!response.ok) {
        return false
      }
      
      const data = await response.json()
      return data.status === 'success'
    } catch (error) {
      console.error('[ReownAPI] Transaction validation failed:', error)
      return false
    }
  }
}

// Singleton instance
let reownAPI: ReownBlockchainAPI | null = null

export function getReownAPI(): ReownBlockchainAPI {
  if (!reownAPI) {
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
    if (!projectId) {
      throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is required for Reown Blockchain API')
    }
    
    reownAPI = new ReownBlockchainAPI({ projectId })
  }
  
  return reownAPI
}

export default ReownBlockchainAPI
