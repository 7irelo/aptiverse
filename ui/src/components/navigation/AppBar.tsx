'use client'

import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Calendar,
  FileText,
  GraduationCap,
  Heart,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  Settings,
  Target,
  User,
  X
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const AppBar = () => {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const { data: session } = useSession()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }

      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }

      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        handleCloseMobileMenu()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (showMobileMenu && !isClosing) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showMobileMenu, isClosing])

  const handleOpenMobileMenu = () => {
    setShowMobileMenu(true)
    setIsClosing(false)
    setIsAnimating(true)
  }

  const handleCloseMobileMenu = () => {
    setIsClosing(true)
    setIsAnimating(false)

    setTimeout(() => {
      setShowMobileMenu(false)
      setIsClosing(false)
    }, 300)
  }

  const handleMobileMenuToggle = () => {
    if (!showMobileMenu) {
      handleOpenMobileMenu()
    } else {
      handleCloseMobileMenu()
    }
  }

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      setShowUserMenu(false)
      handleCloseMobileMenu()

      await signOut({
        callbackUrl: '/login',
        redirect: true
      })

    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const getUserDisplayName = () => {
    if (session?.user) {
      return `${session.user.firstName} ${session.user.lastName}` || session.user.name || 'User'
    }
    return 'John Student'
  }

  const getUserRole = () => {
    return session?.user?.userType || 'Grade 11'
  }

  const handleMobileLinkClick = () => {
    handleCloseMobileMenu()
  }

  const getBackdropClasses = () => {
    if (isAnimating && !isClosing) return 'opacity-100'
    if (isClosing) return 'opacity-0'
    return 'opacity-0'
  }

  const getMenuPanelClasses = () => {
    if (isAnimating && !isClosing) return 'translate-y-0 opacity-100'
    if (isClosing) return '-translate-y-4 opacity-0'
    return '-translate-y-4 opacity-0'
  }

  const getItemAnimation = (index: number) => {
    if (isAnimating && !isClosing) {
      return {
        animationDelay: `${index * 50}ms`,
        animation: 'slideInDown 0.3s ease-out forwards'
      }
    }
    if (isClosing) {
      return {
        animationDelay: `${index * 30}ms`,
        animation: 'slideOutUp 0.25s ease-in forwards'
      }
    }
    return {}
  }

  return (
    <>
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 sm:px-8 py-0 h-[70px] z-40">
        <div className="flex items-center justify-between h-full max-w-full">
          {/* Left section - Mobile menu button */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 border-none bg-transparent rounded-lg cursor-pointer text-gray-700 transition-all duration-200 ease-in-out flex items-center justify-center hover:bg-slate-100 hover:text-slate-800"
              aria-label="Menu"
              onClick={handleMobileMenuToggle}
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Notifications - Hidden on mobile when menu is open */}
            {!showMobileMenu && (
              <div className="relative" ref={notificationsRef}>
                <button
                  className="p-2 sm:p-3 border-none bg-transparent rounded-lg cursor-pointer text-gray-700 transition-all duration-200 ease-in-out flex items-center justify-center hover:bg-slate-100 hover:text-slate-800 hover:-translate-y-px"
                  aria-label="Notifications"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center font-semibold">3</span>
                </button>

                {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl min-w-[280px] sm:min-w-[320px] z-50 animate-in fade-in-0 zoom-in-95">
                    <div className="px-4 sm:px-5 py-4 border-b border-slate-100">
                      <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">3 new</span>
                    </div>
                    <div className="p-2">
                      <div className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ease-in-out hover:bg-slate-50">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 mb-1">New assignment in Mathematics</p>
                          <span className="text-xs text-slate-400">2 min ago</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ease-in-out hover:bg-slate-50">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 mb-1">Your goal is 80% complete</p>
                          <span className="text-xs text-slate-400">1 hour ago</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ease-in-out hover:bg-slate-50">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 mb-1">Study companion has new tips</p>
                          <span className="text-xs text-slate-400">2 hours ago</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-3 border-t border-slate-100">
                      <button className="w-full px-2 py-2 border border-gray-200 bg-transparent rounded-md cursor-pointer text-slate-500 text-sm transition-all duration-200 ease-in-out hover:bg-slate-50 hover:text-gray-700">
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Menu - Hidden on mobile when menu is open */}
            {!showMobileMenu && (
              <div className="relative" ref={userMenuRef}>
                <button
                  className="flex items-center gap-2 sm:gap-3 p-2 border-none bg-transparent rounded-lg cursor-pointer text-gray-700 transition-all duration-200 ease-in-out hover:bg-slate-100"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white">
                    <User size={16} className="sm:w-5 sm:h-5" />
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="font-semibold text-sm text-slate-800">{getUserDisplayName()}</span>
                    <span className="text-xs text-slate-500">{getUserRole()}</span>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl min-w-[200px] z-50 animate-in fade-in-0 zoom-in-95">
                    <div className="p-2">
                      <button className="flex items-center gap-3 w-full px-4 py-3 border-none bg-transparent rounded-lg cursor-pointer text-gray-700 transition-all duration-200 ease-in-out hover:bg-slate-50 hover:text-slate-800 text-sm">
                        <User size={16} />
                        <span>My Profile</span>
                      </button>
                      <button className="flex items-center gap-3 w-full px-4 py-3 border-none bg-transparent rounded-lg cursor-pointer text-gray-700 transition-all duration-200 ease-in-out hover:bg-slate-50 hover:text-slate-800 text-sm">
                        <Settings size={16} />
                        <span>Settings</span>
                      </button>
                      <button className="flex items-center gap-3 w-full px-4 py-3 border-none bg-transparent rounded-lg cursor-pointer text-gray-700 transition-all duration-200 ease-in-out hover:bg-slate-50 hover:text-slate-800 text-sm">
                        <HelpCircle size={16} />
                        <span>Help & Support</span>
                      </button>
                      <div className="h-px bg-slate-100 my-2"></div>
                      <button
                        className="flex items-center gap-3 w-full px-4 py-3 border-none bg-transparent rounded-lg cursor-pointer text-red-600 transition-all duration-200 ease-in-out hover:bg-red-50 text-sm"
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                      >
                        <LogOut size={16} />
                        <span>
                          {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay - Drops from app bar to bottom of screen */}
      {(showMobileMenu || isClosing) && (
        <div className="lg:hidden fixed inset-0 z-30">
          {/* Backdrop with closing animation */}
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 ${getBackdropClasses()}`}
            onClick={handleCloseMobileMenu}
          />

          {/* Menu Panel with closing animation */}
          <div
            ref={mobileMenuRef}
            className={`absolute left-0 right-0 top-[70px] bottom-0 bg-white shadow-2xl transform transition-all duration-300 ease-out overflow-y-auto ${getMenuPanelClasses()}`}
          >
            {/* User Info Section */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 transition-all duration-300 hover:shadow-md">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white">
                  <User size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{getUserDisplayName()}</p>
                  <p className="text-sm text-gray-600 truncate">{getUserRole()}</p>
                </div>
              </div>
            </div>

            {/* Navigation Content */}
            <div className="p-4">
              {/* Main Menu Items */}
              <nav className="mb-6">
                <ul className="space-y-1">
                  {menuItems.map((item, index) => (
                    <li 
                      key={item.href}
                      className="transform transition-all duration-300 ease-out"
                      style={getItemAnimation(index)}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 no-underline rounded-lg transition-all duration-200 font-medium hover:bg-slate-100 hover:text-slate-800 hover:translate-y-[-1px] hover:shadow-sm"
                        onClick={handleMobileLinkClick}
                      >
                        <item.icon size={20} className={`shrink-0 ${item.color}`} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

            </div>
          </div>
        </div>
      )}

      {/* Add custom animation keyframes */}
      <style jsx>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideOutUp {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
      `}</style>
    </>
  )
}

export default AppBar