"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Plus,
    Target,
    Calendar,
    BookOpen,
    TrendingUp,
    CheckCircle2,
    Clock,
    Edit3,
    Trash2,
    Star,
    Award,
    Zap,
    Lightbulb,
    BarChart3
} from 'lucide-react'

import './Goals.css'

interface Goal {
    id: string
    title: string
    description: string
    type: 'academic' | 'personal' | 'skill' | 'exam'
    subject?: string
    targetScore?: number
    currentScore?: number
    deadline: string
    priority: 'low' | 'medium' | 'high'
    progress: number
    createdAt: string
    completed: boolean
    steps?: GoalStep[]
}

interface GoalStep {
    id: string
    title: string
    completed: boolean
}

const Goals = () => {
    const router = useRouter()
    const [goals, setGoals] = useState<Goal[]>([
        {
            id: '1',
            title: 'Achieve 85% in Mathematics',
            description: 'Improve overall mathematics performance by focusing on calculus and algebra',
            type: 'academic',
            subject: 'Mathematics',
            targetScore: 85,
            currentScore: 72,
            deadline: '2024-03-15',
            priority: 'high',
            progress: 65,
            createdAt: '2024-01-15',
            completed: false,
            steps: [
                { id: '1-1', title: 'Complete calculus practice worksheets', completed: true },
                { id: '1-2', title: 'Master algebraic equations', completed: true },
                { id: '1-3', title: 'Solve past exam papers', completed: false },
                { id: '1-4', title: 'Review trigonometry concepts', completed: false }
            ]
        },
        {
            id: '2',
            title: 'Learn Python Programming',
            description: 'Build foundational programming skills in Python for data analysis',
            type: 'skill',
            deadline: '2024-04-30',
            priority: 'medium',
            progress: 30,
            createdAt: '2024-01-20',
            completed: false,
            steps: [
                { id: '2-1', title: 'Complete basic syntax course', completed: true },
                { id: '2-2', title: 'Build simple projects', completed: false },
                { id: '2-3', title: 'Learn data analysis libraries', completed: false }
            ]
        },
        {
            id: '3',
            title: 'Improve Physical Sciences to 75%',
            description: 'Focus on chemistry concepts and practical applications',
            type: 'academic',
            subject: 'Physical Sciences',
            targetScore: 75,
            currentScore: 65,
            deadline: '2024-03-01',
            priority: 'high',
            progress: 45,
            createdAt: '2024-01-10',
            completed: false
        },
        {
            id: '4',
            title: 'Complete All Assignments on Time',
            description: 'Maintain consistent assignment submission without delays',
            type: 'personal',
            deadline: '2024-02-28',
            priority: 'medium',
            progress: 80,
            createdAt: '2024-01-05',
            completed: false
        }
    ])

    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
    const [newGoal, setNewGoal] = useState<Partial<Goal>>({
        title: '',
        description: '',
        type: 'academic',
        subject: '',
        targetScore: 0,
        currentScore: 0,
        deadline: '',
        priority: 'medium',
        progress: 0,
        steps: []
    })

    // Add this function to navigate to goal edit page
    const handleEditGoal = (goalId: string) => {
        router.push(`/goals/${goalId}`)
    }

    const handleCreateGoal = () => {
        if (!newGoal.title) return

        const goal: Goal = {
            id: Date.now().toString(),
            title: newGoal.title!,
            description: newGoal.description || '',
            type: newGoal.type || 'academic',
            subject: newGoal.subject,
            targetScore: newGoal.targetScore,
            currentScore: newGoal.currentScore,
            deadline: newGoal.deadline || new Date().toISOString().split('T')[0],
            priority: newGoal.priority || 'medium',
            progress: newGoal.progress || 0,
            createdAt: new Date().toISOString().split('T')[0],
            completed: false,
            steps: newGoal.steps || []
        }

        setGoals(prev => [goal, ...prev])
        setShowCreateModal(false)
        setNewGoal({
            title: '',
            description: '',
            type: 'academic',
            subject: '',
            targetScore: 0,
            currentScore: 0,
            deadline: '',
            priority: 'medium',
            progress: 0,
            steps: []
        })
    }

    const handleUpdateGoal = (id: string, updates: Partial<Goal>) => {
        setGoals(prev => prev.map(goal => 
            goal.id === id ? { ...goal, ...updates } : goal
        ))
    }

    const handleDeleteGoal = (id: string) => {
        setGoals(prev => prev.filter(goal => goal.id !== id))
    }

    const toggleStepCompletion = (goalId: string, stepId: string) => {
        setGoals(prev => prev.map(goal => {
            if (goal.id === goalId && goal.steps) {
                const updatedSteps = goal.steps.map(step =>
                    step.id === stepId ? { ...step, completed: !step.completed } : step
                )
                const completedSteps = updatedSteps.filter(step => step.completed).length
                const progress = goal.steps.length > 0 ? (completedSteps / goal.steps.length) * 100 : goal.progress
                
                return {
                    ...goal,
                    steps: updatedSteps,
                    progress: Math.round(progress),
                    completed: progress === 100
                }
            }
            return goal
        }))
    }

    const addStepToGoal = (goalId: string, stepTitle: string) => {
        if (!stepTitle.trim()) return
        
        setGoals(prev => prev.map(goal => {
            if (goal.id === goalId) {
                const newStep: GoalStep = {
                    id: `${goalId}-${Date.now()}`,
                    title: stepTitle,
                    completed: false
                }
                return {
                    ...goal,
                    steps: [...(goal.steps || []), newStep]
                }
            }
            return goal
        }))
    }

    const getGoalTypeIcon = (type: Goal['type']) => {
        switch (type) {
            case 'academic': return <BookOpen size={20} className="text-blue-500" />
            case 'personal': return <Target size={20} className="text-green-500" />
            case 'skill': return <Zap size={20} className="text-purple-500" />
            case 'exam': return <Award size={20} className="text-orange-500" />
            default: return <Target size={20} className="text-gray-500" />
        }
    }

    const getPriorityColor = (priority: Goal['priority']) => {
        switch (priority) {
            case 'high': return 'text-red-500 bg-red-50 border-red-200'
            case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200'
            case 'low': return 'text-green-500 bg-green-50 border-green-200'
            default: return 'text-gray-500 bg-gray-50 border-gray-200'
        }
    }

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'bg-green-500'
        if (progress >= 50) return 'bg-blue-500'
        if (progress >= 25) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    const calculateStats = () => {
        const totalGoals = goals.length
        const completedGoals = goals.filter(goal => goal.completed).length
        const averageProgress = goals.reduce((sum, goal) => sum + goal.progress, 0) / totalGoals
        const highPriorityGoals = goals.filter(goal => goal.priority === 'high').length

        return {
            totalGoals,
            completedGoals,
            averageProgress: Math.round(averageProgress),
            highPriorityGoals
        }
    }

    const stats = calculateStats()

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Goals</h1>
                    <p className="text-gray-600">Track your academic and personal goals</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Goals</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalGoals}</p>
                            </div>
                            <Target className="text-blue-500" size={24} />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.completedGoals}</p>
                            </div>
                            <CheckCircle2 className="text-green-500" size={24} />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.averageProgress}%</p>
                            </div>
                            <TrendingUp className="text-purple-500" size={24} />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">High Priority</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.highPriorityGoals}</p>
                            </div>
                            <Star className="text-red-500" size={24} />
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-4">
                        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                            All Goals
                        </button>
                        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                            Active
                        </button>
                        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                            Completed
                        </button>
                    </div>
                    
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        New Goal
                    </button>
                </div>

                {/* Goals Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {goals.map((goal) => (
                        <div key={goal.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                            {/* Goal Header */}
                            <div className="p-6 border-b">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        {getGoalTypeIcon(goal.type)}
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(goal.priority)}`}>
                                                {goal.priority} priority
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEditGoal(goal.id)}
                                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteGoal(goal.id)}
                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                
                                <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
                                
                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>Progress</span>
                                        <span>{goal.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(goal.progress)}`}
                                            style={{ width: `${goal.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Goal Details */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {goal.subject && (
                                        <div>
                                            <span className="text-gray-500">Subject:</span>
                                            <p className="font-medium">{goal.subject}</p>
                                        </div>
                                    )}
                                    {goal.targetScore && (
                                        <div>
                                            <span className="text-gray-500">Target:</span>
                                            <p className="font-medium">{goal.targetScore}%</p>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-500">Deadline:</span>
                                        <p className="font-medium">{new Date(goal.deadline).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Created:</span>
                                        <p className="font-medium">{new Date(goal.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Steps List */}
                            {goal.steps && goal.steps.length > 0 && (
                                <div className="p-6">
                                    <h4 className="font-medium text-gray-900 mb-3">Action Steps</h4>
                                    <div className="space-y-2">
                                        {goal.steps.map((step) => (
                                            <div key={step.id} className="flex items-center gap-3">
                                                <button
                                                    onClick={() => toggleStepCompletion(goal.id, step.id)}
                                                    className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-colors ${
                                                        step.completed 
                                                            ? 'bg-green-500 border-green-500 text-white' 
                                                            : 'border-gray-300 hover:border-green-500'
                                                    }`}
                                                >
                                                    {step.completed && <CheckCircle2 size={12} className="m-auto" />}
                                                </button>
                                                <span className={`text-sm ${step.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                                                    {step.title}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Add Step Input */}
                                    <div className="mt-4 flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Add a step..."
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    addStepToGoal(goal.id, e.currentTarget.value)
                                                    e.currentTarget.value = ''
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {goals.length === 0 && (
                    <div className="text-center py-12">
                        <Target size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
                        <p className="text-gray-600 mb-6">Create your first goal to start tracking your progress</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={20} />
                            Create Your First Goal
                        </button>
                    </div>
                )}
            </div>

            {/* Create Goal Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Create New Goal</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Goal Title *
                                </label>
                                <input
                                    type="text"
                                    value={newGoal.title}
                                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Achieve 85% in Mathematics"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newGoal.description}
                                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Describe your goal..."
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type
                                    </label>
                                    <select
                                        value={newGoal.type}
                                        onChange={(e) => setNewGoal(prev => ({ ...prev, type: e.target.value as Goal['type'] }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="academic">Academic</option>
                                        <option value="personal">Personal</option>
                                        <option value="skill">Skill Development</option>
                                        <option value="exam">Exam Preparation</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Priority
                                    </label>
                                    <select
                                        value={newGoal.priority}
                                        onChange={(e) => setNewGoal(prev => ({ ...prev, priority: e.target.value as Goal['priority'] }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            
                            {newGoal.type === 'academic' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        value={newGoal.subject}
                                        onChange={(e) => setNewGoal(prev => ({ ...prev, subject: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Mathematics"
                                    />
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Target Score
                                    </label>
                                    <input
                                        type="number"
                                        value={newGoal.targetScore}
                                        onChange={(e) => setNewGoal(prev => ({ ...prev, targetScore: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Score
                                    </label>
                                    <input
                                        type="number"
                                        value={newGoal.currentScore}
                                        onChange={(e) => setNewGoal(prev => ({ ...prev, currentScore: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Deadline
                                </label>
                                <input
                                    type="date"
                                    value={newGoal.deadline}
                                    onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateGoal}
                                disabled={!newGoal.title}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Create Goal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Goals