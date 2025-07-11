'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useState, useEffect } from 'react'
import { Dashboard } from '@/components/Dashboard'
import { UserRegistration } from '@/components/UserRegistration'
import { WalletButton } from '@/components/WalletButton'
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
  const [isRegistered, setIsRegistered] = useState(false)
  const [userRole, setUserRole] = useState<'teacher' | 'student' | null>(null)

  useEffect(() => {
    // Check if user is registered
    // This would typically involve checking the blockchain for user account
    if (connected && publicKey) {
      // For now, we'll simulate this check
      // In a real app, you'd query the blockchain here
      checkUserRegistration()
    }
  }, [connected, publicKey])

  const checkUserRegistration = async () => {
    // Simulate checking user registration
    // In a real implementation, you'd query the Solana program
    // For demo purposes, we'll assume user needs to register first
    setIsRegistered(false)
  }

  const handleRegistrationComplete = (role: 'teacher' | 'student') => {
    setIsRegistered(true)
    setUserRole(role)
  }

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            UniGrading
          </h1>
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

  if (!isRegistered) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">UniGrading</h1>
            <WalletButton />
          </div>
          <UserRegistration onRegistrationComplete={handleRegistrationComplete} />
        </div>
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
