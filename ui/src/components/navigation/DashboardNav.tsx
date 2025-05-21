'use client'

import {
  Award,
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  FileText,
  GraduationCap,
  Heart,
  HelpCircle,
  Home,
  Settings,
  Target,
  User
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const DashboardNav = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleNav = () => {
    setIsCollapsed(!isCollapsed)
  }

  const menuItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard', color: 'text-blue-600' },
    { href: '/subjects', icon: BookOpen, label: 'Subjects', color: 'text-green-600' },
    { href: '/analytics', icon: BarChart3, label: 'Analytics', color: 'text-purple-600' },
    { href: '/study-companion', icon: Brain, label: 'Study Companion', color: 'text-indigo-600' },
    { href: '/goals', icon: Target, label: 'Goals & Targets', color: 'text-orange-600' },
    { href: '/rewards', icon: Award, label: 'Rewards', color: 'text-yellow-600' },
    { href: '/diary', icon: FileText, label: 'Learning Diary', color: 'text-pink-600' },
    { href: '/wellness', icon: Heart, label: 'Wellness', color: 'text-red-600' },
    { href: '/schedule', icon: Calendar, label: 'Schedule', color: 'text-cyan-600' },
  ]

  const secondaryItems = [
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/settings', icon: Settings, label: 'Settings' },
    { href: '/help', icon: HelpCircle, label: 'Help & Support' },
  ]

  return (
    <aside 
      className={`hidden lg:flex h-screen bg-gradient-to-b from-white to-slate-50 border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out flex-col overflow-hidden ${
        isCollapsed ? 'w-[70px]' : 'w-[280px]'
      }`}
    >
      {/* Header with Toggle */}
      <div className="p-4 border-b border-slate-100 mb-4 bg-gradient-to-r from-gray-50 to-white h-[70px]">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={toggleNav}
        >
          <div className="shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2">
            <GraduationCap size={24} className="text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex items-center justify-between w-full">
              <div>
                <h1 className="text-lg font-bold text-gray-900">Aptiverse</h1>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="px-4 pb-4 flex-1 overflow-y-auto flex flex-col">
        <div className="mb-6">
          <ul className="list-none p-0 m-0">
            {menuItems.map((item) => (
              <li key={item.href} className="mb-1 relative">
                <Link
                  href={item.href}
                  className={`group overflow-hidden relative flex items-center text-slate-600 no-underline rounded-lg transition-all duration-300 ease-in-out font-medium border-none bg-transparent w-full text-left cursor-pointer hover:bg-slate-100 hover:text-slate-800 ${
                    isCollapsed
                      ? 'p-3 justify-center hover:scale-105'
                      : 'px-4 py-3 hover:translate-x-1'
                  }`}
                >
                  <item.icon size={20} className={`shrink-0 ${item.color}`} />
                  {!isCollapsed && (
                    <span className="ml-3 text-sm whitespace-nowrap truncate transition-all duration-300 ease-in-out">
                      {item.label}
                    </span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 scale-95 bg-gray-800 text-white px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none transition-all duration-200 ease-in-out group-hover:opacity-100 group-hover:scale-100 shadow-lg">
                      {item.label}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-6 border-transparent border-r-gray-800"></div>
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Secondary Navigation */}
        <div className="mt-auto">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 pl-2 whitespace-nowrap truncate">
              Account
            </h3>
          )}
          <ul className="list-none p-0 m-0">
            {secondaryItems.map((item) => (
              <li key={item.href} className="mb-1 relative">
                <Link
                  href={item.href}
                  className={`group relative flex items-center text-slate-600 no-underline rounded-lg transition-all duration-300 ease-in-out font-medium border-none bg-transparent w-full text-left cursor-pointer hover:bg-slate-100 hover:text-slate-800 ${
                    isCollapsed
                      ? 'p-3 justify-center hover:scale-105'
                      : 'px-4 py-3 hover:translate-x-1'
                  }`}
                >
                  <item.icon size={20} className="shrink-0 text-gray-600" />
                  {!isCollapsed && (
                    <span className="ml-3 text-sm whitespace-nowrap truncate transition-all duration-300 ease-in-out">
                      {item.label}
                    </span>
                  )}
                  {isCollapsed && (
                    <div className="hidden group-hover:block absolute left-full top-1/2 -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap z-60 shadow-lg ml-1">
                      {item.label}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  )
}

export default DashboardNav