# MyCora Integration Architecture

## Wallet & Payment Services

### Cybrid Integration (Backend Service)
**Purpose**: Embedded wallets and compliant fiat rails
- **KYC/AML**: Automated identity verification and compliance
- **Bank Account Linking**: Connect traditional bank accounts
- **Fiat-to-Crypto**: Seamless USD to MCC token conversion
- **Embedded Wallets**: Custodial wallet creation for non-crypto users
- **Environment Variable**: `CYBRID_API_KEY` (server-side only)

### WalletConnect Integration (Frontend Protocol)
**Purpose**: External wallet connectivity
- **Wallet Connection**: MetaMask, Rainbow, Coinbase Wallet, etc.
- **QR Code/Deep Link**: Mobile and desktop wallet pairing
- **Transaction Signing**: User-controlled private keys
- **Multi-Chain Support**: Ethereum, Polygon, Base networks
- **Environment Variable**: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (client-side)

## Integration Flow
1. **New Users**: Cybrid creates embedded wallets with fiat onboarding
2. **Crypto Users**: WalletConnect enables external wallet connections
3. **Fiat Rails**: Cybrid handles USD deposits and MCC token minting
4. **Transactions**: Both services support gasless transactions via Biconomy
5. **Compliance**: Cybrid provides KYC while smart contracts enforce rules

## Required Environment Variables
\`\`\`env
# Cybrid (Server-side)
CYBRID_API_KEY=your-cybrid-api-key
CYBRID_ENVIRONMENT=sandbox

# WalletConnect (Client-side)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
NEXT_PUBLIC_MCC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NETWORK=sepolia
