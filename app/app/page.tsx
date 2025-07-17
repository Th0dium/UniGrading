'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useState, useEffect } from 'react'
import { Dashboard } from '@/components/Dashboard'
import { AuthPage } from '@/components/AuthPage'
import { WalletButton } from '@/components/WalletButton'
import { RegistrationDebug } from '@/components/RegistrationDebug'
import { CURRENT_VERSION } from '@/constants/version'
import NoSSR from '@/components/NoSSR'

export default function Home() {
  return (
    <NoSSR>
      <HomeContent />
    </NoSSR>
  )
}

function HomeContent() {
  const { connected, publicKey } = useWallet()
  const [userRole, setUserRole] = useState<'teacher' | 'student' | 'admin' | null>(null)
  const [isCheckingUser, setIsCheckingUser] = useState(false)

  useEffect(() => {
    if (connected && publicKey) {
      checkUserRegistration()
    } else {
      setUserRole(null)
    }
  }, [connected, publicKey])

  const checkUserRegistration = async () => {
    if (!publicKey || isCheckingUser) return

    setIsCheckingUser(true)
    try {
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300))

      const savedUser = localStorage.getItem(`user_${publicKey.toString()}`)
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        if (userData.username && userData.role) {
          setUserRole(userData.role.toLowerCase() as 'teacher' | 'student' | 'admin')
        } else {
          // Invalid data, remove it
          localStorage.removeItem(`user_${publicKey.toString()}`)
          setUserRole(null)
        }
      } else {
        setUserRole(null)
      }
    } catch (error) {
      console.error('Error checking user registration:', error)
      setUserRole(null)
    } finally {
      setIsCheckingUser(false)
    }
  }

  const handleAuthComplete = (role: 'teacher' | 'student' | 'admin') => {
    setUserRole(role)
  }

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            UniGrading
          </h1>
          <div className="flex items-center justify-center mb-6">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {CURRENT_VERSION}
            </span>
          </div>
          <p className="text-xl text-gray-600 mb-8">
            Decentralized University Grading System
          </p>
          <p className="text-gray-500 mb-8">
            Connect your Solana wallet to get started
          </p>
          <WalletButton />
        </div>
      </div>
    )
  }

  // Show loading state while checking user
  if (connected && isCheckingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Checking Account...</h2>
          <p className="text-gray-600">
            Verifying registration for {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
          </p>
        </div>
      </div>
    )
  }

  // Show auth page if user is not registered
  if (connected && !userRole) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">UniGrading</h1>
            <WalletButton />
          </div>
          <AuthPage onAuthComplete={handleAuthComplete} />
        </div>
        <RegistrationDebug />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">UniGrading Dashboard</h1>
          <WalletButton />
        </div>
        <Dashboard userRole={userRole} />
      </div>
    </div>
  )
}
