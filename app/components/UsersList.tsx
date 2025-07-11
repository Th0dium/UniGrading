'use client'

import { useState, useEffect } from 'react'

interface UserData {
  walletAddress: string
  username: string
  role: 'Teacher' | 'Student'
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

export function UsersList() {
  const [users, setUsers] = useState<UserData[]>([])
  const [classrooms, setClassrooms] = useState<ClassroomData[]>([])
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'classes'>('students')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]')
    const allClassrooms = JSON.parse(localStorage.getItem('all_classrooms') || '[]')
    setUsers(allUsers)
    setClassrooms(allClassrooms)
  }

  const filteredStudents = users.filter(user => 
    user.role === 'Student' && 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTeachers = users.filter(user => 
    user.role === 'Teacher' && 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredClassrooms = classrooms.filter(classroom => 
    classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classroom.course.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const tabs = [
    { id: 'students', label: 'Students', count: filteredStudents.length, icon: '🎓' },
    { id: 'teachers', label: 'Teachers', count: filteredTeachers.length, icon: '👨‍🏫' },
    { id: 'classes', label: 'Classes', count: filteredClassrooms.length, icon: '🏫' }
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">System Users & Classes</h3>
        <button
          onClick={loadData}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users or classes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'students' && (
          <div>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students found
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredStudents.map((student, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{student.username}</h4>
                        <p className="text-sm text-gray-500">
                          Wallet: {student.walletAddress.slice(0, 8)}...{student.walletAddress.slice(-8)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Registered: {new Date(student.createdAt * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Student
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'teachers' && (
          <div>
            {filteredTeachers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No teachers found
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredTeachers.map((teacher, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{teacher.username}</h4>
                        <p className="text-sm text-gray-500">
                          Wallet: {teacher.walletAddress.slice(0, 8)}...{teacher.walletAddress.slice(-8)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Registered: {new Date(teacher.createdAt * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          teacher.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {teacher.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Teacher
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'classes' && (
          <div>
            {filteredClassrooms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No classes found
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredClassrooms.map((classroom, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{classroom.name}</h4>
                        <p className="text-sm text-gray-500">Course: {classroom.course}</p>
                        <p className="text-sm text-gray-500">Teacher: {classroom.teacherName}</p>
                        <p className="text-xs text-gray-400">
                          Created: {new Date(classroom.createdAt * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          classroom.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {classroom.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {classroom.students.length} Students
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
