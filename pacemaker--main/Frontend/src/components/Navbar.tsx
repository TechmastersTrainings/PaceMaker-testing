'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, User, Menu, X, LogOut, LayoutDashboard, GraduationCap, Users, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isPublicRoute = pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/pricing') || pathname.startsWith('/forum') || pathname.startsWith('/study-material') || pathname.startsWith('/settings');
  const showLoggedIn = !!user;

  useEffect(() => {
    setIsMobileMenuOpen(false);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full border-b ${
      isScrolled 
        ? 'bg-[#0F172A] shadow-xl border-white/10 py-1 text-white' 
        : 'bg-[#0F172A]/95 backdrop-blur-md border-white/5 py-2 text-white shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-[#5EEAD4]" />
              <span className="font-bold text-xl tracking-tight text-white">PaceMaker</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8">
            {loading ? (
              <div className="w-4 h-4 border-2 border-[#5EEAD4]/30 border-t-[#5EEAD4] rounded-full animate-spin" />
            ) : (
              <>
                <Link href="/" className="text-white/80 hover:text-[#5EEAD4] font-medium transition-colors">Home</Link>
                {showLoggedIn ? (
                  <>
                    {user.role === 'admin' ? (
                      <Link href="/admin" className="text-[#5EEAD4] hover:text-white font-bold flex items-center gap-2 transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Command Center
                      </Link>
                    ) : user.role === 'instructor' || user.role === 'trainer' ? (
                      <Link href="/instructor" className="text-[#5EEAD4] hover:text-white font-bold flex items-center gap-2 transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Command Center
                      </Link>
                    ) : (
                      <Link href="/dashboard" className="text-[#5EEAD4] hover:text-white font-bold flex items-center gap-2 transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Student Dashboard
                      </Link>
                    )}
                    <Link href="/forum" className="text-white/80 hover:text-[#5EEAD4] font-medium flex items-center gap-2 transition-colors relative group">
                      <MessageCircle className="w-4.5 h-4.5 text-white/60 group-hover:text-[#5EEAD4] transition-colors" />
                      <span>Community</span>
                      <span className="absolute -top-1 -right-2 bg-[#0D9488] text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full animate-bounce shadow-sm">
                        3
                      </span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="#services" className="text-white/80 hover:text-[#5EEAD4] font-medium transition-colors">Services</Link>
                    <Link href="#courses" className="text-white/80 hover:text-[#5EEAD4] font-medium transition-colors">Courses</Link>
                    <Link href="#about" className="text-white/80 hover:text-[#5EEAD4] font-medium transition-colors">About Us</Link>
                  </>
                )}
                <Link href="/pricing" className="text-white/80 hover:text-[#5EEAD4] font-medium transition-colors">Pricing</Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-4 h-4 border-2 border-[#5EEAD4]/30 border-t-[#5EEAD4] rounded-full animate-spin" />
            ) : showLoggedIn ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 pr-4 border-r border-white/[0.08]">
                  <div className="bg-white/[0.04] p-2 rounded-full border border-white/[0.06] shadow-sm">
                    <User className="h-4 w-4 text-[#5EEAD4]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white leading-tight">Hi, {user.name}</span>
                    {user.role && <span className="text-[10px] uppercase font-black text-[#5EEAD4] tracking-widest">{user.role}</span>}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-red-500/10 text-white/80 hover:text-red-400 border border-white/[0.08] hover:border-red-500/20 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm"
                  title="Logout from your account"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="hidden lg:flex items-center gap-2 border border-white/[0.08] hover:border-[#5EEAD4] hover:bg-white/[0.04] text-white px-4 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap"
                >
                  <GraduationCap className="h-4 w-4 text-[#5EEAD4]" /> Student Login
                </Link>
                <Link
                  href="/login"
                  className="hidden lg:flex items-center gap-2 border border-white/[0.08] hover:border-[#5EEAD4] hover:bg-white/[0.04] text-white px-4 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap"
                >
                  <Users className="h-4 w-4 text-[#5EEAD4]" /> Instructor Login
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white/85 hover:text-[#5EEAD4] p-2 rounded-xl hover:bg-white/[0.04] transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 backdrop-blur-md overflow-hidden pb-6 pt-4 rounded-b-2xl bg-[#0F172A]"
          >
            <div className="flex flex-col space-y-4 px-4">
              <Link href="/" className="text-white/80 hover:text-[#5EEAD4] font-bold px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-all">Home</Link>
              {showLoggedIn ? (
                <>
                  {user.role === 'admin' ? (
                    <Link href="/admin" className="text-[#5EEAD4] hover:text-white font-bold px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-all flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" /> Command Center
                    </Link>
                  ) : user.role === 'instructor' || user.role === 'trainer' ? (
                    <Link href="/instructor" className="text-[#5EEAD4] hover:text-white font-bold px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-all flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" /> Command Center
                    </Link>
                  ) : (
                    <Link href="/dashboard" className="text-[#5EEAD4] hover:text-white font-bold px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-all flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" /> Student Dashboard
                    </Link>
                  )}
                  <Link href="/forum" className="text-white/80 hover:text-[#5EEAD4] font-bold px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-all flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Community
                  </Link>
                </>
              ) : (
                <>
                  <Link href="#services" className="text-white/80 hover:text-[#5EEAD4] font-bold px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-all">Services</Link>
                  <Link href="#courses" className="text-white/80 hover:text-[#5EEAD4] font-bold px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-all">Courses</Link>
                  <Link href="#about" className="text-white/80 hover:text-[#5EEAD4] font-bold px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-all">About Us</Link>
                </>
              )}
              <Link href="/pricing" className="text-white/80 hover:text-[#5EEAD4] font-bold px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-all">Pricing</Link>

              {/* Auth section */}
              <div className="pt-4 border-t border-white/[0.06] flex flex-col gap-3">
                {showLoggedIn ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/[0.04] p-2 rounded-full border border-white/[0.06] shadow-sm">
                        <User className="h-4 w-4 text-[#5EEAD4]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white leading-tight">Hi, {user.name}</span>
                        {user.role && <span className="text-[10px] uppercase font-black text-[#5EEAD4] tracking-widest">{user.role}</span>}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-bold transition-all duration-300 border border-red-500/20"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-2 border border-white/[0.08] hover:border-[#5EEAD4] hover:bg-white/[0.04] text-white px-4 py-3 rounded-xl font-bold text-sm transition-all"
                    >
                      <GraduationCap className="h-4 w-4 text-[#5EEAD4]" /> Student Login
                    </Link>
                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-2 border border-white/[0.08] hover:border-[#5EEAD4] hover:bg-white/[0.04] text-white px-4 py-3 rounded-xl font-bold text-sm transition-all"
                    >
                      <Users className="h-4 w-4 text-[#5EEAD4]" /> Instructor Login
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
