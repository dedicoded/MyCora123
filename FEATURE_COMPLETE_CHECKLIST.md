# MyCora Feature-Complete Deployment Checklist

## Environment Variables Required in Vercel

### Blockchain Connectivity
- `NEXT_PUBLIC_ALCHEMY_RPC_URL` - Your Alchemy RPC endpoint
- `NEXT_PUBLIC_RPC_URL` - Fallback RPC endpoint
- `NEXT_PUBLIC_CHAIN_ID` - Network chain ID (1 for mainnet, 11155111 for sepolia)

### Smart Contracts (Server-Side Only)
- `SECURITY_TOKEN_ADDRESS` - Deployed security token contract address
- `UTILITY_TOKEN_ADDRESS` - Deployed utility token contract address

### IPFS Integration
- `WEB3_STORAGE_TOKEN` - Web3.Storage API token (server-side only)

### Feature Flags
- `ENABLE_MINTING` - Set to 'true' to enable minting functionality
- `NODE_ENV` - Set to 'production' for production builds

## Deployment Verification Steps

### 1. Smart Contract Integration ✅
- [ ] Security token contract deployed and verified
- [ ] Utility token contract deployed and verified
- [ ] Contract addresses configured in server-side environment variables
- [ ] ABI files present and imported correctly

### 2. Blockchain Connectivity ✅
- [ ] RPC URL configured and responding
- [ ] Wallet connection works (RainbowKit)
- [ ] Network switching functions properly
- [ ] Token balances display correctly via API routes

### 3. IPFS Integration ✅
- [ ] Web3.Storage token configured
- [ ] Upload endpoints return valid CIDs
- [ ] Gateway links accessible
- [ ] Metadata uploads work end-to-end

### 4. Backend API ✅
- [ ] `/api/mint` - Token minting endpoint
- [ ] `/api/whitelist` - Address whitelisting
- [ ] `/api/upload` - IPFS file uploads
- [ ] `/api/verify-license` - License verification
- [ ] `/api/token-balance` - Token balance queries
- [ ] `/api/token-metadata` - Token metadata retrieval
- [ ] `/api/health` - System health check

### 5. Frontend UX ✅
- [ ] Mycelial theme applied consistently
- [ ] Responsive layout on all devices
- [ ] Wallet integration UI functional
- [ ] Minting interface operational
- [ ] Upload forms working

### 6. Security ✅
- [ ] No private keys in client bundle
- [ ] Contract addresses accessed via server-side API routes only
- [ ] Environment variables properly scoped
- [ ] API endpoints secured
- [ ] Input validation implemented

### 7. Infrastructure ✅
- [ ] Frontend deployed to Vercel
- [ ] All environment variables configured
- [ ] Build completes without errors
- [ ] Production URL accessible

## Testing Commands

\`\`\`bash
# Local production build test
npm run build && npm run start

# Environment variable validation
node -e "console.log(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL ? '✅ RPC configured' : '❌ RPC missing')"

# API endpoint testing
curl https://your-app.vercel.app/api/health
curl -X POST https://your-app.vercel.app/api/token-balance -H "Content-Type: application/json" -d '{"address":"0x..."}'
\`\`\`

## Common Issues & Solutions

1. **Wallet won't connect**: Check RPC URL and chain ID configuration
2. **Minting fails**: Verify contract addresses and enable minting flag
3. **Uploads fail**: Confirm Web3.Storage token is set correctly
4. **Token balance not loading**: Ensure API routes are working and contract addresses are set
5. **Styling broken**: Ensure all CSS files are imported in production build
