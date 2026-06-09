'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, BookOpen, ArrowRight, CheckCircle2, X, Sparkles, UserPlus } from 'lucide-react';
import { authService } from '@/services/authService';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const registered = searchParams.get('registered');
  const prefillEmail = searchParams.get('email');
  const role = searchParams.get('role');
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const fromPricing = redirectTo === '/pricing';

  useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [prefillEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const authData = await authService.login({ email, password });
      const userRole = authData.role.toLowerCase();
      
      // Non-student roles get direct portal access — never follow the ?redirect= param
      if (userRole === 'admin' || userRole === 'superadmin') {
        router.push('/admin');
      } else if (userRole === 'instructor' || userRole === 'trainer') {
        router.push('/instructor');
      } else {
        // Students: honour the redirect param (course → pricing → login → back to pricing)
        router.push(redirectTo);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-6 px-4 sm:px-6 bg-[#fdfbf7] min-h-screen">
      <div className="w-full max-w-[440px] flex flex-col gap-3">

        {/* Pricing context banner */}
        {fromPricing && !registered && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-2xl p-3 flex items-start gap-3 shadow-lg"
          >
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-xs">You're one step away from unlocking your courses!</p>
              <p className="text-[11px] text-white/80 font-medium mt-0.5">
                Sign in to continue to your selected plan and start learning.
              </p>
            </div>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full glass-panel rounded-[2.5rem] p-5 md:p-8 shadow-2xl relative overflow-hidden bg-white border border-gray-200"
        >
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl z-0"></div>
          
          <div className="relative z-10">
            <div className="flex justify-center mb-5">
              <div className="bg-primary-50 p-3 rounded-2xl border border-primary-100">
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-center text-gray-900 mb-1 tracking-tight">Welcome Back</h2>
            <p className="text-center text-gray-600 font-medium text-sm mb-6">Resume your medical preparation.</p>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <X className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-xs font-bold text-red-800">{error}</p>
              </motion.div>
            )}

            {registered && !error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-green-800">Registration Successful!</p>
                  <p className="text-[11px] font-medium text-green-600">
                    Please sign in to access your {role} dashboard{fromPricing ? ' and complete your enrollment.' : '.'}
                  </p>
                </div>
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 font-bold text-sm placeholder:text-gray-400 placeholder:font-medium"
                    placeholder="doctor@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 px-1">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Password</label>
                  <Link href="#" className="text-[10px] font-black text-primary-600 hover:text-primary-500 uppercase tracking-widest">Forgot?</Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900 font-bold text-sm placeholder:text-gray-400 placeholder:font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-70 text-white py-4 rounded-xl font-black text-base transition-all shadow-lg shadow-primary-600/30"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'} <ArrowRight className="h-5 w-5" />
              </button>
            </form>

            {/* Register nudge */}
            <div className="mt-6">
              {fromPricing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-teal-50 border border-teal-100 rounded-2xl p-3 flex items-center gap-3"
                >
                  <UserPlus className="w-4 h-4 text-teal-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-teal-900">No account yet?</p>
                    <p className="text-[11px] text-teal-700 font-medium">
                      Register now — it's free and takes under a minute.{' '}
                      <Link 
                        href={`/register?redirect=${encodeURIComponent(redirectTo)}`}
                        className="font-black text-teal-600 hover:text-teal-500 underline"
                      >
                        Create Account →
                      </Link>
                    </p>
                  </div>
                </motion.div>
              ) : (
                <p className="text-center text-xs text-gray-600 font-bold">
                  New aspirant?{' '}
                  <Link href="/register" className="font-black text-primary-600 hover:text-primary-500 transition-colors">
                    Create an account
                  </Link>
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <div className="text-center space-y-4">
          <BookOpen className="w-10 h-10 text-primary-500 animate-pulse mx-auto" />
          <p className="text-sm font-bold text-gray-500">Loading PaceMaker...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
