# MyCora Production Deployment Guide

## Quick Start

### 1. Environment Setup
\`\`\`bash
# Copy environment template
cp .env.example .env.local

# Install dependencies
npm install

# Run production validation
npm run validate
\`\`\`

### 2. Staging Deployment
\`\`\`bash
# Set staging environment
export NODE_ENV=staging
export NEXT_PUBLIC_API_URL=https://staging-api.mycora.com

# Deploy to staging
npm run build
npm run deploy:staging

# Validate staging deployment
npm run validate:staging
\`\`\`

### 3. Production Deployment
\`\`\`bash
# Set production environment
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=https://api.mycora.com

# Deploy smart contracts
npm run deploy:contracts

# Deploy frontend
npm run build
npm run deploy:production

# Run full validation suite
npm run validate:production
\`\`\`

## CI/CD Integration

### GitHub Actions
\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy MyCora
on:
  push:
    branches: [main]
jobs:
  validate-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run validate
      - run: npm run deploy:production
\`\`\`

### Environment Variables Checklist

**Required for Production:**
- [ ] All RPC URLs configured
- [ ] Smart contract addresses deployed
- [ ] External API keys (Cybrid, Biconomy, Privy)
- [ ] KYC provider credentials
- [ ] Payment processor keys

### Biconomy API Key Configuration

**Step 1: Add to .env.production**
\`\`\`bash
# Server-side only (secure)
BICONOMY_API_KEY=your-real-biconomy-api-key-here
\`\`\`

**Step 2: Configure in Replit**
1. Go to your Replit project
2. Navigate to Secrets (lock icon in sidebar)
3. Add:
   - Key: `BICONOMY_API_KEY`
   - Value: `your-real-biconomy-api-key-here`
4. Click Add Secret and redeploy

**Step 3: Verify Configuration**
\`\`\`bash
# Test gasless transaction initialization
npm run test:gasless

# Validate Biconomy connectivity
npm run validate:biconomy
\`\`\`

**Important Notes:**
- Keep BICONOMY_API_KEY server-side only (no NEXT_PUBLIC_ prefix)
- Gasless transactions are handled via `/api/gasless/*` endpoints
- Frontend components call server-side APIs for security

## Monitoring & Health Checks

### Production Health Endpoints
- `/api/health` - Basic system health
- `/api/health/blockchain` - Smart contract connectivity
- `/api/health/integrations` - External service status
- `/api/health/compliance` - KYC/AML system status

### Monitoring Setup
\`\`\`bash
# Set up monitoring dashboards
npm run setup:monitoring

# Configure alerts
npm run setup:alerts
\`\`\`

## Troubleshooting

### Common Issues
1. **Contract deployment failures** - Check private key permissions
2. **RPC connection errors** - Verify API key limits
3. **KYC integration issues** - Confirm provider credentials
4. **Gasless transaction failures** - Check Biconomy configuration

### Debug Commands
\`\`\`bash
# Debug blockchain connectivity
npm run debug:blockchain

# Test KYC integration
npm run debug:kyc

# Validate fiat rails
npm run debug:fiat-rails

# Test Biconomy gasless transactions
npm run debug:biconomy
