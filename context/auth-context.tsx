'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// Designated authorized super-admin email
export const AUTHORIZED_ADMIN_EMAIL = 'eowolabi34@gmail.com';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  authError: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  clearError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setAuthError(null);

      if (!currentUser) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const userEmail = currentUser.email?.toLowerCase();
        const isSuperAdminEmail = userEmail === AUTHORIZED_ADMIN_EMAIL.toLowerCase();

        // Check if admin doc exists in Firestore
        const adminDocRef = doc(db, 'admins', currentUser.uid);
        const adminDocSnap = await getDoc(adminDocRef);

        if (isSuperAdminEmail) {
          // If super admin doc doesn't exist yet, bootstrap it
          if (!adminDocSnap.exists()) {
            await setDoc(
              adminDocRef,
              {
                email: currentUser.email,
                role: 'admin',
                displayName: currentUser.displayName || 'Authorized Admin',
                createdAt: new Date().toISOString(),
              },
              { merge: true }
            );
          }
          setUser(currentUser);
          setIsAdmin(true);
        } else if (adminDocSnap.exists() && adminDocSnap.data()?.role === 'admin') {
          setUser(currentUser);
          setIsAdmin(true);
        } else {
          // Unauthorized user attempted login
          console.warn('Unauthorized admin login attempt:', currentUser.email);
          await fbSignOut(auth);
          setUser(null);
          setIsAdmin(false);
          setAuthError(
            `Access restricted. Customer registration is disabled. Only the designated administrator (${AUTHORIZED_ADMIN_EMAIL}) can sign in.`
          );
        }
      } catch (err: any) {
        console.error('Error verifying admin permissions:', err);
        // Fallback for super admin even if admin doc read had network issue
        if (currentUser.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
          setUser(currentUser);
          setIsAdmin(true);
        } else {
          setUser(null);
          setIsAdmin(false);
          setAuthError('Unable to verify administrative authorization. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Sign-in error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setAuthError(err.message || 'Failed to authenticate with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await fbSignOut(auth);
      setUser(null);
      setIsAdmin(false);
    } catch (err: any) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        authError,
        signInWithGoogle,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
