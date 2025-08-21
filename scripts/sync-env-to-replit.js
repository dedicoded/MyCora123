
#!/usr/bin/env node

/**
 * 🔄 Replit Environment Variable Sync Script
 * 
 * This script helps you sync environment variables to Replit Secrets.
 * Unlike Vercel's CLI, Replit Secrets are managed through the UI.
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Replit Environment Variable Sync Helper\n');

// Read environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('❌ No .env.local file found');
  console.log('💡 Create one with your environment variables first\n');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n').filter(line => 
  line.trim() && !line.startsWith('#') && line.includes('=')
);

console.log('📋 Environment Variables to Add to Replit Secrets:\n');
console.log('1. Click the lock icon (🔒) in your Replit sidebar');
console.log('2. Add each of these variables:\n');

envLines.forEach(line => {
  const [key, value] = line.split('=');
  const maskedValue = value.length > 10 ? 
    value.substring(0, 8) + '...' : 
    '***';
  
  console.log(`   Key: ${key.trim()}`);
  console.log(`   Value: ${maskedValue}`);
  console.log('   ──────────────────────');
});

console.log('\n✅ After adding all secrets:');
console.log('   1. Restart your development server');
console.log('   2. Run: npm run validate:env');
console.log('   3. Deploy your project\n');

console.log('🔗 Replit Secrets are automatically available in:');
console.log('   • Development environment');
console.log('   • Production deployments');
console.log('   • All project collaborators\n');

// Check if all required variables are present
const requiredVars = [
  'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
  'NEXT_PUBLIC_MCC_CONTRACT_ADDRESS', 
  'NEXT_PUBLIC_NETWORK'
];

const missingRequired = requiredVars.filter(varName => 
  !envLines.some(line => line.startsWith(varName + '='))
);

if (missingRequired.length > 0) {
  console.log('⚠️  Missing Required Variables:');
  missingRequired.forEach(varName => {
    console.log(`   • ${varName}`);
  });
  console.log('\n');
}

console.log('📚 For more help: https://docs.replit.com/programming-ide/workspace-features/secrets');
