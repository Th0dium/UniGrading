'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUniGrading } from '../hooks/useUniGrading'
import { useAdminData } from '../hooks/useLocalStorageData'
import { AdminDebugConsole } from './AdminDebugConsole'
import { AdminUserViewer } from './AdminUserViewer'
import { useAdminPermissions } from '../hooks/useAdminPermissions'
import { PermissionWrapper, DebugConsoleRoute, UserManagementRoute } from './AdminRoute'

interface UserData {
  walletAddress: string
  username: string
  role: 'Teacher' | 'Student' | 'Admin'
  createdAt: number
  isActive: boolean
}

interface ClassroomData {
  id: string
  name: string
  course: string
  teacher: string
  teacherName: string
  students: any[]
  createdAt: number
  isActive: boolean
}

interface GradeData {
  id: string
  studentWallet: string
  teacherWallet: string
  teacherName: string
  assignmentName: string
  grade: number
  maxGrade: number
  percentage: number
  timestamp: number
}

export function AdminDashboard() {
  const { publicKey } = useWallet()
  const { currentUser } = useUniGrading()
  const { data, metrics, loading, error, refresh } = useAdminData()
  const {
    canAccessDebugConsole,
    canViewUserDetails,
    canExportData,
    validateAdminAction,
    getRoleDisplay
  } = useAdminPermissions()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'classrooms' | 'grades' | 'accounts' | 'debug'>('overview')

  // Use metrics from the custom hook
  const stats = metrics

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'classrooms', label: 'Classrooms', icon: '🏫' },
    { id: 'grades', label: 'Grades', icon: '📝' },
    { id: 'accounts', label: 'Account Viewer', icon: '👤' },
    { id: 'debug', label: 'Admin Debug', icon: '🔧' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-purple-100">System Administration & Management</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-200">Logged in as</p>
            <p className="font-semibold">{currentUser?.username} ({getRoleDisplay()})</p>
            <p className="text-xs text-purple-200">{publicKey?.toString().slice(0, 8)}...</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
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
      <div className="bg-white rounded-lg shadow-md p-4">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading admin data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 text-xl mr-3">⚠️</div>
              <div>
                <h3 className="font-medium text-red-800">Error Loading Data</h3>
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={refresh}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">System Overview</h2>
              <button
                onClick={refresh}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                🔄 Refresh Data
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="text-blue-600 text-2xl mr-3">👥</div>
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Users</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="text-green-600 text-2xl mr-3">🏫</div>
                  <div>
                    <p className="text-sm font-medium text-green-600">Classrooms</p>
                    <p className="text-2xl font-bold text-green-900">{stats.totalClassrooms}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="text-yellow-600 text-2xl mr-3">📝</div>
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Total Grades</p>
                    <p className="text-2xl font-bold text-yellow-900">{stats.totalGrades}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="text-purple-600 text-2xl mr-3">⚡</div>
                  <div>
                    <p className="text-sm font-medium text-purple-600">Active Users</p>
                    <p className="text-2xl font-bold text-purple-900">{stats.activeUsers}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h3 className="font-medium text-gray-900 mb-2">Teachers</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTeachers}</p>
                <p className="text-sm text-gray-600">{((stats.totalTeachers / stats.totalUsers) * 100 || 0).toFixed(1)}% of users</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h3 className="font-medium text-gray-900 mb-2">Students</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
                <p className="text-sm text-gray-600">{((stats.totalStudents / stats.totalUsers) * 100 || 0).toFixed(1)}% of users</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h3 className="font-medium text-gray-900 mb-2">Admins</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAdmins}</p>
                <p className="text-sm text-gray-600">{((stats.totalAdmins / stats.totalUsers) * 100 || 0).toFixed(1)}% of users</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Recent Activity (24h)</h3>
              <p className="text-lg text-gray-700">{stats.recentRegistrations} new registrations</p>
              <p className="text-sm text-gray-600">Last data refresh: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.users.map((user: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'Teacher' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">
                          {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-8)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt * 1000).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'classrooms' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Classroom Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.classrooms.map((classroom: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">{classroom.name}</h3>
                  <p className="text-sm text-gray-600">{classroom.course}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">Teacher: {classroom.teacherName}</p>
                    <p className="text-xs text-gray-500">Students: {classroom.students?.length || 0}</p>
                    <p className="text-xs text-gray-500">Created: {new Date(classroom.createdAt * 1000).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Grade Management</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {grades.slice(0, 20).map((grade, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {grade.assignmentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {grade.studentWallet.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {grade.teacherName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          grade.percentage >= 90 ? 'bg-green-100 text-green-800' :
                          grade.percentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {grade.grade}/{grade.maxGrade} ({grade.percentage}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(grade.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'accounts' && (
          <UserManagementRoute>
            <AdminUserViewer />
          </UserManagementRoute>
        )}

        {activeTab === 'debug' && (
          <DebugConsoleRoute>
            <AdminDebugConsole />
          </DebugConsoleRoute>
        )}
      </div>
    </div>
  )
}
