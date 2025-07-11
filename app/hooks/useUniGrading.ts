import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { PublicKey, Transaction, SystemProgram, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN, Idl } from '@project-serum/anchor';
// import { toast } from 'react-hot-toast';

// Program ID from the Rust code
const PROGRAM_ID = new PublicKey('AUb7ZQUCsWSVu4ok5CfGeDbgyQTGcgn9WSsC4PwN7MBj');

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
  const { connection } = useConnection();
  const wallet = useWallet();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const provider = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      return null;
    }
    
    return new AnchorProvider(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions || (async (txs) => {
          const signedTxs = [];
          for (const tx of txs) {
            signedTxs.push(await wallet.signTransaction!(tx));
          }
          return signedTxs;
        }),
      },
      { commitment: 'confirmed' }
    );
  }, [connection, wallet]);

  // Generate PDA for user account
  const getUserPDA = useCallback(async (authority: PublicKey): Promise<[PublicKey, number]> => {
    return await PublicKey.findProgramAddress(
      [Buffer.from('user'), authority.toBuffer()],
      PROGRAM_ID
    );
  }, []);

  // Check if user is registered
  const checkUserRegistration = useCallback(async (publicKey?: PublicKey): Promise<User | null> => {
    if (!provider) return null;
    
    const userKey = publicKey || wallet.publicKey;
    if (!userKey) return null;

    try {
      const [userPDA] = await getUserPDA(userKey);
      const accountInfo = await connection.getAccountInfo(userPDA);
      
      if (!accountInfo) {
        return null;
      }

      // In a real implementation, you would deserialize the account data
      // For now, we'll return a mock user
      return {
        authority: userKey,
        username: 'Mock User',
        role: 'Student',
        createdAt: Date.now(),
        isActive: true,
      };
    } catch (error) {
      console.error('Error checking user registration:', error);
      return null;
    }
  }, [provider, wallet.publicKey, getUserPDA, connection]);

  // Register user
  const registerUser = useCallback(async (
    username: string,
    role: 'Teacher' | 'Student'
  ): Promise<string | null> => {
    if (!provider || !wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    try {
      const [userPDA] = await getUserPDA(wallet.publicKey);
      
      // Create instruction manually since we don't have the IDL
      const instruction = new web3.TransactionInstruction({
        keys: [
          { pubkey: userPDA, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: Buffer.from([]), // In real implementation, serialize the instruction data
      });

      const transaction = new Transaction().add(instruction);
      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast.success('User registered successfully!');
      
      // Refresh user data
      const user = await checkUserRegistration();
      setCurrentUser(user);
      
      return signature;
    } catch (error) {
      console.error('Error registering user:', error);
      toast.error('Failed to register user');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [provider, wallet, connection, getUserPDA, checkUserRegistration]);

  // Create classroom (for teachers)
  const createClassroom = useCallback(async (
    classroomName: string,
    course: string
  ): Promise<string | null> => {
    if (!provider || !wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    if (!currentUser || currentUser.role !== 'Teacher') {
      throw new Error('Only teachers can create classrooms');
    }

    setLoading(true);
    try {
      // Generate a new keypair for the classroom
      const classroomKeypair = web3.Keypair.generate();
      const [userPDA] = await getUserPDA(wallet.publicKey);
      
      const instruction = new web3.TransactionInstruction({
        keys: [
          { pubkey: classroomKeypair.publicKey, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: userPDA, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: Buffer.from([]), // Serialize instruction data
      });

      const transaction = new Transaction().add(instruction);
      const signature = await wallet.sendTransaction(transaction, connection, {
        signers: [classroomKeypair]
      });
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast.success('Classroom created successfully!');
      return signature;
    } catch (error) {
      console.error('Error creating classroom:', error);
      toast.error('Failed to create classroom');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [provider, wallet, connection, currentUser, getUserPDA]);

  // Add student to classroom
  const addStudent = useCallback(async (
    classroomPubkey: PublicKey,
    studentName: string,
    studentId: string
  ): Promise<string | null> => {
    if (!provider || !wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    if (!currentUser || currentUser.role !== 'Teacher') {
      throw new Error('Only teachers can add students');
    }

    setLoading(true);
    try {
      const studentKeypair = web3.Keypair.generate();
      
      const instruction = new web3.TransactionInstruction({
        keys: [
          { pubkey: classroomPubkey, isSigner: false, isWritable: true },
          { pubkey: studentKeypair.publicKey, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: Buffer.from([]), // Serialize instruction data
      });

      const transaction = new Transaction().add(instruction);
      const signature = await wallet.sendTransaction(transaction, connection, {
        signers: [studentKeypair]
      });
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast.success('Student added successfully!');
      return signature;
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [provider, wallet, connection, currentUser]);

  // Assign grade
  const assignGrade = useCallback(async (
    studentPubkey: PublicKey,
    assignmentName: string,
    grade: number,
    maxGrade: number
  ): Promise<string | null> => {
    if (!provider || !wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    if (!currentUser || currentUser.role !== 'Teacher') {
      throw new Error('Only teachers can assign grades');
    }

    setLoading(true);
    try {
      const [userPDA] = await getUserPDA(wallet.publicKey);
      
      const instruction = new web3.TransactionInstruction({
        keys: [
          { pubkey: studentPubkey, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: userPDA, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: Buffer.from([]), // Serialize instruction data
      });

      const transaction = new Transaction().add(instruction);
      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      toast.success('Grade assigned successfully!');
      return signature;
    } catch (error) {
      console.error('Error assigning grade:', error);
      toast.error('Failed to assign grade');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [provider, wallet, connection, currentUser, getUserPDA]);

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
