import Image from "next/image";
import Link from "next/link";

export default function Demo() {
  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Header/Hero Section */}
      <header className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
        {/* Optimized Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <Image
            src="/images/demo-hero.jpg"
            alt="Aptiverse platform demonstration interface"
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
              <span className="text-white/90 text-sm font-medium">Interactive Platform Demo</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
              Experience Aptiverse
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto font-light leading-relaxed">
              See How <span className="text-blue-300">AI-Powered Education</span> Transforms Learning
            </p>
            <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed opacity-90">
              Get hands-on with our interactive demo and discover how our intelligent platform 
              personalizes learning for every South African student.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/login"
                className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105"
              >
                <span className="relative z-10">Start Free Trial</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"></div>
              </Link>
              <a
                href="#live-demo"
                className="group border-2 border-white/30 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
              >
                <span className="flex items-center gap-2">
                  Explore Demo
                  <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Features Overview */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              What You'll <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Experience</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Explore the key features that make Aptiverse the most advanced learning platform in South Africa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: "🎯",
                title: "Personalized Learning",
                description: "AI-driven adaptive learning paths tailored to each student's unique needs and pace"
              },
              {
                icon: "📊",
                title: "Real-time Analytics",
                description: "Comprehensive performance tracking with actionable insights and recommendations"
              },
              {
                icon: "🤖",
                title: "AI Tutor Support",
                description: "24/7 intelligent tutoring with instant feedback and step-by-step guidance"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="live-demo" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              Interactive <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Platform Demo</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Experience firsthand how our platform adapts to different learning scenarios
            </p>
          </div>

          {/* Demo Tabs */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white/80 text-sm font-medium">Interactive Demo - Choose Your Scenario</span>
                </div>
                <div className="text-white/60 text-xs">Live Preview • Interactive</div>
              </div>
            </div>

            <div className="p-6">
              {/* Scenario Selector */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {[
                  {
                    title: "Struggling Student",
                    description: "See how we identify and address learning gaps",
                    icon: "📚",
                    active: true
                  },
                  {
                    title: "Average Performer",
                    description: "Watch personalized improvement plans in action",
                    icon: "📈",
                    active: false
                  },
                  {
                    title: "High Achiever",
                    description: "Explore advanced challenges and enrichment",
                    icon: "⭐",
                    active: false
                  }
                ].map((scenario, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      scenario.active 
                        ? 'border-blue-500 bg-blue-50 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{scenario.icon}</span>
                      <h3 className="font-semibold text-gray-900">{scenario.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{scenario.description}</p>
                  </div>
                ))}
              </div>

              {/* Demo Content */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Student Profile */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Profile</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Current Grade</span>
                        <span className="font-semibold text-gray-900">Grade 11</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Starting Average</span>
                        <span className="font-semibold text-gray-900">68%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Target Average</span>
                        <span className="font-semibold text-green-600">85%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Learning Style</span>
                        <span className="font-semibold text-gray-900">Visual + Kinesthetic</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
                    <div className="space-y-3">
                      {[
                        "Focus on algebraic foundations - 3 practice sessions recommended",
                        "Physics concept reinforcement through interactive simulations",
                        "Extended reading comprehension exercises",
                        "Time management skill development"
                      ].map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-700">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Progress Preview */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Simulation</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Mathematics Progress</span>
                          <span>65% → 82%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-2000"
                            style={{ width: '82%' }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Physics Progress</span>
                          <span>58% → 76%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-2000"
                            style={{ width: '76%' }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Overall Average</span>
                          <span>68% → 79%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-2000"
                            style={{ width: '79%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Study Plan */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Study Plan</h3>
                    <div className="space-y-3">
                      {[
                        { day: "Monday", subjects: "Math (Algebra)", duration: "90min" },
                        { day: "Tuesday", subjects: "Physics + English", duration: "120min" },
                        { day: "Wednesday", subjects: "Math (Calculus)", duration: "90min" },
                        { day: "Thursday", subjects: "Revision + Practice", duration: "60min" },
                        { day: "Friday", subjects: "Assessment + Review", duration: "75min" }
                      ].map((day, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{day.day}</div>
                            <div className="text-sm text-gray-600">{day.subjects}</div>
                          </div>
                          <div className="text-sm font-semibold text-blue-600">{day.duration}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Tutor Demo */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              Meet Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">AI Tutor</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Experience real-time, intelligent tutoring that adapts to your learning needs
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">🤖</span>
                  </div>
                  <span className="text-white font-medium">Aptiverse AI Tutor</span>
                </div>
                <div className="text-white/80 text-sm">Online • Ready to help</div>
              </div>
            </div>

            <div className="p-6">
              {/* Chat Interface */}
              <div className="h-96 overflow-y-auto mb-4 space-y-4">
                {/* AI Message */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">AI</span>
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                    <p className="text-gray-800">
                      Hi there! I noticed you're working on quadratic equations. Would you like me to explain 
                      the factoring method, or would you prefer to try solving a practice problem together?
                    </p>
                  </div>
                </div>

                {/* User Message */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-blue-500 rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%]">
                    <p className="text-white">
                      I'm struggling with factoring when the coefficient isn't 1. Can you help?
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">Y</span>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">AI</span>
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                    <p className="text-gray-800 mb-3">
                      Absolutely! Let's work through this step by step. Consider the equation: 
                      <strong> 2x² + 7x + 3 = 0</strong>
                    </p>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-sm text-gray-700 font-mono">
                        Step 1: Multiply a and c → 2 × 3 = 6<br/>
                        Step 2: Find factors of 6 that add to 7 → 6 and 1<br/>
                        Step 3: Rewrite middle term → 2x² + 6x + x + 3<br/>
                        Step 4: Factor by grouping → 2x(x + 3) + 1(x + 3)<br/>
                        Step 5: Final factors → (2x + 1)(x + 3)
                      </p>
                    </div>
                    <p className="text-gray-800 mt-3">
                      Would you like to try another example, or should I explain any step in more detail?
                    </p>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Ask your question about quadratic equations..."
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Learning Ecosystem</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                📚 Comprehensive Curriculum
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                All Subjects Covered
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                From Mathematics and Physical Sciences to Languages and Accounting, 
                our platform provides complete coverage of the South African CAPS curriculum 
                for Grades 11 and 12.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  "Mathematics",
                  "Physical Sciences",
                  "Life Sciences",
                  "Accounting",
                  "English HL/FAL",
                  "Geography",
                  "History",
                  "Business Studies"
                ].map((subject, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{subject}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-1 shadow-xl">
                <div className="bg-white rounded-xl p-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: "Math", progress: 85, color: "bg-blue-500" },
                      { name: "Physics", progress: 78, color: "bg-purple-500" },
                      { name: "English", progress: 92, color: "bg-green-500" },
                      { name: "Accounting", progress: 81, color: "bg-orange-500" },
                      { name: "Life Sci", progress: 74, color: "bg-pink-500" },
                      { name: "Geography", progress: 88, color: "bg-indigo-500" }
                    ].map((subject, index) => (
                      <div key={index} className="text-center">
                        <div className="relative mb-2">
                          <div className="w-16 h-16 mx-auto">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                              <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#E5E7EB"
                                strokeWidth="3"
                              />
                              <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={subject.color.replace('bg-', '').split('-')[0]}
                                strokeWidth="3"
                                strokeDasharray={`${subject.progress}, 100`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-900">{subject.progress}%</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-600">{subject.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Demo CTA */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
            Ready to See the Full Platform?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed">
            Experience the complete Aptiverse platform with all features unlocked. 
            See how our AI can transform learning outcomes for your students.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105"
            >
              <span className="flex items-center gap-2">
                Start Free Trial
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <button className="group border-2 border-white text-white px-6 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
              <span className="flex items-center gap-2">
                Schedule Live Demo
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
            </button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-6 text-center">
            {[
              { number: "14", text: "Days Free Trial" },
              { number: "100%", text: "Full Access" },
              { number: "0", text: "Credit Card Required" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{item.number}</div>
                <div className="text-gray-400 text-sm">{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4 tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Aptiverse
              </h3>
              <p className="text-gray-400 mb-4 text-sm">
                Transforming education through artificial intelligence and personalized learning.
              </p>
            </div>
            
            {[
              {
                title: "Platform",
                links: ["Features", "Demo", "Pricing", "Subjects"]
              },
              {
                title: "Resources", 
                links: ["Blog", "Tutorials", "Webinars", "Research"]
              },
              {
                title: "Support",
                links: ["Help Center", "Contact", "Training", "Community"]
              }
            ].map((column, index) => (
              <div key={index}>
                <h4 className="text-base font-semibold text-white mb-4">{column.title}</h4>
                <ul className="space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 Aptiverse. Revolutionizing education in South Africa.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}