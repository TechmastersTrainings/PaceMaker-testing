'use client';

import Link from 'next/link';
import { Lock, Crown, ArrowRight } from 'lucide-react';

interface SubscribeBlockProps {
  featureName?: string;
}

export default function SubscribeBlock({ featureName }: SubscribeBlockProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-[2.5rem] p-12 max-w-lg w-full text-center backdrop-blur-sm">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/20">
          <Lock className="w-9 h-9 text-white" />
        </div>
        <Crown className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <h2 className="text-2xl font-black text-white mb-3">
          {featureName ? `${featureName} is a Pro Feature` : 'Pro Feature'}
        </h2>
        <p className="text-white/50 text-sm font-medium leading-relaxed mb-8 max-w-sm mx-auto">
          Unlock unlimited access to all video lectures, QBank, grand tests, performance analytics and more with a PaceMaker plan.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl shadow-amber-500/20"
        >
          <Crown className="w-4 h-4" /> Become a Pro Member <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-[10px] text-white/20 font-medium mt-4">
          Plans starting from ₹2,999 — Cancel anytime
        </p>
      </div>
    </div>
  );
}
