
#!/usr/bin/env node

console.log('🔍 Environment Check for MyCora\n');

const requiredVars = [
  'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
  'NEXT_PUBLIC_MCC_CONTRACT_ADDRESS', 
  'NEXT_PUBLIC_NETWORK'
];

const optionalVars = [
  'CYBRID_API_KEY',
  'BICONOMY_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY'
];

let hasIssues = false;

console.log('📋 Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  console.log(`${status} ${varName}: ${value ? 'Set' : 'Missing'}`);
  if (!value) hasIssues = true;
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '⚠️';
  console.log(`${status} ${varName}: ${value ? 'Set' : 'Not set'}`);
});

console.log('\n🎯 Summary:');
if (hasIssues) {
  console.log('❌ Missing required environment variables');
  console.log('💡 Add them to your Replit Secrets or .env.local file');
} else {
  console.log('✅ All required environment variables are set');
}

console.log('\n🔗 For WalletConnect Project ID:');
console.log('   Visit: https://cloud.walletconnect.com/');
console.log('   Create a project and copy the Project ID');
