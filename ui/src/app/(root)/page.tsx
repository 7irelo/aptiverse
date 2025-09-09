import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Header/Hero Section */}
      <header className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
        {/* Optimized Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <Image
            src="/images/people.jpg"
            alt="Diverse group of students collaborating and learning together"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-purple-900/70 mix-blend-overlay"></div>
        </div>
        <div className="absolute top-1/4 left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/90 text-sm font-medium">AI-Powered Learning Platform</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
              Aptiverse
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto font-light leading-relaxed">
              The Future of <span className="text-blue-300">Intelligent Education</span> for South African Scholars
            </p>
            <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed opacity-90">
              Advanced AI analytics, personalized learning paths, and comprehensive academic support
              designed specifically for Grade 11 and 12 students achieving exceptional results.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dashboard"
                className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105"
              >
                <span className="relative z-10">Access Intelligent Platform</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"></div>
              </Link>
              <Link
                href="/demo"
                className="group border-2 border-white/30 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
              >
                <span className="flex items-center gap-2">
                  Watch Demo
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </Link>
            </div>

            {/* Stats Bar */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">98%</div>
                <div className="text-xs text-gray-300">Pass Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">15%</div>
                <div className="text-xs text-gray-300">Average Improvement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">2.5k+</div>
                <div className="text-xs text-gray-300">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">24/7</div>
                <div className="text-xs text-gray-300">AI Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </header>

      {/* Enhanced Analytics Dashboard Preview */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              Advanced Analytics Platform
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
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.trend === 'up' ? 'bg-green-100' :
                              item.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
                            }`}>
                            <svg className={`w-3 h-3 ${item.trend === 'up' ? 'text-green-600' :
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
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
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
                        <div className={`text-xs px-2 py-1 rounded ${item.confidence === 'high' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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

      {/* Advanced Features Showcase */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        <div className="absolute top-20 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              Revolutionary <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Learning Technology</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Powered by cutting-edge AI and machine learning algorithms that adapt to each student's unique learning journey
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1580894894513-541e068a3e2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="AI-powered learning analytics dashboard"
                  width={500}
                  height={350}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>

              {/* Floating Stats Cards */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-xl border border-gray-200">
                <div className="text-lg font-bold text-gray-900 mb-1">47%</div>
                <div className="text-xs text-gray-600">Faster Learning</div>
                <div className="text-xs text-green-600 font-medium">vs traditional methods</div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium mb-4">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Intelligent Adaptation
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                Dynamic Learning Paths Powered by Machine Learning
              </h3>
              <p className="text-base text-gray-600 mb-6 leading-relaxed">
                Our AI continuously analyzes 127+ data points to create perfectly tailored learning experiences that evolve with student progress.
              </p>

              <div className="space-y-3">
                {[
                  "Real-time difficulty adjustment based on performance",
                  "Personalized content recommendations",
                  "Predictive analytics for early intervention",
                  "Automated study schedule optimization"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🧠",
                title: "Cognitive Analytics",
                description: "Advanced pattern recognition identifies learning styles and optimizes teaching methods",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: "📊",
                title: "Predictive Performance",
                description: "Machine learning models forecast academic outcomes and recommend interventions",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: "🎯",
                title: "Precision Tutoring",
                description: "AI tutors provide instant, contextual help exactly when students need it most",
                color: "from-green-500 to-green-600"
              }
            ].map((feature, index) => (
              <div key={index} className="group relative bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10`}></div>
              </div>
            ))}
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
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.trend === 'up' ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                          <svg className={`w-3 h-3 ${item.trend === 'up' ? 'text-green-600' : 'text-gray-600'
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
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.status === 'completed' ? 'bg-green-100' :
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

      {/* Social Proof & Results */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <Image
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Students celebrating academic success"
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
              Proven <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Academic Excellence</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Join thousands of students who have transformed their academic journey with our intelligent platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { number: "2.1x", text: "Higher University Acceptance" },
              { number: "15%", text: "Average Grade Improvement" },
              { number: "96%", text: "Student Satisfaction Rate" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-300 text-sm">{stat.text}</div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-3xl mx-auto border border-white/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                SJ
              </div>
              <div>
                <div className="text-lg font-semibold text-white">Sarah Johnson</div>
                <div className="text-blue-300 text-sm">Grade 12 Student • 94% Average</div>
              </div>
            </div>
            <p className="text-base text-gray-200 leading-relaxed italic">
              "Aptiverse didn't just help me improve my grades—it transformed how I learn. The AI understood my strengths
              and weaknesses better than I did, and the personalized study plans helped me achieve results I never thought possible."
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
            Ready to Transform Your Academic Journey?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto leading-relaxed">
            Experience the future of education with our AI-powered platform. Join South Africa's most advanced learning ecosystem today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-base hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-white/25 hover:scale-105"
            >
              <span className="flex items-center gap-2">
                Start Learning Now
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <Link
              href="/demo"
              className="group border-2 border-white text-white px-6 py-4 rounded-xl font-semibold text-base hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              <span className="flex items-center gap-2">
                Book Personalized Demo
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </span>
            </Link>
          </div>

          <p className="text-blue-200 mt-6 text-xs">
            No credit card required • 14-day free trial • Setup in minutes
          </p>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-3 tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Aptiverse
              </h3>
              <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                Advanced educational intelligence for South Africa's future leaders and innovators.
              </p>
              <div className="flex gap-3">
                {['twitter', 'linkedin', 'instagram'].map((social) => (
                  <div key={social} className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                    <span className="text-gray-400 text-sm">ⓘ</span>
                  </div>
                ))}
              </div>
            </div>

            {[
              { title: "Platform", links: ["Features", "Pricing", "Case Studies", "API"] },
              { title: "Resources", links: ["Documentation", "Tutorials", "Blog", "Research"] },
              { title: "Company", links: ["About", "Careers", "Contact", "Partners"] }
            ].map((column, index) => (
              <div key={index}>
                <h4 className="text-base font-semibold text-white mb-3">{column.title}</h4>
                <ul className="space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 Aptiverse. Transforming education through artificial intelligence and innovation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}