# MyCora Production Deployment Workflow

## Overview
Complete step-by-step guide for deploying MyCora contracts to production networks and syncing environment variables to hosting platforms.

## Prerequisites

### 1. Environment Setup
Ensure your `.env.production` includes:
\`\`\`bash
# Network RPC URLs
ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/YOUR_KEY

# Deployment
PRIVATE_KEY=your_deployer_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Vercel (optional for auto-sync)
VERCEL_PROJECT_ID=your_vercel_project_id
\`\`\`

### 2. Wallet Preparation
- Fund deployer wallet with sufficient ETH/MATIC for gas fees
- Estimated costs: ~0.1 ETH for all contracts on mainnet

## Deployment Steps

### Step 1: Deploy All Contracts
\`\`\`bash
# Deploy to mainnet
npm run deploy:mainnet

# Deploy to Sepolia (testnet)
npm run deploy:sepolia

# Deploy to Polygon
npm run deploy:polygon
\`\`\`

### Step 2: Verify Contracts
\`\`\`bash
# Verify on Etherscan
npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS

# Or use automated verification
npm run deploy:mainnet -- --verify
\`\`\`

### Step 3: Validate Addresses
\`\`\`bash
# Run address validation
npm run validate:addresses

# Expected output:
# ✅ MCC_CONTRACT_ADDRESS: 0xabc123... (deployed)
# ✅ PUFFPASS_CONTRACT_ADDRESS: 0xdef456... (deployed)
# 📊 Deployment readiness: 100%
\`\`\`

### Step 4: Sync to Hosting Platform

#### Option A: Automated Vercel Sync
\`\`\`bash
npm run sync:vercel
\`\`\`

#### Option B: Manual Environment Variable Setup
1. Go to Vercel Project → Settings → Environment Variables
2. Add each contract address:
   - `MCC_CONTRACT_ADDRESS`
   - `PUFFPASS_CONTRACT_ADDRESS`
   - `TRUST_TOKEN_ADDRESS`
   - etc.

### Step 5: Update Frontend Configuration
The deployment script automatically generates client-side variables:
\`\`\`bash
# These are added to .env.production
NEXT_PUBLIC_MCC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_PUFFPASS_CONTRACT_ADDRESS=0x...
\`\`\`

### Step 6: Production Testing
\`\`\`bash
# Run end-to-end tests
npm run test:e2e

# Test specific flows
npm run test:minting
npm run test:staking
npm run test:rewards
\`\`\`

## Deployment Outputs

### Generated Files
- `/deployments/mainnet-deployments.json` - Contract addresses and metadata
- `.env.production` - Updated environment variables
- `deployment-summary.md` - Gas costs and deployment report

### Contract Addresses Structure
\`\`\`json
{
  "MyCoraCoin": {
    "address": "0x...",
    "transactionHash": "0x...",
    "gasUsed": "1234567",
    "deployedAt": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

## Troubleshooting

### Common Issues
1. **Insufficient gas** - Increase gas limit in hardhat.config.ts
2. **RPC rate limits** - Use premium RPC providers
3. **Verification failures** - Check constructor arguments match deployment

### Validation Commands
\`\`\`bash
# Check contract deployment
npm run validate:addresses

# Test contract interactions
npm run test:contracts

# Verify environment sync
npm run validate:env
\`\`\`

## Post-Deployment Checklist

- [ ] All 10 contracts deployed successfully
- [ ] Contract verification completed on block explorers
- [ ] Environment variables synced to hosting platform
- [ ] Frontend displays real contract addresses (not placeholders)
- [ ] End-to-end flows tested (minting, staking, rewards)
- [ ] Production readiness score ≥ 85%
- [ ] Documentation updated with final addresses

## Security Notes

- Store private keys securely (use hardware wallets for mainnet)
- Verify contract addresses before announcing publicly
- Test all flows on testnet before mainnet deployment
- Monitor contracts for unusual activity post-deployment

## Support

For deployment issues:
1. Check the troubleshooting section above
2. Run validation scripts to identify specific problems
3. Review deployment logs in `/deployments/` directory
