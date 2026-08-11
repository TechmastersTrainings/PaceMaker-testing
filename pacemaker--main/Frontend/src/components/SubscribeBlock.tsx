'use client';

import Link from 'next/link';
import { Lock, Crown, ArrowRight } from 'lucide-react';

interface SubscribeBlockProps {
  featureName?: string;
}

export default function SubscribeBlock({ featureName }: SubscribeBlockProps) {
  return (
    <div className="flex items-center justify-center min-h-[50vh] p-4">
      <div className="bg-white border border-stone-200/80 rounded-2xl p-8 max-w-md w-full text-center shadow-lg relative overflow-hidden compact-card">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4 border border-primary-100">
          <Lock className="w-7 h-7 text-primary-600 animate-pulse" />
        </div>
        <Crown className="w-6 h-6 text-amber-500 mx-auto mb-1" />
        <h2 className="text-xl font-black text-stone-900 mb-2">
          {featureName ? `${featureName} is Locked` : 'Premium Module'}
        </h2>
        <p className="text-stone-500 text-xs font-semibold leading-relaxed mb-6 max-w-xs mx-auto">
          Unlock unlimited access to all lectures, clinical scenarios, Q-Bank, mock tests and progress metrics with a premium membership.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-primary-500/10 compact-btn"
        >
          <Crown className="w-3.5 h-3.5" /> Unlock Premium Plan <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider mt-3">
          PLANS FROM ₹2,999 • CANCEL ANYTIME
        </p>
      </div>
    </div>
  );
}
