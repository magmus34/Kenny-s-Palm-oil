'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface AdminUser {
  displayName: string;
  role: 'admin';
}

interface AuthContextType {
  user: AdminUser | null;
  isAdmin: boolean;
  loading: boolean;
  authError: string | null;
  loginWithPassword: (password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  authError: null,
  loginWithPassword: async () => false,
  signOut: async () => {},
  clearError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check existing session on load
  useEffect(() => {
    let isMounted = true;
    fetch('/api/admin/session', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .then((data) => {
        if (isMounted) {
          setIsAdmin(Boolean(data.authenticated));
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Session verification note:', err);
        if (isMounted) {
          setIsAdmin(false);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const loginWithPassword = async (password: string): Promise<boolean> => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setIsAdmin(true);
        setAuthError(null);
        return true;
      } else {
        setIsAdmin(false);
        setAuthError(data.error || 'Incorrect password. Access denied.');
        return false;
      }
    } catch (err: any) {
      console.error('Login request failed:', err);
      setAuthError('Connection error. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsAdmin(false);
      setAuthError(null);
      setLoading(false);
    }
  };

  const clearError = () => setAuthError(null);

  const user: AdminUser | null = isAdmin
    ? {
        displayName: "Kenny's Palm Oil Administrator",
        role: 'admin',
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        authError,
        loginWithPassword,
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
