'use client'

import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle, BookOpen, Send } from 'lucide-react'
import { useState } from 'react'

// Mock API client - replace with your actual API
const authApi = {
  requestPasswordReset: async (email: string): Promise<{ success: boolean; message: string }> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Password reset instructions have been sent to your email.'
        })
      }, 1500)
    })
  }
}

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const resetMutation = useMutation({
    mutationFn: authApi.requestPasswordReset,
    onSuccess: (data, variables) => {
      setIsSubmitted(true)
      setSubmittedEmail(variables)
    },
    onError: (error: any) => {
      console.error('Password reset request failed:', error)
    },
  })

  const onSubmit = (data: ForgotPasswordFormData) => {
    resetMutation.mutate(data.email)
  }

  const handleReset = () => {
    setIsSubmitted(false)
    setSubmittedEmail('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <BookOpen className="text-blue-600" size={32} />
            <span className="text-3xl font-bold font-frygia bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Aptiverse
            </span>
          </Link>
          
          <div className="flex items-center justify-center mb-4">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-2"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back to login</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isSubmitted ? 'Check your email' : 'Reset your password'}
          </h1>
          <p className="text-gray-600">
            {isSubmitted 
              ? `We sent instructions to ${submittedEmail}`
              : 'Enter your email address and we\'ll send you instructions to reset your password.'
            }
          </p>
        </div>

        {/* Success State */}
        {isSubmitted ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Email Sent Successfully!
            </h2>
            
            <p className="text-gray-600 mb-2">
              We've sent password reset instructions to:
            </p>
            <p className="font-medium text-gray-900 mb-6">{submittedEmail}</p>
            
            <div className="space-y-4">
              <div className="text-sm text-gray-600 space-y-2">
                <p>💡 Check your spam folder if you don't see the email</p>
                <p>⏱️ The link will expire in 1 hour for security</p>
              </div>

              <button
                onClick={handleReset}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2"
              >
                <Send size={20} />
                Resend instructions
              </button>

              <Link
                href="/login"
                className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-center"
              >
                Return to login
              </Link>
            </div>
          </div>
        ) : (
          /* Reset Form */
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your email address"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Help Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>Need help?</strong> Contact our support team at{' '}
                  <a href="mailto:support@aptiverse.com" className="underline hover:text-blue-800">
                    support@aptiverse.com
                  </a>{' '}
                  if you're having trouble accessing your account.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={resetMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resetMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={20} />
                )}
                {resetMutation.isPending ? 'Sending...' : 'Send reset instructions'}
              </button>

              {/* Error Message */}
              {resetMutation.isError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 text-center">
                    {resetMutation.error?.response?.data?.message || 'Failed to send reset instructions. Please try again.'}
                  </p>
                </div>
              )}
            </form>

            {/* Additional Links */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Remember your password?{' '}
                  <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-500">
                    Back to login
                  </Link>
                </p>
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-blue-600 font-semibold hover:text-blue-500">
                    Sign up for Aptiverse
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}