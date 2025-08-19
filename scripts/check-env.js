
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
const missingVars = [];

console.log('📋 Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const isPlaceholder = value && (value.includes('your_') || value.includes('0x0000000000000000000000000000000000000000'));
  
  if (!value || isPlaceholder) {
    console.log(`❌ ${varName}: ${!value ? 'Missing' : 'Placeholder value detected'}`);
    missingVars.push(varName);
    hasIssues = true;
  } else {
    console.log(`✅ ${varName}: Set (${value.substring(0, 10)}...)`);
  }
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
  console.log('\n🔧 To fix in Replit:');
  console.log('1. Click the lock icon (Secrets) in the left toolbar');
  console.log('2. Add each missing variable:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('3. Restart dev server: run "Clean Dev Server" workflow');
  console.log('\n💡 After adding secrets, this [v0] Missing critical environment variables log will disappear');
} else {
  console.log('✅ All required environment variables are set');
  console.log('✅ Runtime checks should pass now');
}

console.log('\n🔗 For WalletConnect Project ID:');
console.log('   Visit: https://cloud.reown.com/');
console.log('   Create a project and copy the Project ID');
