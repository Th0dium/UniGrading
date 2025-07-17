'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { UserRegistration } from './UserRegistration'
import toast from 'react-hot-toast'

interface AuthPageProps {
  onAuthComplete: (role: 'teacher' | 'student' | 'admin') => void
}

export function AuthPage({ onAuthComplete }: AuthPageProps) {
  const { publicKey, connected } = useWallet()
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)

  // Auto-login effect when wallet connects
  useEffect(() => {
    if (!connected || !publicKey || isAutoLoggingIn) return

    const attemptAutoLogin = async () => {
      try {
        setIsAutoLoggingIn(true)

        // Check if user exists in localStorage
        const savedUser = localStorage.getItem(`user_${publicKey.toString()}`)

        if (savedUser) {
          // Auto-login delay for better UX
          await new Promise(resolve => setTimeout(resolve, 800))

          const userData = JSON.parse(savedUser)

          // Verify user data integrity
          if (userData.username && userData.role) {
            toast.success(`Welcome back, ${userData.username}!`)
            onAuthComplete(userData.role.toLowerCase() as 'teacher' | 'student' | 'admin')
            return
          } else {
            // Invalid data, remove and show registration
            localStorage.removeItem(`user_${publicKey.toString()}`)
            toast.error('Invalid user data found. Please register again.')
          }
        }

        // No user found or invalid data - show registration
        setShowRegistration(true)

      } catch (error) {
        console.error('Auto-login error:', error)
        toast.error('Error during auto-login. Please try again.')
        setShowRegistration(true)
      } finally {
        setIsAutoLoggingIn(false)
      }
    }

    attemptAutoLogin()
  }, [connected, publicKey, onAuthComplete, isAutoLoggingIn])

  // Show loading state during auto-login
  if (isAutoLoggingIn) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Checking Account...</h3>
            <p className="text-gray-600">
              {publicKey ?
                `Verifying account for ${publicKey.toString().slice(0, 8)}...${publicKey.toString().slice(-8)}` :
                'Connecting to wallet...'
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show registration form if no account found or user explicitly wants to register
  if (showRegistration) {
    return (
      <div className="max-w-md mx-auto">
        {/* Registration Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Create Account</h2>
            {publicKey && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Wallet: {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
                </p>
                <p className="text-sm text-orange-600 font-medium">
                  No account found - Please register to continue
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Registration Form */}
        <UserRegistration onRegistrationComplete={onAuthComplete} />
      </div>
    )
  }

  // Fallback - should not normally reach here due to auto-login
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Connect Your Wallet</h3>
          <p className="text-gray-600">
            Please connect your Solana wallet to continue
          </p>
        </div>
      </div>
    </div>
  )
}
