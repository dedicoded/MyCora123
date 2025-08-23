export interface NetworkConfig {
  chainId: number
  name: string
  rpcUrl: string
  blockExplorer: string
  contracts: {
    myCoraCoin: string
    trustToken: string
    securityToken: string
    utilityToken: string
    puffPassRewards: string
    paymentProcessor: string
    complianceRegistry: string
    badgeRegistry: string
    mccStaking: string
    fiatRailsController: string
  }
}

export const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
  mainnet: {
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcUrl: safeGetEnv('ETHEREUM_RPC_URL', ''),
    blockExplorer: "https://etherscan.io",
    contracts: {
      myCoraCoin: safeGetEnv('ETHEREUM_MYCORA_COIN_ADDRESS', '0x0000000000000000000000000000000000000000'),
      trustToken: safeGetEnv('ETHEREUM_TRUST_TOKEN_ADDRESS', '0x0000000000000000000000000000000000000000'),
      securityToken: safeGetEnv('ETHEREUM_SECURITY_TOKEN_ADDRESS', '0x0000000000000000000000000000000000000000'),
      utilityToken: safeGetEnv('ETHEREUM_UTILITY_TOKEN_ADDRESS', '0x0000000000000000000000000000000000000000'),
      puffPassRewards: safeGetEnv('ETHEREUM_PUFFPASS_REWARDS_ADDRESS', '0x0000000000000000000000000000000000000000'),
      paymentProcessor: safeGetEnv('ETHEREUM_PAYMENT_PROCESSOR_ADDRESS', '0x0000000000000000000000000000000000000000'),
      complianceRegistry: safeGetEnv('ETHEREUM_COMPLIANCE_REGISTRY_ADDRESS', '0x0000000000000000000000000000000000000000'),
      badgeRegistry: safeGetEnv('ETHEREUM_BADGE_REGISTRY_ADDRESS', '0x0000000000000000000000000000000000000000'),
      mccStaking: safeGetEnv('ETHEREUM_MCC_STAKING_ADDRESS', '0x0000000000000000000000000000000000000000'),
      fiatRailsController: safeGetEnv('ETHEREUM_FIAT_RAILS_CONTROLLER_ADDRESS', '0x0000000000000000000000000000000000000000'),
    },
  },
  polygon: {
    chainId: 137,
    name: "Polygon",
    rpcUrl: process.env.POLYGON_RPC_URL || "",
    blockExplorer: "https://polygonscan.com",
    contracts: {
      myCoraCoin: process.env.POLYGON_MYCORA_COIN_ADDRESS || "",
      trustToken: process.env.POLYGON_TRUST_TOKEN_ADDRESS || "",
      securityToken: process.env.POLYGON_SECURITY_TOKEN_ADDRESS || "",
      utilityToken: process.env.POLYGON_UTILITY_TOKEN_ADDRESS || "",
      puffPassRewards: process.env.POLYGON_PUFFPASS_REWARDS_ADDRESS || "",
      paymentProcessor: process.env.POLYGON_PAYMENT_PROCESSOR_ADDRESS || "",
      complianceRegistry: process.env.POLYGON_COMPLIANCE_REGISTRY_ADDRESS || "",
      badgeRegistry: process.env.POLYGON_BADGE_REGISTRY_ADDRESS || "",
      mccStaking: process.env.POLYGON_MCC_STAKING_ADDRESS || "",
      fiatRailsController: process.env.POLYGON_FIAT_RAILS_CONTROLLER_ADDRESS || "",
    },
  },
  base: {
    chainId: 8453,
    name: "Base",
    rpcUrl: process.env.BASE_RPC_URL || "",
    blockExplorer: "https://basescan.org",
    contracts: {
      myCoraCoin: process.env.BASE_MYCORA_COIN_ADDRESS || "",
      trustToken: process.env.BASE_TRUST_TOKEN_ADDRESS || "",
      securityToken: process.env.BASE_SECURITY_TOKEN_ADDRESS || "",
      utilityToken: process.env.BASE_UTILITY_TOKEN_ADDRESS || "",
      puffPassRewards: process.env.BASE_PUFFPASS_REWARDS_ADDRESS || "",
      paymentProcessor: process.env.BASE_PAYMENT_PROCESSOR_ADDRESS || "",
      complianceRegistry: process.env.BASE_COMPLIANCE_REGISTRY_ADDRESS || "",
      badgeRegistry: process.env.BASE_BADGE_REGISTRY_ADDRESS || "",
      mccStaking: process.env.BASE_MCC_STAKING_ADDRESS || "",
      fiatRailsController: process.env.BASE_FIAT_RAILS_CONTROLLER_ADDRESS || "",
    },
  },
  sepolia: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    rpcUrl: safeGetEnv('SEPOLIA_RPC_URL', ''),
    blockExplorer: "https://sepolia.etherscan.io",
    contracts: {
      myCoraCoin: safeGetEnv('SEPOLIA_MYCORA_COIN_ADDRESS', '0x6C7Bb1ABF40C62cEbF95a8c57E24F0b8d7a88888'),
      trustToken: safeGetEnv('SEPOLIA_TRUST_TOKEN_ADDRESS', '0x0000000000000000000000000000000000000000'),
      securityToken: safeGetEnv('SEPOLIA_SECURITY_TOKEN_ADDRESS', '0x0000000000000000000000000000000000000000'),
      utilityToken: safeGetEnv('SEPOLIA_UTILITY_TOKEN_ADDRESS', '0x0000000000000000000000000000000000000000'),
      puffPassRewards: safeGetEnv('SEPOLIA_PUFFPASS_REWARDS_ADDRESS', '0x0000000000000000000000000000000000000000'),
      paymentProcessor: safeGetEnv('SEPOLIA_PAYMENT_PROCESSOR_ADDRESS', '0x0000000000000000000000000000000000000000'),
      complianceRegistry: safeGetEnv('SEPOLIA_COMPLIANCE_REGISTRY_ADDRESS', '0x0000000000000000000000000000000000000000'),
      badgeRegistry: safeGetEnv('SEPOLIA_BADGE_REGISTRY_ADDRESS', '0x0000000000000000000000000000000000000000'),
      mccStaking: safeGetEnv('SEPOLIA_MCC_STAKING_ADDRESS', '0x0000000000000000000000000000000000000000'),
      fiatRailsController: safeGetEnv('SEPOLIA_FIAT_RAILS_CONTROLLER_ADDRESS', '0x0000000000000000000000000000000000000000'),
    },
  },
}

// Safe environment variable getter
const safeGetEnv = (key: string, fallback: string = ""): string => {
  const value = process.env[key]
  if (!value || value.trim() === '' || value === 'undefined' || value === 'null') {
    return fallback
  }
  return value
}

export function getCurrentNetworkConfig(): NetworkConfig {
  const currentNetwork = safeGetEnv('NEXT_PUBLIC_NETWORK', 'sepolia')
  const config = NETWORK_CONFIGS[currentNetwork]
  
  if (!config) {
    console.warn(`Network ${currentNetwork} not found, falling back to sepolia`)
    return NETWORK_CONFIGS.sepolia
  }
  
  return config
}

export function getContractAddress(contractName: keyof NetworkConfig["contracts"]): string {
  const config = getCurrentNetworkConfig()
  const address = config.contracts[contractName]
  
  // Return null address if not set properly to prevent ENS errors
  if (!address || address.trim() === '' || address === 'undefined') {
    return '0x0000000000000000000000000000000000000000'
  }
  
  return address
}
