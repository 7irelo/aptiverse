'use client'

import { Student } from '@/types/Student'
import React, { createContext, useContext, ReactNode } from 'react'

interface StudentContextType {
  student: Student | null
  isLoading: boolean
  error: string | null
  refreshStudent: () => Promise<void>
}

const StudentContext = createContext<StudentContextType | undefined>(undefined)

interface StudentProviderProps {
  children: ReactNode
  initialStudent: Student | null
}

export function StudentProvider({ children, initialStudent }: StudentProviderProps) {
  const [student, setStudent] = React.useState<Student | null>(initialStudent)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const refreshStudent = React.useCallback(async () => {
    if (!initialStudent?.id) return
    
    setIsLoading(true)
    setError(null)
    try {
      setStudent(initialStudent)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh student data')
    } finally {
      setIsLoading(false)
    }
  }, [initialStudent])

  const value = React.useMemo(
    () => ({ student, isLoading, error, refreshStudent }),
    [student, isLoading, error, refreshStudent]
  )

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  )
}

export function useStudent() {
  const context = useContext(StudentContext)
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider')
  }
  return context
}