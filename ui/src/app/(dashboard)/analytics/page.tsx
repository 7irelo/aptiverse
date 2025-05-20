'use client'
import {
    ArrowRight,
    BarChart3,
    BookOpen,
    Brain,
    Calendar,
    CheckCircle2,
    Clock,
    Lightbulb,
    TrendingDown,
    TrendingUp,
    Users,
    Zap,
    Send,
    ChevronDown,
    ChevronUp,
    Target,
    Award,
    Activity,
    BarChart4
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import './Analytics.css'
import subjectsData from './_data/subjectsData'

interface ChatMessage {
    text: string;
    isUser: boolean;
}

interface Topic {
    topic: string;
    score: number;
    trend: string;
}

interface Subject {
    id: string;
    name: string;
    code: string;
    color: string;
    progress: number;
    target: number;
    predictedScore: number;
    averageScore: number;
    studyHours: number;
    studyEfficiency: number;
    assignmentsCompleted: number;
    performanceTrend: string;
    topicPerformance: Topic[];
    improvementTips: string[];
    weeklyStudyHours: number[];
    attendance: {
        totalClasses: number;
        classesAttended: number;
        attendanceRate: number;
    };
    gradeDistribution: Record<string, number>;
    studyPatterns: {
        consistency: number;
        sessionLength: number;
    };
    peerComparison: {
        classAverage: number;
        percentile: number;
        ranking: number;
    };
    knowledgeGaps: Array<{
        concept: string;
        severity: string;
    }>;
    learningResources: Record<string, number>;
}

const Analytics = () => {
    const [expandedTopic, setExpandedTopic] = useState<{subjectId: string, topicIndex: number} | null>(null)
    const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({})
    const [userInput, setUserInput] = useState<{subjectId: string, topicIndex: number, text: string} | null>(null)
    const [expandedSections, setExpandedSections] = useState<{subjectId: string, section: 'topics' | 'tips' | 'analytics'}[]>([])

    const overallStats = {
        totalSubjects: subjectsData.length,
        averageProgress: Math.round(subjectsData.reduce((sum, subject) => sum + subject.progress, 0) / subjectsData.length),
        totalStudyHours: subjectsData.reduce((sum, subject) => sum + subject.studyHours, 0),
        assignmentsCompleted: subjectsData.reduce((sum, subject) => sum + subject.assignmentsCompleted, 0),
        averageEfficiency: Math.round(subjectsData.reduce((sum, subject) => sum + subject.studyEfficiency, 0) / subjectsData.length),
        averageScore: Math.round(subjectsData.reduce((sum, subject) => sum + subject.averageScore, 0) / subjectsData.length),
        totalClasses: subjectsData.reduce((sum, subject) => sum + subject.attendance.totalClasses, 0),
        classesAttended: subjectsData.reduce((sum, subject) => sum + subject.attendance.classesAttended, 0)
    }

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'improving': return <TrendingUp size={16} className="text-green-500" />
            case 'declining': return <TrendingDown size={16} className="text-red-500" />
            default: return <BarChart3 size={16} className="text-yellow-500" />
        }
    }

    const getPerformanceColor = (score: number) => {
        if (score >= 80) return 'text-green-600'
        if (score >= 70) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getPerformanceBadge = (score: number) => {
        if (score >= 80) return 'badge-excellent'
        if (score >= 70) return 'badge-good'
        return 'badge-needs-improvement'
    }

    const isSectionExpanded = (subjectId: string, section: 'topics' | 'tips' | 'analytics') => {
        return expandedSections.some(s => s.subjectId === subjectId && s.section === section)
    }

    const toggleSection = (subjectId: string, section: 'topics' | 'tips' | 'analytics') => {
        setExpandedSections(prev => {
            const isCurrentlyExpanded = prev.some(s => s.subjectId === subjectId && s.section === section)
            if (isCurrentlyExpanded) {
                return prev.filter(s => !(s.subjectId === subjectId && s.section === section))
            } else {
                return [...prev, { subjectId, section }]
            }
        })
    }

    const handleTopicClick = (subjectId: string, topicIndex: number) => {
        const key = `${subjectId}-${topicIndex}`
        
        if (expandedTopic?.subjectId === subjectId && expandedTopic?.topicIndex === topicIndex) {
            setExpandedTopic(null)
        } else {
            setExpandedTopic({ subjectId, topicIndex })
            
            if (!chatMessages[key]) {
                const subject = subjectsData.find(s => s.id === subjectId)
                const topic = subject?.topicPerformance[topicIndex]
                const initialMessages: ChatMessage[] = [
                    {
                        text: `I see you're working on ${topic?.topic}. Based on your current performance of ${topic?.score}%, here are some personalized strategies to help you improve:`,
                        isUser: false
                    },
                    {
                        text: getAIAdvice(topic?.topic || '', topic?.score || 0),
                        isUser: false
                    }
                ]
                setChatMessages(prev => ({
                    ...prev,
                    [key]: initialMessages
                }))
            }
        }
    }

    const getAIAdvice = (topic: string, score: number): string => {
        if (score >= 80) {
            return `Excellent work on ${topic}! You've mastered the fundamentals. To reach the next level:\n\n• Explore advanced applications and real-world problems\n• Try teaching the concepts to others to deepen understanding\n• Look for connections with other mathematical topics\n• Challenge yourself with competition-level problems`
        } else if (score >= 70) {
            return `Good progress on ${topic}! You're on the right track. Focus on:\n\n• Identifying specific areas where you make consistent errors\n• Practicing with timed exercises to build speed and accuracy\n• Creating summary sheets of key formulas and concepts\n• Working on application problems that combine multiple concepts`
        } else {
            return `Let's strengthen your foundation in ${topic}. Here's a step-by-step approach:\n\n• Start with basic concepts and build up gradually\n• Practice daily with focused 25-minute study sessions\n• Use visual aids and real-life examples to understand abstract concepts\n• Don't hesitate to ask for help on specific challenging areas\n• Review fundamental prerequisites that might be causing gaps`
        }
    }

    const handleSendMessage = (subjectId: string, topicIndex: number, message: string) => {
        const key = `${subjectId}-${topicIndex}`
        const newMessage: ChatMessage = { text: message, isUser: true }
        const aiResponse: ChatMessage = {
            text: "I understand you're looking for more specific guidance. For now, I recommend focusing on consistent practice and seeking help from your instructor for detailed explanations. Would you like me to suggest some practice resources?",
            isUser: false
        }

        setChatMessages(prev => ({
            ...prev,
            [key]: [...(prev[key] || []), newMessage, aiResponse]
        }))

        setUserInput(null)
    }

    const renderAdditionalAnalytics = (subject: Subject) => {
        return (
            <div className="analytics-grid">
                {/* Attendance Analytics */}
                <div className="analytics-card">
                    <h3><Calendar size={18} /> Attendance</h3>
                    <div className="progress-bar">
                        <div 
                            className="progress-fill bg-green-500" 
                            style={{ width: `${subject.attendance.attendanceRate}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                        <span>{subject.attendance.classesAttended}/{subject.attendance.totalClasses} classes</span>
                        <span className="font-semibold">{subject.attendance.attendanceRate}%</span>
                    </div>
                </div>

                {/* Grade Distribution */}
                <div className="analytics-card">
                    <h3><Award size={18} /> Grade Distribution</h3>
                    <div className="space-y-2">
                        {Object.entries(subject.gradeDistribution).map(([grade, count]) => (
                            <div key={grade} className="flex justify-between items-center">
                                <span className="text-sm font-medium">{grade}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-500 h-2 rounded-full" 
                                            style={{ width: `${(Number(count) / 10) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm w-6">{count as number}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Study Patterns */}
                <div className="analytics-card">
                    <h3><Activity size={18} /> Study Patterns</h3>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Consistency</span>
                                <span className="font-semibold">{subject.studyPatterns.consistency}%</span>
                            </div>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill bg-purple-500" 
                                    style={{ width: `${subject.studyPatterns.consistency}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Session Length</span>
                                <span className="font-semibold">{subject.studyPatterns.sessionLength}min</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Peer Comparison */}
                <div className="analytics-card">
                    <h3><Users size={18} /> Peer Comparison</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm">Your Score</span>
                            <span className="font-semibold">{subject.averageScore}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">Class Average</span>
                            <span className="text-gray-600">{subject.peerComparison.classAverage}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">Percentile</span>
                            <span className="font-semibold">{subject.peerComparison.percentile}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">Ranking</span>
                            <span className="font-semibold">#{subject.peerComparison.ranking}</span>
                        </div>
                    </div>
                </div>

                {/* Knowledge Gaps */}
                <div className="analytics-card">
                    <h3><Target size={18} /> Knowledge Gaps</h3>
                    <div className="space-y-2">
                        {subject.knowledgeGaps.map((gap, index: number) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                                <span className="text-sm font-medium">{gap.concept}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    gap.severity === 'high' ? 'bg-red-500 text-white' : 
                                    gap.severity === 'medium' ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'
                                }`}>
                                    {gap.severity}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Learning Resources Usage */}
                <div className="analytics-card">
                    <h3><BookOpen size={18} /> Resource Usage</h3>
                    <div className="space-y-3">
                        {Object.entries(subject.learningResources).map(([resource, usage]) => (
                            <div key={resource}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="capitalize">{resource.replace(/([A-Z])/g, ' $1')}</span>
                                    <span className="font-semibold">{usage as number}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill bg-indigo-500" 
                                        style={{ width: `${usage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="analytics-container">
            {/* Enhanced Header Section */}
            <div className="analytics-header">
                <div className="header-content">
                    <div className="header-text">
                        <h1 className="page-title">Academic Analytics Dashboard</h1>
                        <p className="page-subtitle">
                            Comprehensive performance insights, predictive analytics, and personalized improvement strategies
                        </p>
                    </div>
                </div>
                <div className="header-stats">
                    <div className="stat-card">
                        <BookOpen className="text-blue-600" size={24} />
                        <div>
                            <span className="stat-value">{overallStats.totalSubjects}</span>
                            <span className="stat-label">Total Subjects</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <TrendingUp className="text-green-600" size={24} />
                        <div>
                            <span className="stat-value">{overallStats.averageProgress}%</span>
                            <span className="stat-label">Average Progress</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <Zap className="text-purple-600" size={24} />
                        <div>
                            <span className="stat-value">{overallStats.averageEfficiency}%</span>
                            <span className="stat-label">Study Efficiency</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <Award className="text-amber-600" size={24} />
                        <div>
                            <span className="stat-value">{overallStats.averageScore}%</span>
                            <span className="stat-label">Average Score</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <Clock className="text-cyan-600" size={24} />
                        <div>
                            <span className="stat-value">{overallStats.totalStudyHours}</span>
                            <span className="stat-label">Study Hours</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <Users className="text-emerald-600" size={24} />
                        <div>
                            <span className="stat-value">{overallStats.classesAttended}</span>
                            <span className="stat-label">Classes Attended</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Subjects List */}
            <div className="subjects-list">
                {(subjectsData as Subject[]).map((subject) => {
                    const isTopicsExpanded = isSectionExpanded(subject.id, 'topics')
                    const isTipsExpanded = isSectionExpanded(subject.id, 'tips')
                    const isAnalyticsExpanded = isSectionExpanded(subject.id, 'analytics')
                    
                    return (
                        <div key={subject.id} className="subject-card">
                            {/* Enhanced Subject Header */}
                            <div className="subject-header">
                                <div className="subject-icon">
                                    <div className={`subject-badge ${subject.color}`}>
                                        <BookOpen size={24} className="text-white" />
                                    </div>
                                    <div className="subject-info">
                                        <h3 className="subject-name">{subject.name}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="subject-code">{subject.code}</span>
                                            <span className={`performance-badge ${getPerformanceBadge(subject.averageScore)}`}>
                                                {subject.averageScore >= 80 ? 'Excellent' : subject.averageScore >= 70 ? 'Good' : 'Needs Improvement'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="subject-trend">
                                    {getTrendIcon(subject.performanceTrend)}
                                    <span className={`trend-text ${subject.performanceTrend}`}>
                                        {subject.performanceTrend}
                                    </span>
                                </div>
                            </div>

                            {/* Enhanced Progress Section */}
                            <div className="progress-section">
                                <div className="progress-header">
                                    <span className="progress-label">Overall Progress & Performance</span>
                                    <span className="progress-value">{subject.progress}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className={`progress-fill ${subject.color}`}
                                        style={{ width: `${subject.progress}%` }}
                                    ></div>
                                </div>
                                <div className="progress-target">
                                    Target: {subject.target}% • Predicted: {subject.predictedScore}% • Current: {subject.averageScore}%
                                </div>
                            </div>

                            {/* Enhanced Charts Section */}
                            <div className="charts-section">
                                <div className="chart-row">
                                    <div className="mini-chart">
                                        <div className="chart-title">Weekly Study Hours Distribution</div>
                                        <div className="bar-chart">
                                            {subject.weeklyStudyHours.map((hours, index) => (
                                                <div key={index} className="bar-container">
                                                    <div
                                                        className={`bar ${subject.color}`}
                                                        style={{ height: `${(hours / 6) * 60}px` }}
                                                    ></div>
                                                    <span className="bar-label">{hours}h</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="efficiency-score">
                                        <div className="efficiency-label">Study Efficiency Score</div>
                                        <div className="efficiency-circle">
                                            <div className="efficiency-value">{subject.studyEfficiency}%</div>
                                            <svg className="efficiency-ring" width="80" height="80">
                                                <circle
                                                    className="efficiency-ring-bg"
                                                    cx="40"
                                                    cy="40"
                                                    r="35"
                                                    strokeWidth="4"
                                                />
                                                <circle
                                                    className={`efficiency-ring-fill ${subject.color.replace('bg-', 'stroke-')}`}
                                                    cx="40"
                                                    cy="40"
                                                    r="35"
                                                    strokeWidth="4"
                                                    strokeDasharray={`${(subject.studyEfficiency / 100) * 220} 220`}
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Analytics Section */}
                            <div className="topics-section">
                                <div 
                                    className="section-header"
                                    onClick={() => toggleSection(subject.id, 'analytics')}
                                >
                                    <h4 className="section-title">
                                        <BarChart4 size={18} />
                                        Detailed Analytics
                                    </h4>
                                    <div className="section-toggle">
                                        {isAnalyticsExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>
                                {isAnalyticsExpanded && renderAdditionalAnalytics(subject)}
                            </div>

                            {/* Topic Performance - Enhanced */}
                            <div className="topics-section">
                                <div 
                                    className="section-header"
                                    onClick={() => toggleSection(subject.id, 'topics')}
                                >
                                    <h4 className="section-title">
                                        <Lightbulb size={18} />
                                        Topic Performance Analysis
                                    </h4>
                                    <div className="section-toggle">
                                        {isTopicsExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>
                                {isTopicsExpanded && (
                                    <div className="topics-list">
                                        {subject.topicPerformance.map((topic, index) => {
                                            const isExpanded = expandedTopic?.subjectId === subject.id && expandedTopic?.topicIndex === index
                                            const chatKey = `${subject.id}-${index}`
                                            const currentChatMessages = chatMessages[chatKey] || []
                                            
                                            return (
                                                <div key={index} className="topic-container">
                                                    <div 
                                                        className={`topic-item ${isExpanded ? 'expanded' : ''}`}
                                                        onClick={() => handleTopicClick(subject.id, index)}
                                                    >
                                                        <div className="topic-main">
                                                            <span className="topic-name">{topic.topic}</span>
                                                            <div className="topic-score">
                                                                <span className={`score ${getPerformanceColor(topic.score)} ${getPerformanceBadge(topic.score)}`}>
                                                                    {topic.score}%
                                                                </span>
                                                                {topic.trend === 'up' && <TrendingUp size={14} className="text-green-500" />}
                                                                {topic.trend === 'down' && <TrendingDown size={14} className="text-red-500" />}
                                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Enhanced Chat Section */}
                                                    {isExpanded && (
                                                        <div className="topic-chat-expansion">
                                                            <div className="chat-header">
                                                                <Brain size={18} />
                                                                <span>AI Study Assistant - {topic.topic}</span>
                                                            </div>
                                                            <div className="chat-messages">
                                                                {currentChatMessages.map((message: ChatMessage, msgIndex: number) => (
                                                                    <div 
                                                                        key={msgIndex} 
                                                                        className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}
                                                                    >
                                                                        {message.text.split('\n').map((line: string, lineIndex: number) => (
                                                                            <p key={lineIndex}>{line}</p>
                                                                        ))}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="chat-input-container">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Ask for specific advice or clarification..."
                                                                    className="chat-input"
                                                                    value={userInput?.subjectId === subject.id && userInput?.topicIndex === index ? userInput.text : ''}
                                                                    onChange={(e) => setUserInput({
                                                                        subjectId: subject.id,
                                                                        topicIndex: index,
                                                                        text: e.target.value
                                                                    })}
                                                                    onKeyPress={(e) => {
                                                                        if (e.key === 'Enter' && userInput?.text.trim()) {
                                                                            handleSendMessage(subject.id, index, userInput.text)
                                                                        }
                                                                    }}
                                                                />
                                                                <button 
                                                                    className="send-button"
                                                                    onClick={() => userInput?.text.trim() && handleSendMessage(subject.id, index, userInput.text)}
                                                                    disabled={!userInput?.text.trim()}
                                                                >
                                                                    <Send size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Enhanced Improvement Tips */}
                            <div className="tips-section">
                                <div 
                                    className="section-header"
                                    onClick={() => toggleSection(subject.id, 'tips')}
                                >
                                    <h4 className="section-title">
                                        <Lightbulb size={18} />
                                        Personalized Improvement Strategies
                                    </h4>
                                    <div className="section-toggle">
                                        {isTipsExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>
                                {isTipsExpanded && (
                                    <div className="tips-list">
                                        {subject.improvementTips.map((tip: string, index: number) => (
                                            <div key={index} className="tip-item">
                                                <CheckCircle2 size={16} className="text-green-500" />
                                                <span className="tip-text">{tip}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Enhanced Action Buttons */}
                            <div className="action-section">
                                <Link
                                    href={`/subjects/${subject.id}`}
                                    className="view-details-btn"
                                >
                                    View Comprehensive Analytics
                                    <ArrowRight size={18} />
                                </Link>
                                <button className="study-plan-btn">
                                    <Brain size={18} />
                                    Generate Smart Study Plan
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Analytics