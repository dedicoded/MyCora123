
'use client'

let Magic: any = null

// Dynamically import magic-sdk only on client side
if (typeof window !== 'undefined') {
  import('magic-sdk').then((module) => {
    Magic = module.Magic
  }).catch(() => {
    console.warn('magic-sdk not available')
  })
}

export class MagicWalletService {
  private magic: any = null

  async initialize(apiKey: string) {
    if (typeof window === 'undefined') return null

    try {
      if (!Magic) {
        const module = await import('magic-sdk')
        Magic = module.Magic
      }
      
      this.magic = new Magic(apiKey)
      return this.magic
    } catch (error) {
      console.warn('Failed to initialize Magic SDK:', error)
      return null
    }
  }

  async connect() {
    if (!this.magic) return null
    
    try {
      const accounts = await this.magic.wallet.connectWithUI()
      return accounts[0]
    } catch (error) {
      console.error('Magic connect failed:', error)
      return null
    }
  }

  async disconnect() {
    if (!this.magic) return
    
    try {
      await this.magic.user.logout()
    } catch (error) {
      console.error('Magic disconnect failed:', error)
    }
  }

  async isLoggedIn() {
    if (!this.magic) return false
    
    try {
      return await this.magic.user.isLoggedIn()
    } catch (error) {
      console.error('Magic isLoggedIn check failed:', error)
      return false
    }
  }
}

export const magicWallet = new MagicWalletService()
