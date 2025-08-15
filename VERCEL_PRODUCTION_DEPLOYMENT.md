# MyCora Vercel Production Deployment Guide

## 🚀 Final Deployment Checklist

### 1. Environment Variables Setup in Vercel

**Required Variables (add in Vercel → Settings → Environment Variables):**

\`\`\`bash
# Blockchain Configuration
NEXT_PUBLIC_ALCHEMY_RPC_URL=[YOUR_ALCHEMY_RPC_ENDPOINT]
NEXT_PUBLIC_ETH_RPC_URL=[YOUR_ETHEREUM_RPC_ENDPOINT]

# Contract Addresses (Server-side only for security)
SECURITY_TOKEN_ADDRESS=[YOUR_SECURITY_TOKEN_CONTRACT_ADDRESS]
UTILITY_TOKEN_ADDRESS=[YOUR_UTILITY_TOKEN_CONTRACT_ADDRESS]

# IPFS Storage (Server-side only)
WEB3_STORAGE_TOKEN=[YOUR_WEB3_STORAGE_API_TOKEN]

# Development
NEXT_PUBLIC_DEV_MODE=false
NODE_ENV=production
\`\`\`

**Important Security Notes:**
- Contract addresses are now server-side only (no NEXT_PUBLIC_ prefix)
- Use `NEXT_PUBLIC_` prefix only for non-sensitive client-side variables
- Set Environment to both **Production** and **Preview**
- Replace all `[YOUR_*]` placeholders with your actual values
- Double-check variable names match exactly what's in your code

### 2. Pre-Deployment Testing

\`\`\`bash
# Create .env.production locally
cp .env.example .env.production
# Add your production values

# Test production build locally
npm run build
npm run start

# Verify mycelial theme assets load correctly
# Check browser console for missing assets
\`\`\`

### 3. Asset Path Verification

**Current Assets to Verify:**
- `/public/placeholder.svg` - Main placeholder image
- `/public/placeholder-logo.svg` - Logo placeholder
- CSS custom properties in `app/globals.css`
- Mycelial theme variables (earthy colors, organic textures)

**Theme Assets Status:**
- ✅ CSS Variables: Complete OKLCH color system with dark/light themes
- ✅ Placeholder SVGs: Ready for mycelial network graphics
- 🔄 **TODO**: Replace placeholders with organic mycelium visuals
- 🔄 **TODO**: Add animated SVG/WebGL backgrounds for network effect

### 4. CSS Variables & Theme Tokens

**Current Theme System:**
\`\`\`css
/* Earthy Base Colors (ready for mycelial theme) */
--background: oklch(1 0 0);           /* Light soil */
--foreground: oklch(0.145 0 0);       /* Dark earth */
--primary: oklch(0.205 0 0);          /* Deep root */
--accent: oklch(0.97 0 0);            /* Light spore */

/* Chart Colors (network visualization ready) */
--chart-1: oklch(0.646 0.222 41.116); /* Growth orange */
--chart-2: oklch(0.6 0.118 184.704);  /* Trust blue */
--chart-3: oklch(0.398 0.07 227.392); /* Deep network */
\`\`\`

### 5. Mycelial Theme Implementation Status

**✅ Completed:**
- Comprehensive CSS custom property system
- Dark/light theme support with organic color palette
- Responsive design foundation
- SVG placeholder system ready for mycelial graphics

**🔄 Next Steps for Full Mycelial Experience:**
- Replace placeholder SVGs with branching mycelium graphics
- Add animated background with pulsing network nodes
- Implement trust visualization components
- Add organic micro-interactions (hover glows, ripple effects)

### 6. Production Deployment Steps

1. **Set Environment Variables** in Vercel dashboard with your actual API keys
2. **Deploy from main branch** - avoid instant rollback
3. **Test production URL** for full functionality
4. **Verify Web3 features** work with production RPC endpoints
5. **Check mycelial theme** renders correctly across devices

### 7. Post-Deployment Verification

**Test These Features:**
- [ ] Homepage loads with proper theme
- [ ] Development utilities (only visible in dev mode)
- [ ] API routes respond correctly
- [ ] Web3 functionality works with production RPCs
- [ ] IPFS uploads work (if WEB3_STORAGE_TOKEN set)
- [ ] Trust visualization components render
- [ ] Responsive design on mobile/tablet

### 8. Domain Configuration

**After successful deployment:**
- Add custom domain in Vercel dashboard
- Configure DNS records
- Enable HTTPS (automatic with Vercel)
- Test domain redirect if applicable

## 🌱 Mycelial Theme Enhancement Roadmap

**Phase 1: Core Visuals**
- Animated SVG mycelium backgrounds
- Organic node connection graphics
- Trust map visualization components

**Phase 2: Interactions**
- Hover effects with organic growth animations
- Ripple effects on user actions
- Network expansion micro-interactions

**Phase 3: Advanced Features**
- WebGL underground system visuals
- Real-time trust network updates
- Gamified growth mechanics

---

**Ready to deploy!** Your MyCora application has a solid foundation with defensive API patterns, comprehensive environment configuration, and a theme system ready for the full mycelial network experience.
