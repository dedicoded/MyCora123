
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for your MyCora data
export interface UserProfile {
  id: string
  auth_user_id: string
  wallet_address?: string
  email?: string
  display_name?: string
  avatar_url?: string
  auth_method: 'email' | 'wallet' | 'oauth' | 'magic_link'
  kyc_status: 'pending' | 'verified' | 'rejected'
  compliance_score: number
  is_active: boolean
  last_seen: string
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface TransactionLog {
  id: string
  user_id: string
  transaction_hash: string
  transaction_type: 'mint' | 'stake' | 'payment' | 'gasless'
  amount: string
  status: 'pending' | 'confirmed' | 'failed'
  created_at: string
}

export interface ContractMetadata {
  id: string
  contract_address: string
  contract_name: string
  contract_symbol?: string
  contract_type: 'ERC20' | 'ERC721' | 'ERC1155' | 'custom'
  network: string
  chain_id: number
  deployment_block: number
  deployer_address: string
  abi_hash: string
  metadata_uri?: string
  description?: string
  image_url?: string
  external_url?: string
  traits: any[]
  is_verified: boolean
  total_supply?: string
  owner_address?: string
  created_at: string
  updated_at: string
}

export interface GaslessTransactionLog {
  id: string
  user_id: string
  transaction_hash?: string
  contract_address: string
  function_name: string
  function_params: Record<string, any>
  gas_used?: string
  gas_price?: string
  network: string
  chain_id: number
  status: 'pending' | 'success' | 'failed' | 'dropped'
  error_message?: string
  block_number?: number
  block_timestamp?: string
  sponsor_address?: string
  user_op_hash?: string
  bundler_used?: string
  paymaster_used?: string
  created_at: string
}

export interface UserSession {
  id: string
  user_id: string
  session_token: string
  device_info: Record<string, any>
  ip_address?: string
  user_agent?: string
  is_active: boolean
  expires_at: string
  last_activity: string
  created_at: string
}

// User authentication helpers
export const auth = {
  // Email/Password Authentication
  async signUpWithEmail(email: string, password: string, metadata?: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  },

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Magic Link Authentication
  async signInWithMagicLink(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  },

  // OAuth Authentication
  async signInWithOAuth(provider: 'google' | 'github' | 'discord') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  },

  // Wallet Authentication (for Web3 users)
  async signUpWithWallet(walletAddress: string, signature?: string) {
    const { data, error } = await supabase.auth.signUp({
      email: `${walletAddress}@mycora.app`,
      password: signature || walletAddress, // Use wallet signature in production
      options: {
        data: {
          wallet_address: walletAddress,
          auth_method: 'wallet'
        }
      }
    })
    return { data, error }
  },

  async signInWithWallet(walletAddress: string, signature?: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${walletAddress}@mycora.app`, 
      password: signature || walletAddress,
    })
    return { data, error }
  },

  // Password Reset
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    return { data, error }
  },

  // Update Password
  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password
    })
    return { data, error }
  },

  // Session Management
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  async getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helpers
export const db = {
  // User profiles
  async createUserProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single()
    return { data, error }
  },

  async getUserProfile(identifier: string, type: 'wallet' | 'email' | 'id' = 'wallet') {
    const column = type === 'wallet' ? 'wallet_address' : type === 'email' ? 'email' : 'id'
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq(column, identifier)
      .single()
    return { data, error }
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Transaction logs
  async logTransaction(transaction: Omit<TransactionLog, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('transaction_logs')
      .insert(transaction)
      .select()
      .single()
    return { data, error }
  },

  async getTransactionHistory(userId: string) {
    const { data, error } = await supabase
      .from('transaction_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Contract metadata
  async storeContractMetadata(metadata: Omit<ContractMetadata, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('contract_metadata')
      .insert(metadata)
      .select()
      .single()
    return { data, error }
  },

  async getContractByAddress(address: string) {
    const { data, error } = await supabase
      .from('contract_metadata')
      .select('*')
      .eq('contract_address', address)
      .single()
    return { data, error }
  },

  async getContractsByNetwork(network: string, chainId?: number) {
    let query = supabase
      .from('contract_metadata')
      .select('*')
      .eq('network', network)
    
    if (chainId) query = query.eq('chain_id', chainId)
    
    const { data, error } = await query
    return { data, error }
  },

  // Gasless transaction logs
  async logGaslessTransaction(transaction: Omit<GaslessTransactionLog, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('gasless_transaction_logs')
      .insert(transaction)
      .select()
      .single()
    return { data, error }
  },

  async updateGaslessTransaction(txHash: string, updates: Partial<GaslessTransactionLog>) {
    const { data, error } = await supabase
      .from('gasless_transaction_logs')
      .update(updates)
      .eq('transaction_hash', txHash)
      .select()
      .single()
    return { data, error }
  },

  async getGaslessTransactionHistory(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('gasless_transaction_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  // Session management
  async createSession(session: Omit<UserSession, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('user_sessions')
      .insert(session)
      .select()
      .single()
    return { data, error }
  },

  async getActiveSessions(userId: string) {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
    return { data, error }
  }
}
