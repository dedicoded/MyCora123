# MyCora Quick Deployment Guide

## 1. Environment Setup

### Local Development
1. Copy `.env.local.example` to `.env.local`
2. Fill in your actual values (at minimum: WALLETCONNECT_PROJECT_ID)
3. Run `npm run dev`

### Vercel Production
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these **required** variables:
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - `NEXT_PUBLIC_MCC_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_NETWORK`

3. Add these **server-side** variables (no NEXT_PUBLIC_ prefix):
   - `BICONOMY_API_KEY`
   - `CYBRID_API_KEY`
   - `DEPLOYER_PRIVATE_KEY`

## 2. Validation Commands

\`\`\`bash
# Check deployment readiness
npm run validate:deployment

# Validate environment variables
npm run validate:env

# Check UI components
npm run validate:ui

# Full production validation
npm run validate
\`\`\`

## 3. Contract Deployment

\`\`\`bash
# Deploy all contracts to Sepolia testnet
npm run deploy:sepolia

# Deploy to mainnet (production)
npm run deploy:mainnet

# Check deployment status
npm run deployment:status
\`\`\`

## 4. Common Issues

### Blank UI in Production
- Check environment variables are set in Vercel
- Ensure NEXT_PUBLIC_ prefix for client-side variables
- Run `npm run validate:deployment` locally first

### Wallet Connection Fails
- Verify WALLETCONNECT_PROJECT_ID is correct
- Check network configuration matches deployed contracts
- Ensure contract addresses are valid

### Build Errors
- Run `npm run build` locally to test
- Check for case-sensitive file imports
- Validate all environment variables are set

## 5. Support

If you encounter issues:
1. Run validation scripts first
2. Check Replit deployment logs
3. Verify environment variables match this guide
