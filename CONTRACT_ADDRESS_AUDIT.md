# MyCora Smart Contract Address Audit Report

## 🔍 Executive Summary
This audit identifies all smart contract references across the MyCora codebase, categorizes placeholder vs production addresses, and provides a deployment roadmap for production readiness.

## 📋 Contract Address Inventory

### Core Token Contracts
| Contract | Environment Variable | Status | Purpose | Files Using |
|----------|---------------------|--------|---------|-------------|
| **MyCoraCoin (MCC)** | `MCC_CONTRACT_ADDRESS` | ❌ PLACEHOLDER | USD-pegged stablecoin | `app/api/mcc/mint/route.ts`, `components/ui/mcc-token-dashboard.tsx` |
| **MCC Staking** | `MCC_STAKING_CONTRACT_ADDRESS` | ❌ PLACEHOLDER | Staking rewards contract | `contracts/MCCStaking.sol`, `app/api/mcc/stake/route.ts` |
| **Security Token** | `SECURITY_TOKEN_ADDRESS` | ❌ PLACEHOLDER | Compliance-focused ERC-20 | `lib/env-config.ts`, `lib/contracts.ts` |
| **Utility Token** | `UTILITY_TOKEN_ADDRESS` | ❌ PLACEHOLDER | Platform access NFTs | `lib/env-config.ts`, `lib/contracts.ts` |
| **PuffPass Rewards** | `PUFFPASS_CONTRACT_ADDRESS` | ❌ PLACEHOLDER | Loyalty NFT system | `app/api/rewards/purchase/route.ts`, `components/ui/puffpass-status.tsx` |

### Infrastructure Contracts
| Contract | Environment Variable | Status | Purpose | Files Using |
|----------|---------------------|--------|---------|-------------|
| **Payment Processor** | `PAYMENT_PROCESSOR_CONTRACT_ADDRESS` | ❌ PLACEHOLDER | Escrow & payments | `app/api/payments/create/route.ts`, `lib/payment-processor.ts` |
| **Compliance Registry** | `COMPLIANCE_REGISTRY_ADDRESS` | ❌ PLACEHOLDER | KYC/AML tracking | `contracts/ComplianceRegistry.sol`, `app/api/compliance/kyc/route.ts` |
| **Fiat Rails Controller** | `FIAT_RAILS_CONTRACT_ADDRESS` | ❌ PLACEHOLDER | Fiat locking mechanism | `contracts/FiatRailsController.sol`, `app/api/payments/fiat-onramp/route.ts` |
| **Badge Registry** | `BADGE_REGISTRY_ADDRESS` | ❌ PLACEHOLDER | Reputation system | `contracts/BadgeRegistry.sol` |
| **Trust Token** | `TRUST_TOKEN_ADDRESS` | ❌ PLACEHOLDER | Enhanced compliance ERC-20 | `contracts/TrustToken.sol` |

### Client-Side Addresses (NEXT_PUBLIC_)
| Variable | Status | Purpose | Components Using |
|----------|--------|---------|------------------|
| `NEXT_PUBLIC_MCC_CONTRACT_ADDRESS` | ❌ MISSING | Frontend MCC interactions | `components/ui/mcc-token-dashboard.tsx` |
| `NEXT_PUBLIC_MCC_STAKING_CONTRACT_ADDRESS` | ❌ MISSING | Frontend staking UI | `components/ui/mcc-staking-dashboard.tsx` |
| `NEXT_PUBLIC_MILESTONE_NFT_CONTRACT_ADDRESS` | ❌ MISSING | Milestone rewards UI | `components/ui/milestone-nft-rewards.tsx` |

## 🚨 Critical Issues Found

### 1. Placeholder Addresses in Production Code
**Files with placeholder addresses:**
- `app/api/compliance/risk-assessment/route.ts:121` - `0x1234567890123456789012345678901234567890`
- `app/api/compliance/audit/route.ts:97,111,124` - Multiple placeholder addresses
- `app/api/payments/create/route.ts:76` - `0x9876543210987654321098765432109876543210`
- `components/ui/payment-history.tsx:56,57,69,70,82` - Multiple placeholders

### 2. Missing Environment Variables
**Required but undefined:**
- All contract addresses in `.env.example` show `0x...` placeholders
- No production contract addresses configured
- Missing client-side contract addresses for frontend components

### 3. Inconsistent Address Management
**Issues found:**
- Some contracts use server-side addresses, others need client-side
- No validation for address format or network compatibility
- Missing fallback handling for undefined addresses

## 📝 Deployment Action Plan

