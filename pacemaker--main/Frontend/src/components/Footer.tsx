'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  Mail, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowUp,
  Lock
} from 'lucide-react';

// Custom inline brand SVGs to ensure cross-environment compatibility
// independent of lucide-react version updates.
const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Hide the footer in dashboard, admin workspace, active exam screen, settings, and forum pages
  // to maximize screen space and avoid interference with custom scroll interfaces.
  if (
    pathname.startsWith('/admin') || 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/instructor') || 
    pathname.startsWith('/exam') || 
    pathname.startsWith('/settings') || 
    pathname === '/forum'
  ) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    // Simulate API call for premium UI experience
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setEmail('');
      setTimeout(() => setIsSuccess(false), 5500);
    }, 1200);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#040811] relative overflow-hidden mt-auto border-t border-white/[0.04]">
      {/* Premium Top Divider Glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
      
      {/* Subtle background ambient glowing blobs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-teal-500/[0.015] rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary-500/[0.015] rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          
          {/* Brand & Mission (Span 2) */}
          <div className="lg:col-span-2 flex flex-col items-start text-left">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-teal-500/20">
                <Activity className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-display">
                Pace<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Maker</span>
              </span>
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed mb-6 max-w-sm">
              Empowering tomorrow's medical leaders with advanced clinical lectures, high-yield Q-Banks, and real-time AI mentoring.
            </p>
            {/* Social Icons with micro-interactions */}
            <div className="flex gap-2.5">
              {[
                { IconComponent: TwitterIcon, href: '#', label: 'Twitter' },
                { IconComponent: YoutubeIcon, href: '#', label: 'YouTube' },
                { IconComponent: LinkedinIcon, href: '#', label: 'LinkedIn' },
                { IconComponent: InstagramIcon, href: '#', label: 'Instagram' },
                { IconComponent: GithubIcon, href: '#', label: 'GitHub' }
              ].map((soc, idx) => (
                <a
                  key={idx}
                  href={soc.href}
                  aria-label={soc.label}
                  className="w-9 h-9 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.05] hover:border-teal-500/30 flex items-center justify-center text-stone-400 hover:text-white transition-all duration-300 shadow-sm hover:-translate-y-0.5"
                >
                  <soc.IconComponent className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav: Platform */}
          <div>
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-4">Platform</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-sm text-stone-400 hover:text-teal-405 transition-colors duration-200">
                  Explore Courses
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-stone-400 hover:text-teal-405 transition-colors duration-200">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-stone-400 hover:text-teal-405 transition-colors duration-200">
                  Student Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-stone-400 hover:text-teal-405 transition-colors duration-200">
                  Join Academy
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav: Study Features */}
          <div>
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-4">Features</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/login" className="text-sm text-stone-400 hover:text-teal-405 transition-colors duration-200">
                  AI Clinical Tutor
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-stone-400 hover:text-teal-405 transition-colors duration-200">
                  Interactive Q-Bank
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-stone-400 hover:text-teal-405 transition-colors duration-200">
                  Live Classrooms
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-stone-400 hover:text-teal-405 transition-colors duration-200">
                  Patient Simulator
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav: Resources */}
          <div>
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-4">Resources</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/study-material" className="text-sm text-stone-400 hover:text-teal-405 transition-colors duration-200">
                  Study Material
                </Link>
              </li>
              <li>
                <Link href="/forum" className="text-sm text-stone-400 hover:text-teal-405 transition-colors duration-200">
                  Student Forum
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-stone-400 hover:text-teal-405 transition-colors duration-200">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-stone-400 hover:text-teal-405 transition-colors duration-200">
                  MedBlog High-Yields
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Separator line */}
        <div className="border-t border-white/[0.04] my-10" />

        {/* Footer Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-left">
            <p className="text-xs text-stone-500">
              © {new Date().getFullYear()} PaceMaker Academy. Engineered for clinician success.
            </p>
            <p className="text-xs text-stone-600 mt-1 flex items-center gap-1">
              <Lock className="w-3 h-3 text-teal-600" /> All transmissions encrypted with AES-256 SSL security.
            </p>
          </div>

          {/* Secure Trust Badge icons */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/[0.01] px-2.5 py-1.5 rounded-lg border border-white/[0.04]">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-xs font-bold tracking-widest text-stone-400 uppercase">Razorpay Secure</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/[0.01] px-2.5 py-1.5 rounded-lg border border-white/[0.04]">
              <span className="text-xs font-black text-emerald-400">PCI-DSS</span>
              <span className="text-xs font-semibold text-stone-500">COMPLIANT</span>
            </div>
          </div>

          {/* Legal Links & Scroll Top */}
          <div className="flex items-center gap-5">
            <div className="flex gap-4 text-xs text-stone-500">
              <Link href="#" className="hover:text-stone-300 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-stone-300 transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-stone-300 transition-colors">Refunds</Link>
            </div>
            <button
              onClick={scrollToTop}
              aria-label="Scroll back to top"
              className="w-9 h-9 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] flex items-center justify-center text-stone-400 hover:text-white transition-all duration-300 group active:scale-95 shadow-md"
            >
              <ArrowUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
