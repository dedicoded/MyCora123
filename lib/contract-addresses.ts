
// Contract address configuration for different networks
// Fallback for empty contract addresses to prevent ENS errors
const getValidAddress = (address: string | undefined): string => {
  return address && address.trim() !== '' ? address : '0x0000000000000000000000000000000000000000'
}

export const CONTRACT_ADDRESSES = {
  sepolia: {
    MCC_TOKEN: process.env.NEXT_PUBLIC_MCC_CONTRACT_ADDRESS || '0x6C7Bb1ABF40C62cEbF95a8c57E24F0b8d7a88888',
    SECURITY_TOKEN: process.env.NEXT_PUBLIC_SECURITY_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
    UTILITY_TOKEN: process.env.NEXT_PUBLIC_UTILITY_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
    PAYMENT_PROCESSOR: process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
  },
  mainnet: {
    MCC_TOKEN: process.env.NEXT_PUBLIC_MCC_CONTRACT_ADDRESS_MAINNET || '0x0000000000000000000000000000000000000000',
    SECURITY_TOKEN: process.env.NEXT_PUBLIC_SECURITY_CONTRACT_ADDRESS_MAINNET || '0x0000000000000000000000000000000000000000',
    UTILITY_TOKEN: process.env.NEXT_PUBLIC_UTILITY_CONTRACT_ADDRESS_MAINNET || '0x0000000000000000000000000000000000000000',
    PAYMENT_PROCESSOR: process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS_MAINNET || '0x0000000000000000000000000000000000000000',
  }
}

export function getContractAddress(contractName: keyof typeof CONTRACT_ADDRESSES.sepolia, network: string = 'sepolia') {
  const networkAddresses = CONTRACT_ADDRESSES[network as keyof typeof CONTRACT_ADDRESSES]
  if (!networkAddresses) {
    throw new Error(`Unsupported network: ${network}`)
  }
  
  const address = networkAddresses[contractName]
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    console.warn(`Contract ${contractName} not deployed on ${network}`)
    return null
  }
  
  return address
}

export function validateContractAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address) && address !== '0x0000000000000000000000000000000000000000'
}
