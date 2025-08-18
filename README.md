# MyCora Full-Stack Platform

## 🚀 Quick Start

### 1. Environment Variables
Create `.env.local` with the following variables:

\`\`\`bash
# Blockchain RPC URLs
ETHEREUM_RPC_URL=[YOUR_RPC_ENDPOINT]
POLYGON_RPC_URL=[YOUR_POLYGON_RPC_ENDPOINT]
SEPOLIA_RPC_URL=[YOUR_SEPOLIA_RPC_ENDPOINT]

# Contract Deployment
DEPLOYER_PRIVATE_KEY=[YOUR_PRIVATE_KEY]

# WalletConnect & Integrations
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=[YOUR_WALLETCONNECT_PROJECT_ID]
CYBRID_API_KEY=[YOUR_CYBRID_API_KEY]
BICONOMY_API_KEY=[YOUR_BICONOMY_API_KEY]

# Database & Storage
SUPABASE_URL=[YOUR_SUPABASE_URL]
SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]

# Network Configuration
NEXT_PUBLIC_NETWORK=mainnet

# Contract Addresses (populated after deployment)
MYCORA_COIN_ADDRESS=0x...
TRUST_TOKEN_ADDRESS=0x...
PUFFPASS_REWARDS_ADDRESS=0x...
\`\`\`

### 2. Validate Environment
\`\`\`bash
# Check all environment variables and configuration
npm run validate:env

# Full validation suite
npm run audit
\`\`\`

### 3. Deploy Contracts
\`\`\`bash
# Deploy all contracts to Sepolia testnet
npm run deploy:sepolia

# Deploy to mainnet
npm run deploy:mainnet

# Verify contracts on Etherscan
npm run verify:all
\`\`\`

### 4. Development
\`\`\`bash
npm install
npm run dev:auto  # Auto-detects available port
\`\`\`

## 🧠 Operational Integrity

MyCora's build system includes enterprise-grade operational features:

- 🔒 **Security auditing** (`npm audit`)
- 📦 **Bundle size enforcement** (`size-limit`)
- 🧹 **Clean build automation** (`clean`)
- 🚦 **Port conflict detection** (`detect-port`)
- ✅ **Environment validation** (`validate-env.js`)
- 📊 **Performance monitoring** (`perf:audit`)
- 🔍 **Bundle analysis** (`analyze`)

These scripts ensure reproducibility, silent consoles, and investor-grade hygiene across all environments.

## 🏗️ Architecture

### Smart Contracts
- **MyCoraCoin (MCC)** - USD-pegged stablecoin with Cybrid integration
- **TrustToken** - Compliance-focused ERC-20 with KYC integration
- **PuffPassRewards** - Soulbound ERC-1155 loyalty system
- **PaymentProcessor** - Gasless transaction handling with Biconomy
- **ComplianceRegistry** - KYC/AML compliance tracking

### Backend Services
- **Gasless Transactions** - Biconomy integration for user-friendly UX
- **Fiat Rails** - Cybrid integration for seamless fiat on/off-ramps
- **Compliance Engine** - Automated KYC/AML processing
- **Payment Processing** - Multi-token payment handling
- **Admin Dashboard** - Comprehensive platform management

### Frontend Experience
- **Invisible Blockchain UX** - Users interact without knowing it's Web3
- **Multi-Wallet Support** - WalletConnect + embedded wallet options
- **Responsive Design** - Mobile-first with organic mycelial aesthetics
- **Real-time Updates** - Live balance tracking and transaction status

### Infrastructure
- **Frontend**: Vercel with Next.js 14
- **Blockchain**: Multi-chain (Ethereum, Polygon, Base)
- **Database**: Supabase with real-time subscriptions
- **Storage**: IPFS for metadata and compliance documents
- **Monitoring**: Comprehensive logging and error tracking

## 🔐 Security & Compliance

- **Environment Variable Validation** - Automated checks for missing/placeholder values
- **Contract Address Security** - Server-side only exposure of sensitive addresses
- **KYC/AML Integration** - Automated compliance screening
- **Audit Trail** - Immutable transaction and compliance logging
- **Role-Based Access** - Granular permissions for different user types

## 📊 Performance & Monitoring

\`\`\`bash
# Bundle analysis
npm run analyze

# Performance audit
npm run perf:audit

# Size limit checking
npm run size-check

# Full deployment validation
npm run validate:deployment
\`\`\`

## 🚀 Production Deployment

### Vercel Setup
1. Connect your GitHub repository to Vercel
2. Add all environment variables in Vercel Dashboard → Settings → Environment Variables
3. Deploy with automatic CI/CD integration

### Environment Variables for Production
Use the comprehensive environment validation:
\`\`\`bash
npm run validate:env
\`\`\`

This will check all required variables and provide a production readiness score.

## 🛠️ Development Scripts

\`\`\`bash
# Development
npm run dev              # Start development server
npm run dev:auto         # Auto-detect port and start

# Building & Testing
npm run build            # Production build
npm run analyze          # Bundle analysis
npm run test:deployment  # Test production deployment

# Validation & Auditing
npm run audit            # Full security and performance audit
npm run validate:env     # Environment variable validation
npm run validate:ui      # UI deployment validation

# Contract Management
npm run deploy:all       # Deploy all contracts
npm run contracts:compile # Compile contracts
npm run test:contracts   # Run contract tests

# Maintenance
npm run clean            # Clean install
npm run clean:cache      # Clear Next.js cache
\`\`\`

---

**MyCora provides a complete Web3 compliance platform with invisible blockchain UX, enterprise-grade security, and investor-ready operational integrity.**
