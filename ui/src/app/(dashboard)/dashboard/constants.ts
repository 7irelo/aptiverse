import { Bookmark, BookOpen, Target, Users } from "lucide-react"
import { OverallStats, PieChartData, RecentActivity, Subject, UpcomingDeadline } from "./types"

export const upcomingDeadlines: UpcomingDeadline[] = [
    {
        subject: 'Mathematics',
        task: 'Trigonometry Test',
        due: 'Tomorrow',
        priority: 'high',
        type: 'Test',
        preparationTime: '2 hours needed'
    },
    {
        subject: 'Accounting',
        task: 'Financial Statements Project',
        due: 'In 2 days',
        priority: 'high',
        type: 'Project',
        preparationTime: '4 hours needed'
    },
    {
        subject: 'Geography',
        task: 'Research Project Submission',
        due: 'In 5 days',
        priority: 'medium',
        type: 'Project',
        preparationTime: '3 hours needed'
    },
    {
        subject: 'Business Studies',
        task: 'Case Study Analysis',
        due: 'In 3 days',
        priority: 'medium',
        type: 'Assignment',
        preparationTime: '1 hour needed'
    }
]

export const subjects: Subject[] = [
    {
        name: 'Mathematics',
        progress: 75,
        target: 80,
        color: 'bg-blue-500',
        averageScore: 72,
        nextAssessment: 'Trigonometry Test - Jan 25',
        focusArea: 'Calculus'
    },
    {
        name: 'Physical Sciences',
        progress: 68,
        target: 75,
        color: 'bg-purple-500',
        averageScore: 65,
        nextAssessment: 'Chemistry Practical - Jan 26',
        focusArea: 'Physics Formulas'
    },
    {
        name: 'Life Sciences',
        progress: 82,
        target: 78,
        color: 'bg-green-500',
        averageScore: 79,
        nextAssessment: 'Genetics Quiz - Jan 27',
        focusArea: 'Ecology'
    },
    {
        name: 'English HL',
        progress: 88,
        target: 85,
        color: 'bg-red-500',
        averageScore: 84,
        nextAssessment: 'Literature Essay - Feb 1',
        focusArea: 'Creative Writing'
    },
    {
        name: 'Afrikaans FAL',
        progress: 65,
        target: 70,
        color: 'bg-orange-500',
        averageScore: 62,
        nextAssessment: 'Oral Assessment - Jan 30',
        focusArea: 'Writing Skills'
    },
    {
        name: 'Geography',
        progress: 72,
        target: 75,
        color: 'bg-cyan-500',
        averageScore: 70,
        nextAssessment: 'Climate Test - Jan 31',
        focusArea: 'Map Work'
    },
    {
        name: 'Accounting',
        progress: 79,
        target: 82,
        color: 'bg-indigo-500',
        averageScore: 76,
        nextAssessment: 'Financial Statements - Feb 2',
        focusArea: 'Cost Accounting'
    },
    {
        name: 'Business Studies',
        progress: 85,
        target: 80,
        color: 'bg-emerald-500',
        averageScore: 82,
        nextAssessment: 'Marketing Test - Jan 29',
        focusArea: 'Entrepreneurship'
    }
]

export const recentActivities: RecentActivity[] = [
    {
        subject: 'Mathematics',
        activity: 'Completed Algebra Assignment',
        time: '2 hours ago',
        score: 85,
        type: 'assignment'
    },
    {
        subject: 'Physical Sciences',
        activity: 'Chemistry Practical Report',
        time: '1 day ago',
        score: 78,
        type: 'project'
    },
    {
        subject: 'English',
        activity: 'Literature Essay Submission',
        time: '2 days ago',
        score: 92,
        type: 'assignment'
    },
    {
        subject: 'Life Sciences',
        activity: 'Biology Theory Test',
        time: '3 days ago',
        score: 81,
        type: 'test'
    },
    {
        subject: 'Accounting',
        activity: 'Ledger Entries Quiz',
        time: '4 days ago',
        score: 88,
        type: 'quiz'
    }
]

export const overallStats: OverallStats = {
    averageScore: 76,
    completionRate: 68,
    studyHours: 24,
    goalsAchieved: 12,
    weeklyTrend: 5,
    emotionalWellness: 72,
    attendance: '95%',
    classRank: '15/40',
    streak: 7
}


export const quickActions = [
    { icon: BookOpen, label: 'Continue Studying', description: 'Math - Calculus', action: '/study' },
    { icon: Target, label: 'Set Weekly Goal', description: 'Plan your targets', action: '/goals' },
    { icon: Bookmark, label: 'Save Resources', description: 'Bookmark study materials', action: '/resources' },
    { icon: Users, label: 'Join Study Group', description: 'Collaborate with peers', action: '/groups' }
]