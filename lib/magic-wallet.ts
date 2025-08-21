
import { Magic } from 'magic-sdk'

export class MagicWalletService {
  private magic: Magic | null = null

  constructor() {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY) {
      this.magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY)
    }
  }

  async createWallet(email: string) {
    if (!this.magic) throw new Error('Magic SDK not initialized')

    try {
      const didToken = await this.magic.auth.loginWithMagicLink({ email })
      const userInfo = await this.magic.user.getInfo()
      
      return {
        didToken,
        walletAddress: userInfo.publicAddress,
        email: userInfo.email,
        isMfaEnabled: userInfo.isMfaEnabled
      }
    } catch (error) {
      throw new Error(`Magic wallet creation failed: ${error}`)
    }
  }

  async getWalletInfo() {
    if (!this.magic) return null

    try {
      const isLoggedIn = await this.magic.user.isLoggedIn()
      if (!isLoggedIn) return null

      const userInfo = await this.magic.user.getInfo()
      return {
        walletAddress: userInfo.publicAddress,
        email: userInfo.email,
        issuer: userInfo.issuer
      }
    } catch (error) {
      console.error('Failed to get wallet info:', error)
      return null
    }
  }

  async signTransaction(transaction: any) {
    if (!this.magic) throw new Error('Magic SDK not initialized')

    try {
      const provider = this.magic.rpcProvider
      // Magic handles the signing securely
      return await provider.request({
        method: 'eth_sendTransaction',
        params: [transaction]
      })
    } catch (error) {
      throw new Error(`Transaction signing failed: ${error}`)
    }
  }

  async purchasePuffPassPoints(amount: number, paymentMethod: string) {
    const walletInfo = await this.getWalletInfo()
    if (!walletInfo) throw new Error('No active Magic wallet')

    // Integrate with your existing fiat on-ramp
    const response = await fetch('/api/fiat-onramp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        paymentMethod,
        walletAddress: walletInfo.walletAddress,
        email: walletInfo.email,
        provider: 'magic'
      })
    })

    return response.json()
  }

  async logout() {
    if (!this.magic) return

    try {
      await this.magic.user.logout()
      localStorage.removeItem('magicWalletAddress')
      localStorage.removeItem('userEmail')
    } catch (error) {
      console.error('Magic logout failed:', error)
    }
  }
}

export const magicWallet = new MagicWalletService()
