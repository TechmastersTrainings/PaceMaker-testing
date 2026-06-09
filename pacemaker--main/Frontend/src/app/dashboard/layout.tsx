'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Video, Database, 
  ClipboardList, BarChart, Settings, 
  BookOpen, Trophy, Clock, MonitorPlay, 
  Activity, ChevronRight, Stethoscope, Zap, Crown, Lock
} from 'lucide-react';
import AiChatbot from '@/components/AiChatbot';
import { useSubscription, FeatureKey } from '@/hooks/useSubscription';

const MENU_GROUPS: { label: string; items: { icon: any; label: string; href: string; feature: FeatureKey }[] }[] = [
  {
    label: 'Learning',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', feature: 'dashboard' },
      { icon: Video, label: 'Video Library', href: '/dashboard/videos', feature: 'videos' },
      { icon: MonitorPlay, label: 'Live Classes', href: '/dashboard/live', feature: 'live' },
      { icon: BookOpen, label: 'Study Material', href: '/study-material', feature: 'study-material' },
    ],
  },
  {
    label: 'Practice',
    items: [
      { icon: Database, label: 'Question Bank', href: '/dashboard/qbank', feature: 'qbank' },
      { icon: ClipboardList, label: 'Exam Builder', href: '/dashboard/exams', feature: 'exams' },
      { icon: Activity, label: 'Patient Simulation', href: '/dashboard/patient-simulation', feature: 'patient-simulation' },
    ],
  },
  {
    label: 'Progress',
    items: [
      { icon: BarChart, label: 'Performance', href: '/dashboard/performance', feature: 'performance' },
      { icon: Trophy, label: 'Leaderboard', href: '/dashboard/leaderboard', feature: 'leaderboard' },
      { icon: Zap, label: 'Achievements', href: '/dashboard/achievements', feature: 'achievements' },
    ],
  },
];

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null>(null);
  const { canAccess, hasPlan, sub } = useSubscription();

  useEffect(() => {
    setUserName(localStorage.getItem('currentUser') || 'Student');
  }, []);

  const initials = userName ? userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'S';

  const planLabel = sub.plan === 'HIGH' ? 'Plan C' : sub.plan === 'MEDIUM' ? 'Plan B' : sub.plan === 'BASIC' ? 'Plan A' : null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] overflow-hidden bg-[#060f1a]">
      
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-64 hidden md:flex flex-col z-10 border-r border-white/[0.06] shrink-0"
        style={{ background: 'linear-gradient(180deg, #080f1c 0%, #060c18 100%)' }}
      >
        {/* Profile card */}
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-cyan-500/20 shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-black text-white leading-tight truncate">{userName}</span>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mt-0.5">Medical Student</span>
            </div>
            {hasPlan ? (
              <div className="shrink-0 px-2 py-1 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
              </div>
            ) : null}
          </div>
          {!hasPlan ? (
            <Link
              href="/pricing"
              className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-amber-500/20"
            >
              <Crown className="w-3.5 h-3.5" /> Become a Pro Member
            </Link>
          ) : planLabel ? (
            <div className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/60 font-bold text-[10px] uppercase tracking-widest">
              <Crown className="w-3 h-3 text-amber-400" /> {planLabel} • Active
            </div>
          ) : null}
        </div>

        {/* Nav groups */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {MENU_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-2 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  const locked = !canAccess(item.feature);

                  if (locked && item.feature === 'dashboard') return null;

                  const content = (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-r-full" />
                      )}
                      <item.icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-cyan-400' : locked ? 'text-white/10' : 'text-white/30 group-hover:text-white/60'}`} />
                      <span className={`truncate ${locked ? 'text-white/20' : ''}`}>{item.label}</span>
                      {locked && (
                        <Lock className="w-3 h-3 text-amber-500/60 ml-auto shrink-0" />
                      )}
                      {!locked && isActive && <ChevronRight className="w-3 h-3 text-white/30 ml-auto shrink-0" />}
                    </>
                  );

                  if (locked) {
                    return (
                      <Link
                        key={item.href}
                        href="/pricing"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-bold relative group ${
                          isActive
                            ? 'text-white bg-white/10 border border-white/10'
                            : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
                        }`}
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-bold relative group ${
                        isActive
                          ? 'text-white bg-white/10 border border-white/10'
                          : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
                      }`}
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: study goal + settings */}
        <div className="p-4 border-t border-white/[0.06] space-y-3">
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-1">
                <Clock className="w-3 h-3" /> Daily Goal
              </span>
              <span className="text-[10px] font-black text-cyan-400">6.5 / 10h</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-teal-500 h-full w-[65%] rounded-full" />
            </div>
            <p className="text-[10px] text-white/25 font-medium mt-1.5">3.5 hours to go today</p>
          </div>

          <Link href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 text-white/30 hover:text-white/70 rounded-xl hover:bg-white/[0.04] transition-all font-bold text-sm"
          >
            <Settings className="w-4 h-4" /> My Account
          </Link>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto relative"
        style={{ background: 'linear-gradient(135deg, #060f1a 0%, #081525 100%)' }}
      >
        {children}
        <AiChatbot role="student" />
      </main>
    </div>
  );
}
