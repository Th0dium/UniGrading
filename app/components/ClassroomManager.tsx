'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUniGrading } from '../hooks/useUniGrading'
import toast from 'react-hot-toast'

interface Classroom {
  id: string
  name: string
  course: string
  studentCount: number
}

export function ClassroomManager() {
  const { publicKey } = useWallet()
  const { createClassroom, currentUser, loading } = useUniGrading()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newClassroom, setNewClassroom] = useState({ name: '', course: '' })
  const [isLoading, setIsLoading] = useState(false)

  // Load classrooms from localStorage
  useEffect(() => {
    const loadClassrooms = () => {
      if (!publicKey || !currentUser) return

      const allClassrooms = JSON.parse(localStorage.getItem('all_classrooms') || '[]')
      const teacherClassrooms = allClassrooms
        .filter((classroom: any) => classroom.teacher === publicKey.toString())
        .map((classroom: any) => ({
          id: classroom.id,
          name: classroom.name,
          course: classroom.course,
          studentCount: classroom.students ? classroom.students.length : 0
        }))

      setClassrooms(teacherClassrooms)
    }

    loadClassrooms()

    // Refresh every 10 seconds to get updates
    const interval = setInterval(loadClassrooms, 10000)
    return () => clearInterval(interval)
  }, [publicKey, currentUser])

  const handleCreateClassroom = async () => {
    if (!newClassroom.name.trim() || !newClassroom.course.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    if (!currentUser || currentUser.role !== 'Teacher') {
      toast.error('Only teachers can create classrooms')
      return
    }

    // Check for duplicate classroom names
    const existingClassroom = classrooms.find(
      classroom => classroom.name.toLowerCase() === newClassroom.name.trim().toLowerCase()
    )
    if (existingClassroom) {
      toast.error('A classroom with this name already exists')
      return
    }

    setIsLoading(true)
    try {
      // Use the createClassroom function from useUniGrading hook
      const result = await createClassroom(newClassroom.name, newClassroom.course)

      if (result) {
        // Refresh classrooms list
        const allClassrooms = JSON.parse(localStorage.getItem('all_classrooms') || '[]')
        const teacherClassrooms = allClassrooms
          .filter((classroom: any) => classroom.teacher === publicKey?.toString())
          .map((classroom: any) => ({
            id: classroom.id,
            name: classroom.name,
            course: classroom.course,
            studentCount: classroom.students ? classroom.students.length : 0
          }))

        setClassrooms(teacherClassrooms)
        setNewClassroom({ name: '', course: '' })
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Error creating classroom:', error)
      toast.error('Failed to create classroom')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate summary stats
  const totalStudents = classrooms.reduce((sum, classroom) => sum + classroom.studentCount, 0)

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {classrooms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{classrooms.length}</div>
            <div className="text-sm text-blue-600">Total Classrooms</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{totalStudents}</div>
            <div className="text-sm text-green-600">Total Students</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {currentUser?.role === 'Teacher' ? 'Active' : 'N/A'}
            </div>
            <div className="text-sm text-purple-600">Teacher Status</div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Your Classrooms</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={loading || isLoading}
          className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Create Classroom
        </button>
      </div>

      {/* Create Classroom Form */}
      {showCreateForm && (
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h4 className="text-md font-medium text-gray-900 mb-4">Create New Classroom</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classroom Name
              </label>
              <input
                type="text"
                value={newClassroom.name}
                onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Math 101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course
              </label>
              <input
                type="text"
                value={newClassroom.course}
                onChange={(e) => setNewClassroom({ ...newClassroom, course: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Mathematics"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateClassroom}
              disabled={isLoading || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:bg-gray-400 transition-colors"
            >
              {isLoading || loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </div>
              ) : (
                'Create'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Classrooms List */}
      {classrooms.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-400">CLS</span>
          </div>
          <p>No classrooms yet. Create your first classroom to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms.map((classroom) => {
            // Get classroom data from localStorage for additional info
            const allClassrooms = JSON.parse(localStorage.getItem('all_classrooms') || '[]')
            const fullClassroomData = allClassrooms.find((c: any) => c.id === classroom.id)

            return (
              <div key={classroom.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-medium text-gray-900">{classroom.name}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {classroom.studentCount} students
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{classroom.course}</p>
                {fullClassroomData && (
                  <p className="text-xs text-gray-500 mb-4">
                    Created: {new Date(fullClassroomData.createdAt * 1000).toLocaleDateString()}
                  </p>
                )}
                <div className="flex space-x-2">
                  <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded text-sm transition-colors">
                    Manage
                  </button>
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm transition-colors">
                    Students
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
