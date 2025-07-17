'use client'

import { useState } from 'react'

interface Improvement {
  category: string
  title: string
  description: string
  status: 'completed' | 'improved' | 'fixed'
  impact: 'high' | 'medium' | 'low'
}

const improvements: Improvement[] = [
  {
    category: 'Authentication',
    title: 'Removed Manual Login Form',
    description: 'Users with registered wallets now auto-login automatically when connecting their wallet, eliminating the need for manual login steps.',
    status: 'completed',
    impact: 'high'
  },
  {
    category: 'Transaction History',
    title: 'Enhanced Transaction Details',
    description: 'Added comprehensive transaction information including block height, compute units, balance changes, and user-friendly data visualization.',
    status: 'improved',
    impact: 'high'
  },
  {
    category: 'Admin Debug',
    title: 'Advanced Data Inspector',
    description: 'Completely redesigned data inspector with detailed statistics, sample objects, and comprehensive data analysis for users, classrooms, and grades.',
    status: 'improved',
    impact: 'high'
  },
  {
    category: 'Program Wallet',
    title: 'Program Wallet Dashboard',
    description: 'Added complete program wallet information including balance, transaction history, deployment details, and performance metrics.',
    status: 'completed',
    impact: 'high'
  },
  {
    category: 'UI/UX',
    title: 'Compact Layout Design',
    description: 'Reduced padding and margins in tables and cards, optimized spacing for better screen utilization and improved readability.',
    status: 'improved',
    impact: 'medium'
  },
  {
    category: 'Performance',
    title: 'Optimized Data Refresh Intervals',
    description: 'Increased refresh intervals from 5s to 10s and added visibility-based refreshing to reduce unnecessary API calls and improve performance.',
    status: 'improved',
    impact: 'medium'
  },
  {
    category: 'Error Handling',
    title: 'Enhanced LocalStorage Error Handling',
    description: 'Added comprehensive try-catch blocks, data validation, and graceful error recovery for localStorage operations.',
    status: 'fixed',
    impact: 'high'
  },
  {
    category: 'Hydration',
    title: 'Fixed SSR Hydration Issues',
    description: 'Implemented proper client-side mounting checks and loading states to prevent hydration mismatches.',
    status: 'fixed',
    impact: 'high'
  },
  {
    category: 'Memory Management',
    title: 'Prevented Memory Leaks',
    description: 'Added proper cleanup for intervals, optimized useCallback/useMemo usage, and implemented proper component unmounting.',
    status: 'fixed',
    impact: 'medium'
  },
  {
    category: 'Code Quality',
    title: 'Created Custom Data Hooks',
    description: 'Extracted localStorage logic into reusable hooks (useLocalStorageData, useAdminData) to reduce code duplication.',
    status: 'completed',
    impact: 'medium'
  }
]

export function ImprovementSummary() {
  const [isOpen, setIsOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'improved': return 'bg-blue-100 text-blue-800'
      case 'fixed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const stats = {
    total: improvements.length,
    completed: improvements.filter(i => i.status === 'completed').length,
    improved: improvements.filter(i => i.status === 'improved').length,
    fixed: improvements.filter(i => i.status === 'fixed').length,
    highImpact: improvements.filter(i => i.impact === 'high').length
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-colors"
        title="View Improvements Summary"
      >
        <span className="text-lg">🚀</span>
      </button>

      {/* Improvement Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Frontend Improvements</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mt-3 text-sm">
              <div className="text-center">
                <div className="font-bold">{stats.total}</div>
                <div className="text-xs opacity-90">Total</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{stats.completed}</div>
                <div className="text-xs opacity-90">New</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{stats.improved}</div>
                <div className="text-xs opacity-90">Enhanced</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{stats.fixed}</div>
                <div className="text-xs opacity-90">Fixed</div>
              </div>
            </div>
          </div>

          {/* Improvements List */}
          <div className="p-4 space-y-3">
            {improvements.map((improvement, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {improvement.category}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(improvement.status)}`}>
                      {improvement.status}
                    </span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${getImpactColor(improvement.impact)}`} title={`${improvement.impact} impact`}></div>
                </div>
                
                <h4 className="font-medium text-gray-900 text-sm mb-1">
                  {improvement.title}
                </h4>
                
                <p className="text-xs text-gray-600 leading-relaxed">
                  {improvement.description}
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-3 rounded-b-lg text-center">
            <p className="text-xs text-gray-600">
              🎉 All major debug issues have been resolved!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
