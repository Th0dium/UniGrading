'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import toast from 'react-hot-toast'
import { useUniGrading } from '../hooks/useUniGrading'
import { WalletButton } from './WalletButton'

interface UserLoginProps {
  onLoginSuccess: (user: any) => void
  onNeedRegistration: () => void
}

export function UserLogin({ onLoginSuccess, onNeedRegistration }: UserLoginProps) {
  const { connected, publicKey } = useWallet()
  const { currentUser, checkUserRegistration, loading } = useUniGrading()
  const [isChecking, setIsChecking] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Fix hydration error
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check user registration when wallet connects
  useEffect(() => {
    const checkUser = async () => {
      if (connected && publicKey) {
        setIsChecking(true)
        try {
          const user = await checkUserRegistration(publicKey)
          if (user) {
            toast.success(`Welcome back, ${user.username}!`)
            onLoginSuccess(user)
          } else {
            toast.error('User not registered. Please register first.')
            onNeedRegistration()
          }
        } catch (error) {
          console.error('Error checking user:', error)
          toast.error('Failed to check user registration')
        } finally {
          setIsChecking(false)
        }
      }
    }

    checkUser()
  }, [connected, publicKey, checkUserRegistration, onLoginSuccess, onNeedRegistration])

  // Auto-login if user is already loaded
  useEffect(() => {
    if (currentUser && connected) {
      onLoginSuccess(currentUser)
    }
  }, [currentUser, connected, onLoginSuccess])

  const handleManualCheck = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsChecking(true)
    try {
      const user = await checkUserRegistration(publicKey)
      if (user) {
        toast.success(`Welcome back, ${user.username}!`)
        onLoginSuccess(user)
      } else {
        toast.error('User not registered. Please register first.')
        onNeedRegistration()
      }
    } catch (error) {
      console.error('Error checking user:', error)
      toast.error('Failed to check user registration')
    } finally {
      setIsChecking(false)
    }
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Login to UniGrading
      </h2>
      
      <div className="space-y-6">
        {/* Wallet Connection */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Connect your Solana wallet to access your account
          </p>
          <WalletButton />
        </div>

        {/* Connection Status */}
        {connected && publicKey && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Wallet Connected
                </p>
                <p className="text-xs text-green-600">
                  {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Manual Check Button */}
        {connected && (
          <button
            onClick={handleManualCheck}
            disabled={isChecking || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isChecking || loading ? 'Checking...' : 'Check Registration'}
          </button>
        )}

        {/* Registration Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onNeedRegistration}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Register here
            </button>
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            How to login:
          </h3>
          <ol className="text-xs text-blue-700 space-y-1">
            <li>1. Connect your Solana wallet using the button above</li>
            <li>2. Your registration will be automatically checked</li>
            <li>3. If registered, you'll be logged in automatically</li>
            <li>4. If not registered, you'll be prompted to register</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
