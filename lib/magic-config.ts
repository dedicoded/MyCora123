
export const magicConfig = {
  // Magic SDK configuration
  publishableKey: process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY,
  
  // Cannabis-specific settings
  network: process.env.NEXT_PUBLIC_NETWORK || 'sepolia',
  
  // Customization for cannabis industry
  theme: {
    primaryColor: '#10B981', // Cannabis green
    backgroundColor: '#1F2937',
    isDarkMode: true
  },
  
  // Compliance settings
  extensions: [
    // Add extensions as needed for compliance
  ],
  
  // Cannabis payment optimizations
  puffPassIntegration: {
    enabled: true,
    autoCreatePoints: true,
    defaultTier: 'bronze'
  }
}

export const validateMagicConfig = () => {
  if (!magicConfig.publishableKey) {
    console.warn('🎪 Magic SDK: Missing NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY')
    console.warn('🎪 Add your Magic publishable key to Replit Secrets')
    console.warn('🎪 Get one at: https://magic.link/dashboard')
    return false
  }
  
  return true
}
