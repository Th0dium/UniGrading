'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

interface ProgramWalletData {
  programId: string
  balance: number
  transactionCount: number
  lastActivity: number
  deployedAt: number
  version: string
  authority: string
}

interface ProgramTransaction {
  signature: string
  type: 'deploy' | 'upgrade' | 'instruction' | 'transfer'
  timestamp: number
  amount?: number
  from?: string
  to?: string
  instruction?: string
  status: 'success' | 'failed'
}

export function ProgramWalletInfo() {
  const { connected } = useWallet()
  const [programData, setProgramData] = useState<ProgramWalletData>({
    programId: 'AUb7ZQUCsWSVu4ok5CfGeDbgyQTGcgn9WSsC4PwN7MBj',
    balance: 2.45678901, // SOL
    transactionCount: 1247,
    lastActivity: Date.now() - 3600000, // 1 hour ago
    deployedAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    version: '1.0.0',
    authority: '8CvwxZ9Db6XbLD46NZwwmVDZZMPzMZfBuMcifkVSWkAp'
  })

  const [programTransactions] = useState<ProgramTransaction[]>([
    {
      signature: 'tx_program_deploy_1234567890abcdef',
      type: 'deploy',
      timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000,
      status: 'success',
      instruction: 'Program deployment'
    },
    {
      signature: 'tx_program_upgrade_2345678901bcdefg',
      type: 'upgrade',
      timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000,
      status: 'success',
      instruction: 'Program upgrade to v1.0.0'
    },
    {
      signature: 'tx_program_instruction_3456789012cdefgh',
      type: 'instruction',
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
      status: 'success',
      instruction: 'register_user'
    },
    {
      signature: 'tx_program_instruction_4567890123defghi',
      type: 'instruction',
      timestamp: Date.now() - 1 * 60 * 60 * 1000,
      status: 'success',
      instruction: 'create_classroom'
    },
    {
      signature: 'tx_program_instruction_5678901234efghij',
      type: 'instruction',
      timestamp: Date.now() - 30 * 60 * 1000,
      status: 'success',
      instruction: 'assign_grade'
    }
  ])

  const formatSOL = (amount: number) => {
    return `${amount.toFixed(6)} SOL`
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deploy': return '🚀'
      case 'upgrade': return '⬆️'
      case 'instruction': return '⚙️'
      case 'transfer': return '💸'
      default: return '📝'
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deploy': return 'bg-blue-100 text-blue-800'
      case 'upgrade': return 'bg-green-100 text-green-800'
      case 'instruction': return 'bg-purple-100 text-purple-800'
      case 'transfer': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Program Wallet Overview */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🏛️ Program Wallet</h2>
            <p className="text-indigo-100">UniGrading Solana Program</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{formatSOL(programData.balance)}</div>
            <div className="text-indigo-200 text-sm">Current Balance</div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-indigo-200 text-sm">Program ID</div>
            <div className="font-mono text-sm truncate">{programData.programId}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-indigo-200 text-sm">Total Transactions</div>
            <div className="text-xl font-bold">{programData.transactionCount.toLocaleString()}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-indigo-200 text-sm">Last Activity</div>
            <div className="text-sm">{new Date(programData.lastActivity).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Program Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Program Information */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Program ID:</span>
              <span className="font-mono text-sm text-gray-900">{programData.programId.slice(0, 8)}...{programData.programId.slice(-8)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Version:</span>
              <span className="font-semibold text-gray-900">{programData.version}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Deployed:</span>
              <span className="text-gray-900">{new Date(programData.deployedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Authority:</span>
              <span className="font-mono text-sm text-gray-900">{programData.authority.slice(0, 8)}...{programData.authority.slice(-8)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Network:</span>
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">Devnet</span>
            </div>
          </div>
        </div>

        {/* Balance & Activity */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Balance & Activity</h3>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-green-600 text-sm font-medium">Current Balance</div>
                  <div className="text-2xl font-bold text-green-900">{formatSOL(programData.balance)}</div>
                </div>
                <div className="text-green-600 text-3xl">💰</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-blue-600 text-sm font-medium">Total TXs</div>
                <div className="text-xl font-bold text-blue-900">{programData.transactionCount.toLocaleString()}</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="text-purple-600 text-sm font-medium">Uptime</div>
                <div className="text-xl font-bold text-purple-900">
                  {Math.floor((Date.now() - programData.deployedAt) / (24 * 60 * 60 * 1000))}d
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Program Transactions */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Program Transactions</h3>
          <div className="text-sm text-gray-500">{programTransactions.length} recent</div>
        </div>
        
        <div className="space-y-3">
          {programTransactions.map((tx, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getTransactionIcon(tx.type)}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 text-sm">{tx.instruction || tx.type}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTransactionColor(tx.type)}`}>
                        {tx.type}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(tx.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs text-gray-600">
                    {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    {tx.status === 'success' ? '✅ Success' : '❌ Failed'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Program Transactions →
          </button>
        </div>
      </div>
    </div>
  )
}
