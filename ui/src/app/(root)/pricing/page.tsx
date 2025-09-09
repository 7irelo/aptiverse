"use client"
import React, { useState } from 'react'
import { 
  Check, 
  Star, 
  Zap, 
  Crown, 
  Users, 
  BookOpen, 
  BarChart3, 
  Brain, 
  Shield,
  Clock,
  Target,
  Award,
  Heart,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      name: "Student",
      description: "Perfect for individual learners",
      price: isAnnual ? "R49" : "R59",
      period: isAnnual ? "/month" : "/month",
      originalPrice: "R79",
      savings: isAnnual ? "Save 38%" : "Save 25%",
      popular: false,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      features: [
        "AI-powered learning paths",
        "Basic progress analytics",
        "24/7 AI tutoring support",
        "Mobile app access",
        "Curriculum-aligned content",
        "Email support",
        "5 subjects included",
        "Basic assessment tools"
      ],
      cta: "Start Learning",
      highlighted: false
    },
    {
      name: "Pro Learner",
      description: "Advanced features for serious students",
      price: isAnnual ? "R99" : "R119",
      period: isAnnual ? "/month" : "/month",
      originalPrice: "R149",
      savings: isAnnual ? "Save 34%" : "Save 20%",
      popular: true,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      features: [
        "Everything in Student, plus:",
        "Advanced AI analytics",
        "Personalized study plans",
        "Unlimited subjects",
        "Priority AI tutoring",
        "Offline content access",
        "Detailed performance reports",
        "Exam preparation tools",
        "Wellness tracking",
        "Chat & email support"
      ],
      cta: "Go Pro",
      highlighted: true
    },
    {
      name: "School & Institution",
      description: "Complete solution for schools and tutors",
      price: "Custom",
      period: "/student/month",
      originalPrice: null,
      savings: "Volume discounts",
      popular: false,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      features: [
        "Everything in Pro Learner, plus:",
        "Teacher dashboard",
        "Classroom management",
        "Bulk student accounts",
        "Admin controls",
        "Custom reporting",
        "Parent portal access",
        "Curriculum customization",
        "Dedicated support manager",
        "Training & onboarding",
        "SLA guarantee",
        "Advanced security"
      ],
      cta: "Contact Sales",
      highlighted: false
    }
  ]

  const features = [
    {
      icon: Brain,
      name: "AI-Powered Learning",
      description: "Personalized learning paths adapted to each student's pace and style"
    },
    {
      icon: BarChart3,
      name: "Advanced Analytics",
      description: "Detailed performance tracking and predictive insights"
    },
    {
      icon: Clock,
      name: "24/7 AI Tutoring",
      description: "Instant help and explanations available anytime"
    },
    {
      icon: Target,
      name: "Goal Tracking",
      description: "Set, monitor, and achieve academic goals with milestone planning"
    },
    {
      icon: Shield,
      name: "Safe & Secure",
      description: "Enterprise-grade security and privacy protection"
    },
    {
      icon: Award,
      name: "Gamified Learning",
      description: "Engaging achievement system with badges and rewards"
    }
  ]

  const faqs = [
    {
      question: "Can I change plans later?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! All paid plans include a 14-day free trial. No credit card required to start."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept credit cards, debit cards, EFT, and mobile payments. School plans can be invoiced."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely. You can cancel your subscription at any time with no cancellation fees."
    },
    {
      question: "Is the content aligned with CAPS curriculum?",
      answer: "Yes, all our content is specifically designed for the South African CAPS curriculum for Grades 11-12."
    },
    {
      question: "Do you offer discounts for schools?",
      answer: "Yes, we offer significant volume discounts for schools and educational institutions. Contact our sales team."
    }
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
              <span className="text-white/90 text-sm font-medium">Simple, Transparent Pricing</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Affordable <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Excellence</span> for All
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              Choose the perfect plan for your learning journey. All plans include our powerful AI technology 
              and are designed specifically for South African students.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Toggle */}
      <div className="relative -mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  !isAnnual 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  isAnnual 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annual Billing
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Save 25%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`relative rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                  plan.highlighted 
                    ? 'border-purple-300 shadow-2xl transform scale-105' 
                    : 'border-gray-200 shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                      <Star size={16} />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    
                    <div className="mb-4">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-600">{plan.period}</span>
                      </div>
                      {plan.originalPrice && (
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <span className="text-sm text-gray-500 line-through">R{plan.originalPrice}</span>
                          <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            {plan.savings}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className={`w-5 h-5 bg-gradient-to-r ${plan.color} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Check size={12} className="text-white" />
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    href={plan.name === "School & Institution" ? "/contact" : "/signup"}
                    className={`block w-full text-center py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/25'
                        : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-gray-500/25'
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  {plan.name !== "School & Institution" && (
                    <p className="text-center text-gray-500 text-sm mt-4">
                      Start with 14-day free trial
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Comparison */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              Compare <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">All Features</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              See how our plans stack up against each other
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-6 px-8 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-6 px-4 font-semibold text-gray-900">Student</th>
                  <th className="text-center py-6 px-4 font-semibold text-gray-900 bg-purple-50">Pro Learner</th>
                  <th className="text-center py-6 px-4 font-semibold text-gray-900">School</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { feature: "AI-Powered Learning Paths", student: true, pro: true, school: true },
                  { feature: "Advanced Analytics Dashboard", student: "Basic", pro: "Advanced", school: "Enterprise" },
                  { feature: "24/7 AI Tutoring", student: true, pro: "Priority", school: "Priority" },
                  { feature: "Subjects Included", student: "5", pro: "Unlimited", school: "Unlimited" },
                  { feature: "Offline Access", student: false, pro: true, school: true },
                  { feature: "Personalized Study Plans", student: "Limited", pro: true, school: true },
                  { feature: "Wellness Tracking", student: false, pro: true, school: true },
                  { feature: "Teacher Dashboard", student: false, pro: false, school: true },
                  { feature: "Parent Portal", student: false, pro: false, school: true },
                  { feature: "Custom Reporting", student: false, pro: false, school: true },
                  { feature: "Dedicated Support", student: "Email", pro: "Chat & Email", school: "Manager" }
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-8 text-sm font-medium text-gray-900">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.student === 'boolean' ? (
                        row.student ? <Check size={20} className="text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>
                      ) : (
                        <span className="text-sm text-gray-600">{row.student}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center bg-purple-50">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? <Check size={20} className="text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>
                      ) : (
                        <span className="text-sm text-gray-600">{row.pro}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.school === 'boolean' ? (
                        row.school ? <Check size={20} className="text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>
                      ) : (
                        <span className="text-sm text-gray-600">{row.school}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              Powerful <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Features Included</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Every plan includes our core AI technology and educational tools
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white mb-4">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Questions</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Get answers to common questions about our pricing and plans
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HelpCircle size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
            Ready to Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Learning Journey?</span>
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of South African students achieving exceptional results with our AI-powered platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/signup" 
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/25 hover:scale-105"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              Contact Sales
            </Link>
          </div>
          
          <p className="text-blue-200 mt-6 text-sm">
            No credit card required • 14-day free trial • Setup in minutes
          </p>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-6">Trusted by students and schools across South Africa</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-gray-300 font-semibold">✓ CAPS Aligned</div>
              <div className="text-gray-300 font-semibold">✓ Secure & Private</div>
              <div className="text-gray-300 font-semibold">✓ 24/7 Support</div>
              <div className="text-gray-300 font-semibold">✓ Money Back Guarantee</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Pricing