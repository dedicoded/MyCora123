
-- Enhanced user profiles table with auth methods
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT UNIQUE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  auth_method TEXT CHECK (auth_method IN ('email', 'wallet', 'oauth', 'magic_link')) DEFAULT 'email',
  kyc_status TEXT CHECK (kyc_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  compliance_score INTEGER DEFAULT 0 CHECK (compliance_score >= 0 AND compliance_score <= 100),
  is_active BOOLEAN DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction logs table
CREATE TABLE transaction_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  transaction_hash TEXT NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN ('mint', 'stake', 'payment', 'gasless')) NOT NULL,
  amount TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'failed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced contract metadata table
CREATE TABLE contract_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_address TEXT UNIQUE NOT NULL,
  contract_name TEXT NOT NULL,
  contract_symbol TEXT,
  contract_type TEXT CHECK (contract_type IN ('ERC20', 'ERC721', 'ERC1155', 'custom')) NOT NULL,
  network TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  deployment_block INTEGER NOT NULL,
  deployer_address TEXT NOT NULL,
  abi_hash TEXT NOT NULL,
  metadata_uri TEXT,
  description TEXT,
  image_url TEXT,
  external_url TEXT,
  traits JSONB DEFAULT '[]',
  is_verified BOOLEAN DEFAULT false,
  total_supply TEXT,
  owner_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gasless transaction logs table
CREATE TABLE gasless_transaction_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  transaction_hash TEXT UNIQUE,
  contract_address TEXT NOT NULL,
  function_name TEXT NOT NULL,
  function_params JSONB DEFAULT '{}',
  gas_used TEXT,
  gas_price TEXT,
  network TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  status TEXT CHECK (status IN ('pending', 'success', 'failed', 'dropped')) DEFAULT 'pending',
  error_message TEXT,
  block_number INTEGER,
  block_timestamp TIMESTAMP WITH TIME ZONE,
  sponsor_address TEXT,
  user_op_hash TEXT,
  bundler_used TEXT,
  paymaster_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table for advanced session management
CREATE TABLE user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  device_info JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comprehensive indexes for performance
CREATE INDEX idx_user_profiles_wallet ON user_profiles(wallet_address);
CREATE INDEX idx_user_profiles_auth_user ON user_profiles(auth_user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_transaction_logs_user ON transaction_logs(user_id);
CREATE INDEX idx_transaction_logs_hash ON transaction_logs(transaction_hash);
CREATE INDEX idx_contract_metadata_address ON contract_metadata(contract_address);
CREATE INDEX idx_contract_metadata_network ON contract_metadata(network, chain_id);
CREATE INDEX idx_gasless_logs_user ON gasless_transaction_logs(user_id);
CREATE INDEX idx_gasless_logs_hash ON gasless_transaction_logs(transaction_hash);
CREATE INDEX idx_gasless_logs_status ON gasless_transaction_logs(status);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);

-- Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE gasless_transaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own transactions" ON transaction_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = transaction_logs.user_id 
      AND auth.uid()::text = user_profiles.id::text
    )
  );

CREATE POLICY "Public read access to contracts" ON contract_metadata
  FOR SELECT TO authenticated USING (true);
