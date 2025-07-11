'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { useUniGrading } from '../hooks/useUniGrading'
import { PublicKey } from '@solana/web3.js'

interface Student {
  id: string
  name: string
  pubkey: string
}

interface Grade {
  assignmentName: string
  grade: number
  maxGrade: number
  timestamp: number
}

export function GradeManager() {
  const { assignGrade, loading } = useUniGrading()
  const [selectedClassroom, setSelectedClassroom] = useState('')
  const [students, setStudents] = useState<Student[]>([
    // Mock data
    { id: 'STU001', name: 'Alice Johnson', pubkey: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' },
    { id: 'STU002', name: 'Bob Smith', pubkey: '8yLYtg3DX98e08UKTEqcE6kCifUqB94VZSvKpthBtV' }
  ])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [gradeForm, setGradeForm] = useState({
    assignmentName: '',
    grade: '',
    maxGrade: '100'
  })

  const classrooms = [
    { id: '1', name: 'Math 101' },
    { id: '2', name: 'Physics 201' }
  ]

  const handleAssignGrade = async () => {
    if (!selectedStudent || !gradeForm.assignmentName || !gradeForm.grade) {
      toast.error('Please fill in all required fields')
      return
    }

    const grade = parseInt(gradeForm.grade)
    const maxGrade = parseInt(gradeForm.maxGrade)

    if (grade > maxGrade) {
      toast.error('Grade cannot exceed maximum grade')
      return
    }

    try {
      const selectedStudentData = students.find(s => s.id === selectedStudent)
      if (!selectedStudentData) {
        toast.error('Student not found')
        return
      }

      // Convert pubkey string to PublicKey
      const studentPubkey = new PublicKey(selectedStudentData.pubkey)

      await assignGrade(
        studentPubkey,
        gradeForm.assignmentName,
        grade,
        maxGrade
      )

      setGradeForm({ assignmentName: '', grade: '', maxGrade: '100' })
      setSelectedStudent('')
    } catch (error) {
      console.error('Error assigning grade:', error)
      toast.error('Failed to assign grade')
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Grade Management</h3>

      {/* Classroom Selection */}
      <div className="bg-gray-50 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Classroom
        </label>
        <select
          value={selectedClassroom}
          onChange={(e) => setSelectedClassroom(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Choose a classroom...</option>
          {classrooms.map((classroom) => (
            <option key={classroom.id} value={classroom.id}>
              {classroom.name}
            </option>
          ))}
        </select>
      </div>

      {selectedClassroom && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student List */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-4">Students</h4>
            <div className="space-y-2">
              {students.map((student) => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedStudent === student.id
                      ? 'bg-primary-50 border-primary-200 border'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{student.name}</div>
                  <div className="text-sm text-gray-500">{student.id}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Grade Assignment Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-4">Assign Grade</h4>
            
            {!selectedStudent ? (
              <div className="text-center py-8 text-gray-500">
                Select a student to assign grades
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignment Name *
                  </label>
                  <input
                    type="text"
                    value={gradeForm.assignmentName}
                    onChange={(e) => setGradeForm({ ...gradeForm, assignmentName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Midterm Exam"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade *
                    </label>
                    <input
                      type="number"
                      value={gradeForm.grade}
                      onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="85"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Grade
                    </label>
                    <input
                      type="number"
                      value={gradeForm.maxGrade}
                      onChange={(e) => setGradeForm({ ...gradeForm, maxGrade: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min="1"
                    />
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <strong>Student:</strong> {students.find(s => s.id === selectedStudent)?.name}
                </div>

                <button
                  onClick={handleAssignGrade}
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  {loading ? 'Assigning Grade...' : 'Assign Grade'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
