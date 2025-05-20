import React from 'react'
import { 
  Target, 
  Users, 
  Award, 
  Heart, 
  Globe, 
  Zap, 
  BookOpen, 
  TrendingUp,
  Shield,
  Star,
  GraduationCap,
  Lightbulb,
  Rocket
} from 'lucide-react'
import Link from 'next/link'

const Page = () => {
  const values = [
    {
      icon: Target,
      title: "Excellence",
      description: "We strive for academic excellence and continuous improvement in everything we do.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Heart,
      title: "Empowerment",
      description: "We empower students to take control of their learning journey and achieve their full potential.",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Users,
      title: "Community",
      description: "We believe in the power of collaborative learning and supportive educational communities.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We continuously innovate to provide cutting-edge educational technology solutions.",
      color: "from-purple-500 to-indigo-500"
    }
  ]

  const team = [
    {
      name: "Dr. Sarah Chen",
      role: "Chief Education Officer",
      bio: "Former university professor with 15+ years in educational technology and curriculum development.",
      expertise: ["Educational Psychology", "Curriculum Design", "AI in Education"]
    },
    {
      name: "Michael Rodriguez",
      role: "Head of AI Research",
      bio: "Machine learning expert focused on adaptive learning systems and predictive analytics.",
      expertise: ["Machine Learning", "Data Science", "Learning Analytics"]
    },
    {
      name: "Dr. Amanda Bester",
      role: "Curriculum Director",
      bio: "Specialist in South African CAPS curriculum with extensive classroom experience.",
      expertise: ["CAPS Curriculum", "Assessment Design", "Teacher Training"]
    },
    {
      name: "James Khoza",
      role: "Student Success Lead",
      bio: "Dedicated to ensuring every student receives personalized support and achieves their goals.",
      expertise: ["Student Mentoring", "Academic Support", "Progress Monitoring"]
    }
  ]

  const milestones = [
    {
      year: "2022",
      title: "Platform Foundation",
      description: "Initial research and development of AI learning algorithms",
      icon: Rocket
    },
    {
      year: "2023",
      title: "Beta Launch",
      description: "Successful pilot program with 500 South African students",
      icon: GraduationCap
    },
    {
      year: "2024",
      title: "National Expansion",
      description: "Platform launch across all South African provinces",
      icon: Globe
    },
    {
      year: "2025",
      title: "Future Vision",
      description: "Expanding to other African nations and new subject areas",
      icon: TrendingUp
    }
  ]

  const impactStats = [
    { number: "2,500+", label: "Students Empowered" },
    { number: "98%", label: "Pass Rate" },
    { number: "15%", label: "Average Improvement" },
    { number: "47%", label: "Faster Learning" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/90 text-sm font-medium">Our Story</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Transforming Education Through <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Artificial Intelligence</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              Aptiverse was born from a simple yet powerful vision: to make exceptional education accessible 
              to every South African student through cutting-edge AI technology and personalized learning experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/contact" 
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/25 hover:scale-105"
              >
                Join Our Mission
              </Link>
              <Link 
                href="/team" 
                className="border-2 border-white text-white px-6 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                Meet Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Target size={16} />
                Our Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                Empowering the Next Generation of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">African Leaders</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We believe that every student deserves access to quality education tailored to their unique 
                learning style, pace, and aspirations. Our mission is to bridge educational gaps and unlock 
                the full potential of South African youth through intelligent technology.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                By combining advanced AI with deep educational expertise, we're creating learning experiences 
                that are not only effective but also engaging, empowering, and transformative.
              </p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Personalized Learning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">AI-Powered Insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Proven Results</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 text-white">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Lightbulb size={24} />
                    Our Vision
                  </h3>
                  <p className="text-blue-100 leading-relaxed">
                    To become Africa's leading educational technology platform, transforming how students learn 
                    and educators teach through innovative AI solutions that make exceptional education accessible to all.
                  </p>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">2025</div>
                    <div className="text-xs opacity-80">Reach Goal</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">50k+</div>
                    <div className="text-xs opacity-80">Students</div>
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

      {/* Impact Stats */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {impactStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Core Values</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              These principles guide everything we do and shape the future of education we're building together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className="group text-center">
                  <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center text-white mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={28} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                    
                    <div className={`absolute inset-0 bg-gradient-to-r ${value.color} rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10`}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Our Story Timeline */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Journey</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              From a bold idea to a transformative educational platform making real impact across South Africa.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => {
                const Icon = milestone.icon
                const isEven = index % 2 === 0
                
                return (
                  <div key={index} className={`relative flex items-center ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                    {/* Content */}
                    <div className={`w-1/2 ${isEven ? 'pr-8 text-right' : 'pl-8'}`}>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Icon size={20} className="text-white" />
                          </div>
                          <div>
                            <div className="text-sm text-blue-300 font-medium">{milestone.year}</div>
                            <h3 className="text-lg font-bold text-white">{milestone.title}</h3>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{milestone.description}</p>
                      </div>
                    </div>
                    
                    {/* Timeline dot */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full border-4 border-blue-500 z-10"></div>
                    
                    {/* Spacer */}
                    <div className="w-1/2"></div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Dream Team</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Passionate educators, innovative technologists, and dedicated professionals working together 
              to revolutionize education in South Africa.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="group text-center">
                <div className="relative bg-white rounded-3xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  {/* Avatar placeholder */}
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 mx-auto">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{member.name}</h3>
                  <div className="text-sm text-blue-600 font-medium mb-3">{member.role}</div>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{member.bio}</p>
                  
                  <div className="space-y-2">
                    {member.expertise.map((skill, skillIndex) => (
                      <div key={skillIndex} className="text-xs text-gray-500 bg-gray-50 rounded-full px-3 py-1">
                        {skill}
                      </div>
                    ))}
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology & Innovation */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
                <Zap size={16} />
                Powered by Innovation
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                Cutting-Edge <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">AI Technology</span>
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Adaptive Learning Algorithms</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Our AI continuously analyzes student performance to create perfectly tailored learning paths that evolve with each student's progress.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Predictive Analytics</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Advanced machine learning models forecast academic outcomes and identify learning gaps before they become obstacles.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Secure & Scalable</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Built with enterprise-grade security and designed to scale across millions of students while maintaining performance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white mb-4 mx-auto">
                    <Award size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Proven Impact</h3>
                  <p className="text-gray-600">Validated by educational research and student success stories</p>
                </div>
                
                <div className="space-y-4">
                  {[
                    { metric: "Learning Efficiency", value: "+47%", description: "Compared to traditional methods" },
                    { metric: "Student Engagement", value: "92%", description: "Active daily usage" },
                    { metric: "Knowledge Retention", value: "+35%", description: "Long-term concept mastery" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <div className="font-semibold text-gray-900">{item.metric}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                      <div className="text-lg font-bold text-blue-600">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
                Ready to Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Educational Revolution?</span>
              </h2>
              <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                Be part of the movement transforming education in South Africa. Together, we can build a brighter future for our students.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  href="/contact" 
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/25 hover:scale-105"
                >
                  Partner With Us
                </Link>
                <Link 
                  href="/careers" 
                  className="border-2 border-white text-white px-6 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                >
                  Join Our Team
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Page