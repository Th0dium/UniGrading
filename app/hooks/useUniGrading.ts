import { useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';

// Types matching the Rust structs
export interface User {
  authority: PublicKey;
  username: string;
  role: 'Teacher' | 'Student';
  createdAt: number;
  isActive: boolean;
}

export interface Classroom {
  name: string;
  course: string;
  teacher: PublicKey;
  students: StudentRef[];
}

export interface Student {
  id: string;
  name: string;
  grades: Grade[];
  classroom: PublicKey;
}

export interface StudentRef {
  name: string;
  pubkey: PublicKey;
}

export interface Grade {
  assignmentName: string;
  grade: number;
  maxGrade: number;
  timestamp: number;
  gradedBy: PublicKey;
}

export const useUniGrading = () => {
  const wallet = useWallet();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for existing user in localStorage when wallet connects
  useEffect(() => {
    if (wallet.connected && wallet.publicKey && !currentUser) {
      const savedUser = localStorage.getItem(`user_${wallet.publicKey.toString()}`);
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    }
  }, [wallet.connected, wallet.publicKey, currentUser]);

  // Check if user is registered (Mock implementation)
  const checkUserRegistration = useCallback(async (publicKey?: PublicKey): Promise<User | null> => {
    if (!wallet.connected) return null;

    const userKey = publicKey || wallet.publicKey;
    if (!userKey) return null;

    try {
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Return current user if exists, otherwise null
      return currentUser;
    } catch (error) {
      console.error('Error checking user registration:', error);
      return null;
    }
  }, [wallet.connected, wallet.publicKey, currentUser]);

  // Register user (Mock implementation for testing)
  const registerUser = useCallback(async (
    username: string,
    role: 'Teacher' | 'Student'
  ): Promise<string | null> => {
    if (!wallet.connected || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    try {
      // Mock delay to simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create mock user data
      const mockUser: User = {
        authority: wallet.publicKey,
        username,
        role,
        createdAt: Date.now() / 1000,
        isActive: true,
      };

      setCurrentUser(mockUser);
      toast.success('User registered successfully! (Mock)');

      // Return mock transaction signature
      return 'mock_signature_' + Date.now();
    } catch (error) {
      console.error('Error registering user:', error);
      toast.error(`Failed to register user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  // Create classroom (Mock implementation)
  const createClassroom = useCallback(async (
    classroomName: string,
    course: string
  ): Promise<string | null> => {
    if (!wallet.connected || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    if (!currentUser || currentUser.role !== 'Teacher') {
      throw new Error('Only teachers can create classrooms');
    }

    setLoading(true);
    try {
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success(`Classroom "${classroomName}" created successfully! (Mock)`);
      return 'mock_classroom_signature_' + Date.now();
    } catch (error) {
      console.error('Error creating classroom:', error);
      toast.error('Failed to create classroom');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [wallet, currentUser]);

  // Add student to classroom (Mock implementation)
  const addStudent = useCallback(async (
    classroomPubkey: PublicKey,
    studentName: string,
    studentId: string
  ): Promise<string | null> => {
    if (!wallet.connected || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    if (!currentUser || currentUser.role !== 'Teacher') {
      throw new Error('Only teachers can add students');
    }

    setLoading(true);
    try {
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(`Student "${studentName}" (${studentId}) added successfully! (Mock)`);
      return 'mock_student_signature_' + Date.now();
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [wallet, currentUser]);

  // Assign grade (Mock implementation)
  const assignGrade = useCallback(async (
    studentPubkey: PublicKey,
    assignmentName: string,
    grade: number,
    maxGrade: number
  ): Promise<string | null> => {
    if (!wallet.connected || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    if (!currentUser || currentUser.role !== 'Teacher') {
      throw new Error('Only teachers can assign grades');
    }

    setLoading(true);
    try {
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      toast.success(`Grade assigned: ${grade}/${maxGrade} for "${assignmentName}" (Mock)`);
      return 'mock_grade_signature_' + Date.now();
    } catch (error) {
      console.error('Error assigning grade:', error);
      toast.error('Failed to assign grade');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [wallet, currentUser]);

  // Load user data on wallet connection
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      checkUserRegistration().then(setCurrentUser);
    } else {
      setCurrentUser(null);
    }
  }, [wallet.connected, wallet.publicKey, checkUserRegistration]);

  return {
    // State
    currentUser,
    loading,
    isConnected: wallet.connected,
    publicKey: wallet.publicKey,
    
    // User Management
    registerUser,
    checkUserRegistration,
    
    // Classroom Management
    createClassroom,
    addStudent,
    
    // Grade Management
    assignGrade,
  };
};
