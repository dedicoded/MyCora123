# Vercel Environment Variables Setup

## Required Client-Side Variables (NEXT_PUBLIC_)

Add these variables in your Vercel dashboard under Project Settings > Environment Variables:

### WalletConnect Configuration
- **Key**: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- **Value**: `your-walletconnect-project-id`
- **Environment**: Production
- **Description**: WalletConnect project ID for wallet connections

### Network Configuration  
- **Key**: `NEXT_PUBLIC_NETWORK`
- **Value**: `mainnet` or `polygon` or `base` or `sepolia`
- **Environment**: Production
- **Description**: Target blockchain network

### MyCora Coin Contract
- **Key**: `NEXT_PUBLIC_MCC_CONTRACT_ADDRESS`
- **Value**: `0xYourActualContractAddress`
- **Environment**: Production
- **Description**: MyCora Coin contract address for frontend wallet interactions

## Security Note

Only the MCC contract address is exposed client-side as it's needed for direct wallet interactions. All other sensitive contract addresses remain server-side only for security.

## Deployment Steps

1. Deploy contracts using `npm run deploy:all`
2. Copy real contract addresses from deployment output
3. Add variables to Vercel dashboard
4. Redeploy application