### Phase 1: Contract Deployment
1. **Deploy Core Contracts** (in order):
   \`\`\`bash
   # Deploy MyCora Coin (stablecoin)
   npx hardhat run scripts/deploy-mcc.ts --network mainnet
   
   # Deploy MCC Staking
   npx hardhat run scripts/deploy-mcc-staking.ts --network mainnet
   
   # Deploy Security Token
   npx hardhat run scripts/deploy-security-token.js --network mainnet
   
   # Deploy Utility Token  
   npx hardhat run scripts/deploy-utility-token.js --network mainnet
   
   # Deploy PuffPass Rewards
   npx hardhat run scripts/deploy-puffpass.ts --network mainnet
   \`\`\`

2. **Deploy Infrastructure Contracts**:
   \`\`\`bash
   # Deploy Payment Processor
   npx hardhat run scripts/deploy-payment-processor.ts --network mainnet
   
   # Deploy Compliance Registry
   npx hardhat run scripts/deploy-compliance-registry.ts --network mainnet
   
   # Deploy Fiat Rails Controller
   npx hardhat run scripts/deploy-fiat-rails.ts --network mainnet
   \`\`\`

### Phase 2: Environment Configuration
Update Vercel environment variables with deployed addresses:

\`\`\`env
# Core Tokens
MCC_CONTRACT_ADDRESS=0x[DEPLOYED_MCC_ADDRESS]
MCC_STAKING_CONTRACT_ADDRESS=0x[DEPLOYED_STAKING_ADDRESS]
SECURITY_TOKEN_ADDRESS=0x[DEPLOYED_SECURITY_ADDRESS]
UTILITY_TOKEN_ADDRESS=0x[DEPLOYED_UTILITY_ADDRESS]
PUFFPASS_CONTRACT_ADDRESS=0x[DEPLOYED_PUFFPASS_ADDRESS]

# Infrastructure
PAYMENT_PROCESSOR_CONTRACT_ADDRESS=0x[DEPLOYED_PAYMENT_ADDRESS]
COMPLIANCE_REGISTRY_ADDRESS=0x[DEPLOYED_COMPLIANCE_ADDRESS]
FIAT_RAILS_CONTRACT_ADDRESS=0x[DEPLOYED_FIAT_RAILS_ADDRESS]

# Client-side (for frontend components)
NEXT_PUBLIC_MCC_CONTRACT_ADDRESS=0x[DEPLOYED_MCC_ADDRESS]
NEXT_PUBLIC_MCC_STAKING_CONTRACT_ADDRESS=0x[DEPLOYED_STAKING_ADDRESS]
NEXT_PUBLIC_MILESTONE_NFT_CONTRACT_ADDRESS=0x[DEPLOYED_MILESTONE_ADDRESS]
\`\`\`

### Phase 3: Code Updates Required
1. **Replace all placeholder addresses** in API routes and components
2. **Add address validation** in environment configuration
3. **Implement fallback handling** for missing addresses
4. **Update frontend components** to use real contract addresses

## 🔧 Immediate Actions Required

### 1. Update Environment Configuration
\`\`\`typescript
// lib/env-config.ts - Add validation for all contract addresses
const requiredContracts = [
  'MCC_CONTRACT_ADDRESS',
  'MCC_STAKING_CONTRACT_ADDRESS', 
  'SECURITY_TOKEN_ADDRESS',
  'UTILITY_TOKEN_ADDRESS',
  'PUFFPASS_CONTRACT_ADDRESS',
  'PAYMENT_PROCESSOR_CONTRACT_ADDRESS'
];
\`\`\`

### 2. Replace Placeholder Addresses
All files containing `0x1234...` or similar need real addresses

### 3. Add Network Validation
Ensure all addresses are on the same network (mainnet/testnet)

## 📊 Integration Status

### External Services
| Service | Status | Address Requirements |
|---------|--------|---------------------|
| **Biconomy** | ✅ Configured | Uses contract addresses for gasless transactions |
| **Cybrid** | ✅ Configured | Fiat rails integration |
| **WalletConnect** | ✅ Configured | No contract addresses needed |
| **Privy** | ✅ Configured | Wallet-as-a-service |

### Payment Flows
| Flow | Status | Contracts Needed |
|------|--------|------------------|
| **Starbucks Gift Cards** | ❌ Missing addresses | PaymentProcessor, MCC |
| **Five Star Rewards** | ❌ Missing addresses | PuffPass, BadgeRegistry |
| **CashApp-style UX** | ❌ Missing addresses | MCC, FiatRails |

## ✅ Next Steps Checklist

- [ ] Deploy all smart contracts to target network
- [ ] Update all environment variables with real addresses
- [ ] Replace placeholder addresses in code
- [ ] Add address validation and error handling
- [ ] Test all contract interactions end-to-end
- [ ] Verify gasless transactions work with real addresses
- [ ] Update documentation with final addresses
- [ ] Run production validation script

## 🎯 Production Readiness Score: 15%

**Blockers for Production:**
- No deployed smart contracts (0/10 contracts)
- All addresses are placeholders
- Missing client-side address configuration
- No address validation or error handling

**Estimated Time to Production Ready:** 2-3 days
- 1 day: Contract deployment and verification
- 1 day: Environment configuration and testing  
- 0.5 day: Code updates and validation
