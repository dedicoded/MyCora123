console.log('🔍 MyCora Environment Validation\n');

// Configuration-driven approach
const envConfig = {
  required: [
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
    'NEXT_PUBLIC_MCC_CONTRACT_ADDRESS',
    'NEXT_PUBLIC_NETWORK'
  ],
  optional: [
    'CYBRID_API_KEY',
    'BICONOMY_API_KEY',
    'BICONOMY_PROJECT_ID',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ],
  deployment: [
    'DEPLOYER_PRIVATE_KEY',
    'ETHERSCAN_API_KEY',
    'POLYGONSCAN_API_KEY'
  ]
};

function validateEnvVar(varName, isRequired = true) {
  const value = process.env[varName];
  const isPlaceholder = value && (
    value.includes('your_') ||
    value.includes('0x0000000000000000000000000000000000000000') ||
    value.includes('placeholder') ||
    value === 'changeme'
  );

  if (!value) {
    return { status: 'missing', message: 'Missing' };
  } else if (isPlaceholder) {
    return { status: 'placeholder', message: 'Placeholder detected' };
  } else if (varName.includes('CONTRACT_ADDRESS') && !value.match(/^0x[a-fA-F0-9]{40}$/)) {
    return { status: 'invalid', message: 'Invalid contract address format' };
  } else if (varName.includes('PROJECT_ID') && value.length < 10) {
    return { status: 'invalid', message: 'Project ID too short' };
  } else {
    return { status: 'valid', message: `Set (${value.substring(0, 10)}...)` };
  }
}

function checkEnvironmentGroup(groupName, variables, isRequired = true) {
  console.log(`📋 ${groupName} Variables:`);
  const issues = [];

  variables.forEach(varName => {
    const result = validateEnvVar(varName, isRequired);
    const icons = {
      valid: '✅',
      missing: '❌',
      placeholder: '⚠️',
      invalid: '❌'
    };

    console.log(`${icons[result.status]} ${varName}: ${result.message}`);

    if (isRequired && result.status !== 'valid') {
      issues.push(varName);
    }
  });

  return issues;
}

// Perform validation
const requiredIssues = checkEnvironmentGroup('Required', envConfig.required, true);
const optionalIssues = checkEnvironmentGroup('Optional', envConfig.optional, false);
const deploymentIssues = checkEnvironmentGroup('Deployment', envConfig.deployment, false);

console.log('\n🎯 Summary:');

if (requiredIssues.length > 0) {
  console.error(`\n❌ Critical issues found: ${requiredIssues.join(', ')}\n`);
  console.info(`🔧 Fix in Replit:`);
  console.info(`1. Click the lock icon (Secrets) in the left sidebar`);
  console.info(`2. Add each missing variable as a new secret`);
  console.info(`3. Restart using "Clean Dev Server" workflow`);
  console.info(`\n💡 Missing env vars will cause runtime errors`);

  // Specific guidance
  console.info(`\n🔗 Quick fixes:`);
  if (requiredIssues.includes('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID')) {
    console.info(`   - Get WalletConnect ID: https://cloud.reown.com/`);
  }
  if (requiredIssues.includes('NEXT_PUBLIC_MCC_CONTRACT_ADDRESS')) {
    console.info(`   - Deploy contracts first: pnpm run deploy:sepolia`);
  }

  process.exit(1);
} else {
  console.log('✅ All required environment variables are properly configured');
  console.log('✅ Application should start without environment errors');

  if (deploymentIssues.length > 0) {
    console.log('\n⚠️ Missing deployment variables - contract deployment may fail');
    console.log(`   Missing: ${deploymentIssues.join(', ')}`);
  }
}

console.log('\n🚀 Environment check complete\n');