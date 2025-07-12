'use client'

import { useState, useEffect } from 'react'

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

interface UserActivity {
  type: 'registration' | 'classroom_created' | 'grade_received' | 'grade_assigned'
  timestamp: number
  description: string
  details?: any
}

export function AdminUserViewer() {
  const [users, setUsers] = useState<UserData[]>([])
  const [classrooms, setClassrooms] = useState<ClassroomData[]>([])
  const [grades, setGrades] = useState<GradeData[]>([])
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'Teacher' | 'Student' | 'Admin'>('all')

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadData = () => {
    if (typeof window !== 'undefined') {
      try {
        const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]')
        const allClassrooms = JSON.parse(localStorage.getItem('all_classrooms') || '[]')
        const allGrades = JSON.parse(localStorage.getItem('all_grades') || '[]')
        
        setUsers(allUsers)
        setClassrooms(allClassrooms)
        setGrades(allGrades)
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const getUserActivity = (user: UserData): UserActivity[] => {
    const activities: UserActivity[] = []

    // Registration activity
    activities.push({
      type: 'registration',
      timestamp: user.createdAt * 1000,
      description: `Registered as ${user.role}`,
      details: { role: user.role, wallet: user.walletAddress }
    })

    // Classroom activities (if teacher)
    if (user.role === 'Teacher') {
      const userClassrooms = classrooms.filter(c => c.teacher === user.walletAddress)
      userClassrooms.forEach(classroom => {
        activities.push({
          type: 'classroom_created',
          timestamp: classroom.createdAt * 1000,
          description: `Created classroom "${classroom.name}"`,
          details: { classroom: classroom.name, course: classroom.course }
        })
      })
    }

    // Grade activities
    const userGrades = grades.filter(g => 
      g.studentWallet === user.walletAddress || g.teacherWallet === user.walletAddress
    )
    
    userGrades.forEach(grade => {
      if (grade.studentWallet === user.walletAddress) {
        activities.push({
          type: 'grade_received',
          timestamp: grade.timestamp,
          description: `Received grade ${grade.grade}/${grade.maxGrade} for "${grade.assignmentName}"`,
          details: { grade: grade.grade, maxGrade: grade.maxGrade, assignment: grade.assignmentName }
        })
      } else if (grade.teacherWallet === user.walletAddress) {
        activities.push({
          type: 'grade_assigned',
          timestamp: grade.timestamp,
          description: `Assigned grade ${grade.grade}/${grade.maxGrade} for "${grade.assignmentName}"`,
          details: { grade: grade.grade, maxGrade: grade.maxGrade, assignment: grade.assignmentName }
        })
      }
    })

    return activities.sort((a, b) => b.timestamp - a.timestamp)
  }

  const getUserStats = (user: UserData) => {
    if (user.role === 'Teacher') {
      const teacherClassrooms = classrooms.filter(c => c.teacher === user.walletAddress)
      const gradesAssigned = grades.filter(g => g.teacherWallet === user.walletAddress)
      return {
        classrooms: teacherClassrooms.length,
        gradesAssigned: gradesAssigned.length,
        totalStudents: teacherClassrooms.reduce((sum, c) => sum + (c.students?.length || 0), 0)
      }
    } else if (user.role === 'Student') {
      const studentGrades = grades.filter(g => g.studentWallet === user.walletAddress)
      const avgGrade = studentGrades.length > 0 
        ? studentGrades.reduce((sum, g) => sum + g.percentage, 0) / studentGrades.length 
        : 0
      return {
        gradesReceived: studentGrades.length,
        averageGrade: Math.round(avgGrade),
        lastActivity: studentGrades.length > 0 ? Math.max(...studentGrades.map(g => g.timestamp)) : user.createdAt * 1000
      }
    } else {
      return {
        adminSince: user.createdAt * 1000,
        systemAccess: 'Full'
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">👤 User Account Viewer</h1>
        <p className="text-indigo-100">Detailed view of all user accounts and activities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Users ({filteredUsers.length})</h2>
            
            {/* Search and Filter */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Teacher">Teacher</option>
                <option value="Student">Student</option>
              </select>
            </div>

            {/* User List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredUsers.map((user, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedUser(user)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedUser?.walletAddress === user.walletAddress
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500 font-mono">
                        {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-8)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'Teacher' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          {selectedUser ? (
            <div className="space-y-6">
              {/* User Header */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedUser.username}</h2>
                    <p className="text-sm text-gray-500">
                      Registered: {new Date(selectedUser.createdAt * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      selectedUser.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                      selectedUser.role === 'Teacher' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedUser.role}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Status: {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Account Information</h3>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Wallet Address:</span>
                        <span className="font-mono text-xs">{selectedUser.walletAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Username:</span>
                        <span>{selectedUser.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Role:</span>
                        <span>{selectedUser.role}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span>{new Date(selectedUser.createdAt * 1000).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Statistics</h3>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="space-y-1 text-sm">
                      {Object.entries(getUserStats(selectedUser)).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span>{typeof value === 'number' && value > 1000000000 ? new Date(value).toLocaleDateString() : value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity History */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Activity History</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {getUserActivity(selectedUser).map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'registration' ? 'bg-blue-500' :
                        activity.type === 'classroom_created' ? 'bg-green-500' :
                        activity.type === 'grade_received' ? 'bg-yellow-500' :
                        'bg-purple-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                        {activity.details && (
                          <pre className="text-xs text-gray-600 mt-1 bg-white p-2 rounded overflow-x-auto">
                            {JSON.stringify(activity.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👤</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a User</h3>
              <p className="text-gray-500">Choose a user from the list to view detailed information</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
