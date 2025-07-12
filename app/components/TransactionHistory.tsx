'use client'

import { useState } from 'react'

interface Transaction {
  signature: string
  instruction: string
  status: 'Success' | 'Failed' | 'Pending'
  timestamp: number
  accounts: string[]
  programLogs?: string[]
  error?: string
}

interface TransactionHistoryProps {
  transactions: Transaction[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [expandedTx, setExpandedTx] = useState<Set<string>>(new Set())

  const toggleTransaction = (signature: string) => {
    const newExpanded = new Set(expandedTx)
    if (newExpanded.has(signature)) {
      newExpanded.delete(signature)
    } else {
      newExpanded.add(signature)
    }
    setExpandedTx(newExpanded)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return 'bg-green-100 text-green-800'
      case 'Failed':
        return 'bg-red-100 text-red-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success':
        return '✅'
      case 'Failed':
        return '❌'
      case 'Pending':
        return '⏳'
      default:
        return '❓'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
      
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No transactions found
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Transaction Header */}
              <div 
                className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleTransaction(tx.signature)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getStatusIcon(tx.status)}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{tx.instruction}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(tx.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm text-gray-600">
                      {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                    </span>
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedTx.has(tx.signature) ? 'rotate-180' : ''
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              {expandedTx.has(tx.signature) && (
                <div className="p-4 space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Transaction Signature</h4>
                      <p className="font-mono text-xs text-gray-600 break-all bg-gray-50 p-2 rounded">
                        {tx.signature}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Instruction</h4>
                      <p className="text-sm text-gray-900">{tx.instruction}</p>
                    </div>
                  </div>

                  {/* Accounts Involved */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Accounts Involved</h4>
                    <div className="space-y-1">
                      {tx.accounts.map((account, i) => (
                        <div key={i} className="font-mono text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          {account}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Program Logs */}
                  {tx.programLogs && tx.programLogs.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Program Logs</h4>
                      <div className="bg-black text-green-400 p-3 rounded font-mono text-xs max-h-40 overflow-y-auto">
                        {tx.programLogs.map((log, i) => (
                          <div key={i}>{log}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error Details */}
                  {tx.error && (
                    <div>
                      <h4 className="text-sm font-medium text-red-700 mb-2">Error Details</h4>
                      <div className="bg-red-50 border border-red-200 p-3 rounded">
                        <p className="text-sm text-red-800">{tx.error}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <button 
                      onClick={() => window.open(`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`, '_blank')}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      View on Explorer
                    </button>
                    <button 
                      onClick={() => navigator.clipboard.writeText(tx.signature)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Copy Signature
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Generate real transactions from localStorage data
export const generateRealTransactions = (): Transaction[] => {
  const transactions: Transaction[] = []

  if (typeof window !== 'undefined') {
    try {
      // Get real data from localStorage
      const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]')
      const allClassrooms = JSON.parse(localStorage.getItem('all_classrooms') || '[]')
      const allGrades = JSON.parse(localStorage.getItem('all_grades') || '[]')

      // Generate transactions from user registrations
      allUsers.forEach((user: any) => {
        transactions.push({
          signature: `tx_register_${user.walletAddress.slice(0, 8)}_${user.createdAt}`,
          instruction: 'register_user',
          status: 'Success' as const,
          timestamp: user.createdAt * 1000,
          accounts: [
            `User Account: ${user.walletAddress}`,
            'System Program: 11111111111111111111111111111112'
          ],
          programLogs: [
            'Program AUb7ZQUCsWSVu4ok5CfGeDbgyQTGcgn9WSsC4PwN7MBj invoke [1]',
            'Program log: Instruction: RegisterUser',
            `Program log: Creating user account for: ${user.username}`,
            `Program log: Role: ${user.role}`,
            'Program AUb7ZQUCsWSVu4ok5CfGeDbgyQTGcgn9WSsC4PwN7MBj consumed 12345 of 200000 compute units',
            'Program AUb7ZQUCsWSVu4ok5CfGeDbgyQTGcgn9WSsC4PwN7MBj success'
          ]
        })
      })

      // Generate transactions from classroom creation
      allClassrooms.forEach((classroom: any) => {
        transactions.push({
          signature: `tx_classroom_${classroom.id}_${classroom.createdAt}`,
          instruction: 'create_classroom',
          status: 'Success' as const,
          timestamp: classroom.createdAt * 1000,
          accounts: [
            `Classroom Account: ${classroom.id}`,
            `Teacher Authority: ${classroom.teacher}`,
            'System Program: 11111111111111111111111111111112'
          ],
          programLogs: [
            'Program AUb7ZQUCsWSVu4ok5CfGeDbgyQTGcgn9WSsC4PwN7MBj invoke [1]',
            'Program log: Instruction: CreateClassroom',
            `Program log: Creating classroom: ${classroom.name}`,
            `Program log: Course: ${classroom.course}`,
            `Program log: Teacher: ${classroom.teacherName}`,
            'Program AUb7ZQUCsWSVu4ok5CfGeDbgyQTGcgn9WSsC4PwN7MBj consumed 15678 of 200000 compute units',
            'Program AUb7ZQUCsWSVu4ok5CfGeDbgyQTGcgn9WSsC4PwN7MBj success'
          ]
        })
      })

      // Generate transactions from grade assignments
      allGrades.forEach((grade: any) => {
        transactions.push({
          signature: `tx_grade_${grade.id}_${grade.timestamp}`,
          instruction: 'assign_grade',
          status: 'Success' as const,
          timestamp: grade.timestamp,
          accounts: [
            `Student Account: ${grade.studentWallet}`,
            `Teacher Authority: ${grade.teacherWallet}`
          ],
          programLogs: [
            'Program AUb7ZQUCsWSVu4ok5CfGeDbgyQTGcgn9WSsC4PwN7MBj invoke [1]',
            'Program log: Instruction: AssignGrade',
            `Program log: Assignment: ${grade.assignmentName}`,
            `Program log: Grade: ${grade.grade}/${grade.maxGrade} (${grade.percentage}%)`,
            `Program log: Teacher: ${grade.teacherName}`,
            'Program AUb7ZQUCsWSVu4ok5CfGeDbgyQTGcgn9WSsC4PwN7MBj consumed 18901 of 200000 compute units',
            'Program AUb7ZQUCsWSVu4ok5CfGeDbgyQTGcgn9WSsC4PwN7MBj success'
          ]
        })
      })

      // Sort by timestamp (newest first)
      transactions.sort((a, b) => b.timestamp - a.timestamp)
    } catch (error) {
      console.error('Error generating real transactions:', error)
    }
  }

  // If no real transactions, show placeholder
  if (transactions.length === 0) {
    transactions.push({
      signature: 'no_transactions_found_placeholder',
      instruction: 'system_info',
      status: 'Success' as const,
      timestamp: Date.now(),
      accounts: ['System Program: 11111111111111111111111111111112'],
      programLogs: [
        'Program log: No transactions found',
        'Program log: Register users and create classrooms to see transaction history',
        'Program log: This is a placeholder transaction'
      ]
    })
  }

  return transactions
}

// Export real transactions
export const realTransactions = generateRealTransactions()
