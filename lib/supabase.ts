
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for your MyCora data
export interface UserProfile {
  id: string
  wallet_address: string
  kyc_status: 'pending' | 'verified' | 'rejected'
  compliance_score: number
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
  contract_type: string
  network: string
  deployment_block: number
  abi_hash: string
  created_at: string
}

// User authentication helpers
export const auth = {
  async signUpWithWallet(walletAddress: string) {
    const { data, error } = await supabase.auth.signUp({
      email: `${walletAddress}@mycora.app`,
      password: walletAddress, // Use wallet signature in production
    })
    return { data, error }
  },

  async signInWithWallet(walletAddress: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${walletAddress}@mycora.app`, 
      password: walletAddress,
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
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

  async getUserProfile(walletAddress: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
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
  async storeContractMetadata(metadata: Omit<ContractMetadata, 'id' | 'created_at'>) {
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
  }
}
