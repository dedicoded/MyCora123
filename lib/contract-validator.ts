
// Runtime contract address validation
export class ContractValidator {
  private static readonly PLACEHOLDER_PATTERNS = [
    /0x0{40}/, // All zeros
    /0x[0-9]{40}/, // Sequential numbers
    /placeholder/i,
    /changeme/i,
    /your_/i,
    /0x\.{3}/  // 0x...
  ]

  static validateAddress(address: string, contractName: string): boolean {
    if (!address) {
      console.warn(`⚠️ ${contractName}: Address is missing`)
      return false
    }

    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      console.error(`❌ ${contractName}: Invalid address format - ${address}`)
      return false
    }

    for (const pattern of this.PLACEHOLDER_PATTERNS) {
      if (pattern.test(address)) {
        console.error(`❌ ${contractName}: Placeholder address detected - ${address}`)
        return false
      }
    }

    console.log(`✅ ${contractName}: Valid address - ${address.substring(0, 10)}...`)
    return true
  }

  static validateAllContracts(): boolean {
    const contracts = [
      { name: 'MCC Contract', address: process.env.NEXT_PUBLIC_MCC_CONTRACT_ADDRESS },
      { name: 'Security Token', address: process.env.SECURITY_TOKEN_ADDRESS },
      { name: 'Utility Token', address: process.env.UTILITY_TOKEN_ADDRESS },
      { name: 'PuffPass', address: process.env.PUFFPASS_CONTRACT_ADDRESS },
      { name: 'Payment Processor', address: process.env.PAYMENT_PROCESSOR_CONTRACT_ADDRESS }
    ]

    const results = contracts.map(({ name, address }) => 
      this.validateAddress(address || '', name)
    )

    return results.every(Boolean)
  }
}

export default ContractValidator
