'use client';

import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Mail, AlertCircle, LogOut, Shield } from 'lucide-react';
import { supabase, signInWithEmail, signOut, getSession } from '../../../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    getSession().then(({ session }) => {
      setSession(session);
      setInitialLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setInitialLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signInWithEmail(email, password);

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      setError(error.message);
    }
  };

  // Show loading spinner while checking authentication
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Background gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/5 to-transparent"></div>
        
        {/* Animated background dots */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-ping delay-500"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-ping opacity-20"></div>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              AndookieCards Admin
            </h2>
            <p className="text-gray-300">Initializing secure connection...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Background gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/5 to-transparent"></div>
        
        {/* Animated background dots */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-ping delay-500"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
          <div className="max-w-md w-full">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
              <div className="text-center mb-8">
                <div className="relative mx-auto h-16 w-16 mb-6">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl w-16 h-16 flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  Admin Portal
                </h2>
                <p className="text-gray-300">Secure access to AndookieCards dashboard</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 pl-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
                      placeholder="admin@andookiecards.com"
                      required
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
                      placeholder="Enter your secure password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Authenticating...
                    </div>
                  ) : (
                    'Access Dashboard'
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-xs text-gray-400">
                  🔒 Secured by enterprise-grade authentication
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show authenticated content
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/5 to-transparent"></div>
      
      {/* Animated background dots */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-ping delay-500"></div>
      </div>

      {/* Admin Navigation Bar */}
      <nav className="relative z-10 bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                AndookieCards Admin
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">
                  {session.user?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white font-medium bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10">{children}</main>
    </div>
  );
}