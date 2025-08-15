# MyCora Environment Variables - Complete Mapping

## 🔑 Required Variables for Vercel Deployment

### Blockchain Configuration
| Variable Name | Used In | Purpose | Example Value |
|---------------|---------|---------|---------------|
| `ALCHEMY_RPC_URL` | `server.js`, `lib/env-config.ts` | Primary RPC endpoint for Ethereum | `https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY` |
| `ETH_RPC_URL` | `server.js`, `lib/env-config.ts` | Backup RPC endpoint | `https://mainnet.infura.io/v3/YOUR_PROJECT_ID` |
| `PRIVATE_KEY` | `server.js`, `lib/env-config.ts` | Contract interaction signing | `0x1234...` (64 chars) |
| `ETH_PRIVATE_KEY` | `server.js`, `lib/env-config.ts` | Alternative private key | `0x5678...` (64 chars) |

### Smart Contract Addresses
| Variable Name | Used In | Purpose | Example Value |
|---------------|---------|---------|---------------|
| `SECURITY_TOKEN_ADDRESS` | `lib/env-config.ts` | Security token contract | `0x1234abcd...` (42 chars) |
| `UTILITY_TOKEN_ADDRESS` | `lib/env-config.ts` | Utility token contract | `0x5678efgh...` (42 chars) |

### IPFS Storage
| Variable Name | Used In | Purpose | Example Value |
|---------------|---------|---------|---------------|
| `WEB3_STORAGE_TOKEN` | `app/api/upload/route.ts`, `app/api/verify-license/route.ts`, `app/api/health/route.ts` | IPFS uploads via Web3.Storage | Long token from web3.storage |

### Environment
| Variable Name | Used In | Purpose | Example Value |
|---------------|---------|---------|---------------|
| `NODE_ENV` | `lib/env-config.ts` | Environment detection | `production` |

## 🛠 Vercel Setup Instructions

1. **Go to Vercel Dashboard**
   - Navigate to your project → Settings → Environment Variables

2. **Add Each Variable**
   \`\`\`
   ALCHEMY_RPC_URL = https://eth-mainnet.alchemyapi.io/v2/YOUR_ALCHEMY_KEY
   ETH_RPC_URL = https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
   PRIVATE_KEY = your-private-key-without-0x-prefix
   ETH_PRIVATE_KEY = your-eth-private-key-without-0x-prefix
   SECURITY_TOKEN_ADDRESS = 0x1234567890123456789012345678901234567890
   UTILITY_TOKEN_ADDRESS = 0x0987654321098765432109876543210987654321
   WEB3_STORAGE_TOKEN = your-web3-storage-token-from-account-page
   NODE_ENV = production
   \`\`\`

3. **Environment Settings**
   - Set each variable to **both Production and Preview**
   - Click Save after each variable
   - Trigger a **Redeploy** after adding all variables

## 🔍 File-by-File Usage

### `server.js` (Backend - moved to .backup)
- `process.env.ALCHEMY_RPC_URL` - Line 20
- `process.env.ETH_RPC_URL` - Line 21  
- `process.env.PRIVATE_KEY` - Line 25
- `process.env.ETH_PRIVATE_KEY` - Line 30

### `app/api/upload/route.ts` (IPFS Upload API)
- `process.env.WEB3_STORAGE_TOKEN` - Line 4, 7

### `app/api/verify-license/route.ts` (License Verification)
- `process.env.WEB3_STORAGE_TOKEN` - Line 44, 47

### `app/api/health/route.ts` (Health Check)
- `process.env.WEB3_STORAGE_TOKEN` - Line 9 (status check)

### `lib/env-config.ts` (Central Configuration)
- All variables centrally managed and validated

## ✅ Validation Checklist

- [ ] All 8 environment variables added to Vercel
- [ ] Variables set for both Production and Preview
- [ ] RPC URL matches your blockchain network
- [ ] Contract addresses are from correct network
- [ ] Private keys are secure and properly formatted
- [ ] Web3.Storage token is valid and active
- [ ] Redeployed after adding variables

## 🚨 Security Notes

- **Never commit private keys to Git**
- **Use different private keys for development/production**
- **Rotate Web3.Storage tokens periodically**
- **Verify contract addresses match your deployment network**
