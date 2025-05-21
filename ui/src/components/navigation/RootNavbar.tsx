'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { Menu, X, BookOpen, User, LogIn } from 'lucide-react'
import './RootNavbar.css'

const RootNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <>
      <nav className="root-navbar">
        <div className="navbar-container">
          {/* Logo/Brand */}
          <Link href="/" className="navbar-brand">
            <BookOpen className="logo-icon" size={28} />
            <span className="brand-text">Aptiverse</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="desktop-nav">
            <Link href="/features" className="nav-link">
              Features
            </Link>
            <Link href="/about" className="nav-link">
              About
            </Link>
            <Link href="/pricing" className="nav-link">
              Pricing
            </Link>
            <Link href="/contact" className="nav-link">
              Contact
            </Link>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="auth-section">
            <Link href="/login" className="auth-link login-link">
              <LogIn size={18} />
              <span>Login</span>
            </Link>
            <Link href="/register" className="auth-link signup-link">
              <User size={18} />
              <span>Sign Up</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-button"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-content">
            <Link href="/features" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              Features
            </Link>
            <Link href="/about" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              About
            </Link>
            <Link href="/pricing" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              Pricing
            </Link>
            <Link href="/contact" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              Contact
            </Link>
            
            <div className="mobile-auth-section">
              <Link href="/login" className="mobile-auth-link login" onClick={() => setIsMenuOpen(false)}>
                <LogIn size={18} />
                <span>Login</span>
              </Link>
              <Link href="/register" className="mobile-auth-link signup" onClick={() => setIsMenuOpen(false)}>
                <User size={18} />
                <span>Sign Up</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop for mobile menu */}
      {isMenuOpen && (
        <div 
          className="mobile-menu-backdrop"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  )
}

export default RootNavbar