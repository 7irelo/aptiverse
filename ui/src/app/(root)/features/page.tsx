"use client"
import React from 'react'
import { 
  Brain, 
  BarChart3, 
  Target, 
  Users, 
  Clock, 
  Shield, 
  Zap, 
  BookOpen, 
  TrendingUp,
  Smartphone,
  Globe,
  Award,
  Heart
} from 'lucide-react'
import Link from 'next/link'

const Features = () => {
  const mainFeatures = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Advanced machine learning algorithms adapt to each student's learning style and pace",
      features: ["Personalized learning paths", "Real-time difficulty adjustment", "Intelligent content recommendations"],
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive performance tracking with actionable insights for students and educators",
      features: ["Real-time progress monitoring", "Predictive performance analysis", "Detailed learning analytics"],
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      icon: Target,
      title: "Goal-Oriented Learning",
      description: "Set, track, and achieve academic goals with personalized milestone planning",
      features: ["Custom goal setting", "Progress tracking", "Milestone celebrations"],
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    }
  ]

  const featureGrid = [
    {
      icon: Users,
      title: "Collaborative Learning",
      description: "Connect with peers and educators in a supportive learning community",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      icon: Clock,
      title: "24/7 AI Tutoring",
      description: "Instant help and explanations available anytime, anywhere",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: Shield,
      title: "Safe Learning Environment",
      description: "Secure platform with privacy-focused design for all users",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Zap,
      title: "Instant Feedback",
      description: "Real-time assessment and constructive feedback on all assignments",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      icon: BookOpen,
      title: "Curriculum Aligned",
      description: "Content perfectly aligned with South African CAPS curriculum",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Visual progress reports and improvement metrics",
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Seamless learning experience across all devices",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Globe,
      title: "Offline Access",
      description: "Download materials and continue learning without internet",
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    },
    {
      icon: Award,
      title: "Achievement System",
      description: "Gamified learning with badges and rewards for milestones",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      icon: Heart,
      title: "Wellness Support",
      description: "Mental health and wellness resources integrated into learning",
      color: "text-rose-600",
      bgColor: "bg-rose-50"
    }
  ]

  const stats = [
    { number: "98%", label: "Student Satisfaction" },
    { number: "47%", label: "Faster Learning" },
    { number: "2.1x", label: "Better Results" },
    { number: "24/7", label: "AI Support" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/90 text-sm font-medium">Platform Features</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Powerful Features for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Exceptional Learning</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover how our AI-powered platform transforms traditional education into personalized, 
              engaging, and effective learning experiences for South African students.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/login" 
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/25 hover:scale-105"
              >
                Start Learning Today
              </Link>
              <Link 
                href="/demo" 
                className="border-2 border-white text-white px-6 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                Watch Feature Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="relative -mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 text-center">
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Learning Technologies</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Powered by cutting-edge AI and educational research to deliver unprecedented learning outcomes
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="group relative">
                  <div className={`relative bg-white rounded-3xl p-8 shadow-xl border ${feature.borderColor} hover:shadow-2xl transition-all duration-500 hover:-translate-y-2`}>
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={28} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                    
                    <ul className="space-y-3">
                      {feature.features.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center gap-3 text-sm text-gray-700">
                          <div className={`w-2 h-2 bg-gradient-to-r ${feature.color} rounded-full`}></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                    
                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10`}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Analytics Dashboard Preview */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <BarChart3 size={16} />
              Live Analytics Dashboard
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              Real-Time <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Performance Intelligence</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Comprehensive analytics and insights that transform raw data into actionable educational strategies
            </p>
          </div>

          {/* Main Analytics Dashboard */}
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-12">
            {/* Dashboard Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white/80 text-sm font-medium">Student Performance Dashboard</span>
                </div>
                <div className="text-white/60 text-xs">Live Data • Updated just now</div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Key Metrics Overview */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Weekly Performance</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-gray-900">4.2h</div>
                      <div className="text-xs text-gray-600">Study Time</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-gray-900">87%</div>
                      <div className="text-xs text-gray-600">Efficiency</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-gray-900">12</div>
                      <div className="text-xs text-gray-600">Topics</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-gray-900">94%</div>
                      <div className="text-xs text-gray-600">Accuracy</div>
                    </div>
                  </div>
                </div>

                {/* Progress Chart */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100 lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Learning Progress Trend</h3>
                    <span className="text-xs text-green-600 font-medium">+12% this month</span>
                  </div>
                  <div className="h-32 bg-white/50 rounded-lg p-3">
                    {/* Enhanced Progress Chart */}
                    <div className="flex items-end justify-between h-20">
                      {[65, 78, 82, 75, 88, 92, 85, 89, 93, 96, 94, 98].map((value, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="w-3 bg-gradient-to-t from-purple-500 to-purple-600 rounded-t transition-all duration-500 hover:from-purple-400 hover:to-purple-500 relative group"
                            style={{ height: `${value}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {value}%
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">W{index + 1}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subject Performance */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Subject Mastery</h3>
                  <div className="space-y-4">
                    {[
                      { subject: 'Mathematics', progress: 85, trend: 'up', color: 'bg-blue-500' },
                      { subject: 'Physical Sciences', progress: 78, trend: 'up', color: 'bg-purple-500' },
                      { subject: 'English', progress: 92, trend: 'stable', color: 'bg-green-500' },
                      { subject: 'Life Sciences', progress: 74, trend: 'down', color: 'bg-pink-500' },
                      { subject: 'Accounting', progress: 81, trend: 'up', color: 'bg-orange-500' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700 w-24">{item.subject}</span>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            item.trend === 'up' ? 'bg-green-100' : 
                            item.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                            <svg className={`w-3 h-3 ${
                              item.trend === 'up' ? 'text-green-600' : 
                              item.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {item.trend === 'up' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              ) : item.trend === 'down' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                              )}
                            </svg>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full">
                            <div 
                              className={`h-2 rounded-full ${item.color} transition-all duration-1000`}
                              style={{ width: `${item.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-gray-900 w-8">{item.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Insights & Recommendations */}
                <div className="space-y-6">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <div className="text-lg font-bold text-gray-900 mb-1">3.8</div>
                      <div className="text-xs text-gray-600">Avg. GPA</div>
                      <div className="text-xs text-green-600 font-medium mt-1">↑ 0.3 this term</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <div className="text-lg font-bold text-gray-900 mb-1">94%</div>
                      <div className="text-xs text-gray-600">Attendance</div>
                      <div className="text-xs text-green-600 font-medium mt-1">Perfect this month</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <div className="text-lg font-bold text-gray-900 mb-1">18</div>
                      <div className="text-xs text-gray-600">Assignments</div>
                      <div className="text-xs text-blue-600 font-medium mt-1">2 due soon</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <div className="text-lg font-bold text-gray-900 mb-1">A</div>
                      <div className="text-xs text-gray-600">Current Grade</div>
                      <div className="text-xs text-green-600 font-medium mt-1">Target achieved</div>
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                        <Brain size={14} className="text-white" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">AI Learning Insights</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <p className="text-xs text-gray-700">Strong performance in algebra, consider advancing to calculus</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <p className="text-xs text-gray-700">Physics concepts need reinforcement, schedule practice session</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <p className="text-xs text-gray-700">Study patterns show optimal learning between 14:00-17:00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Dashboard Screenshots */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Study Habits Analytics */}
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white/80 text-sm font-medium">Study Habits Analytics</span>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Weekly Study Distribution</h4>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <span>Subjects</span>
                    <span>Hours</span>
                  </div>
                  {[
                    { subject: 'Mathematics', hours: 8.5, color: 'bg-blue-500', percentage: 35 },
                    { subject: 'Sciences', hours: 6.2, color: 'bg-purple-500', percentage: 25 },
                    { subject: 'Languages', hours: 4.8, color: 'bg-green-500', percentage: 20 },
                    { subject: 'Other', hours: 4.5, color: 'bg-gray-400', percentage: 19 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-700 w-20">{item.subject}</span>
                      <div className="flex-1 mx-2">
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${item.color} transition-all duration-1000`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-900 w-8">{item.hours}h</span>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Peak Performance Hours</h4>
                  <div className="flex justify-between items-end h-16">
                    {[
                      { hour: '08', value: 30 },
                      { hour: '10', value: 45 },
                      { hour: '12', value: 60 },
                      { hour: '14', value: 85 },
                      { hour: '16', value: 95 },
                      { hour: '18', value: 75 },
                      { hour: '20', value: 55 }
                    ].map((item, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="w-4 bg-gradient-to-t from-green-500 to-green-600 rounded-t"
                          style={{ height: `${item.value}%` }}
                        ></div>
                        <span className="text-xs text-gray-600 mt-1">{item.hour}:00</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Predictive Analytics */}
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white/80 text-sm font-medium">Predictive Performance</span>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Final Exam Predictions</h4>
                  <div className="space-y-3">
                    {[
                      { subject: 'Mathematics', current: 85, predicted: 92, confidence: 'high' },
                      { subject: 'Physics', current: 78, predicted: 85, confidence: 'medium' },
                      { subject: 'English', current: 92, predicted: 94, confidence: 'high' },
                      { subject: 'Life Sciences', current: 74, predicted: 82, confidence: 'medium' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700 w-20">{item.subject}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{item.current}%</span>
                          <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <span className="text-xs font-semibold text-gray-900">{item.predicted}%</span>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ${
                          item.confidence === 'high' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.confidence}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Intervention Recommendations</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-xs text-gray-700">Schedule extra physics practice sessions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-xs text-gray-700">Review calculus fundamentals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-gray-700">Maintain current English study routine</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Features Grid */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Learning Ecosystem</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Everything students need to succeed, all in one intelligent platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {featureGrid.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="group">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
                    <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={24} className={feature.color} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">{feature.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Additional Analytics Dashboard - Progress Tracking */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              Comprehensive <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Progress Tracking</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Monitor every aspect of student development with detailed analytics and progress metrics
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Skills Development Dashboard */}
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-800 to-blue-700 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white/80 text-sm font-medium">Skills Development Matrix</span>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[
                    { skill: 'Problem Solving', level: 85, trend: 'up' },
                    { skill: 'Critical Thinking', level: 78, trend: 'up' },
                    { skill: 'Time Management', level: 92, trend: 'stable' },
                    { skill: 'Research Skills', level: 74, trend: 'up' }
                  ].map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-gray-700">{item.skill}</span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          item.trend === 'up' ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <svg className={`w-3 h-3 ${
                            item.trend === 'up' ? 'text-green-600' : 'text-gray-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {item.trend === 'up' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                            )}
                          </svg>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-900">{item.level}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000"
                          style={{ width: `${item.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-100">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Recommended Skill Development</h4>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Critical Thinking</span>
                    <span className="text-blue-600 font-medium">+3 sessions this week</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Milestones */}
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-800 to-purple-700 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white/80 text-sm font-medium">Learning Milestones</span>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {[
                    { milestone: 'Algebra Mastery', status: 'completed', date: '2 days ago', points: 50 },
                    { milestone: 'Physics Fundamentals', status: 'completed', date: '1 week ago', points: 75 },
                    { milestone: 'Calculus Introduction', status: 'in-progress', date: 'Due in 3 days', points: 25 },
                    { milestone: 'Advanced Writing', status: 'pending', date: 'Starts next week', points: 0 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          item.status === 'completed' ? 'bg-green-100' : 
                          item.status === 'in-progress' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {item.status === 'completed' ? (
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : item.status === 'in-progress' ? (
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                          ) : (
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.milestone}</div>
                          <div className="text-xs text-gray-500">{item.date}</div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{item.points} pts</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI-Powered Learning Deep Dive */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Brain size={16} />
                Intelligent Learning Engine
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                How Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">AI Technology</span> Works
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Continuous Assessment</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Our AI analyzes 127+ data points including response time, accuracy patterns, and learning preferences to understand each student's unique needs.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Personalized Adaptation</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Learning content and difficulty automatically adjust in real-time based on performance, ensuring optimal challenge and engagement.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Predictive Analytics</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Machine learning models forecast future performance and identify potential challenges before they impact learning outcomes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-8 text-white">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold mb-4">AI Learning Insights</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm">Optimal learning time detected: 14:00-17:00</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <span className="text-sm">Algebra concepts mastered ahead of schedule</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <span className="text-sm">Physics practice session recommended</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold">85%</div>
                    <div className="text-xs opacity-80">Mastery Level</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold">12%</div>
                    <div className="text-xs opacity-80">Progress This Week</div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
              Transformative <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Learning Benefits</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "For Students",
                benefits: [
                  "Personalized learning experience",
                  "24/7 AI tutoring support",
                  "Engaging, gamified content",
                  "Real-time progress tracking"
                ]
              },
              {
                title: "For Educators",
                benefits: [
                  "Automated assessment grading",
                  "Detailed analytics dashboard",
                  "Early intervention alerts",
                  "Curriculum planning tools"
                ]
              },
              {
                title: "For Parents",
                benefits: [
                  "Progress monitoring access",
                  "Regular achievement reports",
                  "Wellbeing tracking",
                  "Direct communication channels"
                ]
              }
            ].map((group, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="text-xl font-bold mb-6 text-center">{group.title}</h3>
                <ul className="space-y-4">
                  {group.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                      <span className="text-blue-100">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
            Ready to Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Intelligent Learning?</span>
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of South African students who are achieving exceptional results with our AI-powered platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/login" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
            >
              Schedule Demo
            </Link>
          </div>
          
          <p className="text-gray-500 mt-6 text-sm">
            No credit card required • 14-day free trial • Setup in 5 minutes
          </p>
        </div>
      </section>
    </div>
  )
}

export default Features