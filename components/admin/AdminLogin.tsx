'use client';

import React from 'react';
import Link from 'next/link';
import { Droplet, Lock, ShieldCheck, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth, AUTHORIZED_ADMIN_EMAIL } from '@/context/auth-context';

export default function AdminLogin() {
  const { signInWithGoogle, loading, authError, clearError } = useAuth();

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <Droplet className="w-7 h-7 fill-white" />
            </div>
          </Link>
          <h2 className="text-3xl font-black text-white tracking-tight">Admin Dashboard</h2>
          <p className="mt-2 text-sm text-stone-400">
            Kenny&apos;s Premium Palm Oil • Management Portal
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-stone-800/90 py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-stone-700/80 space-y-6">
            <div className="flex items-center gap-3 p-3.5 bg-orange-950/60 rounded-2xl border border-orange-800/50 text-xs text-orange-200">
              <ShieldCheck className="w-5 h-5 text-orange-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Administrator Access Only</p>
                <p className="text-orange-300/90 mt-0.5">
                  Customer accounts are completely disabled. Only the designated administrator (
                  <span className="font-mono text-white underline">{AUTHORIZED_ADMIN_EMAIL}</span>) can log in.
                </p>
              </div>
            </div>

            {authError && (
              <div className="p-4 bg-red-950/70 border border-red-800 text-red-200 rounded-2xl text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-red-100">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Access Restricted</span>
                </div>
                <p>{authError}</p>
                <button
                  onClick={clearError}
                  className="text-stone-300 underline hover:text-white pt-1 text-[11px]"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="space-y-4">
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-extrabold text-sm shadow-lg shadow-orange-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying Authorization...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Customer Website</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
