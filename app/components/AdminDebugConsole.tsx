'use client'

import { useState, useEffect } from 'react'
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

export function AdminDebugConsole() {
  const { publicKey, connected } = useWallet()
  const { currentUser, loading } = useUniGrading()
  const [activeTab, setActiveTab] = useState<'logs' | 'performance' | 'data' | 'users' | 'system'>('logs')
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([])
  const [realTimeData, setRealTimeData] = useState({
    users: [],
    classrooms: [],
    grades: []
  })

  // Load data and generate logs
  useEffect(() => {
    loadRealTimeData()
    generateSystemLogs()
    
    // Refresh every 5 seconds for admin debug
    const interval = setInterval(() => {
      loadRealTimeData()
      addPerformanceLog()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const loadRealTimeData = () => {
    if (typeof window !== 'undefined') {
      try {
        const users = JSON.parse(localStorage.getItem('all_users') || '[]')
        const classrooms = JSON.parse(localStorage.getItem('all_classrooms') || '[]')
        const grades = JSON.parse(localStorage.getItem('all_grades') || '[]')
        setRealTimeData({ users, classrooms, grades })
      } catch (error) {
        addLog('error', 'data', 'Failed to load real-time data', error)
      }
    }
  }

  const addLog = (level: SystemLog['level'], category: SystemLog['category'], message: string, details?: any) => {
    const newLog: SystemLog = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      level,
      category,
      message,
      details
    }
    
    setSystemLogs(prev => [newLog, ...prev.slice(0, 99)]) // Keep last 100 logs
  }

  const generateSystemLogs = () => {
    addLog('info', 'system', 'Admin Debug Console initialized')
    addLog('info', 'auth', `Admin user ${currentUser?.username} accessed debug console`)
    addLog('debug', 'data', 'Loading system data from localStorage')
  }

  const addPerformanceLog = () => {
    const memoryUsage = (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 'N/A'
    addLog('debug', 'performance', `Memory usage: ${memoryUsage} bytes`)
  }

  // Performance metrics
  const performanceMetrics: PerformanceMetric[] = [
    {
      name: 'Total Users',
      value: realTimeData.users.length,
      unit: 'users',
      status: realTimeData.users.length > 50 ? 'good' : realTimeData.users.length > 20 ? 'warning' : 'critical',
      description: 'Total registered users in the system'
    },
    {
      name: 'Data Refresh Rate',
      value: '5',
      unit: 'seconds',
      status: 'good',
      description: 'How often admin data is refreshed'
    },
    {
      name: 'LocalStorage Size',
      value: new Blob([JSON.stringify(localStorage)]).size,
      unit: 'bytes',
      status: 'good',
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
    }
  ]

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🔧 Admin Debug Console</h1>
            <p className="text-red-100">Advanced System Monitoring & Debugging</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={clearLogs}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
            >
              Clear Logs
            </button>
            <button
              onClick={exportData}
              className="bg-purple-500 hover:bg-purple-600 px-3 py-1 rounded text-sm"
            >
              Export Data
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
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Data Inspector</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Users Data</h3>
                <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(realTimeData.users.slice(0, 2), null, 2)}
                </pre>
                <p className="text-xs text-gray-500 mt-2">Showing first 2 users</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Classrooms Data</h3>
                <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(realTimeData.classrooms.slice(0, 2), null, 2)}
                </pre>
                <p className="text-xs text-gray-500 mt-2">Showing first 2 classrooms</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Grades Data</h3>
                <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(realTimeData.grades.slice(0, 2), null, 2)}
                </pre>
                <p className="text-xs text-gray-500 mt-2">Showing first 2 grades</p>
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
