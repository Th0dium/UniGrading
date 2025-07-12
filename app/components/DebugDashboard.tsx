'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUniGrading } from '../hooks/useUniGrading'
import { AccountInfoTable, ProgramVariablesTable } from './AccountInfoTable'
import { TransactionHistory, mockTransactions } from './TransactionHistory'
import { ProgramStateMonitor } from './ProgramStateMonitor'
import { UsersList } from './UsersList'

export function DebugDashboard() {
  const { publicKey, connected } = useWallet()
  const { currentUser, loading } = useUniGrading()
  const [activeTab, setActiveTab] = useState<'accounts' | 'variables' | 'program' | 'transactions' | 'users'>('accounts')

  // Mock account data - in real app, this would come from blockchain
  const mockAccounts = [
    {
      accountType: 'User',
      publicKey: publicKey?.toString() || '11111111111111111111111111111111',
      fields: [
        {
          name: 'authority',
          type: 'PublicKey',
          value: publicKey?.toString() || '11111111111111111111111111111111',
          description: 'The wallet address that owns this user account'
        },
        {
          name: 'username',
          type: 'String',
          value: currentUser?.username || 'Not set',
          description: 'Display name for the user'
        },
        {
          name: 'role',
          type: 'UserRole',
          value: currentUser?.role || 'Student',
          description: 'User role: Teacher or Student'
        },
        {
          name: 'created_at',
          type: 'i64',
          value: currentUser?.createdAt || Date.now() / 1000,
          description: 'Unix timestamp when account was created'
        },
        {
          name: 'is_active',
          type: 'bool',
          value: currentUser?.isActive ?? true,
          description: 'Whether the user account is active'
        }
      ]
    },
    {
      accountType: 'Classroom',
      publicKey: 'ClassroomAccount1111111111111111111111',
      fields: [
        {
          name: 'name',
          type: 'String',
          value: 'Math 101',
          description: 'Name of the classroom'
        },
        {
          name: 'course',
          type: 'String',
          value: 'Mathematics',
          description: 'Course subject'
        },
        {
          name: 'teacher',
          type: 'PublicKey',
          value: 'TeacherPublicKey111111111111111111111',
          description: 'Public key of the teacher who owns this classroom'
        },
        {
          name: 'students',
          type: 'Vec<StudentRef>',
          value: [],
          description: 'List of students enrolled in this classroom'
        }
      ]
    },
    {
      accountType: 'Student',
      publicKey: 'StudentAccount111111111111111111111111',
      fields: [
        {
          name: 'id',
          type: 'String',
          value: 'STU001',
          description: 'Student ID number'
        },
        {
          name: 'name',
          type: 'String',
          value: 'No students enrolled',
          description: 'Student full name'
        },
        {
          name: 'classroom',
          type: 'PublicKey',
          value: 'ClassroomAccount1111111111111111111111',
          description: 'Reference to the classroom this student belongs to'
        },
        {
          name: 'grades',
          type: 'Vec<Grade>',
          value: [
            {
              assignment_name: 'Midterm Exam',
              grade: 85,
              max_grade: 100,
              timestamp: Date.now() / 1000,
              graded_by: 'TeacherPublicKey111111111111111111111'
            }
          ],
          description: 'List of grades for this student'
        }
      ]
    }
  ]

  // Mock program variables
  const mockVariables = [
    {
      name: 'PROGRAM_ID',
      type: 'PublicKey',
      value: 'AUb7ZQUCsWSVu4ok5CfGeDbgyQTGcgn9WSsC4PwN7MBj',
      scope: 'Global' as const,
      description: 'The program ID for the UniGrading Solana program'
    },
    {
      name: 'connected',
      type: 'bool',
      value: connected,
      scope: 'Local' as const,
      description: 'Whether wallet is currently connected'
    },
    {
      name: 'publicKey',
      type: 'PublicKey',
      value: publicKey?.toString() || null,
      scope: 'Local' as const,
      description: 'Current wallet public key'
    },
    {
      name: 'currentUser',
      type: 'User',
      value: currentUser ? 'Loaded' : 'Not loaded',
      scope: 'Local' as const,
      description: 'Current user account data from blockchain'
    },
    {
      name: 'loading',
      type: 'bool',
      value: loading,
      scope: 'Local' as const,
      description: 'Whether any blockchain operation is in progress'
    },
    {
      name: 'app_version',
      type: 'string',
      value: 'v1.1',
      scope: 'Global' as const,
      description: 'UniGrading application version'
    }
  ]

  // Program instruction data
  const programInstructions = [
    {
      name: 'register_user',
      accounts: ['user', 'authority', 'system_program', 'clock'],
      parameters: ['username: String', 'role: UserRole'],
      description: 'Creates a new user account on-chain'
    },
    {
      name: 'initialize_classroom',
      accounts: ['classroom', 'authority', 'teacher_user?', 'system_program'],
      parameters: ['classroom_name: String', 'course: String'],
      description: 'Creates a new classroom account'
    },
    {
      name: 'add_student',
      accounts: ['classroom', 'student', 'authority', 'system_program'],
      parameters: ['student_name: String', 'student_id: String'],
      description: 'Adds a student to a classroom'
    },
    {
      name: 'assign_grade',
      accounts: ['student', 'teacher', 'teacher_user?', 'clock'],
      parameters: ['assignment_name: String', 'grade: u8', 'max_grade: u8'],
      description: 'Assigns a grade to a student'
    }
  ]

  const tabs = [
    { id: 'accounts', label: 'Account Data', icon: 'ACC' },
    { id: 'variables', label: 'Program Variables', icon: 'VAR' },
    { id: 'program', label: 'Program Info', icon: 'PRG' },
    { id: 'transactions', label: 'Transaction History', icon: 'TXN' },
    { id: 'users', label: 'Users & Classes', icon: 'USR' }
  ]

  return (
    <div className="space-y-6">
      {/* Program State Monitor */}
      <ProgramStateMonitor />

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'accounts' | 'variables' | 'program' | 'transactions' | 'users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2 text-xs font-mono bg-gray-200 px-1 rounded">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'accounts' && (
            <div className="space-y-6">
              <AccountInfoTable 
                accounts={mockAccounts} 
                title="Blockchain Account Data"
              />
              
              {/* Connection Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Connection Status</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">Wallet Connected:</span>
                    <span className={`ml-2 font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
                      {connected ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-600">User Registered:</span>
                    <span className={`ml-2 font-medium ${currentUser ? 'text-green-600' : 'text-red-600'}`}>
                      {currentUser ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'variables' && (
            <ProgramVariablesTable 
              variables={mockVariables} 
              title="Runtime Variables"
            />
          )}

          {activeTab === 'program' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Instructions</h3>
                <div className="space-y-4">
                  {programInstructions.map((instruction, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{instruction.name}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Accounts:</span>
                          <ul className="mt-1 space-y-1">
                            {instruction.accounts.map((account, i) => (
                              <li key={i} className="text-gray-600 font-mono text-xs">
                                {account}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Parameters:</span>
                          <ul className="mt-1 space-y-1">
                            {instruction.parameters.map((param, i) => (
                              <li key={i} className="text-gray-600 font-mono text-xs">
                                {param}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Description:</span>
                          <p className="mt-1 text-gray-600 text-xs">
                            {instruction.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <TransactionHistory transactions={mockTransactions} />
          )}

          {activeTab === 'users' && (
            <UsersList />
          )}
        </div>
      </div>
    </div>
  )
}
