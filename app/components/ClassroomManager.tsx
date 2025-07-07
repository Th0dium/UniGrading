'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface Classroom {
  id: string
  name: string
  course: string
  studentCount: number
}

export function ClassroomManager() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([
    // Mock data for demo
    { id: '1', name: 'Math 101', course: 'Mathematics', studentCount: 25 },
    { id: '2', name: 'Physics 201', course: 'Physics', studentCount: 18 }
  ])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newClassroom, setNewClassroom] = useState({ name: '', course: '' })
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateClassroom = async () => {
    if (!newClassroom.name.trim() || !newClassroom.course.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      // Here you would call the Solana program to create a classroom
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const classroom: Classroom = {
        id: Date.now().toString(),
        name: newClassroom.name,
        course: newClassroom.course,
        studentCount: 0
      }
      
      setClassrooms([...classrooms, classroom])
      setNewClassroom({ name: '', course: '' })
      setShowCreateForm(false)
      toast.success('Classroom created successfully!')
    } catch (error) {
      toast.error('Failed to create classroom')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Your Classrooms</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
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
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:bg-gray-400"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Classrooms List */}
      {classrooms.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">🏫</div>
          <p>No classrooms yet. Create your first classroom to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms.map((classroom) => (
            <div key={classroom.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-medium text-gray-900">{classroom.name}</h4>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {classroom.studentCount} students
                </span>
              </div>
              <p className="text-gray-600 mb-4">{classroom.course}</p>
              <div className="flex space-x-2">
                <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded text-sm">
                  Manage
                </button>
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm">
                  Students
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
