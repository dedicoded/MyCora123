
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useIsClient } from './useIsClient'

interface IndexedDBConfig {
  dbName: string
  version: number
  stores: {
    name: string
    keyPath: string
    indexes?: { name: string; keyPath: string; unique?: boolean }[]
  }[]
}

const defaultConfig: IndexedDBConfig = {
  dbName: 'MyCoraDB',
  version: 1,
  stores: [
    {
      name: 'wallets',
      keyPath: 'id',
      indexes: [
        { name: 'address', keyPath: 'address', unique: true },
        { name: 'type', keyPath: 'type', unique: false }
      ]
    },
    {
      name: 'transactions',
      keyPath: 'hash',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp', unique: false },
        { name: 'status', keyPath: 'status', unique: false }
      ]
    },
    {
      name: 'compliance',
      keyPath: 'userId',
      indexes: [
        { name: 'kycStatus', keyPath: 'kycStatus', unique: false },
        { name: 'lastUpdated', keyPath: 'lastUpdated', unique: false }
      ]
    }
  ]
}

export function useIndexedDB(config: IndexedDBConfig = defaultConfig) {
  const isClient = useIsClient()
  const [db, setDb] = useState<IDBDatabase | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isClient) return

    const request = indexedDB.open(config.dbName, config.version)

    request.onerror = () => {
      const errorMsg = `IndexedDB error: ${request.error?.message || 'Unknown error'}`
      console.error(errorMsg)
      setError(errorMsg)
    }

    request.onsuccess = () => {
      const database = request.result
      console.log('IndexedDB connected:', database.name)
      setDb(database)
      setIsReady(true)
      setError(null)
    }

    request.onupgradeneeded = () => {
      const database = request.result
      
      config.stores.forEach(store => {
        if (!database.objectStoreNames.contains(store.name)) {
          const objectStore = database.createObjectStore(store.name, { keyPath: store.keyPath })
          
          // Create indexes if specified
          store.indexes?.forEach(index => {
            objectStore.createIndex(index.name, index.keyPath, { unique: index.unique || false })
          })
        }
      })
    }

    return () => {
      if (db) {
        db.close()
      }
    }
  }, [isClient, config.dbName, config.version])

  const addData = useCallback(async (storeName: string, data: any) => {
    if (!db || !isReady) throw new Error('Database not ready')
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.add(data)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }, [db, isReady])

  const getData = useCallback(async (storeName: string, key: any) => {
    if (!db || !isReady) throw new Error('Database not ready')
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }, [db, isReady])

  const updateData = useCallback(async (storeName: string, data: any) => {
    if (!db || !isReady) throw new Error('Database not ready')
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(data)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }, [db, isReady])

  const deleteData = useCallback(async (storeName: string, key: any) => {
    if (!db || !isReady) throw new Error('Database not ready')
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }, [db, isReady])

  const getAllData = useCallback(async (storeName: string) => {
    if (!db || !isReady) throw new Error('Database not ready')
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }, [db, isReady])

  const clearStore = useCallback(async (storeName: string) => {
    if (!db || !isReady) throw new Error('Database not ready')
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }, [db, isReady])

  return {
    db,
    isReady,
    error,
    addData,
    getData,
    updateData,
    deleteData,
    getAllData,
    clearStore
  }
}

// Convenience hooks for specific stores
export function useWalletDB() {
  const { addData, getData, updateData, deleteData, getAllData, isReady, error } = useIndexedDB()
  
  return {
    isReady,
    error,
    addWallet: (wallet: any) => addData('wallets', wallet),
    getWallet: (id: string) => getData('wallets', id),
    updateWallet: (wallet: any) => updateData('wallets', wallet),
    deleteWallet: (id: string) => deleteData('wallets', id),
    getAllWallets: () => getAllData('wallets')
  }
}

export function useTransactionDB() {
  const { addData, getData, updateData, deleteData, getAllData, isReady, error } = useIndexedDB()
  
  return {
    isReady,
    error,
    addTransaction: (transaction: any) => addData('transactions', transaction),
    getTransaction: (hash: string) => getData('transactions', hash),
    updateTransaction: (transaction: any) => updateData('transactions', transaction),
    deleteTransaction: (hash: string) => deleteData('transactions', hash),
    getAllTransactions: () => getAllData('transactions')
  }
}

export function useComplianceDB() {
  const { addData, getData, updateData, deleteData, getAllData, isReady, error } = useIndexedDB()
  
  return {
    isReady,
    error,
    addComplianceRecord: (record: any) => addData('compliance', record),
    getComplianceRecord: (userId: string) => getData('compliance', userId),
    updateComplianceRecord: (record: any) => updateData('compliance', record),
    deleteComplianceRecord: (userId: string) => deleteData('compliance', userId),
    getAllComplianceRecords: () => getAllData('compliance')
  }
}

export default useIndexedDB
