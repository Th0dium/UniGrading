'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUniGrading } from '../hooks/useUniGrading'
import { AccountInfoTable, ProgramVariablesTable } from './AccountInfoTable'
import { TransactionHistory, generateRealTransactions } from './TransactionHistory'
import { ProgramStateMonitor } from './ProgramStateMonitor'
import { UsersList } from './UsersList'
import { CURRENT_VERSION } from '@/constants/version'

export function DebugDashboard() {
  const { publicKey, connected } = useWallet()
  const { currentUser, loading } = useUniGrading()
  const [activeTab, setActiveTab] = useState<'accounts' | 'variables' | 'program' | 'transactions' | 'users'>('accounts')
  const [realTimeData, setRealTimeData] = useState({
    users: [],
    classrooms: [],
    grades: []
  })

  // Load real data
  useEffect(() => {
    const loadRealData = () => {
      // Check if localStorage is available (client-side only)
      if (typeof window !== 'undefined') {
        try {
          const users = JSON.parse(localStorage.getItem('all_users') || '[]')
          const classrooms = JSON.parse(localStorage.getItem('all_classrooms') || '[]')
          const grades = JSON.parse(localStorage.getItem('all_grades') || '[]')
          setRealTimeData({ users, classrooms, grades })
        } catch (error) {
          console.error('Error loading data from localStorage:', error)
          setRealTimeData({ users: [], classrooms: [], grades: [] })
        }
      }
    }

    loadRealData()
    // Refresh every 10 seconds
    const interval = setInterval(loadRealData, 10000)
    return () => clearInterval(interval)
  }, [])

  // Generate real accounts from localStorage data
  const generateRealAccounts = () => {
    const accounts = []

    // Current User Account
    if (currentUser && publicKey) {
      accounts.push({
        accountType: 'User (Current)',
        publicKey: publicKey.toString(),
        fields: [
          {
            name: 'username',
            type: 'String',
            value: currentUser.username,
            description: 'User display name'
          },
          {
            name: 'authority',
            type: 'PublicKey',
            value: currentUser.authority.toString(),
            description: 'Wallet public key that owns this account'
          },
          {
            name: 'role',
            type: 'UserRole',
            value: currentUser.role,
            description: 'User role: Teacher or Student'
          },
          {
            name: 'created_at',
            type: 'i64',
            value: currentUser.createdAt,
            description: 'Unix timestamp when account was created'
          },
          {
            name: 'is_active',
            type: 'bool',
            value: currentUser.isActive,
            description: 'Whether the user account is active'
          }
        ]
      })
    }

    // Real Classrooms from localStorage
    const allClassrooms = realTimeData.classrooms
    if (allClassrooms.length > 0) {
      allClassrooms.slice(0, 2).forEach((classroom: any, index: number) => {
        accounts.push({
          accountType: `Classroom ${index + 1}`,
          publicKey: classroom.id,
          fields: [
            {
              name: 'name',
              type: 'String',
              value: classroom.name,
              description: 'Name of the classroom'
            },
            {
              name: 'course',
              type: 'String',
              value: classroom.course,
              description: 'Course subject'
            },
            {
              name: 'teacher',
              type: 'PublicKey',
              value: classroom.teacher,
              description: 'Public key of the teacher who owns this classroom'
            },
            {
              name: 'teacher_name',
              type: 'String',
              value: classroom.teacherName,
              description: 'Name of the teacher'
            },
            {
              name: 'students',
              type: 'Vec<StudentRef>',
              value: classroom.students || [],
              description: 'List of students enrolled in this classroom'
            },
            {
              name: 'created_at',
              type: 'i64',
              value: classroom.createdAt,
              description: 'Unix timestamp when classroom was created'
            }
          ]
        })
      })
    }

    // Real Students from localStorage
    const allStudents = realTimeData.users.filter((user: any) => user.role === 'Student')
    if (allStudents.length > 0) {
      allStudents.slice(0, 2).forEach((student: any, index: number) => {
        const studentGrades = realTimeData.grades.filter((grade: any) => grade.studentWallet === student.walletAddress)

        accounts.push({
          accountType: `Student ${index + 1}`,
          publicKey: student.walletAddress,
          fields: [
            {
              name: 'username',
              type: 'String',
              value: student.username,
              description: 'Student username'
            },
            {
              name: 'wallet_address',
              type: 'PublicKey',
              value: student.walletAddress,
              description: 'Student wallet address'
            },
            {
              name: 'role',
              type: 'String',
              value: student.role,
              description: 'User role'
            },
            {
              name: 'created_at',
              type: 'i64',
              value: student.createdAt,
              description: 'Unix timestamp when account was created'
            },
            {
              name: 'grades_count',
              type: 'u32',
              value: studentGrades.length,
              description: 'Number of grades assigned to this student'
            }
          ]
        })
      })
    }

    // If no real data, show placeholder
    if (accounts.length === 0) {
      accounts.push({
        accountType: 'No Accounts',
        publicKey: 'No real accounts found',
        fields: [
          {
            name: 'message',
            type: 'String',
            value: 'No users, classrooms, or students registered yet',
            description: 'Register users and create classrooms to see real account data'
          }
        ]
      })
    }

    return accounts
  }

  const realAccounts = generateRealAccounts()

  // Real program variables with actual data
  const realVariables = [
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
      value: currentUser ? `${currentUser.username} (${currentUser.role})` : 'Not registered',
      scope: 'Local' as const,
      description: 'Current user account data'
    },
    {
      name: 'loading',
      type: 'bool',
      value: loading,
      scope: 'Local' as const,
      description: 'Whether any operation is in progress'
    },
    {
      name: 'total_users',
      type: 'number',
      value: realTimeData.users.length,
      scope: 'Global' as const,
      description: 'Total number of registered users'
    },
    {
      name: 'total_students',
      type: 'number',
      value: realTimeData.users.filter((user: any) => user.role === 'Student').length,
      scope: 'Global' as const,
      description: 'Total number of students'
    },
    {
      name: 'total_teachers',
      type: 'number',
      value: realTimeData.users.filter((user: any) => user.role === 'Teacher').length,
      scope: 'Global' as const,
      description: 'Total number of teachers'
    },
    {
      name: 'total_classrooms',
      type: 'number',
      value: realTimeData.classrooms.length,
      scope: 'Global' as const,
      description: 'Total number of classrooms created'
    },
    {
      name: 'total_grades',
      type: 'number',
      value: realTimeData.grades.length,
      scope: 'Global' as const,
      description: 'Total number of grades recorded'
    },
    {
      name: 'app_version',
      type: 'string',
      value: CURRENT_VERSION,
      scope: 'Global' as const,
      description: 'UniGrading application version'
    },
    {
      name: 'last_updated',
      type: 'timestamp',
      value: new Date().toISOString(),
      scope: 'Local' as const,
      description: 'Last time data was refreshed'
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
                accounts={realAccounts}
                title="Real Account Data"
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
              variables={realVariables}
              title="Real-time Variables"
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
            <TransactionHistory transactions={generateRealTransactions()} />
          )}

          {activeTab === 'users' && (
            <UsersList />
          )}
        </div>
      </div>
    </div>
  )
}
