'use client'

import { Student } from '@/types/Student'
import { useApiClient } from './useApiClient'
import { useEffect, useState } from 'react'

export function useStudentData(studentId?: number) {
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const apiClient = useApiClient()

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setIsLoading(true)
        const id = studentId || 4
        const response = await apiClient.get<Student>(`/students/${id}`)
        setStudent(response.data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch student data')
        console.error('Error fetching student:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudent()
  }, [studentId, apiClient])

  return { student, isLoading, error }
}