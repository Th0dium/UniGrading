'use client'

import { useState } from 'react'
import { TeacherDashboard } from './TeacherDashboard'
import { StudentDashboard } from './StudentDashboard'
import { AdminDashboard } from './AdminDashboard'
import { DebugDashboard } from './DebugDashboard'
import { AdminDashboardRoute } from './AdminRoute'

interface DashboardProps {
  userRole: 'teacher' | 'student' | 'admin' | null
}

export function Dashboard({ userRole }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'main' | 'debug'>('main')

  if (!userRole) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading user information...</p>
      </div>
    )
  }

  const tabs = userRole === 'admin' ? [
    { id: 'main', label: 'Admin Dashboard', icon: '⚡' }
  ] : [
    { id: 'main', label: 'Dashboard', icon: '🏠' },
    { id: 'debug', label: 'Debug Info', icon: '🔧' }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome, {userRole === 'teacher' ? 'Teacher' : 'Student'}!
        </h2>
        <p className="text-gray-600">
          {userRole === 'teacher'
            ? 'Manage your classrooms and assign grades to students.'
            : 'View your grades and track your academic progress.'
          }
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'main' | 'debug')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'main' && (
            <>
              {userRole === 'teacher' && <TeacherDashboard />}
              {userRole === 'student' && <StudentDashboard />}
              {userRole === 'admin' && (
                <AdminDashboardRoute>
                  <AdminDashboard />
                </AdminDashboardRoute>
              )}
            </>
          )}

          {activeTab === 'debug' && userRole !== 'admin' && (
            <DebugDashboard />
          )}
        </div>
      </div>
    </div>
  )
}
