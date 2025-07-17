'use client'

import { useState, useEffect, useCallback } from 'react'

interface LocalStorageData {
  users: any[]
  classrooms: any[]
  grades: any[]
}

interface UseLocalStorageDataReturn {
  data: LocalStorageData
  loading: boolean
  error: string | null
  refresh: () => void
  clearError: () => void
}

export function useLocalStorageData(refreshInterval?: number): UseLocalStorageDataReturn {
  const [data, setData] = useState<LocalStorageData>({
    users: [],
    classrooms: [],
    grades: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      setError(null)
      setLoading(true)

      const users = JSON.parse(localStorage.getItem('all_users') || '[]')
      const classrooms = JSON.parse(localStorage.getItem('all_classrooms') || '[]')
      const grades = JSON.parse(localStorage.getItem('all_grades') || '[]')

      // Validate data structure
      if (!Array.isArray(users) || !Array.isArray(classrooms) || !Array.isArray(grades)) {
        throw new Error('Invalid data structure in localStorage')
      }

      setData({ users, classrooms, grades })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data from localStorage'
      setError(errorMessage)
      console.error('Error loading localStorage data:', err)
      
      // Reset to empty arrays on error
      setData({ users: [], classrooms: [], grades: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(() => {
    loadData()
  }, [loadData])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Initial load
  useEffect(() => {
    loadData()
  }, [loadData])

  // Auto-refresh if interval is provided
  useEffect(() => {
    if (!refreshInterval) return

    const interval = setInterval(() => {
      // Only refresh if document is visible to save resources
      if (document.visibilityState === 'visible') {
        loadData()
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval, loadData])

  return {
    data,
    loading,
    error,
    refresh,
    clearError
  }
}

// Helper hook for admin-specific data with additional metrics
export function useAdminData() {
  const { data, loading, error, refresh, clearError } = useLocalStorageData(30000) // 30 seconds

  const metrics = {
    totalUsers: data.users.length,
    totalTeachers: data.users.filter((user: any) => user.role === 'Teacher').length,
    totalStudents: data.users.filter((user: any) => user.role === 'Student').length,
    totalAdmins: data.users.filter((user: any) => user.role === 'Admin').length,
    totalClassrooms: data.classrooms.length,
    totalGrades: data.grades.length,
    activeUsers: data.users.filter((user: any) => user.isActive).length,
    recentRegistrations: data.users.filter((user: any) => 
      Date.now() - (user.createdAt * 1000) < 24 * 60 * 60 * 1000
    ).length
  }

  return {
    data,
    metrics,
    loading,
    error,
    refresh,
    clearError
  }
}
