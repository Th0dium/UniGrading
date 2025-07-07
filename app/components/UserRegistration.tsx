'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import toast from 'react-hot-toast'

interface UserRegistrationProps {
  onRegistrationComplete: (role: 'teacher' | 'student') => void
}

export function UserRegistration({ onRegistrationComplete }: UserRegistrationProps) {
  const { publicKey } = useWallet()
  const [username, setUsername] = useState('')
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student'>('student')
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!username.trim()) {
      toast.error('Please enter a username')
      return
    }

    setIsLoading(true)
    
    try {
      // Here you would call the Solana program to register the user
      // For now, we'll simulate the registration
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Registration successful!')
      onRegistrationComplete(selectedRole)
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        User Registration
      </h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter your username"
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="student"
                checked={selectedRole === 'student'}
                onChange={(e) => setSelectedRole(e.target.value as 'student')}
                className="mr-2"
              />
              <span>Student</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="teacher"
                checked={selectedRole === 'teacher'}
                onChange={(e) => setSelectedRole(e.target.value as 'teacher')}
                className="mr-2"
              />
              <span>Teacher</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleRegister}
          disabled={isLoading || !username.trim()}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Wallet:</strong> {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}</p>
      </div>
    </div>
  )
}
