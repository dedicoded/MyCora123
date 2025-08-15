# MyCora Contract Deployment Guide

## 🎯 Deployment Strategy

### Network Selection
- **Security Token (ERC-1400)**: Ethereum Mainnet or Sepolia
- **Utility Token (ERC-721)**: Polygon, Base, or Optimism (lower gas costs)

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
Create `.env.local` with your deployment keys:
\`\`\`bash
# Network RPC URLs
ETHEREUM_RPC_URL=[YOUR_ETHEREUM_RPC_ENDPOINT]
SEPOLIA_RPC_URL=[YOUR_SEPOLIA_RPC_ENDPOINT]
POLYGON_RPC_URL=[YOUR_POLYGON_RPC_ENDPOINT]
BASE_RPC_URL=[YOUR_BASE_RPC_ENDPOINT]

# Deployment wallet private key
DEPLOYER_PRIVATE_KEY=0x[YOUR_PRIVATE_KEY]

# Block explorer API keys for verification
ETHERSCAN_API_KEY=[YOUR_ETHERSCAN_KEY]
POLYGONSCAN_API_KEY=[YOUR_POLYGONSCAN_KEY]
BASESCAN_API_KEY=[YOUR_BASESCAN_KEY]
\`\`\`

### 2. Hardhat Configuration
Ensure `hardhat.config.js` includes all target networks:
\`\`\`javascript
networks: {
  mainnet: {
    url: process.env.ETHEREUM_RPC_URL,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    chainId: 1
  },
  sepolia: {
    url: process.env.SEPOLIA_RPC_URL,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    chainId: 11155111
  },
  polygon: {
    url: process.env.POLYGON_RPC_URL,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    chainId: 137
  },
  base: {
    url: process.env.BASE_RPC_URL,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    chainId: 8453
  }
}
\`\`\`

## 🚀 Deployment Commands

### Option A: Sepolia + Polygon (Recommended for Testing)
\`\`\`bash
# Deploy Security Token to Sepolia
npx hardhat run scripts/deploy-security-token.js --network sepolia

# Deploy Utility Token to Polygon
npx hardhat run scripts/deploy-utility-token.js --network polygon
\`\`\`

### Option B: Mainnet + Base (Production)
\`\`\`bash
# Deploy Security Token to Ethereum Mainnet
npx hardhat run scripts/deploy-security-token.js --network mainnet

# Deploy Utility Token to Base
npx hardhat run scripts/deploy-utility-token.js --network base
\`\`\`

## ✅ Contract Verification

### Verify on Etherscan (Ethereum/Sepolia)
\`\`\`bash
npx hardhat verify --network sepolia [SECURITY_TOKEN_ADDRESS] "MyCora Security Token" "MCST"
\`\`\`

### Verify on Polygonscan
\`\`\`bash
npx hardhat verify --network polygon [UTILITY_TOKEN_ADDRESS] "MyCora Utility Token" "MCUT"
\`\`\`

### Verify on Basescan
\`\`\`bash
npx hardhat verify --network base [UTILITY_TOKEN_ADDRESS] "MyCora Utility Token" "MCUT"
\`\`\`

## 🔧 Vercel Environment Variables

### Required Variables (Server-Side Only)
\`\`\`bash
# Contract addresses (from deployment output)
SECURITY_TOKEN_ADDRESS=0x[DEPLOYED_SECURITY_TOKEN_ADDRESS]
UTILITY_TOKEN_ADDRESS=0x[DEPLOYED_UTILITY_TOKEN_ADDRESS]

# RPC endpoints for backend operations
ETHEREUM_RPC_URL=[YOUR_ETHEREUM_RPC_ENDPOINT]
POLYGON_RPC_URL=[YOUR_POLYGON_RPC_ENDPOINT]

# Private key for backend minting operations
DEPLOYER_PRIVATE_KEY=0x[YOUR_PRIVATE_KEY]

# IPFS storage
WEB3_STORAGE_TOKEN=[YOUR_WEB3_STORAGE_TOKEN]
\`\`\`

### Required Variables (Client-Side)
\`\`\`bash
# Public RPC URLs for wallet connections
NEXT_PUBLIC_ETHEREUM_RPC_URL=[YOUR_PUBLIC_ETHEREUM_RPC_ENDPOINT]
NEXT_PUBLIC_POLYGON_RPC_URL=[YOUR_PUBLIC_POLYGON_RPC_ENDPOINT]

# Chain IDs for wallet switching
NEXT_PUBLIC_SECURITY_CHAIN_ID=1  # or 11155111 for Sepolia
NEXT_PUBLIC_UTILITY_CHAIN_ID=137  # or 8453 for Base

# Environment flag
NEXT_PUBLIC_ENVIRONMENT=production
\`\`\`

## 📝 Network-Specific Chain IDs

| Network | Chain ID | Explorer |
|---------|----------|----------|
| Ethereum Mainnet | 1 | etherscan.io |
| Sepolia Testnet | 11155111 | sepolia.etherscan.io |
| Polygon Mainnet | 137 | polygonscan.com |
| Base Mainnet | 8453 | basescan.org |
| Optimism Mainnet | 10 | optimistic.etherscan.io |

## 🔄 Post-Deployment Steps

1. **Test Contract Interactions**
   \`\`\`bash
   # Test minting on testnet first
   npx hardhat run scripts/test-mint.js --network sepolia
   \`\`\`

2. **Update Frontend Configuration**
   - Redeploy Vercel app after setting all environment variables
   - Test wallet connection on each network
   - Verify minting flows work end-to-end

3. **Verify Block Explorer Links**
   - Ensure contract pages load correctly
   - Check that ABI is properly imported
   - Test read/write functions through explorer

## 🚨 Security Checklist

- [ ] Private keys stored securely (never in code)
- [ ] Environment variables set in Vercel (not in repository)
- [ ] Contract addresses kept server-side only
- [ ] Contracts verified on block explorers
- [ ] Test transactions on testnets first
- [ ] Backup deployment addresses and transaction hashes
- [ ] Set up monitoring for contract events

## 📞 Troubleshooting

### Common Issues
- **Gas estimation failed**: Increase gas limit in deployment script
- **Verification failed**: Ensure constructor parameters match exactly
- **RPC errors**: Check API key limits and network status
- **Frontend not connecting**: Verify NEXT_PUBLIC_ variables are set correctly

### Support Resources
- [Hardhat Documentation](https://hardhat.org/docs)
- [Etherscan Verification Guide](https://docs.etherscan.io/tutorials/verifying-contracts-programmatically)
- [Polygon Deployment Guide](https://docs.polygon.technology/develop/hardhat/)
