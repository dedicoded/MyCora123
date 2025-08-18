# Vercel Bundle Analysis Setup

## Environment Variable Configuration

Add the following environment variable in your Vercel dashboard:

| Key | Value | Environment |
|-----|-------|-------------|
| ANALYZE | true | Preview |

**Important**: Only add this to Preview environment, not Production, to avoid bloating production builds.

## Setup Steps

1. **Go to Vercel Dashboard**
   - Navigate to your project → Settings → Environment Variables

2. **Add ANALYZE Variable**
   - Key: `ANALYZE`
   - Value: `true`
   - Environment: **Preview** (not Production)

3. **Redeploy**
   - Trigger a new build to generate the bundle analysis report
   - Push to a branch or trigger manual deployment

4. **View the Report**
   - After build, check build logs for analyzer UI link
   - Usually available at `your-preview-url/_next/static/chunks/`
   - Look for bundle analysis output in Vercel build logs

## Pro Tips

- **Keep analysis local-only**: Only enable in Preview/Dev environments
- **Monitor chunk sizes**: Watch for chunks over 50KB that need optimization
- **Use size-limit**: Run `npm run size` locally to check bundle limits
- **Regular audits**: Run `npm run perf:audit` before major releases

## Troubleshooting

- If analysis doesn't appear, check that ANALYZE=true is set in Preview environment
- Ensure @next/bundle-analyzer is installed: `npm install --save-dev @next/bundle-analyzer`
- Check build logs for any webpack compilation errors
</markdown>
