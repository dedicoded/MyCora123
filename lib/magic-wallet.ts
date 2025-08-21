
'use client'

import { Magic } from 'magic-sdk'

export class MagicWalletService {
  private magic: Magic | null = null
  private isInitialized = false

  async initialize(apiKey: string) {
    if (typeof window === 'undefined') return null
    if (this.isInitialized && this.magic) return this.magic

    try {
      this.magic = new Magic(apiKey)
      this.isInitialized = true
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
