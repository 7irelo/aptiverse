export interface StudentSubject {
  id: number
  studentId: number
  subjectId: string
  progress: number | null
  target: number | null
  averageScore: number | null
  studyHours: number | null
  assignmentsCompleted: number | null
  upcomingDeadlines: string | null
  strength: string | null
  weakness: string | null
  lastActivity: string | null
  performanceTrend: string | null
  studyEfficiency: number | null
  predictedScore: number | null
  difficultyLevel: string | null
  confidenceLevel: number | null
  learningVelocity: number | null
  retentionRate: number | null
  subjectName: string
  subjectCode: string
  subjectDescription: string
  subjectColor: string
  subjectTextColor: string
  subjectBorderColor: string
  lastUpdated?: string
}

export interface Student {
  id: number
  userId: string
  adminId: string | null
  grade: string
  adminName: string | null
  studentSubjects: Array<StudentSubject>
  subjectCount: number
}