
export interface MobileWalletConfig {
  name: string
  deepLink: string
  universalLink: string
  downloadUrl: string
}

export const supportedMobileWallets: MobileWalletConfig[] = [
  {
    name: 'MetaMask',
    deepLink: 'metamask://',
    universalLink: 'https://metamask.app.link/',
    downloadUrl: 'https://metamask.io/download/'
  },
  {
    name: 'Rainbow',
    deepLink: 'rainbow://',
    universalLink: 'https://rainbow.me/',
    downloadUrl: 'https://rainbow.me/download'
  },
  {
    name: 'Coinbase Wallet',
    deepLink: 'cbwallet://',
    universalLink: 'https://go.cb-w.com/',
    downloadUrl: 'https://www.coinbase.com/wallet'
  },
  {
    name: 'Trust Wallet',
    deepLink: 'trust://',
    universalLink: 'https://link.trustwallet.com/',
    downloadUrl: 'https://trustwallet.com/download'
  }
]

export class MobileWalletDetector {
  static isMobile(): boolean {
    return typeof window !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
  }

  static isIOS(): boolean {
    return typeof window !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)
  }

  static isAndroid(): boolean {
    return typeof window !== 'undefined' && /Android/i.test(navigator.userAgent)
  }

  static async tryWalletDeepLink(walletConfig: MobileWalletConfig, wcUri: string): Promise<boolean> {
    if (!this.isMobile()) return false

    try {
      const encodedUri = encodeURIComponent(wcUri)
      const deepLinkUrl = `${walletConfig.deepLink}wc?uri=${encodedUri}`
      const universalLinkUrl = `${walletConfig.universalLink}wc?uri=${encodedUri}`

      // Try deep link first
      window.location.href = deepLinkUrl

      // Fallback to universal link after a short delay
      setTimeout(() => {
        window.location.href = universalLinkUrl
      }, 500)

      return true
    } catch (error) {
      console.error(`[MobileWallet] Failed to open ${walletConfig.name}:`, error)
      return false
    }
  }

  static getRecommendedWallet(): MobileWalletConfig {
    if (this.isIOS()) {
      return supportedMobileWallets.find(w => w.name === 'MetaMask') || supportedMobileWallets[0]
    }
    if (this.isAndroid()) {
      return supportedMobileWallets.find(w => w.name === 'Trust Wallet') || supportedMobileWallets[0]
    }
    return supportedMobileWallets[0]
  }
}

export function generateQRCodeData(wcUri: string, size: number = 256): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(wcUri)}`
}
