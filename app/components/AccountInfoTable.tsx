'use client'

import { useState } from 'react'
import { PublicKey } from '@solana/web3.js'

interface AccountField {
  name: string
  type: string
  value: any
  description: string
}

interface AccountInfo {
  accountType: string
  publicKey: string
  fields: AccountField[]
}

interface AccountInfoTableProps {
  accounts: AccountInfo[]
  title: string
}

export function AccountInfoTable({ accounts, title }: AccountInfoTableProps) {
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set())

  const toggleAccount = (publicKey: string) => {
    const newExpanded = new Set(expandedAccounts)
    if (newExpanded.has(publicKey)) {
      newExpanded.delete(publicKey)
    } else {
      newExpanded.add(publicKey)
    }
    setExpandedAccounts(newExpanded)
  }

  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined) return 'N/A'
    
    switch (type) {
      case 'PublicKey':
        return typeof value === 'string' ? value : value.toString()
      case 'i64':
      case 'timestamp':
        return new Date(Number(value) * 1000).toLocaleString()
      case 'bool':
        return value ? 'True' : 'False'
      case 'Vec<StudentRef>':
      case 'Vec<Grade>':
        return Array.isArray(value) ? `${value.length} items` : 'Empty'
      case 'String':
        return value.toString()
      case 'u8':
      case 'u16':
      case 'u32':
      case 'f64':
        return value.toString()
      default:
        return JSON.stringify(value)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PublicKey':
        return 'bg-blue-100 text-blue-800'
      case 'String':
        return 'bg-green-100 text-green-800'
      case 'bool':
        return 'bg-purple-100 text-purple-800'
      case 'i64':
      case 'timestamp':
        return 'bg-orange-100 text-orange-800'
      case 'u8':
      case 'u16':
      case 'u32':
      case 'f64':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      {accounts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No accounts found
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Account Header */}
              <div 
                className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleAccount(account.publicKey)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {account.accountType}
                    </span>
                    <span className="font-mono text-sm text-gray-600">
                      {account.publicKey.slice(0, 8)}...{account.publicKey.slice(-8)}
                    </span>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedAccounts.has(account.publicKey) ? 'rotate-180' : ''
                    }`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Account Fields */}
              {expandedAccounts.has(account.publicKey) && (
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Field Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Value
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {account.fields.map((field, fieldIndex) => (
                          <tr key={fieldIndex} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {field.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(field.type)}`}>
                                {field.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                              <span className="font-mono">
                                {formatValue(field.value, field.type)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {field.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

// Helper component for displaying program state variables
interface ProgramVariable {
  name: string
  type: string
  value: any
  scope: 'Global' | 'Local' | 'Account'
  description: string
}

interface ProgramVariablesTableProps {
  variables: ProgramVariable[]
  title: string
}

export function ProgramVariablesTable({ variables, title }: ProgramVariablesTableProps) {
  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'Global':
        return 'bg-red-100 text-red-800'
      case 'Local':
        return 'bg-blue-100 text-blue-800'
      case 'Account':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PublicKey':
        return 'bg-blue-100 text-blue-800'
      case 'String':
        return 'bg-green-100 text-green-800'
      case 'bool':
        return 'bg-purple-100 text-purple-800'
      case 'number':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      {variables.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No variables found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variable Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scope
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {variables.map((variable, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {variable.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(variable.type)}`}>
                      {variable.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScopeColor(variable.scope)}`}>
                      {variable.scope}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    <span className="font-mono">
                      {variable.value?.toString() || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {variable.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
