# MyCora Vercel Deployment Guide

## Required Environment Variables

Set these in your Vercel project → Settings → Environment Variables:

### Blockchain Configuration
- **ALCHEMY_RPC_URL**: Your Alchemy API endpoint for Ethereum mainnet
- **ETH_RPC_URL**: Alternative RPC URL (Infura or other provider)
- **PRIVATE_KEY**: Private key for contract interactions (keep secure!)
- **ETH_PRIVATE_KEY**: Alternative private key if needed

### Smart Contract Addresses
- **SECURITY_TOKEN_ADDRESS**: Deployed security token contract address
- **UTILITY_TOKEN_ADDRESS**: Deployed utility token contract address

### IPFS Storage
- **WEB3_STORAGE_TOKEN**: Token from web3.storage for IPFS uploads

### Environment
- **NODE_ENV**: Set to "production" for production deployment

## Deployment Steps

1. **Add Environment Variables**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add each variable above with correct values
   - Set Environment to "Production" and "Preview"

2. **Verify Configuration**:
   - Check that all variables are accessible via `process.env.VARIABLE_NAME`
   - No NEXT_PUBLIC_ prefix needed for server-side variables

3. **Deploy**:
   - Push to main branch or trigger manual deployment
   - Monitor build logs for any missing environment variable errors

## Files Using Environment Variables

- `server.js` - Blockchain RPC and private key configuration
- `app/api/upload/route.ts` - Web3.Storage token for IPFS uploads
- `app/api/verify-license/route.ts` - License verification with IPFS anchoring
- `app/api/health/route.ts` - Environment status checking

## Troubleshooting

If you see "missing env vars" warnings:
1. Double-check variable names match exactly
2. Ensure they're set for both Production and Preview environments
3. Redeploy after adding variables
4. Check build logs for specific missing variables
