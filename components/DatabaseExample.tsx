
'use client'

import { useEffect, useState } from 'react'
import { useWalletDB, useTransactionDB } from '@/lib/hooks/useIndexedDB'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function DatabaseExample() {
  const { isReady: walletReady, addWallet, getAllWallets } = useWalletDB()
  const { isReady: txReady, addTransaction, getAllTransactions } = useTransactionDB()
  const [wallets, setWallets] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])

  const handleAddWallet = async () => {
    if (!walletReady) return
    
    try {
      await addWallet({
        id: `wallet_${Date.now()}`,
        address: `0x${Math.random().toString(16).slice(2)}`,
        type: 'metamask',
        createdAt: new Date().toISOString()
      })
      loadWallets()
    } catch (error) {
      console.error('Failed to add wallet:', error)
    }
  }

  const handleAddTransaction = async () => {
    if (!txReady) return
    
    try {
      await addTransaction({
        hash: `0x${Math.random().toString(16).slice(2)}`,
        amount: Math.random() * 1000,
        status: 'pending',
        timestamp: Date.now()
      })
      loadTransactions()
    } catch (error) {
      console.error('Failed to add transaction:', error)
    }
  }

  const loadWallets = async () => {
    if (!walletReady) return
    try {
      const data = await getAllWallets()
      setWallets(data as any[])
    } catch (error) {
      console.error('Failed to load wallets:', error)
    }
  }

  const loadTransactions = async () => {
    if (!txReady) return
    try {
      const data = await getAllTransactions()
      setTransactions(data as any[])
    } catch (error) {
      console.error('Failed to load transactions:', error)
    }
  }

  useEffect(() => {
    if (walletReady) loadWallets()
  }, [walletReady])

  useEffect(() => {
    if (txReady) loadTransactions()
  }, [txReady])

  if (!walletReady || !txReady) {
    return <div>Initializing database...</div>
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Wallet Database</h3>
        <Button onClick={handleAddWallet} className="mb-4">
          Add Sample Wallet
        </Button>
        <div className="space-y-2">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="p-2 border rounded">
              <div>ID: {wallet.id}</div>
              <div>Address: {wallet.address}</div>
              <div>Type: {wallet.type}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Transaction Database</h3>
        <Button onClick={handleAddTransaction} className="mb-4">
          Add Sample Transaction
        </Button>
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div key={tx.hash} className="p-2 border rounded">
              <div>Hash: {tx.hash}</div>
              <div>Amount: {tx.amount}</div>
              <div>Status: {tx.status}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
