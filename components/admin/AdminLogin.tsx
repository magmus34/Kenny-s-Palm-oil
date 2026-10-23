'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Droplet, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function AdminLogin() {
  const { loginWithPassword, loading, authError, clearError } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || loading) return;
    await loginWithPassword(password);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-700 flex items-center justify-center text-white shadow-xl shadow-orange-600/20 group-hover:scale-105 transition-transform">
              <Droplet className="w-8 h-8 fill-white" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Administrator Portal
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-stone-400">
            Kenny&apos;s Premium Palm Oil • Private Management
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-stone-800/90 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-stone-700/80 space-y-6">
            <div className="flex items-center gap-3 p-3 bg-stone-900/80 rounded-2xl border border-stone-700/60 text-xs text-stone-300">
              <ShieldCheck className="w-5 h-5 text-orange-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Private Admin Authorization</p>
                <p className="text-stone-400 text-[11px] mt-0.5">
                  Sign-up is permanently disabled. Enter the administrator password to unlock store management.
                </p>
              </div>
            </div>

            {authError && (
              <div className="p-4 bg-red-950/80 border border-red-800 text-red-200 rounded-2xl text-xs space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-red-100">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Access Denied</span>
                </div>
                <p className="text-stone-300 leading-relaxed">{authError}</p>
                <button
                  type="button"
                  onClick={clearError}
                  className="text-stone-400 hover:text-white underline text-[11px] pt-1 block cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Single Password Input Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-2"
                >
                  Admin Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    autoFocus
                    placeholder="Enter admin password..."
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (authError) clearError();
                    }}
                    className="w-full pl-10 pr-12 py-3 bg-stone-900 border border-stone-700 rounded-xl text-white placeholder-stone-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !password.trim()}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-extrabold text-sm shadow-lg shadow-orange-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Password...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Unlock Admin Dashboard</span>
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
