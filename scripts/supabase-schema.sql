
-- User profiles table
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  kyc_status TEXT CHECK (kyc_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  compliance_score INTEGER DEFAULT 0 CHECK (compliance_score >= 0 AND compliance_score <= 100),
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

-- Contract metadata table
CREATE TABLE contract_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_address TEXT UNIQUE NOT NULL,
  contract_type TEXT NOT NULL,
  network TEXT NOT NULL,
  deployment_block INTEGER NOT NULL,
  abi_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_wallet ON user_profiles(wallet_address);
CREATE INDEX idx_transaction_logs_user ON transaction_logs(user_id);
CREATE INDEX idx_transaction_logs_hash ON transaction_logs(transaction_hash);
CREATE INDEX idx_contract_metadata_address ON contract_metadata(contract_address);

-- Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_metadata ENABLE ROW LEVEL SECURITY;

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
