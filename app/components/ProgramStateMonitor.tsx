'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUniGrading } from '../hooks/useUniGrading'

interface ProgramState {
  totalUsers: number
  totalClassrooms: number
  totalStudents: number
  totalGrades: number
  activeConnections: number
  lastUpdate: number
}

export function ProgramStateMonitor() {
  const { connected, publicKey } = useWallet()
  const { currentUser, loading } = useUniGrading()
  const [mounted, setMounted] = useState(false)
  const [programState, setProgramState] = useState<ProgramState>({
    totalUsers: 0,
    totalClassrooms: 0,
    totalStudents: 0,
    totalGrades: 0,
    activeConnections: 0,
    lastUpdate: Date.now()
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fix hydration error
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch real program state from localStorage
  const fetchProgramState = async () => {
    setIsRefreshing(true)
    try {
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 300))

      // Get real data from localStorage
      const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]')
      const allClassrooms = JSON.parse(localStorage.getItem('all_classrooms') || '[]')
      const allGrades = JSON.parse(localStorage.getItem('all_grades') || '[]')

      // Calculate real statistics
      const totalUsers = allUsers.length
      const totalClassrooms = allClassrooms.length
      const totalStudents = allUsers.filter((user: any) => user.role === 'Student').length
      const totalGrades = allGrades.length
      const activeConnections = connected ? 1 : 0

      setProgramState({
        totalUsers,
        totalClassrooms,
        totalStudents,
        totalGrades,
        activeConnections,
        lastUpdate: Date.now()
      })
    } catch (error) {
      console.error('Error fetching program state:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchProgramState()
    const interval = setInterval(fetchProgramState, 30000)
    return () => clearInterval(interval)
  }, [])

  const stats = [
    {
      name: 'Total Users',
      value: programState.totalUsers,
      icon: 'Users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Classrooms',
      value: programState.totalClassrooms,
      icon: 'Class',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Students',
      value: programState.totalStudents,
      icon: 'Student',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Teachers',
      value: programState.totalUsers - programState.totalStudents,
      icon: 'Teacher',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      name: 'Grades Recorded',
      value: programState.totalGrades,
      icon: 'Grade',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Program State Monitor</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Last updated: {new Date(programState.lastUpdate).toLocaleTimeString()}
          </span>
          <button
            onClick={fetchProgramState}
            disabled={isRefreshing}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {isRefreshing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stat.bgColor} rounded-lg p-2`}>
                <span className={`text-xs font-medium ${stat.color}`}>{stat.icon}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className={`text-lg font-semibold ${stat.color}`}>
                  {stat.value.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Current User Status */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Current Session</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm font-medium text-gray-700">Wallet Status</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {connected ? 'Connected' : 'Disconnected'}
            </p>
            {publicKey && (
              <p className="text-xs font-mono text-gray-500 mt-1">
                {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
              </p>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${currentUser ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <span className="text-sm font-medium text-gray-700">User Status</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {currentUser ? `Registered as ${currentUser.role}` : 'Not registered'}
            </p>
            {currentUser && (
              <p className="text-xs text-gray-500 mt-1">
                {currentUser.username}
              </p>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${loading ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
              <span className="text-sm font-medium text-gray-700">Program Status</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {loading ? 'Processing...' : 'Ready'}
            </p>
          </div>
        </div>
      </div>

      {/* Network Info */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Network Information</h4>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Network:</span>
              <span className="ml-2 font-medium text-gray-900">Devnet</span>
            </div>
            <div>
              <span className="text-gray-600">Program ID:</span>
              <span className="ml-2 font-mono text-xs text-gray-900">
                AUb7ZQUCsWSVu4ok5CfGeDbgyQTGcgn9WSsC4PwN7MBj
              </span>
            </div>
            <div>
              <span className="text-gray-600">RPC Endpoint:</span>
              <span className="ml-2 font-medium text-gray-900">Devnet</span>
            </div>
            <div>
              <span className="text-gray-600">Commitment:</span>
              <span className="ml-2 font-medium text-gray-900">Confirmed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
