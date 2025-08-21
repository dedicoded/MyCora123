# MyCora UI Deployment Checklist

## Pre-Deployment Validation

### 🔍 File System Checks
- [ ] All file names use consistent casing
- [ ] No case-insensitive duplicate files
- [ ] All imports match exact file name casing
- [ ] No broken relative import paths

### 🖼️ Asset Validation
- [ ] All images are in `public/` directory
- [ ] Font files are properly linked
- [ ] CSS files are correctly imported
- [ ] No hardcoded asset paths in components
- [ ] Placeholder images use correct syntax: `/placeholder.svg?height=X&width=Y`

### 🔧 Environment Configuration
- [ ] `.env.example` includes all required variables
- [ ] Production environment variables are set in Vercel
- [ ] No `NEXT_PUBLIC_` prefixes on sensitive variables
- [ ] Network-specific contract addresses are configured
- [ ] Database connection strings are valid

### 🎨 Styling & CSS
- [ ] Tailwind CSS is properly imported in `globals.css`
- [ ] Custom theme configuration is complete
- [ ] No unused CSS classes in production build
- [ ] Dynamic class names are safeguarded from purging
- [ ] Font variables are properly configured

### 📱 Responsive Design
- [ ] Components use responsive Tailwind classes (`sm:`, `md:`, `lg:`)
- [ ] Layout works on mobile, tablet, and desktop
- [ ] Navigation adapts to different screen sizes
- [ ] Text remains readable at all breakpoints

### 🔗 Integration Checks
- [ ] Supabase connection is configured
- [ ] Wallet connection works in production
- [ ] API routes respond correctly
- [ ] Smart contract addresses are deployed and verified

## Build Validation Commands

\`\`\`bash
# Run UI validation script
npm run validate:ui

# Test production build locally
npm run build
npm run start

# Check for build warnings
npm run build 2>&1 | grep -i warning

# Validate environment variables
npm run validate:env
\`\`\`

## Common Issues & Solutions

### Case Sensitivity Errors
\`\`\`bash
# Find potential case issues
find . -name "*.tsx" -o -name "*.ts" | sort | uniq -i -d
\`\`\`

### Missing Assets
- Check build logs for 404 errors
- Verify all images are in `public/` directory
- Use relative paths for local assets

### Tailwind Purging Issues
- Add dynamic classes to safelist in `tailwind.config.js`
- Use complete class names, avoid string concatenation
- Test production build locally

### Environment Variable Issues
- Ensure all `NEXT_PUBLIC_` variables are truly needed on client
- Use server-side API routes for sensitive operations
- Validate all required variables are set in production

## Post-Deployment Verification

- [ ] Homepage loads without errors
- [ ] Wallet connection works
- [ ] All navigation links function
- [ ] Forms submit successfully
- [ ] Responsive design works on mobile
- [ ] No console errors in browser
- [ ] All images and fonts load correctly

## Emergency Rollback Plan

If deployment issues occur:
1. Check Replit deployment logs
2. Verify environment variables in Replit Secrets
3. Test locally with production build
4. Use Replit's deployment history if needed
5. Monitor error tracking for user impact
