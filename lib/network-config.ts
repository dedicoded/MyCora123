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
    rpcUrl: process.env.ETHEREUM_RPC_URL || "",
    blockExplorer: "https://etherscan.io",
    contracts: {
      myCoraCoin: process.env.ETHEREUM_MYCORA_COIN_ADDRESS || "",
      trustToken: process.env.ETHEREUM_TRUST_TOKEN_ADDRESS || "",
      securityToken: process.env.ETHEREUM_SECURITY_TOKEN_ADDRESS || "",
      utilityToken: process.env.ETHEREUM_UTILITY_TOKEN_ADDRESS || "",
      puffPassRewards: process.env.ETHEREUM_PUFFPASS_REWARDS_ADDRESS || "",
      paymentProcessor: process.env.ETHEREUM_PAYMENT_PROCESSOR_ADDRESS || "",
      complianceRegistry: process.env.ETHEREUM_COMPLIANCE_REGISTRY_ADDRESS || "",
      badgeRegistry: process.env.ETHEREUM_BADGE_REGISTRY_ADDRESS || "",
      mccStaking: process.env.ETHEREUM_MCC_STAKING_ADDRESS || "",
      fiatRailsController: process.env.ETHEREUM_FIAT_RAILS_CONTROLLER_ADDRESS || "",
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
    rpcUrl: process.env.SEPOLIA_RPC_URL || "",
    blockExplorer: "https://sepolia.etherscan.io",
    contracts: {
      myCoraCoin: process.env.SEPOLIA_MYCORA_COIN_ADDRESS || "",
      trustToken: process.env.SEPOLIA_TRUST_TOKEN_ADDRESS || "",
      securityToken: process.env.SEPOLIA_SECURITY_TOKEN_ADDRESS || "",
      utilityToken: process.env.SEPOLIA_UTILITY_TOKEN_ADDRESS || "",
      puffPassRewards: process.env.SEPOLIA_PUFFPASS_REWARDS_ADDRESS || "",
      paymentProcessor: process.env.SEPOLIA_PAYMENT_PROCESSOR_ADDRESS || "",
      complianceRegistry: process.env.SEPOLIA_COMPLIANCE_REGISTRY_ADDRESS || "",
      badgeRegistry: process.env.SEPOLIA_BADGE_REGISTRY_ADDRESS || "",
      mccStaking: process.env.SEPOLIA_MCC_STAKING_ADDRESS || "",
      fiatRailsController: process.env.SEPOLIA_FIAT_RAILS_CONTROLLER_ADDRESS || "",
    },
  },
}

export function getCurrentNetworkConfig(): NetworkConfig {
  const currentNetwork = process.env.NEXT_PUBLIC_NETWORK || "sepolia"
  return NETWORK_CONFIGS[currentNetwork] || NETWORK_CONFIGS.sepolia
}

export function getContractAddress(contractName: keyof NetworkConfig["contracts"]): string {
  const config = getCurrentNetworkConfig()
  return config.contracts[contractName] || ""
}
