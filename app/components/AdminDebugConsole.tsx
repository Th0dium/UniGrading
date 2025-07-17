'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUniGrading } from '../hooks/useUniGrading'
import { CURRENT_VERSION } from '@/constants/version'

interface SystemLog {
  id: string
  timestamp: number
  level: 'info' | 'warning' | 'error' | 'debug'
  category: 'auth' | 'data' | 'system' | 'user' | 'performance'
  message: string
  details?: any
}

interface PerformanceMetric {
  name: string
  value: number | string
  unit: string
  status: 'good' | 'warning' | 'critical'
  description: string
}

interface RealTimeData {
  users: any[]
  classrooms: any[]
  grades: any[]
}

export function AdminDebugConsole() {
  const { publicKey, connected } = useWallet()
  const { currentUser, loading } = useUniGrading()
  const [activeTab, setActiveTab] = useState<'logs' | 'performance' | 'data' | 'users' | 'system'>('logs')
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([])
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({
    users: [],
    classrooms: [],
    grades: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fix hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Memoized data loading function
  const loadRealTimeData = useCallback(() => {
    if (!mounted || typeof window === 'undefined') return

    try {
      setError(null)
      const users = JSON.parse(localStorage.getItem('all_users') || '[]')
      const classrooms = JSON.parse(localStorage.getItem('all_classrooms') || '[]')
      const grades = JSON.parse(localStorage.getItem('all_grades') || '[]')

      setRealTimeData({ users, classrooms, grades })
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading real-time data:', error)
      setError('Failed to load data from localStorage')
      addLog('error', 'data', 'Failed to load real-time data', error)
      setIsLoading(false)
    }
  }, [mounted])

  // Initialize and setup intervals
  useEffect(() => {
    if (!mounted) return

    loadRealTimeData()
    generateSystemLogs()

    // Optimized refresh interval - only refresh when tab is active
    intervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadRealTimeData()
        addPerformanceLog()
      }
    }, 10000) // Increased to 10 seconds for better performance

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [mounted, loadRealTimeData])

  // Optimized log management
  const addLog = useCallback((level: SystemLog['level'], category: SystemLog['category'], message: string, details?: any) => {
    if (!mounted) return

    const newLog: SystemLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      category,
      message,
      details
    }

    setSystemLogs(prev => {
      const newLogs = [newLog, ...prev]
      return newLogs.slice(0, 100) // Keep last 100 logs
    })
  }, [mounted])

  const generateSystemLogs = useCallback(() => {
    if (!mounted) return

    addLog('info', 'system', 'Admin Debug Console initialized')
    if (currentUser?.username) {
      addLog('info', 'auth', `Admin user ${currentUser.username} accessed debug console`)
    }
    addLog('debug', 'data', 'Loading system data from localStorage')
  }, [mounted, currentUser?.username, addLog])

  const addPerformanceLog = useCallback(() => {
    if (!mounted || typeof window === 'undefined') return

    try {
      const memoryUsage = (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 'N/A'
      const timing = performance.timing
      const loadTime = timing.loadEventEnd - timing.navigationStart

      addLog('debug', 'performance', `Memory: ${memoryUsage} bytes, Load time: ${loadTime}ms`)
    } catch (error) {
      addLog('warning', 'performance', 'Could not collect performance metrics', error)
    }
  }, [mounted, addLog])

  // Memoized performance metrics with error handling
  const performanceMetrics: PerformanceMetric[] = useMemo(() => {
    if (!mounted) return []

    const getLocalStorageSize = () => {
      try {
        if (typeof window === 'undefined') return 0
        return new Blob([JSON.stringify(localStorage)]).size
      } catch (error) {
        console.error('Error calculating localStorage size:', error)
        return 0
      }
    }

    const getUsersStatus = (count: number): 'good' | 'warning' | 'critical' => {
      if (count > 50) return 'good'
      if (count > 20) return 'warning'
      return 'critical'
    }

    const getStorageStatus = (size: number): 'good' | 'warning' | 'critical' => {
      if (size < 1024 * 1024) return 'good' // < 1MB
      if (size < 5 * 1024 * 1024) return 'warning' // < 5MB
      return 'critical' // >= 5MB
    }

    const storageSize = getLocalStorageSize()

    return [
      {
        name: 'Total Users',
        value: realTimeData.users.length,
        unit: 'users',
        status: getUsersStatus(realTimeData.users.length),
        description: 'Total registered users in the system'
      },
      {
        name: 'Data Refresh Rate',
        value: '10',
        unit: 'seconds',
        status: 'good',
        description: 'How often admin data is refreshed'
      },
      {
        name: 'LocalStorage Size',
        value: Math.round(storageSize / 1024),
        unit: 'KB',
        status: getStorageStatus(storageSize),
        description: 'Total size of localStorage data'
      },
      {
        name: 'Active Sessions',
        value: connected ? 1 : 0,
        unit: 'sessions',
        status: connected ? 'good' : 'warning',
        description: 'Number of active wallet connections'
      },
      {
        name: 'App Version',
        value: CURRENT_VERSION,
        unit: '',
        status: 'good',
        description: 'Current application version'
      },
      {
        name: 'Error Count',
        value: systemLogs.filter(log => log.level === 'error').length,
        unit: 'errors',
        status: systemLogs.filter(log => log.level === 'error').length === 0 ? 'good' :
               systemLogs.filter(log => log.level === 'error').length < 5 ? 'warning' : 'critical',
        description: 'Number of errors in system logs'
      }
    ]
  }, [mounted, realTimeData, connected, systemLogs])

  const tabs = [
    { id: 'logs', label: 'System Logs', icon: '📋' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'data', label: 'Data Inspector', icon: '🔍' },
    { id: 'users', label: 'User Accounts', icon: '👤' },
    { id: 'system', label: 'System Info', icon: '🖥️' }
  ]

  const clearLogs = () => {
    setSystemLogs([])
    addLog('info', 'system', 'System logs cleared by admin')
  }

  const exportData = () => {
    const exportData = {
      users: realTimeData.users,
      classrooms: realTimeData.classrooms,
      grades: realTimeData.grades,
      logs: systemLogs,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `unigrading-admin-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    addLog('info', 'system', 'Admin data exported successfully')
  }

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
            <span>Loading Admin Debug Console...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🔧 Admin Debug Console</h1>
            <p className="text-red-100">Advanced System Monitoring & Debugging</p>
            {error && (
              <p className="text-red-200 text-sm mt-1">⚠️ {error}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={clearLogs}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 disabled:opacity-50 px-3 py-1 rounded text-sm transition-colors"
            >
              Clear Logs
            </button>
            <button
              onClick={exportData}
              disabled={isLoading}
              className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 px-3 py-1 rounded text-sm transition-colors"
            >
              Export Data
            </button>
            <button
              onClick={loadRealTimeData}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-3 py-1 rounded text-sm transition-colors"
            >
              {isLoading ? '🔄' : '↻'} Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">System Logs</h2>
              <span className="text-sm text-gray-500">{systemLogs.length} entries</span>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {systemLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded border-l-4 ${
                    log.level === 'error' ? 'bg-red-50 border-red-500' :
                    log.level === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                    log.level === 'debug' ? 'bg-gray-50 border-gray-500' :
                    'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        log.level === 'error' ? 'bg-red-100 text-red-800' :
                        log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        log.level === 'debug' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {log.category}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{log.message}</p>
                  {log.details && (
                    <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Performance Metrics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{metric.name}</h3>
                    <span className={`w-3 h-3 rounded-full ${
                      metric.status === 'good' ? 'bg-green-500' :
                      metric.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value} <span className="text-sm font-normal text-gray-500">{metric.unit}</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{metric.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Data Inspector</h2>
              <div className="text-sm text-gray-500">
                Real-time data from localStorage
              </div>
            </div>

            {/* Data Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-blue-600 text-sm font-medium">Total Users</div>
                <div className="text-2xl font-bold text-blue-900">{realTimeData.users.length}</div>
                <div className="text-xs text-blue-600">
                  {realTimeData.users.filter((u: any) => u.isActive).length} active
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-green-600 text-sm font-medium">Classrooms</div>
                <div className="text-2xl font-bold text-green-900">{realTimeData.classrooms.length}</div>
                <div className="text-xs text-green-600">
                  {realTimeData.classrooms.filter((c: any) => c.isActive).length} active
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="text-yellow-600 text-sm font-medium">Grades</div>
                <div className="text-2xl font-bold text-yellow-900">{realTimeData.grades.length}</div>
                <div className="text-xs text-yellow-600">
                  Avg: {realTimeData.grades.length > 0 ?
                    (realTimeData.grades.reduce((sum: number, g: any) => sum + g.percentage, 0) / realTimeData.grades.length).toFixed(1) : 0}%
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="text-purple-600 text-sm font-medium">Data Size</div>
                <div className="text-2xl font-bold text-purple-900">
                  {Math.round(new Blob([JSON.stringify({
                    users: realTimeData.users,
                    classrooms: realTimeData.classrooms,
                    grades: realTimeData.grades
                  })]).size / 1024)}KB
                </div>
                <div className="text-xs text-purple-600">localStorage</div>
              </div>
            </div>

            {/* Detailed Data Tables */}
            <div className="grid grid-cols-1 gap-6">
              {/* Users Data */}
              <div className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Users Data Structure</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Sample User Object</h4>
                      <pre className="text-xs text-gray-600 bg-gray-100 p-3 rounded overflow-auto max-h-48">
                        {JSON.stringify(realTimeData.users[0] || {}, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">User Statistics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Users:</span>
                          <span className="font-mono">{realTimeData.users.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Teachers:</span>
                          <span className="font-mono">{realTimeData.users.filter((u: any) => u.role === 'Teacher').length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Students:</span>
                          <span className="font-mono">{realTimeData.users.filter((u: any) => u.role === 'Student').length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Admins:</span>
                          <span className="font-mono">{realTimeData.users.filter((u: any) => u.role === 'Admin').length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active Users:</span>
                          <span className="font-mono">{realTimeData.users.filter((u: any) => u.isActive).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Recent (24h):</span>
                          <span className="font-mono">
                            {realTimeData.users.filter((u: any) =>
                              Date.now() - (u.createdAt * 1000) < 24 * 60 * 60 * 1000
                            ).length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Classrooms Data */}
              <div className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Classrooms Data Structure</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Classroom Object</h4>
                      <pre className="text-xs text-gray-600 bg-gray-100 p-3 rounded overflow-auto max-h-48">
                        {JSON.stringify(realTimeData.classrooms[0] || {}, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Classroom Statistics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Classrooms:</span>
                          <span className="font-mono">{realTimeData.classrooms.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active Classrooms:</span>
                          <span className="font-mono">{realTimeData.classrooms.filter((c: any) => c.isActive).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Students Enrolled:</span>
                          <span className="font-mono">
                            {realTimeData.classrooms.reduce((sum: number, c: any) => sum + (c.students?.length || 0), 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Students/Class:</span>
                          <span className="font-mono">
                            {realTimeData.classrooms.length > 0 ?
                              (realTimeData.classrooms.reduce((sum: number, c: any) => sum + (c.students?.length || 0), 0) / realTimeData.classrooms.length).toFixed(1) : 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Unique Courses:</span>
                          <span className="font-mono">
                            {new Set(realTimeData.classrooms.map((c: any) => c.course)).size}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grades Data */}
              <div className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Grades Data Structure</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Grade Object</h4>
                      <pre className="text-xs text-gray-600 bg-gray-100 p-3 rounded overflow-auto max-h-48">
                        {JSON.stringify(realTimeData.grades[0] || {}, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Grade Statistics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Grades:</span>
                          <span className="font-mono">{realTimeData.grades.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Average Grade:</span>
                          <span className="font-mono">
                            {realTimeData.grades.length > 0 ?
                              (realTimeData.grades.reduce((sum: number, g: any) => sum + g.percentage, 0) / realTimeData.grades.length).toFixed(1) : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Highest Grade:</span>
                          <span className="font-mono">
                            {realTimeData.grades.length > 0 ?
                              Math.max(...realTimeData.grades.map((g: any) => g.percentage)) : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lowest Grade:</span>
                          <span className="font-mono">
                            {realTimeData.grades.length > 0 ?
                              Math.min(...realTimeData.grades.map((g: any) => g.percentage)) : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Unique Assignments:</span>
                          <span className="font-mono">
                            {new Set(realTimeData.grades.map((g: any) => g.assignmentName)).size}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Recent Grades (24h):</span>
                          <span className="font-mono">
                            {realTimeData.grades.filter((g: any) =>
                              Date.now() - g.timestamp < 24 * 60 * 60 * 1000
                            ).length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">User Account Inspector</h2>
            
            <div className="space-y-3">
              {realTimeData.users.map((user: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{user.username}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'Teacher' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Wallet:</span>
                      <span className="ml-2 font-mono text-gray-600">{user.walletAddress}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Created:</span>
                      <span className="ml-2 text-gray-600">{new Date(user.createdAt * 1000).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className={`ml-2 ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">System Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Application Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-mono">{CURRENT_VERSION}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Environment:</span>
                    <span className="font-mono">Development</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Build Time:</span>
                    <span className="font-mono">{new Date().toISOString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Runtime Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">User Agent:</span>
                    <span className="font-mono text-xs">{navigator.userAgent.slice(0, 30)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Screen:</span>
                    <span className="font-mono">{screen.width}x{screen.height}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Language:</span>
                    <span className="font-mono">{navigator.language}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
