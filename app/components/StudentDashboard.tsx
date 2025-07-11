'use client'

import { useState, useEffect } from 'react'
import { useUniGrading } from '../hooks/useUniGrading'

interface Grade {
  assignmentName: string
  grade: number
  maxGrade: number
  timestamp: number
  gradedBy: string
}

export function StudentDashboard() {
  const { loading, currentUser } = useUniGrading()
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load real grades from localStorage
    const loadGrades = async () => {
      setIsLoading(true)
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500))

      if (currentUser) {
        // Get grades for current user from localStorage
        const allGrades = JSON.parse(localStorage.getItem('all_grades') || '[]')
        const userGrades = allGrades
          .filter((grade: any) => grade.studentWallet === currentUser.authority.toString())
          .map((grade: any) => ({
            assignmentName: grade.assignmentName,
            grade: grade.grade,
            maxGrade: grade.maxGrade,
            timestamp: grade.timestamp,
            gradedBy: grade.teacherName
          }))
          .sort((a: any, b: any) => b.timestamp - a.timestamp) // Sort by newest first

        setGrades(userGrades)
      } else {
        setGrades([])
      }

      setIsLoading(false)
    }

    loadGrades()

    // Refresh grades every 10 seconds to get real-time updates
    const interval = setInterval(loadGrades, 10000)
    return () => clearInterval(interval)
  }, [currentUser])

  const calculateAverage = () => {
    if (grades.length === 0) return 0
    const total = grades.reduce((sum, grade) => sum + (grade.grade / grade.maxGrade) * 100, 0)
    return Math.round(total / grades.length)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Grade Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Grade Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{calculateAverage()}%</div>
            <div className="text-sm text-blue-600">Overall Average</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{grades.length}</div>
            <div className="text-sm text-green-600">Total Assignments</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {grades.filter(g => (g.grade / g.maxGrade) >= 0.9).length}
            </div>
            <div className="text-sm text-purple-600">A Grades (90%+)</div>
          </div>
        </div>
      </div>

      {/* Grades List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Grades</h3>
        
        {grades.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No grades available yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Graded By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {grades.map((grade, index) => {
                  const percentage = Math.round((grade.grade / grade.maxGrade) * 100)
                  const gradeColor = percentage >= 90 ? 'text-green-600' : 
                                   percentage >= 80 ? 'text-blue-600' : 
                                   percentage >= 70 ? 'text-yellow-600' : 'text-red-600'
                  
                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {grade.assignmentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grade.grade}/{grade.maxGrade}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${gradeColor}`}>
                        {percentage}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(grade.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {grade.gradedBy}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
