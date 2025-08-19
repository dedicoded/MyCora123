
console.log('🔍 Environment Check for MyCora\n');

const required = [
  'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
  'NEXT_PUBLIC_MCC_CONTRACT_ADDRESS',
  'NEXT_PUBLIC_NETWORK'
];

const optional = [
  'CYBRID_API_KEY',
  'BICONOMY_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY'
];

const missing = required.filter((key) => !process.env[key]);
const placeholders = required.filter((key) => {
  const value = process.env[key];
  return value && (value.includes('your_') || value.includes('0x0000000000000000000000000000000000000000'));
});

console.log('📋 Required Variables:');
required.forEach(varName => {
  const value = process.env[varName];
  const isPlaceholder = value && (value.includes('your_') || value.includes('0x0000000000000000000000000000000000000000'));
  
  if (!value || isPlaceholder) {
    console.log(`❌ ${varName}: ${!value ? 'Missing' : 'Placeholder value detected'}`);
  } else {
    console.log(`✅ ${varName}: Set (${value.substring(0, 10)}...)`);
  }
});

console.log('\n📋 Optional Variables:');
optional.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '⚠️';
  console.log(`${status} ${varName}: ${value ? 'Set' : 'Not set'}`);
});

console.log('\n🎯 Summary:');
if (missing.length || placeholders.length) {
  console.error(`\n❌ Missing critical env vars: ${[...missing, ...placeholders].join(', ')}\n`);
  console.info(`🔧 Fix in Replit:`);
  console.info(`1. Click the lock icon (Secrets) in the left toolbar`);
  console.info(`2. Add each missing variable as a new secret`);
  console.info(`3. Restart dev server using "Clean Dev Server" workflow`);
  console.info(`\n💡 After adding secrets, the [v0] Missing critical environment variables logs will disappear`);
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set');
  console.log('✅ Runtime checks should pass now');
}

console.log('\n🔗 For WalletConnect Project ID:');
console.log('   Visit: https://cloud.reown.com/');
console.log('   Create a project and copy the Project ID');
