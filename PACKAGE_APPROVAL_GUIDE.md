# Package Approval Guide for MyCora Deployment

## Issue: secp256k1 Post-Install Scripts

When deploying MyCora, you may encounter build failures due to packages like `secp256k1` requiring post-install scripts that need explicit approval.

## Resolution Steps

### 1. Run Approval Command Locally
In your project root directory:
\`\`\`bash
pnpm approve-builds
\`\`\`
This will prompt you to approve packages like `secp256k1` that require post-install scripts.

### 2. Commit the Updated pnpm-lock.yaml
After approval, `pnpm-lock.yaml` will be updated with the approved packages. Commit and push this change:
\`\`\`bash
git add pnpm-lock.yaml
git commit -m "Approved secp256k1 build scripts"
git push
\`\`\`

### 3. Redeploy on Vercel
Trigger a new deployment from your Vercel dashboard or push to your main branch.

## Why This Happens

- `secp256k1` is a cryptographic library used for blockchain operations
- It requires native compilation during installation
- Vercel's security model requires explicit approval for post-install scripts
- This is a one-time setup per project

## Prevention

Add this to your `package.json` to pre-approve common blockchain packages:
\`\`\`json
{
  "pnpm": {
    "onlyBuiltDependencies": ["secp256k1", "keccak", "scrypt"]
  }
}
\`\`\`

## Troubleshooting

If the issue persists:
1. Clear node_modules: `rm -rf node_modules`
2. Clear pnpm cache: `pnpm store prune`
3. Reinstall: `pnpm install`
4. Re-run approval: `pnpm approve-builds`
