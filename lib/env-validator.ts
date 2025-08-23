
export function validateContractAddresses(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  const requiredAddresses = {
    SECURITY_TOKEN_ADDRESS: process.env.SECURITY_TOKEN_ADDRESS,
    UTILITY_TOKEN_ADDRESS: process.env.UTILITY_TOKEN_ADDRESS,
    MCC_CONTRACT_ADDRESS: process.env.MCC_CONTRACT_ADDRESS,
  };

  Object.entries(requiredAddresses).forEach(([key, value]) => {
    if (!value || value === "" || value === "0x") {
      errors.push(`${key} is not configured or empty`);
    } else if (!value.startsWith('0x') || value.length !== 42) {
      errors.push(`${key} is not a valid Ethereum address format`);
    }
  });

  const rpcUrl = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL;
  if (!rpcUrl) {
    errors.push("RPC URL is not configured");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function getContractAddress(contractName: string): string | null {
  const addresses = {
    SECURITY_TOKEN: process.env.SECURITY_TOKEN_ADDRESS,
    UTILITY_TOKEN: process.env.UTILITY_TOKEN_ADDRESS,
    MCC_CONTRACT: process.env.MCC_CONTRACT_ADDRESS,
  };

  const address = addresses[contractName as keyof typeof addresses];
  
  if (!address || address === "" || address === "0x") {
    return null;
  }

  return address;
}
