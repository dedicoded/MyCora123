# MyCora Full-Stack Setup

## Quick Start

### 1. Environment Variables
Create `.env.local` with the following variables:

\`\`\`bash
# Blockchain RPC URLs
NEXT_PUBLIC_ALCHEMY_RPC_URL=[YOUR_RPC_ENDPOINT]
NEXT_PUBLIC_RPC_URL=[YOUR_RPC_ENDPOINT]
ETHEREUM_RPC_URL=[YOUR_RPC_ENDPOINT]
SEPOLIA_RPC_URL=[YOUR_SEPOLIA_RPC_ENDPOINT]

# Contract Deployment
DEPLOYER_PRIVATE_KEY=[YOUR_PRIVATE_KEY]

# WalletConnect (Required for RainbowKit)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=[YOUR_WALLETCONNECT_PROJECT_ID]

# IPFS Storage
WEB3_STORAGE_TOKEN=[YOUR_WEB3_STORAGE_TOKEN]

# Contract Addresses (after deployment)
SECURITY_TOKEN_ADDRESS=0x...
UTILITY_TOKEN_ADDRESS=0x...
\`\`\`

### 2. Get WalletConnect Project ID
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy the Project ID
4. Add it as `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in your environment variables

### 3. Deploy Contracts
\`\`\`bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy-security-token.js --network sepolia
npx hardhat run scripts/deploy-utility-token.js --network sepolia

# Deploy to mainnet
npx hardhat run scripts/deploy-security-token.js --network mainnet
npx hardhat run scripts/deploy-utility-token.js --network mainnet
\`\`\`

### 4. Vercel Deployment
Add all environment variables in Vercel Dashboard → Settings → Environment Variables

## Architecture

### Contracts
- `MyCoraSecurityToken.sol` (ERC-1400 style)
- `MyCoraUtilityToken.sol` (ERC-721)

### Backend
- Next.js API Routes (serverless)
- Web3.Storage for IPFS uploads
- Endpoints for whitelisting, minting, metadata uploads

### Frontend
- Next.js + wagmi + RainbowKit
- Multi-network support (Ethereum, Polygon, Base, Sepolia)
- Components for minting tokens
- Metadata upload + mint flow

### Infrastructure
- Frontend: Vercel
- Blockchain: Alchemy RPC
- Storage: Web3.Storage (IPFS)
- Wallet: WalletConnect + RainbowKit

## Security
- Store secrets in environment variables
- Never commit private keys
- Use HTTPS everywhere
- Contract addresses are public but kept server-side for security

## Development
\`\`\`bash
npm install
npm run dev
\`\`\`

---

**Deploy and adapt this stack for a secure, scalable MyCora dApp. Need more features, dashboard UI, or database integration? Just ask!**
